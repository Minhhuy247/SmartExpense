import React, { useEffect, useState } from 'react'
import {
  Bell, RefreshCcw, CalendarDays, ChartNoAxesCombined, ChevronLeft, ChevronRight, CircleHelp, CreditCard,
  House, LayoutDashboard, LogOut, Menu, Plus, Repeat2, Settings2, ShieldCheck,
  WalletCards, X, CheckCircle2, AlertCircle, Info, Sparkles
} from 'lucide-react'
import Auth from './components/Auth'
import { BudgetForm, RecurringForm, ReminderForm, TransactionForm } from './components/Forms'
import { Automation, Budgets, CalendarPage, Dashboard, Notifications, Settings, Transactions } from './components/Pages'
import { Modal } from './components/Ui'
import { emptyData, monthKey, monthLabel, shiftMonth, uid } from './lib/data'
import { supabase } from './lib/supabase'
import * as api from './lib/api'

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
  const [data, setData] = useState(() => emptyData())
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [route, setRoute] = useState('dashboard')
  const [month, setMonth] = useState(monthKey())
  const [selectedDay, setSelectedDay] = useState('')
  const [dialog, setDialog] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const unread = data.notifications.filter(item => !item.read).length

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: authData, error }) => {
      if (mounted) {
        if (error) setToast({ id: uid(), message: error.message, kind: 'error' })
        setSession(authData?.session || null)
        setAuthLoading(false)
      }
    }).catch(error => {
      if (mounted) { setToast({ id: uid(), message: error.message, kind: 'error' }); setAuthLoading(false) }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      if (!currentSession) { setData(emptyData()); setRoute('dashboard') }
    })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  const userId = session?.user?.id
  async function refresh() {
    if (!userId) return
    setLoading(true)
    try { setData(await api.fetchAccountData(session.user)) }
    catch (error) { notify(error.message || 'Không thể tải dữ liệu.', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setData(emptyData(session.user))
    setLoading(true)
    api.fetchAccountData(session.user).then(result => { if (!cancelled) setData(result) })
      .catch(error => { if (!cancelled) notify(error.message || 'Không thể tải dữ liệu.', 'error') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId, route])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4200)
    return () => clearTimeout(timer)
  }, [toast])

  function notify(message, kind = 'success') { setToast({ id: uid(), message, kind }) }
  function navigate(next) { setRoute(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }) }
  async function execute(task, message, closeDialog = true) {
    if (!userId || loading) return
    setLoading(true)
    try {
      await task()
      const fresh = await api.fetchAccountData(session.user)
      setData(fresh)
      if (closeDialog) { setDialog(null); setConfirm(null) }
      notify(message)
    } catch (error) {
      notify(error.message || 'Thao tác không thành công.', 'error')
    } finally { setLoading(false) }
  }
  async function signout() {
    const { error } = await supabase.auth.signOut()
    if (error) notify(error.message, 'error')
    else { setSession(null); setData(emptyData()); setDialog(null); setConfirm(null) }
  }
  const saveTransaction = input => execute(() => api.saveTransaction(userId, input), input.id ? 'Đã cập nhật giao dịch.' : 'Đã thêm giao dịch.')
  const saveBudget = input => execute(() => api.saveBudget(userId, input), input.id ? 'Đã cập nhật ngân sách.' : 'Đã tạo ngân sách.')
  const saveRecurring = input => execute(() => api.saveRecurring(userId, input), input.id ? 'Đã cập nhật quy tắc.' : 'Đã tạo quy tắc.')
  const saveReminder = input => execute(() => api.saveNotification(userId, input), input.id ? 'Đã cập nhật nhắc nhở.' : 'Đã tạo nhắc nhở.')
  function requestDelete(kind, item) {
    const names = { transaction: 'giao dịch', budget: 'ngân sách', recurring: 'quy tắc', notification: 'thông báo' }
    setConfirm({ kind, item, title: `Xóa ${names[kind]}?`, text: 'Thao tác này sẽ xóa dữ liệu được chọn.' })
  }
  function deleteConfirmed() {
    if (!confirm) return
    const tables = { transaction: 'transactions', budget: 'budgets', recurring: 'recurring_rules', notification: 'notifications' }
    execute(() => api.removeRow(userId, tables[confirm.kind], confirm.item.id), 'Đã xóa thành công.')
  }
  function updatePreferences(next) {
    const updated = { ...data.preferences, ...next }
    execute(() => api.savePreferences(userId, updated), 'Đã cập nhật tùy chọn.', false)
  }
  function openDialog(kind, item = null) { setDialog({ kind, item }) }
  if (authLoading) return <div className="app-loading">SmartExpense</div>
  if (!session) return <><Auth toast={notify}/>{toast && <Toast item={toast} close={() => setToast(null)}/>}</>

  const heading = TITLES[route] || 'SmartExpense'
  const userName = data.profile.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Khách hàng'

  return <div className="app-shell">
    {mobileOpen && <button className="sidebar-scrim" aria-label="Đóng menu" onClick={() => setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-visible' : ''}`}>
      <div className="sidebar-brand"><span className="brand-icon"><ChartNoAxesCombined size={23}/></span><span>smart<span>expense</span></span><button type="button" className="sidebar-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X size={18}/></button></div>
      <div className="sidebar-section-title">KHÔNG GIAN LÀM VIỆC</div>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">{NAV.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => navigate(id)} className={`nav-item ${route === id ? 'active' : ''}`}><Icon size={20} strokeWidth={1.85}/><span>{label}</span>{id === 'notifications' && unread > 0 && <em className="nav-count">{unread > 99 ? '99+' : unread}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={18}/><strong>Money, made simple.</strong><span>Chủ động hơn mỗi ngày, từ những khoản nhỏ nhất.</span></div><div className="sidebar-section-title">CÀI ĐẶT</div><button type="button" onClick={() => navigate('settings')} className={`nav-item ${route === 'settings' ? 'active' : ''}`}><Settings2 size={20}/><span>Tài khoản</span></button><div className="sidebar-profile"><span className="avatar">{userName.charAt(0).toUpperCase()}</span><span className="profile-copy"><strong>{userName}</strong><small>{data.profile.email || 'Tài khoản cá nhân'}</small></span><button className="icon-button sidebar-logout" type="button" onClick={signout} title="Đăng xuất" aria-label="Đăng xuất"><LogOut size={18}/></button></div></div>
    </aside>
    <div className="app-main"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Mở menu" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div className="breadcrumb">SMARTEXPENSE <ChevronRight size={14}/> <strong>{heading}</strong></div></div><div className="topbar-right"><div className="month-switcher"><button className="icon-button" onClick={() => setMonth(m => shiftMonth(m, -1))} title="Tháng trước"><ChevronLeft size={18}/></button><label className="month-picker-label"><CalendarDays size={16}/><span>{monthLabel(month)}</span><input type="month" aria-label="Chọn tháng" value={month} onChange={e => e.target.value && setMonth(e.target.value)}/></label><button className="icon-button" onClick={() => setMonth(m => shiftMonth(m, 1))} title="Tháng sau"><ChevronRight size={18}/></button></div><button className="icon-button" title="Làm mới dữ liệu" aria-label="Làm mới dữ liệu" onClick={refresh}><RefreshCcw size={18}/></button><button className="header-notifications" aria-label="Mở thông báo" onClick={() => navigate('notifications')}><Bell size={20}/>{unread > 0 && <span/>}</button><button className="header-avatar" onClick={() => navigate('settings')} aria-label="Tài khoản">{userName.charAt(0).toUpperCase()}</button></div></header>
      <main className="content">{loading && <div className="sync-indicator" role="status">Đang đồng bộ...</div>}<div className="welcome-line"><div><span className="eyebrow">✦ SMART FINANCE STUDIO</span><h1>{heading === 'Tổng quan' ? `Một ngày tốt lành, ${userName}!` : heading}</h1>{route === 'dashboard' && <p>Đây là tình hình tài chính của bạn trong {monthLabel(month).toLowerCase()}.</p>}</div></div>
        {route === 'dashboard' && <Dashboard data={data} month={month} navigate={navigate} addTransaction={() => openDialog('transaction')}/>}
        {route === 'transactions' && <Transactions data={data} month={month} add={() => openDialog('transaction')} onEdit={item => openDialog('transaction', item)} onDelete={item => requestDelete('transaction', item)}/>}
        {route === 'budgets' && <Budgets data={data} month={month} add={() => openDialog('budget')} onEdit={item => openDialog('budget', item)} onDelete={item => requestDelete('budget', item)}/>}
        {route === 'calendar' && <CalendarPage data={data} month={month} selectedDay={selectedDay} setSelectedDay={setSelectedDay} add={() => openDialog('transaction')} onEdit={item => openDialog('transaction', item)} onDelete={item => requestDelete('transaction', item)}/>}
        {route === 'notifications' && <Notifications data={data} month={month} add={() => openDialog('reminder')} onEdit={item => openDialog('reminder', item)} onRead={id => execute(() => api.setNotificationRead(userId, id), 'Đã đánh dấu đã đọc.', false)} onReadAll={() => execute(() => api.setNotificationRead(userId), 'Đã đánh dấu tất cả đã đọc.', false)} onDelete={item => requestDelete('notification', item)}/>}
        {route === 'automation' && <Automation data={data} onAdd={() => openDialog('recurring')} onEdit={item => openDialog('recurring', item)} onDelete={item => requestDelete('recurring', item)} onToggle={(id, active) => execute(() => api.toggleRecurring(userId, id, active), 'Đã cập nhật quy tắc.', false)} onPreferences={updatePreferences}/>}
        {route === 'settings' && <Settings data={data} onProfile={profile => execute(() => api.saveProfile(userId, profile.name), 'Đã lưu thông tin cá nhân.', false)} onSignOut={signout}/>}
      </main><footer className="app-footer"><span>© {new Date().getFullYear()} SmartExpense</span><span>Quản lý tài chính cá nhân</span></footer>
    </div>
    {dialog?.kind === 'transaction' && <TransactionForm month={month} item={dialog.item} onSave={saveTransaction} onClose={() => setDialog(null)}/>}
    {dialog?.kind === 'budget' && <BudgetForm month={month} item={dialog.item} onSave={saveBudget} onClose={() => setDialog(null)}/>}
    {dialog?.kind === 'recurring' && <RecurringForm item={dialog.item} onSave={saveRecurring} onClose={() => setDialog(null)}/>}
    {dialog?.kind === 'reminder' && <ReminderForm item={dialog.item} onSave={saveReminder} onClose={() => setDialog(null)}/>}

    {confirm && <Modal title={confirm.title} onClose={() => setConfirm(null)}><div className="confirm-body"><p>{confirm.text}</p><div className="modal-actions"><button className="btn btn-ghost" onClick={() => setConfirm(null)}>Hủy</button><button className="btn btn-danger" onClick={deleteConfirmed}>Xóa</button></div></div></Modal>}
    {toast && <Toast item={toast} close={() => setToast(null)}/>}
  </div>
}

function Toast({ item, close }) {
  const Icon = item.kind === 'error' ? AlertCircle : item.kind === 'info' ? Info : CheckCircle2
  return <div className={`toast toast-${item.kind}`} role="status"><Icon size={20}/><span>{item.message}</span><button onClick={close} aria-label="Đóng thông báo"><X size={17}/></button></div>
}

export default App
