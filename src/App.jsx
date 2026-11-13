import React, { useEffect, useState } from 'react'
import {
  Bell, CalendarDays, ChartNoAxesCombined, ChevronLeft, ChevronRight, CircleHelp, CreditCard,
  House, LayoutDashboard, LogOut, Menu, Plus, Repeat2, Settings2, ShieldCheck,
  WalletCards, X, CheckCircle2, AlertCircle, Info, Sparkles
} from 'lucide-react'
import Auth from './components/Auth'
import { BudgetForm, RecurringForm, ReminderForm, TransactionForm } from './components/Forms'
import { Automation, Budgets, CalendarPage, Dashboard, Notifications, Settings, Transactions } from './components/Pages'
import { Field, Modal } from './components/Ui'
import { loadData, money, monthKey, monthLabel, reconcileAlerts, REMEMBER_KEY, SESSION_KEY, shiftMonth, saveData, uid } from './lib/data'

const NAV = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'transactions', label: 'Giao dịch', icon: WalletCards },
  { id: 'budgets', label: 'Ngân sách', icon: CreditCard },
  { id: 'calendar', label: 'Lịch thu chi', icon: CalendarDays },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'automation', label: 'Tự động hóa', icon: Repeat2 }
]

const TITLES = {
  dashboard: 'Tổng quan', transactions: 'Giao dịch', budgets: 'Ngân sách',
  calendar: 'Lịch thu chi', notifications: 'Thông báo', automation: 'Tự động hóa', settings: 'Tài khoản'
}

