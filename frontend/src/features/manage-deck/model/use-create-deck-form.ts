'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import {
  CEFRLevelEnum,
  type CreateDeckFormValues,
  CreateDeckSchema,
  DeckVisibilityEnum,
} from '@/entities/deck'
import { createDeckAction } from '../server'
import { useDeckSearchParams } from './deck-search-params'

export function useCreateDeckForm() {
  const router = useRouter()
  const [_, setParams] = useDeckSearchParams()
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateDeckFormValues>({
    resolver: zodResolver(CreateDeckSchema),
    defaultValues: {
      title: '',
      description: '',
      language: 'en',
      level: CEFRLevelEnum.B1,
      visibility: DeckVisibilityEnum.PRIVATE,
      tags: [],
    },
  })

  const onSubmit = (values: CreateDeckFormValues) => {
    startTransition(async () => {
      const res = await createDeckAction(values)

      if (!res.success) {
        handleServerError(res.error)

        return
      }

      toast.success('Deck created successfully!')
      setParams({ 'create-deck': false })
      form.reset()
      router.push(ROUTES.vocabDeckEdit(res.data.id))
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    closeDialog: () => {
      if (!isPending) {
        setParams({ 'create-deck': false })
      }
    },
  }
}
