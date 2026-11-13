import React, { useState } from 'react'
import { categoryOptions, monthKey, todayKey } from '../lib/data'
import { Field, Modal } from './Ui'

export function TransactionForm({ item, month, onSave, onClose }) {
  const [type, setType] = useState(item?.type || 'expense')
  const [category, setCategory] = useState(item?.category || 'Ăn uống')
  const [amount, setAmount] = useState(item?.amount ?? '')
  const [date, setDate] = useState(item?.date || (month === monthKey() ? todayKey() : `${month}-01`))
  const [note, setNote] = useState(item?.note || '')
  function changeType(next) {
    setType(next)
    setCategory(next === 'income' ? 'Lương' : 'Ăn uống')
  }
  function submit(e) {
    e.preventDefault()
    if (!(Number(amount) > 0) || !note.trim() || !date) return
    onSave({ ...item, type, category, amount: Math.round(Number(amount)), date, note: note.trim() })
  }
  return <Modal title={item ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch'} onClose={onClose}>
    <form className="modal-form" onSubmit={submit}>
      <div className="type-tabs"><button type="button" className={type === 'expense' ? 'active' : ''} onClick={() => changeType('expense')}>Chi tiêu</button><button type="button" className={type === 'income' ? 'active' : ''} onClick={() => changeType('income')}>Thu nhập</button></div>
      <Field label="Số tiền (VND)"><input autoFocus type="number" min="1" step="1" required placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
      <Field label="Nội dung"><input maxLength="120" required placeholder="Nhập nội dung giao dịch" value={note} onChange={e => setNote(e.target.value)} /></Field>
      <div className="form-two"><Field label="Danh mục"><select value={category} onChange={e => setCategory(e.target.value)}>{categoryOptions(type).map(c => <option key={c.name}>{c.name}</option>)}</select></Field><Field label="Ngày giao dịch"><input type="date" required value={date} onChange={e => setDate(e.target.value)} /></Field></div>
      <div className="modal-actions"><button className="btn btn-ghost" type="button" onClick={onClose}>Hủy</button><button className="btn btn-primary" type="submit">{item ? 'Lưu thay đổi' : 'Thêm giao dịch'}</button></div>
    </form>
  </Modal>
}

export function BudgetForm({ item, month, onSave, onClose }) {
  const [category, setCategory] = useState(item?.category || 'Ăn uống')
  const [limit, setLimit] = useState(item?.limit ?? '')
  const [dateMonth, setDateMonth] = useState(item?.month || month)
  const [note, setNote] = useState(item?.note || '')
  function submit(e) {
    e.preventDefault()
    if (!(Number(limit) > 0) || !dateMonth) return
    onSave({ ...item, category, limit: Math.round(Number(limit)), month: dateMonth, note: note.trim() })
  }
  return <Modal title={item ? 'Chỉnh sửa ngân sách' : 'Tạo ngân sách'} onClose={onClose}>
    <form className="modal-form" onSubmit={submit}>
      <Field label="Danh mục chi tiêu"><select disabled={!!item} value={category} onChange={e => setCategory(e.target.value)}>{categoryOptions('expense').map(c => <option key={c.name}>{c.name}</option>)}</select></Field>
      <Field label="Hạn mức (VND)"><input autoFocus required type="number" min="1" step="1" value={limit} placeholder="Nhập hạn mức" onChange={e => setLimit(e.target.value)} /></Field>
      <div className="form-two"><Field label="Áp dụng cho tháng"><input type="month" required disabled={!!item} value={dateMonth} onChange={e => setDateMonth(e.target.value)} /></Field><Field label="Ghi chú"><input maxLength="100" placeholder="Không bắt buộc" value={note} onChange={e => setNote(e.target.value)} /></Field></div>
      <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button><button type="submit" className="btn btn-primary">{item ? 'Lưu thay đổi' : 'Tạo ngân sách'}</button></div>
    </form>
  </Modal>
}

export function RecurringForm({ item, onSave, onClose }) {
  const [type, setType] = useState(item?.type || 'expense')
  const [title, setTitle] = useState(item?.title || '')
  const [category, setCategory] = useState(item?.category || 'Hóa đơn')
  const [amount, setAmount] = useState(item?.amount ?? '')
  const [day, setDay] = useState(item?.day || 5)
  const [active, setActive] = useState(item?.active ?? true)
  function changeType(next) { setType(next); setCategory(next === 'income' ? 'Lương' : 'Hóa đơn') }
  function submit(e) {
    e.preventDefault()
    if (!title.trim() || Number(amount) <= 0) return
    onSave({ ...item, type, title: title.trim(), category, amount: Math.round(Number(amount)), day: Number(day), active })
  }
  return <Modal title={item ? 'Sửa giao dịch định kỳ' : 'Thêm giao dịch định kỳ'} onClose={onClose}>
    <form className="modal-form" onSubmit={submit}>
      <div className="type-tabs"><button type="button" className={type === 'expense' ? 'active' : ''} onClick={() => changeType('expense')}>Chi tiêu</button><button type="button" className={type === 'income' ? 'active' : ''} onClick={() => changeType('income')}>Thu nhập</button></div>
      <Field label="Tên giao dịch"><input autoFocus required maxLength="120" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ví dụ: Tiền thuê nhà"/></Field>
      <Field label="Số tiền (VND)"><input required type="number" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></Field>
      <div className="form-two"><Field label="Danh mục"><select value={category} onChange={e => setCategory(e.target.value)}>{categoryOptions(type).map(c => <option key={c.name}>{c.name}</option>)}</select></Field><Field label="Ngày thực hiện hằng tháng"><select value={day} onChange={e => setDay(Number(e.target.value))}>{Array.from({ length: 28 }, (_, i) => i + 1).map(d => <option key={d} value={d}>Ngày {d}</option>)}</select></Field></div>
      <label className="switch-row"><span>Kích hoạt quy tắc</span><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /></label>
      <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button><button type="submit" className="btn btn-primary">{item ? 'Lưu thay đổi' : 'Thêm quy tắc'}</button></div>
    </form>
  </Modal>
}

export function ReminderForm({ item, onSave, onClose }) {
  const [title, setTitle] = useState(item?.title || '')
  const [message, setMessage] = useState(item?.message || '')
  function submit(e) { e.preventDefault(); if (!title.trim()) return; onSave({ ...item, title: title.trim(), message: message.trim(), kind: 'custom' }) }
  return <Modal title={item ? 'Chỉnh sửa nhắc nhở' : 'Tạo nhắc nhở'} onClose={onClose}>
    <form className="modal-form" onSubmit={submit}>
      <Field label="Tiêu đề"><input autoFocus required maxLength="90" placeholder="Ví dụ: Thanh toán học phí" value={title} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label="Nội dung"><textarea rows="4" maxLength="500" placeholder="Nội dung nhắc nhở" value={message} onChange={e => setMessage(e.target.value)} /></Field>
      <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button><button type="submit" className="btn btn-primary">{item ? 'Lưu thay đổi' : 'Tạo nhắc nhở'}</button></div>
    </form>
  </Modal>
}
