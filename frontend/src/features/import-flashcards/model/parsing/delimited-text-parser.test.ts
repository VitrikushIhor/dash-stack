import { describe, expect, it } from 'vitest'
import { detectDelimiter, parseDelimitedText } from './delimited-text-parser'

describe('delimited text parser', () => {
  it('should_preserve_unicode_quotes_delimiters_and_newlines_when_fields_are_quoted', () => {
    expect(
      parseDelimitedText(
        '\uFEFF"слово, два","say ""hi""\r\nagain"\r\n\r\nnext,last',
        ','
      )
    ).toEqual([
      { sourceRow: 1, fields: ['слово, два', 'say "hi"\r\nagain'], errors: [] },
      { sourceRow: 4, fields: ['next', 'last'], errors: [] },
    ])
  })
  it.each(['\t', ',', ';'] as const)(
    'should_detect_%j_when_rows_are_consistent',
    (separator) => {
      expect(
        detectDelimiter(`term${separator}definition\nhello${separator}привіт`)
      ).toBe(separator)
    }
  )
  it('should_require_manual_choice_when_delimiters_are_ambiguous', () => {
    expect(detectDelimiter('a,b;c\nd,e;f')).toBeNull()
  })
  it('should_report_source_row_when_quotes_are_unclosed', () => {
    expect(parseDelimitedText('ok,yes\n"broken,text', ',')[1]).toMatchObject({
      sourceRow: 2,
      errors: ['Unclosed quoted field'],
    })
  })
  it('should_report_invalid_quotes_without_dropping_content', () => {
    expect(parseDelimitedText('a"b,c', ',')[0]).toEqual({
      sourceRow: 1,
      fields: ['a"b', 'c'],
      errors: ['Quote inside an unquoted field'],
    })
  })
  it('should_ignore_blank_rows_when_input_is_empty', () => {
    expect(parseDelimitedText('\uFEFF\r\n \n', '\t')).toEqual([])
  })
  it('should_preserve_empty_columns_when_a_row_has_delimiters', () => {
    expect(parseDelimitedText(',value,', ',')[0]?.fields).toEqual([
      '',
      'value',
      '',
    ])
  })
})
