import { Alert, AlertDescription } from '@/shared/ui/core/alert'
import { Checkbox } from '@/shared/ui/core/checkbox'
import { Label } from '@/shared/ui/core/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/core/table'
import { Textarea } from '@/shared/ui/core/textarea'
import type { ImportViewModel } from '../model/use-import-preview'

const fields = ['term', 'definition', 'example', 'imageUrl'] as const
const labels = {
  term: 'Term',
  definition: 'Definition',
  example: 'Example',
  imageUrl: 'Image URL',
}

export function ImportPreviewTable({ model }: { model: ImportViewModel }) {
  if (!model.preview) return null

  return (
    <div className='bg-muted/15 space-y-3 rounded-xl border p-4'>
      {model.preview.warnings.map((warning) => (
        <Alert key={warning} role='status'>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}
      <div className='bg-background max-h-80 overflow-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exclude</TableHead>
              <TableHead>Source row</TableHead>
              {fields.map((field) => (
                <TableHead key={field}>{labels[field]}</TableHead>
              ))}
              <TableHead>Validation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.preview.rows.map((row) => (
              <TableRow key={row.sourceRow}>
                <TableCell>
                  <Checkbox
                    aria-label={`Exclude source row ${row.sourceRow}`}
                    checked={row.excluded}
                    onCheckedChange={(checked) =>
                      model.excludeRow(row.sourceRow, checked === true)
                    }
                  />
                </TableCell>
                <TableCell>{row.sourceRow}</TableCell>
                {fields.map((field) => (
                  <TableCell key={field} className='p-1'>
                    <Textarea
                      className='min-w-32'
                      aria-label={`${labels[field]}, source row ${row.sourceRow}`}
                      disabled={row.excluded}
                      value={row.card[field] ?? ''}
                      onChange={(event) =>
                        model.editRow(row.sourceRow, field, event.target.value)
                      }
                    />
                  </TableCell>
                ))}
                <TableCell className='min-w-48'>
                  {[
                    ...row.errors.map((error) => error.message),
                    ...row.warnings,
                  ].map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {model.hasWarnings && (
        <Label className='flex items-center gap-2'>
          <Checkbox
            checked={model.acknowledged}
            onCheckedChange={(checked) =>
              model.setAcknowledged(checked === true)
            }
          />
          I reviewed the warnings and accept the displayed content and omitted
          columns.
        </Label>
      )}
    </div>
  )
}