function App() {
  const [data, setData] = useState(() => reconcileAlerts(loadData()))
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
  })
  const [route, setRoute] = useState('dashboard')
  const [month, setMonth] = useState(monthKey())
  const [selectedDay, setSelectedDay] = useState('')
  const [dialog, setDialog] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const unread = data.notifications.filter(item => !item.read).length

  useEffect(() => { saveData(data) }, [data])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3800)
    return () => clearTimeout(timer)
  }, [toast])

  function notify(message, kind = 'success') { setToast({ id: uid(), message, kind }) }
  function mutate(updater) { setData(prev => reconcileAlerts(updater(prev))) }
  function navigate(next) { setRoute(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }) }
  function enter(profile) {
    const viewSession = { email: profile.email || '', name: profile.name || 'Khách hàng', type: 'preview' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(viewSession))
    setSession(viewSession)
    setData(prev => ({ ...prev, profile: { name: profile.name || prev.profile.name, email: profile.email || prev.profile.email } }))
    setRoute('dashboard')
  }
  function signout() {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setRoute('dashboard')
    setDialog(null)
    setConfirm(null)
  }
  function saveTransaction(input) {
    const id = input.id || uid()
    mutate(prev => ({ ...prev, transactions: input.id ? prev.transactions.map(t => t.id === input.id ? { ...t, ...input } : t) : [{ ...input, id, createdAt: new Date().toISOString() }, ...prev.transactions] }))
    setDialog(null)
    notify(input.id ? 'Đã cập nhật giao dịch.' : 'Đã thêm giao dịch.')
  }
  function saveBudget(input) {
    const existing = data.budgets.find(b => b.month === input.month && b.category === input.category && b.id !== input.id)
    if (existing) return notify('Danh mục này đã có ngân sách trong tháng.', 'error')
    mutate(prev => ({ ...prev, budgets: input.id ? prev.budgets.map(b => b.id === input.id ? { ...b, ...input } : b) : [...prev.budgets, { ...input, id: uid() }] }))
    setDialog(null)
    notify(input.id ? 'Đã cập nhật ngân sách.' : 'Đã tạo ngân sách.')
  }
  function saveRecurring(input) {
    mutate(prev => ({ ...prev, recurring: input.id ? prev.recurring.map(r => r.id === input.id ? { ...r, ...input } : r) : [{ ...input, id: uid() }, ...prev.recurring] }))
    setDialog(null)
    notify(input.id ? 'Đã cập nhật quy tắc.' : 'Đã tạo quy tắc.')
  }
  function saveReminder(input) {
    mutate(prev => ({ ...prev, notifications: input.id ? prev.notifications.map(n => n.id === input.id ? { ...n, ...input } : n) : [{ ...input, id: uid(), read: false, date: new Date().toISOString() }, ...prev.notifications] }))
    setDialog(null)
    notify(input.id ? 'Đã cập nhật nhắc nhở.' : 'Đã tạo nhắc nhở.')
  }
  function requestDelete(kind, item) {
    const names = { transaction: 'giao dịch', budget: 'ngân sách', recurring: 'quy tắc', notification: 'thông báo' }
    setConfirm({ kind, item, title: `Xóa ${names[kind]}?`, text: 'Thao tác này sẽ xóa dữ liệu được chọn.' })
  }
  function deleteConfirmed() {
    if (!confirm) return
    const { kind, item } = confirm
    const tables = { transaction: 'transactions', budget: 'budgets', recurring: 'recurring', notification: 'notifications' }
    const table = tables[kind]
    mutate(prev => ({ ...prev, [table]: prev[table].filter(r => r.id !== item.id) }))
    setConfirm(null)
    notify('Đã xóa thành công.')
  }
  function updatePreferences(next) { mutate(prev => ({ ...prev, preferences: { ...prev.preferences, ...next } })); notify('Đã cập nhật tùy chọn.') }
  function openDialog(kind, item = null) { setDialog({ kind, item }) }

  if (!session) return <><Auth onEnter={enter} toast={notify}/>{toast && <Toast item={toast} close={() => setToast(null)}/>}</>

  const heading = TITLES[route] || 'SmartExpense'
  const userName = data.profile.name || session.name || 'Khách hàng'

  return <div className="app-shell">
    {mobileOpen && <button className="sidebar-scrim" aria-label="Đóng menu" onClick={() => setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-visible' : ''}`}>
      <div className="sidebar-brand"><span className="brand-icon"><ChartNoAxesCombined size={23}/></span><span>smart<span>expense</span></span><button type="button" className="sidebar-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X size={18}/></button></div>
      <div className="sidebar-section-title">KHÔNG GIAN LÀM VIỆC</div>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">{NAV.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => navigate(id)} className={`nav-item ${route === id ? 'active' : ''}`}><Icon size={20} strokeWidth={1.85}/><span>{label}</span>{id === 'notifications' && unread > 0 && <em className="nav-count">{unread > 99 ? '99+' : unread}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={18}/><strong>Money, made simple.</strong><span>Chủ động hơn mỗi ngày, từ những khoản nhỏ nhất.</span></div><div className="sidebar-section-title">CÀI ĐẶT</div><button type="button" onClick={() => navigate('settings')} className={`nav-item ${route === 'settings' ? 'active' : ''}`}><Settings2 size={20}/><span>Tài khoản</span></button><div className="sidebar-profile"><span className="avatar">{userName.charAt(0).toUpperCase()}</span><span className="profile-copy"><strong>{userName}</strong><small>{data.profile.email || 'Tài khoản cá nhân'}</small></span><button className="icon-button sidebar-logout" type="button" onClick={signout} title="Đăng xuất" aria-label="Đăng xuất"><LogOut size={18}/></button></div></div>
    </aside>
    <div className="app-main"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Mở menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div className="breadcrumb">SMARTEXPENSE <ChevronRight size={14}/> <strong>{heading}</strong></div></div><div className="topbar-right"><div className="month-switcher"><button className="icon-button" onClick={() => setMonth(m => shiftMonth(m, -1))} title="Tháng trước"><ChevronLeft size={18}/></button><label className="month-picker-label"><CalendarDays size={16}/><span>{monthLabel(month)}</span><input type="month" aria-label="Chọn tháng" value={month} onChange={e => e.target.value && setMonth(e.target.value)}/></label><button className="icon-button" onClick={() => setMonth(m => shiftMonth(m, 1))} title="Tháng sau"><ChevronRight size={18}/></button></div><button className="header-notifications" aria-label="Mở thông báo" onClick={() => navigate('notifications')}><Bell size={20}/>{unread > 0 && <span/>}</button><button className="header-avatar" onClick={() => navigate('settings')} aria-label="Tài khoản">{userName.charAt(0).toUpperCase()}</button></div></header>
      <main className="content"><div className="welcome-line"><div><span className="eyebrow">✦ SMART FINANCE STUDIO</span><h1>{heading === 'Tổng quan' ? `Một ngày tốt lành, ${userName}!` : heading}</h1>{route === 'dashboard' && <p>Đây là tình hình tài chính của bạn trong {monthLabel(month).toLowerCase()}.</p>}</div></div>
        {route === 'dashboard' && <Dashboard data={data} month={month} navigate={navigate} addTransaction={() => openDialog('transaction')}/>}
        {route === 'transactions' && <Transactions data={data} month={month} add={() => openDialog('transaction')} onEdit={item => openDialog('transaction', item)} onDelete={item => requestDelete('transaction', item)}/>}
        {route === 'budgets' && <Budgets data={data} month={month} add={() => openDialog('budget')} onEdit={item => openDialog('budget', item)} onDelete={item => requestDelete('budget', item)}/>}
        {route === 'calendar' && <CalendarPage data={data} month={month} selectedDay={selectedDay} setSelectedDay={setSelectedDay} add={() => openDialog('transaction')} onEdit={item => openDialog('transaction', item)} onDelete={item => requestDelete('transaction', item)}/>}
        {route === 'notifications' && <Notifications data={data} month={month} add={() => openDialog('reminder')} onEdit={item => openDialog('reminder', item)} onRead={id => mutate(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n) }))} onReadAll={() => mutate(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }))} onDelete={item => requestDelete('notification', item)}/>}
        {route === 'automation' && <Automation data={data} onAdd={() => openDialog('recurring')} onEdit={item => openDialog('recurring', item)} onDelete={item => requestDelete('recurring', item)} onToggle={(id, active) => mutate(prev => ({ ...prev, recurring: prev.recurring.map(r => r.id === id ? { ...r, active } : r) }))} onPreferences={updatePreferences}/>}
        {route === 'settings' && <Settings data={data} onProfile={profile => { mutate(prev => ({ ...prev, profile })); notify('Đã lưu thông tin cá nhân.') }} onSignOut={signout} onPassword={() => openDialog('password')}/>}
      </main><footer className="app-footer"><span>© {new Date().getFullYear()} SmartExpense</span><span>Quản lý tài chính cá nhân</span></footer>
    </div>
    {dialog?.kind === 'transaction' && <TransactionForm month={month} item={dialog.item} onSave={saveTransaction} onClose={() => setDialog(null)}/>}
    {dialog?.kind === 'budget' && <BudgetForm month={month} item={dialog.item} onSave={saveBudget} onClose={() => setDialog(null)}/>}
    {dialog?.kind === 'recurring' && <RecurringForm item={dialog.item} onSave={saveRecurring} onClose={() => setDialog(null)}/>}
    {dialog?.kind === 'reminder' && <ReminderForm item={dialog.item} onSave={saveReminder} onClose={() => setDialog(null)}/>}
    {dialog?.kind === 'password' && <PasswordForm email={data.profile.email} close={() => setDialog(null)} toast={notify}/>}
    {confirm && <Modal title={confirm.title} onClose={() => setConfirm(null)}><div className="confirm-body"><p>{confirm.text}</p><div className="modal-actions"><button className="btn btn-ghost" onClick={() => setConfirm(null)}>Hủy</button><button className="btn btn-danger" onClick={deleteConfirmed}>Xóa</button></div></div></Modal>}
    {toast && <Toast item={toast} close={() => setToast(null)}/>}
  </div>
}

