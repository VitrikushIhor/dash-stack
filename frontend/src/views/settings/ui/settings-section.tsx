interface SettingsSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>{title}</h3>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </div>
      {children}
    </div>
  )
}
