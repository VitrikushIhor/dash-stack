import { z } from 'zod'
import { type DefaultValues } from 'react-hook-form'

export const notificationsFormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none'], {
    error: (iss) =>
      iss.input === undefined
        ? 'Please select a notification type.'
        : undefined,
  }),
  mobile: z.boolean().default(false),
  communication_emails: z.boolean().default(false),
  social_emails: z.boolean().default(false),
  marketing_emails: z.boolean().default(false),
  security_emails: z.boolean(),
})

/** What the form fields accept (defaults make fields optional at input level) */
export type NotificationsFormInput = z.input<typeof notificationsFormSchema>

/** What onSubmit receives after Zod parses and fills defaults */
export type NotificationsFormValues = z.output<typeof notificationsFormSchema>

export const notificationsDefaultValues: DefaultValues<NotificationsFormInput> =
  {
    communication_emails: false,
    marketing_emails: false,
    social_emails: true,
    security_emails: true,
  }
