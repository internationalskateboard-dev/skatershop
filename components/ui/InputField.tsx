/**
 * InputField
 * - Campo de formulario reutilizable con estilo oscuro.
 * - Se usa en checkout y admin.
 */
'use client'

import React from 'react'

export default function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = true,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-300">{label}</span>
      <input
        required={required}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
      />
    </label>
  )
}
