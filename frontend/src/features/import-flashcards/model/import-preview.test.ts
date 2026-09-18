import { describe, expect, it } from 'vitest'
import {
  IMPORT_MAX_BYTES,
  prepareImport,
  validateImportCard,
} from './import-preview'

const mapping = { term: 0, definition: 1, example: null, imageUrl: null }

describe('import preview', () => {
  it.each(['quizlet', 'quenti', 'generic'] as const)(
    'should_preview_%s_default_text_fixture',
    (source) => {
      const preview = prepareImport('hello\tпривіт\nworld\tсвіт', {
        source,
        delimiter: '\t',
        hasHeader: false,
        mapping,
      })
      expect(preview.rows.map((row) => row.card.term)).toEqual([
        'hello',
        'world',
      ])
      expect(preview.rows.every((row) => row.errors.length === 0)).toBe(true)
    }
  )
  it('should_read_anki_directives_and_map_multiple_fields_with_source_rows', () => {
    const preview = prepareImport(
      '#separator:Tab\n#html:true\n#columns:Front\tBack\tExtra\nhello\t<b>привіт</b>\texample',
      {
        source: 'anki',
        delimiter: 'auto',
        hasHeader: false,
        mapping: { ...mapping, example: 2 },
      }
    )
    expect(preview.delimiter).toBe('\t')
    expect(preview.rows[0]).toMatchObject({
      sourceRow: 4,
      card: { term: 'hello', definition: '<b>привіт</b>', example: 'example' },
    })
    expect(preview.rows[0]?.warnings.length).toBeGreaterThan(0)
  })
  it('should_keep_an_anki_card_whose_term_starts_with_a_hash', () => {
    const preview = prepareImport('#word\tdefinition', {
      source: 'anki',
      delimiter: '\t',
      hasHeader: false,
      mapping,
    })

    expect(preview.rows[0]?.card).toMatchObject({
      term: '#word',
      definition: 'definition',
    })
  })
  it('should_map_columns_and_skip_header_when_selected', () => {
    const preview = prepareImport(
      'Definition;Example;Term\nmeaning;sentence;word',
      {
        source: 'generic',
        delimiter: ';',
        hasHeader: true,
        mapping: { term: 2, definition: 0, example: 1, imageUrl: null },
      }
    )
    expect(preview.rows[0]).toMatchObject({
      sourceRow: 2,
      card: { term: 'word', definition: 'meaning', example: 'sentence' },
    })
  })
  it('should_report_invalid_and_unmapped_fields_without_silent_loss', () => {
    const preview = prepareImport('term,,extra', {
      source: 'generic',
      delimiter: ',',
      hasHeader: false,
      mapping,
    })
    expect(preview.rows[0]?.errors.length).toBeGreaterThan(0)
    expect(preview.rows[0]?.warnings).toContain('Unmapped non-empty columns: 3')
    expect(
      validateImportCard({
        term: 'term',
        definition: 'corrected',
        example: null,
        imageUrl: null,
      })
    ).toEqual([])
  })
  it('should_warn_for_cloze_media_and_html_without_executing_or_stripping_them', () => {
    const preview = prepareImport(
      'term\t{{c1::answer}} [sound:a.mp3] <img src=x>',
      { source: 'anki', delimiter: '\t', hasHeader: false, mapping }
    )
    expect(preview.rows[0]?.card.definition).toContain('<img src=x>')
    expect(preview.rows[0]?.warnings.length).toBeGreaterThan(0)
  })
  it('should_reject_oversized_input_before_parsing', () => {
    expect(() =>
      prepareImport('x'.repeat(IMPORT_MAX_BYTES + 1), {
        source: 'generic',
        delimiter: 'auto',
        hasHeader: false,
        mapping,
      })
    ).toThrow('4 MiB')
  })
  it('should_preserve_apostrophes_duplicates_and_unicode', () => {
    const preview = prepareImport("'word,слово\n'word,слово", {
      source: 'generic',
      delimiter: ',',
      hasHeader: false,
      mapping,
    })
    expect(preview.rows.map((row) => row.card.term)).toEqual(["'word", "'word"])
  })

  it('should_preview_the_versioned_dash_stack_json_backup_without_loss', () => {
    const preview = prepareImport(
      JSON.stringify({
        schemaVersion: 1,
        cards: [
          {
            term: '=formula',
            definition: 'Привіт, world',
            example: 'Line one\nLine two',
            imageUrl: 'https://example.test/image.png',
          },
        ],
      }),
      {
        source: 'dash-stack-json',
        delimiter: 'auto',
        hasHeader: false,
        mapping,
      }
    )

    expect(preview.rows).toEqual([
      expect.objectContaining({
        sourceRow: 1,
        card: {
          term: '=formula',
          definition: 'Привіт, world',
          example: 'Line one\nLine two',
          imageUrl: 'https://example.test/image.png',
        },
        errors: [],
      }),
    ])
  })

  it('should_reject_an_unknown_dash_stack_json_schema_version', () => {
    expect(() =>
      prepareImport(JSON.stringify({ schemaVersion: 2, cards: [] }), {
        source: 'dash-stack-json',
        delimiter: 'auto',
        hasHeader: false,
        mapping,
      })
    ).toThrow('schemaVersion 1')
  })

  it('should_reject_backup_fields_that_cannot_be_imported_without_data_loss', () => {
    expect(() =>
      prepareImport(
        JSON.stringify({
          schemaVersion: 1,
          cards: [
            {
              term: 'term',
              definition: 'definition',
              example: null,
              imageUrl: null,
              unsupportedField: 'must not disappear',
            },
          ],
        }),
        {
          source: 'dash-stack-json',
          delimiter: 'auto',
          hasHeader: false,
          mapping,
        }
      )
    ).toThrow('schemaVersion 1')
  })
})
