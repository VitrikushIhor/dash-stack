import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.describe('Vocabulary critical browser flows', () => {
  test('guest opens a public catalog deck and starts Flashcards', async ({
    page,
  }) => {
    await page.goto('/vocab/catalog')

    await expect(
      page.getByRole('heading', { name: 'Explore Public Vocabulary Decks' })
    ).toBeVisible()
    await page.getByRole('link', { name: 'Open deck' }).first().click()

    await expect(page).toHaveURL(/\/vocab\/decks\/[^/]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('20 cards', { exact: true })).toBeVisible()
    await page.getByRole('link', { name: 'Flashcards' }).click()

    await expect(page).toHaveURL(/\/vocab\/decks\/[^/]+\/flashcards/)
    await expect(page.getByText('Card 1 of 20')).toBeVisible()
  })

  test('authenticated user forks a public deck and edits the private copy', async ({
    page,
  }) => {
    await page.goto('/sign-in?redirect=/vocab/catalog')
    await page.getByLabel('Email').fill('admin@dashstack.app')
    await page.getByLabel('Password').fill('secret42')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/vocab\/catalog$/)
    await page.getByRole('button', { name: 'Fork Deck' }).first().click()
    await expect(page).toHaveURL(/\/vocab\/decks\/[^/]+\/edit$/)

    await expect(page.getByText('Private (Only you)')).toBeVisible()
    const title = page.getByPlaceholder('e.g. Oxford 3000 Core Vocabulary')
    await title.fill(`Phase 10 browser fork ${Date.now()}`)
    await page.getByRole('button', { name: 'Save Deck' }).click()

    await expect(page.getByText('All changes saved successfully!')).toBeVisible()
  })

  test('account switch does not retain the previous user identity', async ({
    page,
  }) => {
    await page.goto('/sign-in?redirect=/vocab/decks')
    await page.getByLabel('Email').fill('admin@dashstack.app')
    await page.getByLabel('Password').fill('secret42')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/vocab\/decks$/)
    await expect(
      page.getByRole('button', {
        name: 'User menu: Admin User, admin@dashstack.app',
      })
    ).toBeVisible()

    await page
      .getByRole('button', {
        name: 'User menu: Admin User, admin@dashstack.app',
      })
      .click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    await expect(page).toHaveURL(/\/sign-in$/)
    await page.getByLabel('Email').fill('bart@simpson.com')
    await page.getByLabel('Password').fill('secret42')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/vocab\/decks$/)
    await expect(
      page.getByRole('button', {
        name: 'User menu: Bart Simpson, bart@simpson.com',
      })
    ).toBeVisible()
    await expect(
      page.getByRole('button', {
        name: 'User menu: Admin User, admin@dashstack.app',
      })
    ).toHaveCount(0)
  })

  test('owner imports a large CSV, exports JSON, and keeps deep-scroll star state', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await page.goto('/sign-in?redirect=/vocab/catalog')
    await page.getByLabel('Email').fill('admin@dashstack.app')
    await page.getByLabel('Password').fill('secret42')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByRole('button', { name: 'Fork Deck' }).first().click()

    await expect(page).toHaveURL(/\/vocab\/decks\/[^/]+\/edit$/)
    const deckId = page.url().split('/')[5]
    if (!deckId) throw new Error('Fork route did not include a deck ID')

    await page.goto(`/vocab/decks/${deckId}`)
    await page.getByRole('button', { name: 'Import cards' }).click()
    const csv = Array.from(
      { length: 1000 },
      (_, index) => `Phase 10 term ${index + 1},Phase 10 definition ${index + 1}`
    ).join('\n')
    await page.getByLabel('Paste text').fill(csv)
    await page.getByRole('button', { name: 'Preview' }).click()
    await expect(page.getByRole('button', { name: 'Import 1000 cards' })).toBeEnabled({
      timeout: 30_000,
    })
    await page.getByRole('button', { name: 'Import 1000 cards' }).click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 30_000 })

    await page.reload()
    await expect(page.getByText('1020 cards', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Export' }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'JSON (Data)' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/)
    const downloadPath = await download.path()
    if (!downloadPath) throw new Error('JSON export download did not persist')
    const exportedJson = await readFile(downloadPath)
    expect(exportedJson.toString('utf8')).toContain('"schemaVersion":1')

    const list = page.locator('div[aria-label="Cards in this deck"]')
    const lastImportedTerm = page.getByText('Phase 10 term 1000', {
      exact: true,
    })
    for (let pageIndex = 0; pageIndex < 25; pageIndex += 1) {
      if (await lastImportedTerm.isVisible()) break
      const previousScrollHeight = await list.evaluate(
        (element) => element.scrollHeight
      )
      await list.evaluate((element) => {
        element.scrollTop = element.scrollHeight
        element.dispatchEvent(new Event('scroll'))
      })
      await expect
        .poll(
          async () =>
            (await lastImportedTerm.isVisible()) ||
            (await list.evaluate((element) => element.scrollHeight)) >
              previousScrollHeight,
          { timeout: 15_000 }
        )
        .toBe(true)
    }
    await list.evaluate((element) => {
      element.scrollTop = element.scrollHeight
      element.dispatchEvent(new Event('scroll'))
    })
    await expect(lastImportedTerm).toBeVisible({
      timeout: 30_000,
    })
    const lastCard = page.locator('article').filter({ hasText: 'Phase 10 term 1000' })
    const minimumRetainedScrollTop = await list.evaluate(
      (element) => element.scrollTop - element.clientHeight
    )
    await lastCard.getByRole('button', { name: 'Star card' }).click()
    await expect(lastCard.getByRole('button', { name: 'Unstar card' })).toBeVisible()
    await expect
      .poll(() => list.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(minimumRetainedScrollTop)
    await lastCard.getByRole('button', { name: 'Unstar card' }).click()
    await expect(lastCard.getByRole('button', { name: 'Star card' })).toBeVisible()

    await page.getByRole('button', { name: 'Import cards' }).click()
    const importDialog = page.getByRole('dialog', { name: 'Import flashcards' })
    await importDialog.getByRole('combobox', { name: 'Source' }).click()
    await page.getByRole('option', { name: 'Dash Stack JSON backup' }).click()
    await importDialog.locator('input[type="file"]').setInputFiles({
      name: download.suggestedFilename(),
      mimeType: 'application/json',
      buffer: exportedJson,
    })
    await expect(importDialog.getByLabel('Paste text')).toHaveValue(/"schemaVersion":1/, {
      timeout: 30_000,
    })
    await page.getByRole('button', { name: 'Preview' }).click()
    await expect(page.getByRole('button', { name: 'Import 1020 cards' })).toBeEnabled({
      timeout: 30_000,
    })
    await page.getByRole('button', { name: 'Import 1020 cards' }).click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 30_000 })
    await page.reload()
    await expect(page.getByText('2040 cards', { exact: true })).toBeVisible()
  })
})
