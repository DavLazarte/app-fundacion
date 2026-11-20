'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share, Smartphone, X } from 'lucide-react'

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    // 1. Registrar Service Worker y configurar auto-actualización sin intervención del usuario
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Chequear si hay actualización en el servidor al cargar
          reg.update().catch(() => {})

          // Chequeo periódico cada 15 minutos si la app queda abierta
          const interval = setInterval(() => {
            reg.update().catch(() => {})
          }, 15 * 60 * 1000)

          return () => clearInterval(interval)
        })
        .catch((err) => {
          console.error('Service Worker registration error:', err)
        })

      // Solo recargar si ya había un Service Worker previo y se actualizó a uno nuevo
      let refreshing = false
      const hadController = Boolean(navigator.serviceWorker.controller)

      const handleControllerChange = () => {
        if (hadController && !refreshing) {
          refreshing = true
          window.location.reload()
        }
      }
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

      // Cada vez que el usuario vuelve a la pestaña o desbloquea el celular, verificar novedades
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}))
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // 2. Comprobar si ya está instalada la PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // 3. Detectar si es iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIos(isIosDevice)

    // 4. Capturar el evento beforeinstallprompt de navegadores compatibles
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
      }
      setDeferredPrompt(null)
      setModalOpen(false)
    } else {
      setModalOpen(true)
    }
  }

  // Si ya está instalada, no mostramos nada
  if (isInstalled) return null

  return (
    <>
      {/* Botón siempre visible si no está instalada */}
      <button
        onClick={handleInstallClick}
        title="Instalar como aplicación"
        className="flex items-center gap-1.5 rounded-xl border border-[#d2dfda] bg-white px-3 py-1.5 text-xs font-semibold text-[#0d6b5e] shadow-xs transition-colors hover:bg-[#e7f4ef]"
      >
        <Smartphone className="size-3.5" />
        <span className="inline">Instalar app</span>
      </button>

      {/* Modal explicativo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#183b34]/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#edf1ef] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#0d6b5e] text-white">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1e3934]">Instalar Tesorería</h3>
                  <p className="text-xs text-[#71827e]">Acceso directo y pantalla completa</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#71827e] hover:bg-[#f3f7f5]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs text-[#4c665e]">
              <p>
                Instalá la plataforma en tu dispositivo para acceder rápidamente con un toque o ventana independiente,
                sin barras de navegador.
              </p>

              {isIos ? (
                <div className="rounded-xl border border-[#d2dfda] bg-[#f7f9f8] p-3 text-xs">
                  <p className="font-bold text-[#1e3934]">Cómo instalar en iPhone o iPad:</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-[#5a736c]">
                    <li>
                      Tocá el botón <strong>Compartir</strong> <Share className="inline size-3.5" /> en la barra de Safari.
                    </li>
                    <li>
                      Buscá y seleccioná <strong>"Agregar a pantalla de inicio"</strong>.
                    </li>
                    <li>Tocá <strong>"Agregar"</strong> en la esquina superior.</li>
                  </ol>
                </div>
              ) : deferredPrompt ? (
                <p className="text-[#5a736c]">
                  Hacé clic en <strong>"Instalar ahora"</strong> para añadir Tesorería a tus aplicaciones de escritorio o inicio.
                </p>
              ) : (
                <div className="rounded-xl border border-[#d2dfda] bg-[#f7f9f8] p-3 text-xs">
                  <p className="font-bold text-[#1e3934]">Cómo instalar en PC o Mac:</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-[#5a736c]">
                    <li>
                      En <strong>Chrome</strong> o <strong>Edge</strong>, buscá el ícono de <strong>Instalar</strong> en la barra de direcciones (a la derecha de la URL).
                    </li>
                    <li>
                      O hacé clic en los <strong>tres puntos ⋮</strong> arriba a la derecha y elegí <strong>"Instalar Plataforma de Tesorería"</strong>.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="h-9 rounded-xl border-[#d2dfda] px-4 text-xs"
              >
                Cerrar
              </Button>
              {deferredPrompt && (
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="h-9 gap-1.5 rounded-xl bg-[#0d6b5e] px-4 text-xs font-semibold text-white hover:bg-[#0a574c]"
                >
                  <Download className="size-3.5" />
                  Instalar ahora
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
