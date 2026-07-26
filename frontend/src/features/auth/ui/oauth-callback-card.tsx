'use client'

import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import { useOAuthCallback } from '../model/hooks/use-oauth-callback'

interface OAuthCallbackCardProps {
  code?: string
  error?: string
}

export function OAuthCallbackCard({ code, error }: OAuthCallbackCardProps) {
  useOAuthCallback({
    code: code ?? null,
    error: error ?? null,
  })

  return (
    <Card className='gap-4 text-center'>
      <CardHeader>
        <CardTitle className='text-lg tracking-tight'>
          Authenticating...
        </CardTitle>
        <CardDescription>Completing sign in, please wait.</CardDescription>
      </CardHeader>
      <CardContent className='flex justify-center'>
        <Loader2 className='text-primary h-12 w-12 animate-spin' />
      </CardContent>
    </Card>
  )
}
