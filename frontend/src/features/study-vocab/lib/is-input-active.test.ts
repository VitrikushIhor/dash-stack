import { beforeEach, describe, expect, it } from 'vitest'
import { isInputActive } from './is-input-active'

describe('isInputActive', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns false when no active input or element is body', () => {
    expect(isInputActive()).toBe(false)
  })

  it('returns true when input element is focused', () => {
    const input = document.createElement('input')

    document.body.appendChild(input)
    input.focus()
    expect(isInputActive()).toBe(true)
  })

  it('returns true when textarea is focused', () => {
    const textarea = document.createElement('textarea')

    document.body.appendChild(textarea)
    textarea.focus()
    expect(isInputActive()).toBe(true)
  })

  it('returns true when contentEditable element is focused', () => {
    const div = document.createElement('div')

    div.tabIndex = 0
    div.setAttribute('contenteditable', 'true')
    document.body.appendChild(div)
    div.focus()
    expect(isInputActive()).toBe(true)
  })

  it('returns true when a standard control is focused', () => {
    const btn = document.createElement('button')

    document.body.appendChild(btn)
    btn.focus()
    expect(isInputActive()).toBe(true)
  })

  it('returns true when a select is focused', () => {
    const select = document.createElement('select')

    document.body.appendChild(select)
    select.focus()
    expect(isInputActive()).toBe(true)
  })

  it('allows shortcuts when the focused flashcard surface opts in', () => {
    const flashcard = document.createElement('div')

    flashcard.tabIndex = 0
    flashcard.setAttribute('role', 'button')
    flashcard.setAttribute('data-study-shortcut-surface', 'true')
    document.body.appendChild(flashcard)
    flashcard.focus()

    expect(isInputActive()).toBe(false)
  })

  it('keeps nested controls inside the shortcut surface active', () => {
    const flashcard = document.createElement('div')

    flashcard.setAttribute('data-study-shortcut-surface', 'true')
    const button = document.createElement('button')

    flashcard.appendChild(button)
    document.body.appendChild(flashcard)
    button.focus()

    expect(isInputActive()).toBe(true)
  })
})
