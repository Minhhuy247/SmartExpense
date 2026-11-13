import React, { useEffect } from 'react'
import { X, ArrowDownLeft, ArrowUpRight, Utensils, Car, ShoppingBag, ReceiptText, House, Coffee, HeartPulse, BookOpen, Circle, BriefcaseBusiness, Gift, Wallet } from 'lucide-react'
import { getCategory, money } from '../lib/data'

const ICONS = {
  utensils: Utensils, car: Car, 'shopping-bag': ShoppingBag,
  receipt: ReceiptText, house: House, coffee: Coffee, 'heart-pulse': HeartPulse,
  'book-open': BookOpen, circle: Circle, briefcase: BriefcaseBusiness, gift: Gift, wallet: Wallet
}

export function CategoryIcon({ name, size = 17 }) {
  const category = getCategory(name)
  const Icon = ICONS[category.icon] || Circle
  return <span className="category-icon" style={{ backgroundColor: `${category.color}21`, color: category.color }}><Icon size={size} strokeWidth={2} /></span>
}

export function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    function close(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', close); document.body.style.overflow = original }
  }, [onClose])
  return <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
    <section className={`modal-card ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><h2>{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Đóng"><X size={19}/></button></div>
      {children}
    </section>
  </div>
}

export function EmptyState({ icon: Icon = Wallet, title, subtitle, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={27}/></span><h3>{title}</h3><p>{subtitle}</p>{action}</div>
}

export function TypeAmount({ type, amount, sign = true }) {
  return <span className={`amount-text ${type === 'income' ? 'income' : 'expense'}`}>{sign && (type === 'income' ? '+' : '−')}{money(amount)}</span>
}

export function TypeIcon({ type }) {
  return <span className={`flow-icon ${type === 'income' ? 'positive' : 'negative'}`}>
    {type === 'income' ? <ArrowDownLeft size={19}/> : <ArrowUpRight size={19}/>}
  </span>
}

export function BudgetBar({ spent, limit }) {
  const ratio = limit > 0 ? spent / limit * 100 : 0
  return <div className={`progress-track ${ratio > 100 ? 'is-over' : ratio >= 80 ? 'is-near' : ''}`}><span style={{ width: `${Math.min(ratio, 100)}%` }}/></div>
}

export function Field({ label, children, hint }) {
  return <label className="field"><span className="field-label">{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

export function SectionTitle({ title, subtitle, right }) {
  return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{right}</div>
}
