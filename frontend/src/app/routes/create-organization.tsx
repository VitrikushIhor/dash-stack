import { createFileRoute } from '@tanstack/react-router'
import { CreateOrganizationPage } from '@/pages/create-organization'

export const Route = createFileRoute('/create-organization')({
  component: CreateOrganizationPage,
})
