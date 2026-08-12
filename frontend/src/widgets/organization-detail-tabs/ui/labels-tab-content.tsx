import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/core/card'
import type { LabelDto } from '@/entities/label'
import { labelColorStyles } from '@/entities/label/model/types'
import {
  CreateLabelButton,
  LabelRowActions,
  LabelModals,
} from '@/features/manage-label'

interface LabelsTabContentProps {
  labels: LabelDto[]
}

export function LabelsTabContent({ labels }: LabelsTabContentProps) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Labels</h3>
          <p className='text-muted-foreground text-sm'>
            Manage labels used to categorize tasks in this organization.
          </p>
        </div>
        <CreateLabelButton />
      </div>

      <Card>
        <CardContent className='p-0'>
          {labels.length === 0 ? (
            <div className='flex h-32 flex-col items-center justify-center gap-2 text-center'>
              <p className='text-muted-foreground text-sm'>No labels found</p>
              <CreateLabelButton variant='outline'>
                Create your first label
              </CreateLabelButton>
            </div>
          ) : (
            <div className='divide-border flex flex-col divide-y'>
              {labels.map((label) => (
                <div
                  key={label.id}
                  className='hover:bg-muted/50 flex items-center justify-between p-4 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        'flex h-6 items-center rounded-full border px-2.5 text-xs font-medium capitalize',
                        labelColorStyles[label.color].bg,
                        labelColorStyles[label.color].text,
                        labelColorStyles[label.color].border
                      )}
                    >
                      {label.name}
                    </div>
                  </div>
                  <LabelRowActions label={label} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LabelModals labels={labels} />
    </div>
  )
}
