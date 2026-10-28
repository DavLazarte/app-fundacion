import { serverFetch } from '@/lib/api/client'
import { User } from '@/types/api'

export async function getMe(): Promise<User | null> {
  try {
    const data = await serverFetch<{ user: User }>('/me')
    return data.user
  } catch {
    return null
  }
}
