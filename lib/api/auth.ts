import { cache } from 'react'
import { serverFetch } from '@/lib/api/client'
import { User } from '@/types/api'

export const getMe = cache(async (): Promise<User | null> => {
  try {
    const data = await serverFetch<{ user: User }>('/me', {
      next: { revalidate: 30 },
    })
    return data.user
  } catch {
    return null
  }
})
