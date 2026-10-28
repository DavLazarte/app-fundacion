'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Landmark, Loader2, Lock, Mail } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors?.email) {
          setError(data.errors.email[0])
        } else {
          setError(data.message || 'Error al iniciar sesión')
        }
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Ocurrió un error inesperado al conectar con el servidor.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#dfe8e4] bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0d6b5e] text-white shadow-sm">
            <Landmark className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#18463f]">
            Fundación
          </h1>
          <p className="mt-1 text-sm text-[#78908a]">
            Plataforma de Tesorería · Ingreso al sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Correo electrónico
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b9e98]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@devsign.ar"
                className="h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] pl-10 pr-3.5 text-sm text-[#1e3934] outline-none transition-all placeholder:text-[#9bb0aa] focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c665e]">
              Contraseña
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b9e98]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] pl-10 pr-3.5 text-sm text-[#1e3934] outline-none transition-all placeholder:text-[#9bb0aa] focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full rounded-xl bg-[#0d6b5e] font-semibold text-white transition-all hover:bg-[#0a574c]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Ingresando...
              </span>
            ) : (
              'Ingresar a la plataforma'
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-[#8ca09a]">
          Acceso restringido únicamente a usuarios autorizados.
        </p>
      </div>
    </div>
  )
}