function PasswordForm({ email, close, toast }) {
  const [step, setStep] = useState('email')
  const [address, setAddress] = useState(email || '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  function submit(e) {
    e.preventDefault()
    if (step === 'email') {
      if (!address.includes('@')) return toast('Email không hợp lệ.', 'error')
      setStep('otp')
      toast('Chưa gửi email OTP vì Supabase chưa được kết nối.', 'info')
    } else {
      if (otp.length !== 6 || password.length < 8 || password !== confirm) return toast('Kiểm tra mã OTP và mật khẩu mới.', 'error')
      toast('Xác thực và đổi mật khẩu sẽ hoạt động sau khi kết nối Supabase.', 'info')
    }
  }
  return <Modal title="Đổi mật khẩu" onClose={close}><form className="modal-form" onSubmit={submit}>
    <Field label="Email xác minh"><input type="email" disabled={step === 'otp'} value={address} onChange={e => setAddress(e.target.value)} required/></Field>
    {step === 'otp' && <><Field label="Mã OTP"><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6 chữ số"/></Field><Field label="Mật khẩu mới"><input type="password" autoComplete="new-password" required minLength="8" value={password} onChange={e => setPassword(e.target.value)}/></Field><Field label="Xác nhận mật khẩu"><input type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}/></Field></>}
    <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={close}>Hủy</button><button type="submit" className="btn btn-primary">{step === 'email' ? 'Tiếp tục' : 'Xác nhận'}</button></div>
  </form></Modal>
}

function Toast({ item, close }) {
  const Icon = item.kind === 'error' ? AlertCircle : item.kind === 'info' ? Info : CheckCircle2
  return <div className={`toast toast-${item.kind}`} role="status"><Icon size={20}/><span>{item.message}</span><button onClick={close} aria-label="Đóng thông báo"><X size={17}/></button></div>
}

export default App
