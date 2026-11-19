'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value: string | number
  onChange: (rawValue: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  autoFocus?: boolean
}

/**
 * Formatea un valor numérico o texto a formato moneda rioplatense (puntos para miles, coma para centavos).
 */
export function formatToDisplay(value: string | number): string {
  if (value === null || value === undefined || value === '') return ''
  const str = String(value).trim()

  // Si tiene coma (ej: "1.000,50" o "1000,50")
  if (str.includes(',')) {
    const parts = str.split(',')
    const intDigits = parts[0].replace(/\D/g, '')
    const decDigits = parts.slice(1).join('').replace(/\D/g, '').slice(0, 2)
    const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0'
    return `${formattedInt},${decDigits}`
  }

  // Si viene con punto desde backend o float puro (ej: "250000.00" o "1250.50")
  if (str.includes('.')) {
    const dotParts = str.split('.')
    // Si tiene exactamente 1 punto y después hay 1 o 2 dígitos, es un decimal de API/DB
    if (dotParts.length === 2 && dotParts[1].length <= 2) {
      const intDigits = dotParts[0].replace(/\D/g, '')
      const decDigits = dotParts[1].replace(/\D/g, '')
      const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0'
      return decDigits && decDigits !== '00' ? `${formattedInt},${decDigits}` : formattedInt
    }
  }

  // En cualquier otro caso, limpiamos todo caracter no numérico y formateamos miles con puntos
  const intDigits = str.replace(/\D/g, '')
  if (!intDigits) return ''
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Convierte el valor con formato visual a un número puro en formato string ("1000000.50") para enviar a la API.
 */
export function parseToRaw(display: string): string {
  if (!display) return ''
  const str = display.trim()

  if (str.includes(',')) {
    const parts = str.split(',')
    const intDigits = parts[0].replace(/\D/g, '') || '0'
    const decDigits = parts.slice(1).join('').replace(/\D/g, '').slice(0, 2)
    return decDigits ? `${intDigits}.${decDigits}` : intDigits
  }

  return str.replace(/\D/g, '')
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  required = false,
  disabled = false,
  className,
  id,
  autoFocus,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => formatToDisplay(value))

  // Sincronizar si el valor prop cambia desde afuera (ej: reset del form o carga inicial)
  useEffect(() => {
    const formatted = formatToDisplay(value)
    if (parseToRaw(displayValue) !== parseToRaw(formatted)) {
      setDisplayValue(formatted)
    }
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Si el usuario presiona coma o punto para indicar centavos
    if (e.key === ',' || e.key === '.') {
      e.preventDefault()
      if (!displayValue.includes(',')) {
        const base = displayValue || '0'
        const next = `${base},`
        setDisplayValue(next)
        onChange(parseToRaw(next))
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputVal = e.target.value

    if (!inputVal) {
      setDisplayValue('')
      onChange('')
      return
    }

    if (inputVal.includes(',')) {
      const parts = inputVal.split(',')
      const intDigits = parts[0].replace(/\D/g, '')
      const decDigits = parts.slice(1).join('').replace(/\D/g, '').slice(0, 2)
      const formattedInt = intDigits ? intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0'

      const endsWithComma = inputVal.endsWith(',')
      const newDisplay =
        endsWithComma && !decDigits
          ? `${formattedInt},`
          : `${formattedInt},${decDigits}`

      setDisplayValue(newDisplay)
      onChange(parseToRaw(newDisplay))
    } else {
      // Solo enteros
      const intDigits = inputVal.replace(/\D/g, '')
      if (!intDigits) {
        setDisplayValue('')
        onChange('')
        return
      }
      const formattedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      setDisplayValue(formattedInt)
      onChange(intDigits)
    }
  }

  return (
    <div className="relative flex w-full items-center">
      <span className="pointer-events-none absolute left-3.5 select-none text-base font-bold text-[#71827e] sm:text-sm">
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        id={id}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        value={displayValue}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'h-11 w-full rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] pl-8 pr-3.5 text-base font-bold text-[#1e3934] outline-none transition-all placeholder:font-normal placeholder:text-[#93a29e] focus:border-[#0d6b5e] focus:bg-white focus:ring-2 focus:ring-[#0d6b5e]/20 sm:text-sm',
          className
        )}
      />
    </div>
  )
}
