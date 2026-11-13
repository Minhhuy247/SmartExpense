import React, { useMemo, useState } from 'react'
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, CheckCheck, ChevronDown,
  ChevronLeft, ChevronRight, Clock3, CreditCard, Edit3, Ellipsis, Filter, Info, LayoutGrid,
  Pencil, Plus, Repeat2, Search, Settings2, ShieldAlert, Trash2, TrendingDown, TrendingUp,
  Wallet, WalletCards, X
} from 'lucide-react'
import {
  CATEGORIES, categoryOptions, compactMoney, dateLabel, getCategory, localDate,
  money, monthKey, monthLabel, shiftMonth, shortDate, spentFor, todayKey
} from '../lib/data'
import { BudgetBar, CategoryIcon, EmptyState, Field, SectionTitle, TypeAmount, TypeIcon } from './Ui'

function SummaryCard({ label, amount, icon: Icon, tone, detail }) {
  return <article className={`stat-card stat-${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={20}/></span></div><strong>{money(amount)}</strong><small>{detail}</small></article>
}

function TransactionLine({ item, onEdit, onDelete, compact = false }) {
  return <div className={`transaction-line ${compact ? 'compact' : ''}`}>
    <CategoryIcon name={item.category} size={19}/>
    <div className="transaction-main"><strong>{item.note}</strong><small>{item.category} <span className="mid-dot">·</span> {dateLabel(item.date)}</small></div>
    <TypeAmount type={item.type} amount={item.amount}/>
    {(onEdit || onDelete) && <div className="row-actions">{onEdit && <button className="icon-button" onClick={() => onEdit(item)} aria-label="Sửa giao dịch" title="Sửa"><Pencil size={16}/></button>}{onDelete && <button className="icon-button danger-hover" onClick={() => onDelete(item)} aria-label="Xóa giao dịch" title="Xóa"><Trash2 size={16}/></button>}</div>}
  </div>
}

function BarChart({ transactions, month }) {
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5))
  const values = months.map(m => {
    const entries = transactions.filter(t => t.date.startsWith(m))
    return { month: m, income: entries.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), expense: entries.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) }
  })
  const max = Math.max(...values.flatMap(v => [v.income, v.expense]), 1)
  return <div className="chart-wrap"><div className="chart-legend"><span><i className="legend-dot income-dot"/> Thu nhập</span><span><i className="legend-dot expense-dot"/> Chi tiêu</span></div><div className="chart-content"><div className="chart-y-axis"><span>{compactMoney(max)}</span><span>{compactMoney(max / 2)}</span><span>0</span></div><div className="chart-bars">{values.map(row => <div className="chart-month" key={row.month}><div className="bar-pair"><div className="bar bar-income" title={`Thu nhập: ${money(row.income)}`} style={{ height: `${Math.max(row.income ? 4 : 0, row.income / max * 100)}%` }}/><div className="bar bar-expense" title={`Chi tiêu: ${money(row.expense)}`} style={{ height: `${Math.max(row.expense ? 4 : 0, row.expense / max * 100)}%` }}/></div><span>T{Number(row.month.slice(5))}</span></div>)}</div></div></div>
}

export function Dashboard({ data, month, navigate, addTransaction }) {
  const transactions = data.transactions.filter(t => t.date.startsWith(month))
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const budgets = data.budgets.filter(b => b.month === month)
  const allocated = budgets.reduce((s, b) => s + b.limit, 0)
  const spentOnBudgets = budgets.reduce((s, b) => s + spentFor(transactions, b.category, month), 0)
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt?.localeCompare?.(a.createdAt || '') || 0).slice(0, 5)
  const byCategory = categoryOptions('expense').map(c => ({ ...c, total: spentFor(transactions, c.name, month) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 5)
  const topTotal = byCategory.reduce((s, c) => s + c.total, 0)
  return <>
    <div className="hero-panel"><div className="hero-copy"><span className="eyebrow light">✦ QUẢN LÝ TÀI CHÍNH THÔNG MINH</span><h2>Tiền của bạn.<br/><em>Tương lai của bạn.</em></h2><p>Nhìn rõ dòng tiền, làm chủ ngân sách và từng bước hiện thực hóa những mục tiêu mới.</p><button className="btn btn-gold" onClick={addTransaction}><Plus size={17}/> Ghi lại giao dịch</button><span className="hero-caption">Một quyết định nhỏ · Một thay đổi lớn</span></div><div className="hero-visual" aria-hidden="true"><div className="hero-ring hero-ring-one"/><div className="hero-ring hero-ring-two"/><div className="hero-coin"><WalletCards size={51} strokeWidth={1.35}/></div><div className="hero-float hero-float-a"><span>↗</span><strong>Tài chính rõ ràng</strong><small>Mỗi ngày một tốt hơn</small></div><div className="hero-float hero-float-b"><span>✦</span><strong>YOUR FINANCE</strong></div><span className="hero-star hero-star-a">✦</span><span className="hero-star hero-star-b">✧</span></div></div>
    <div className="stats-grid">
      <SummaryCard label="Tổng thu nhập" amount={income} icon={ArrowDownLeft} tone="green" detail="Trong tháng đang chọn"/>
      <SummaryCard label="Tổng chi tiêu" amount={expense} icon={ArrowUpRight} tone="orange" detail="Trong tháng đang chọn"/>
      <SummaryCard label="Số dư thu - chi" amount={income - expense} icon={Wallet} tone="navy" detail="Chênh lệch thu và chi"/>
      <SummaryCard label="Ngân sách còn lại" amount={allocated - spentOnBudgets} icon={CreditCard} tone="gold" detail={`${budgets.length} danh mục đã thiết lập`}/>
    </div>
    <div className="dashboard-row main-chart-row"><section className="panel"><SectionTitle title="Bức tranh dòng tiền" subtitle="So sánh dòng tiền trong 6 tháng gần nhất"/><BarChart transactions={data.transactions} month={month}/></section>
      <section className="panel"><SectionTitle title="Khoản chi nổi bật" subtitle="Các nhóm chi lớn trong tháng"/>{byCategory.length ? <div className="category-breakdown">{byCategory.map(c => <div className="breakdown-item" key={c.name}><div className="breakdown-head"><span><CategoryIcon name={c.name} size={14}/>{c.name}</span><strong>{money(c.total)}</strong></div><div className="progress-track"><span style={{ background: c.color, width: `${c.total / (topTotal || 1) * 100}%` }}/></div></div>)}</div> : <EmptyState title="Chưa có khoản chi" subtitle="Các danh mục chi tiêu sẽ được hiển thị tại đây."/>}</section>
    </div>
    <div className="dashboard-row"><section className="panel"><SectionTitle title="Nhật ký giao dịch" subtitle="Hoạt động mới nhất trong tháng" right={<button className="link-action" onClick={() => navigate('transactions')}>Xem tất cả <ArrowRight size={16}/></button>}/><div className="line-list">{recent.length ? recent.map(t => <TransactionLine compact key={t.id} item={t}/>) : <EmptyState title="Chưa có giao dịch" subtitle="Thêm giao dịch đầu tiên để bắt đầu theo dõi."/>}</div></section>
      <section className="panel"><SectionTitle title="Kế hoạch ngân sách" subtitle="Theo dõi hạn mức của từng danh mục" right={<button className="link-action" onClick={() => navigate('budgets')}>Quản lý <ArrowRight size={16}/></button>}/><div className="budget-mini-list">{budgets.length ? budgets.slice(0, 5).map(b => { const spent = spentFor(transactions, b.category, month); const p = b.limit ? Math.round(spent / b.limit * 100) : 0; return <div className="budget-mini" key={b.id}><div><strong>{b.category}</strong><span>{p}%</span></div><BudgetBar spent={spent} limit={b.limit}/><small>{money(spent)} / {money(b.limit)}</small></div> }) : <EmptyState title="Chưa thiết lập ngân sách" subtitle="Tạo hạn mức để theo dõi các khoản chi."/>}</div></section>
    </div>
  </>
}

export function Transactions({ data, month, onEdit, onDelete, add }) {
  const [term, setTerm] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const filtered = data.transactions.filter(t => t.date.startsWith(month) && (type === 'all' || t.type === type) && (category === 'all' || t.category === category) && `${t.note} ${t.category}`.toLocaleLowerCase('vi').includes(term.toLocaleLowerCase('vi'))).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''))
  const pageSize = 9
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const shown = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const income = data.transactions.filter(t => t.date.startsWith(month) && t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = data.transactions.filter(t => t.date.startsWith(month) && t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return <>
    <div className="page-heading"><div><h2>Giao dịch</h2><p>Quản lý và tra cứu tất cả khoản thu chi trong tháng.</p></div><button className="btn btn-primary" onClick={add}><Plus size={18}/> Thêm giao dịch</button></div>
    <div className="substats"><div><span>Tổng thu</span><strong className="income">{money(income)}</strong></div><div><span>Tổng chi</span><strong className="expense">{money(expense)}</strong></div><div><span>Chênh lệch</span><strong>{money(income - expense)}</strong></div></div>
    <section className="panel transactions-panel"><div className="toolbar"><div className="search-box"><Search size={18}/><input aria-label="Tìm giao dịch" placeholder="Tìm theo nội dung, danh mục..." value={term} onChange={e => { setTerm(e.target.value); setPage(1) }}/></div><select aria-label="Lọc loại giao dịch" value={type} onChange={e => { setType(e.target.value); setCategory('all'); setPage(1) }}><option value="all">Tất cả thu chi</option><option value="income">Thu nhập</option><option value="expense">Chi tiêu</option></select><select aria-label="Lọc danh mục" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}><option value="all">Tất cả danh mục</option>{CATEGORIES.filter(c => type === 'all' || c.type === type).map(c => <option key={c.name}>{c.name}</option>)}</select></div>
      <div className="table-title"><strong>Danh sách giao dịch</strong><span>{filtered.length} giao dịch</span></div>
      {shown.length ? <div className="transaction-list">{shown.map(t => <TransactionLine key={t.id} item={t} onEdit={onEdit} onDelete={onDelete}/>)}</div> : <EmptyState icon={Search} title="Không tìm thấy giao dịch" subtitle="Thử thay đổi bộ lọc hoặc thêm giao dịch mới." action={<button className="btn btn-soft" onClick={add}>Thêm giao dịch</button>}/>}
      {filtered.length > pageSize && <div className="pagination"><span>Trang {currentPage}/{totalPages}</span><div><button className="icon-button" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={18}/></button><button className="icon-button" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={18}/></button></div></div>}
    </section>
  </>
}

export function Budgets({ data, month, onEdit, onDelete, add }) {
  const budgets = [...data.budgets.filter(b => b.month === month)].sort((a, b) => a.category.localeCompare(b.category, 'vi'))
  const used = budgets.reduce((s, b) => s + spentFor(data.transactions, b.category, month), 0)
  const total = budgets.reduce((s, b) => s + b.limit, 0)
  return <><div className="page-heading"><div><h2>Ngân sách</h2><p>Đặt hạn mức và theo dõi mức sử dụng theo danh mục.</p></div><button className="btn btn-primary" onClick={add}><Plus size={18}/> Tạo ngân sách</button></div>
    <div className="budget-overview"><div><span>Tổng hạn mức</span><strong>{money(total)}</strong></div><div><span>Đã sử dụng</span><strong>{money(used)}</strong></div><div><span>Còn lại</span><strong>{money(total - used)}</strong></div></div>
    {budgets.length ? <div className="budget-cards">{budgets.map(b => { const spent = spentFor(data.transactions, b.category, month); const p = b.limit ? Math.round(spent / b.limit * 100) : 0; return <article className="budget-card" key={b.id}><div className="budget-card-top"><CategoryIcon name={b.category} size={22}/><div className="budget-controls"><button className="icon-button" title="Sửa ngân sách" aria-label="Sửa ngân sách" onClick={() => onEdit(b)}><Pencil size={17}/></button><button className="icon-button danger-hover" title="Xóa ngân sách" aria-label="Xóa ngân sách" onClick={() => onDelete(b)}><Trash2 size={17}/></button></div></div><h3>{b.category}</h3><p className="budget-total"><strong>{money(spent)}</strong><span> / {money(b.limit)}</span></p><BudgetBar spent={spent} limit={b.limit}/><div className="budget-card-foot"><span>{p}% đã dùng</span><span className={p > 100 ? 'status-over' : p >= 80 ? 'status-near' : 'status-good'}>{p > 100 ? 'Vượt hạn mức' : p === 100 ? 'Đã hết hạn mức' : p >= 80 ? 'Gần hết' : 'Trong hạn mức'}</span></div>{b.note && <small className="budget-note">{b.note}</small>}</article>})}</div> : <section className="panel"><EmptyState icon={WalletCards} title="Chưa có ngân sách tháng này" subtitle="Thiết lập hạn mức cho các danh mục thường sử dụng." action={<button className="btn btn-primary" onClick={add}>Tạo ngân sách</button>}/></section>}
  </>
}

export function CalendarPage({ data, month, selectedDay, setSelectedDay, onEdit, onDelete, add }) {
  const [y, m] = month.split('-').map(Number)
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7
  const days = new Date(y, m, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => i - offset + 1)
  const selected = selectedDay?.startsWith(month) ? selectedDay : `${month}-01`
  const transactions = data.transactions.filter(t => t.date === selected).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  const today = todayKey()
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  function dayKey(day) { return `${month}-${String(day).padStart(2, '0')}` }
  return <><div className="page-heading"><div><h2>Lịch thu chi</h2><p>Xem giao dịch theo ngày và theo dõi dòng tiền trong tháng.</p></div><button className="btn btn-primary" onClick={add}><Plus size={18}/> Thêm giao dịch</button></div>
    <div className="calendar-layout"><section className="panel calendar-panel"><div className="calendar-panel-head"><strong>{monthLabel(month)}</strong><span>{data.transactions.filter(t => t.date.startsWith(month)).length} giao dịch</span></div><div className="calendar-grid">{['T2','T3','T4','T5','T6','T7','CN'].map(d => <span className="weekday" key={d}>{d}</span>)}{cells.map((d,i) => {const valid = d >= 1 && d <= days; const date = valid ? dayKey(d) : ''; const rows = valid ? data.transactions.filter(t => t.date === date) : []; const hasIncome = rows.some(t => t.type === 'income'); const hasExpense = rows.some(t => t.type === 'expense'); return <button type="button" key={i} disabled={!valid} className={`calendar-cell ${valid ? '' : 'muted-cell'} ${date === selected ? 'selected' : ''} ${date === today ? 'is-today' : ''}`} onClick={() => valid && setSelectedDay(date)}><span>{valid && d}</span><div className="calendar-dots">{hasIncome && <i className="dot-green"/>}{hasExpense && <i className="dot-amber"/>}</div>{rows.length > 0 && <small>{compactMoney(rows.filter(t => t.type === 'expense').reduce((n,t) => n + t.amount,0))}</small>}</button> })}</div><div className="calendar-legend"><span><i className="dot-green"/> Thu nhập</span><span><i className="dot-amber"/> Chi tiêu</span><span><i className="dot-outline"/> Hôm nay</span></div></section>
      <section className="panel day-panel"><div className="day-panel-head"><span className="eyebrow">CHI TIẾT NGÀY</span><h3>{dateLabel(selected)}</h3><p>{transactions.length} giao dịch</p></div><div className="day-stats"><div><span>Thu nhập</span><strong className="income">+{money(income)}</strong></div><div><span>Chi tiêu</span><strong className="expense">−{money(expense)}</strong></div></div><div className="day-items">{transactions.length ? transactions.map(t => <TransactionLine key={t.id} item={t} compact onEdit={onEdit} onDelete={onDelete}/>) : <EmptyState icon={CalendarDays} title="Ngày này chưa có giao dịch" subtitle="Các khoản thu chi trong ngày sẽ hiển thị ở đây."/>}</div></section></div>
  </>
}

export function Notifications({ data, month, onRead, onDelete, onEdit, onReadAll, add }) {
  const [filter, setFilter] = useState('all')
  const [allTime, setAllTime] = useState(false)
  const items = [...data.notifications].filter(n => (allTime || (n.month || n.date.slice(0, 7)) === month) && (filter === 'all' || (filter === 'unread' ? !n.read : n.kind === filter))).sort((a,b) => b.date.localeCompare(a.date))
  const unread = data.notifications.filter(n => !n.read).length
  return <><div className="page-heading"><div><h2>Thông báo</h2><p>Cảnh báo ngân sách và các nhắc nhở quan trọng.</p></div><button className="btn btn-primary" onClick={add}><Plus size={18}/> Tạo nhắc nhở</button></div>
    <section className="panel notification-panel"><div className="notification-toolbar"><div className="pill-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Tất cả</button><button className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>Chưa đọc {unread ? `(${unread})` : ''}</button><button className={filter === 'budget' ? 'active' : ''} onClick={() => setFilter('budget')}>Ngân sách</button><button className={filter === 'custom' ? 'active' : ''} onClick={() => setFilter('custom')}>Nhắc nhở</button></div><div className="notification-actions"><button className="link-action" onClick={() => setAllTime(v => !v)}>{allTime ? "Chỉ tháng này" : "Tất cả thời gian"}</button><button className="link-action" onClick={onReadAll}><CheckCheck size={16}/> Đánh dấu đã đọc</button></div></div>
      <div className="notification-list">{items.length ? items.map(n => <article className={`notification-row ${n.read ? '' : 'unread'}`} key={n.id}><span className={`notification-symbol ${n.kind}`}><Bell size={20}/></span><div className="notification-body"><div><h3>{n.title}</h3>{!n.read && <i className="unread-pip"/>}</div><p>{n.message}</p><time>{new Date(n.date).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</time></div><div className="row-actions">{!n.read && <button className="icon-button" title="Đánh dấu đã đọc" aria-label="Đánh dấu đã đọc" onClick={() => onRead(n.id)}><Check size={18}/></button>}{n.kind === 'custom' && <button className="icon-button" title="Sửa" aria-label="Sửa nhắc nhở" onClick={() => onEdit(n)}><Pencil size={16}/></button>}<button className="icon-button danger-hover" title="Xóa" aria-label="Xóa thông báo" onClick={() => onDelete(n)}><Trash2 size={17}/></button></div></article>) : <EmptyState icon={Bell} title="Không có thông báo" subtitle="Các cảnh báo và nhắc nhở sẽ được hiển thị tại đây."/>}</div></section>
  </>
}

export function Automation({ data, onAdd, onEdit, onDelete, onToggle, onPreferences }) {
  const pref = data.preferences
  return <><div className="page-heading"><div><h2>Tự động hóa</h2><p>Quản lý các quy tắc và thiết lập tài chính.</p></div><button className="btn btn-primary" onClick={onAdd}><Plus size={18}/> Thêm quy tắc</button></div>
    <div className="automation-banner"><div className="auto-banner-icon"><Repeat2 size={25}/></div><div><h3>Quy tắc tài chính thông minh</h3><p>Quản lý lịch định kỳ và ngưỡng ngân sách trong cùng một nơi.</p></div></div>
    <div className="automation-grid"><section className="panel"><SectionTitle title="Giao dịch định kỳ" subtitle={`${data.recurring.filter(r => r.active).length} quy tắc đang bật`}/><div className="recurring-list">{data.recurring.length ? data.recurring.map(r => <article className="recurring-row" key={r.id}><CategoryIcon name={r.category} size={18}/><div className="recurring-name"><strong>{r.title}</strong><span>Ngày {r.day} hằng tháng <span className="mid-dot">·</span> {r.category}</span></div><div className="recurring-amount"><TypeAmount type={r.type} amount={r.amount}/><label className="switch-compact" title={r.active ? 'Tắt quy tắc' : 'Bật quy tắc'}><input type="checkbox" checked={r.active} onChange={e => onToggle(r.id, e.target.checked)}/><span/></label></div><div className="row-actions"><button className="icon-button" title="Sửa" onClick={() => onEdit(r)}><Pencil size={16}/></button><button className="icon-button danger-hover" title="Xóa" onClick={() => onDelete(r)}><Trash2 size={16}/></button></div></article>) : <EmptyState icon={Repeat2} title="Chưa có quy tắc" subtitle="Thêm khoản thu chi lặp lại để quản lý thuận tiện hơn."/>}</div></section>
      <section className="panel"><SectionTitle title="Cảnh báo ngân sách" subtitle="Thiết lập các điều kiện thông báo"/><div className="setting-list"><label className="setting-row"><span className="setting-symbol warning-symbol"><Bell size={20}/></span><span className="setting-copy"><strong>Gần chạm ngân sách</strong><small>Thông báo khi chi tiêu đạt ngưỡng đã chọn.</small></span><span className="switch-compact"><input type="checkbox" checked={pref.alertNear} onChange={e => onPreferences({ alertNear: e.target.checked })}/><span/></span></label><div className="threshold-row"><span>Ngưỡng cảnh báo</span><select value={pref.alertPercent} onChange={e => onPreferences({ alertPercent: Number(e.target.value) })}><option value={50}>50%</option><option value={70}>70%</option><option value={80}>80%</option><option value={90}>90%</option></select></div><label className="setting-row"><span className="setting-symbol danger-symbol"><ShieldAlert size={20}/></span><span className="setting-copy"><strong>Hết hoặc vượt ngân sách</strong><small>Thông báo khi chi tiêu đạt hoặc vượt hạn mức.</small></span><span className="switch-compact"><input type="checkbox" checked={pref.alertExceeded} onChange={e => onPreferences({ alertExceeded: e.target.checked })}/><span/></span></label><label className="setting-row"><span className="setting-symbol blue-symbol"><CalendarDays size={20}/></span><span className="setting-copy"><strong>Tổng kết theo tháng</strong><small>Nhận báo cáo thu chi vào cuối mỗi tháng.</small></span><span className="switch-compact"><input type="checkbox" checked={pref.monthlySummary} onChange={e => onPreferences({ monthlySummary: e.target.checked })}/><span/></span></label></div></section></div>
  </>
}

export function Settings({ data, onProfile, onSignOut }) {
  const [name, setName] = useState(data.profile.name || '')

  return <><div className="page-heading"><div><h2>Tài khoản</h2><p>Cập nhật thông tin cá nhân và bảo mật tài khoản.</p></div></div>
    <div className="settings-grid"><section className="panel"><SectionTitle title="Thông tin cá nhân" subtitle="Thông tin hiển thị trên tài khoản"/><form className="modal-form settings-form" onSubmit={e => { e.preventDefault(); onProfile({ name: name.trim() }) }}><Field label="Họ và tên"><input required maxLength="60" value={name} onChange={e => setName(e.target.value)}/></Field><Field label="Email"><input type="email" value={data.profile.email} readOnly/></Field><div><button className="btn btn-primary" type="submit">Lưu thông tin</button></div></form></section>
      <section className="panel"><SectionTitle title="Bảo mật" subtitle="Các tùy chọn bảo vệ tài khoản"/><div className="security-row"><span className="setting-symbol warning-symbol"><Wallet size={20}/></span><div><strong>Phiên làm việc</strong><p>Đăng xuất khỏi giao diện trên thiết bị này.</p></div><button className="btn btn-outline" onClick={onSignOut}>Đăng xuất</button></div></section></div>
  </>
}
