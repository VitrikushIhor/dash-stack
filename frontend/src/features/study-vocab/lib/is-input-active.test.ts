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

  it('returns false when standard button or link is focused', () => {
    const btn = document.createElement('button')
    document.body.appendChild(btn)
    btn.focus()
    expect(isInputActive()).toBe(false)
  })
})
