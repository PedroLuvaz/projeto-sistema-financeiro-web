'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthName } from '@/utils/helpers'

export default function MonthSelector({ mes, ano, onChange }) {
  const prev = () => {
    if (mes === 1) onChange(12, ano - 1)
    else onChange(mes - 1, ano)
  }
  const next = () => {
    if (mes === 12) onChange(1, ano + 1)
    else onChange(mes + 1, ano)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button className="btn-icon" onClick={prev}><ChevronLeft size={18} /></button>
      <span style={{ fontWeight: 600, fontSize: '1rem', minWidth: 160, textAlign: 'center' }}>
        {getMonthName(mes)} {ano}
      </span>
      <button className="btn-icon" onClick={next}><ChevronRight size={18} /></button>
    </div>
  )
}
