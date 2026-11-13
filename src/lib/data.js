export const CATEGORIES = [
  { name: 'Ăn uống', color: '#E69E45', icon: 'utensils', type: 'expense' },
  { name: 'Đi lại', color: '#6E97C8', icon: 'car', type: 'expense' },
  { name: 'Mua sắm', color: '#B88AA1', icon: 'shopping-bag', type: 'expense' },
  { name: 'Hóa đơn', color: '#809C96', icon: 'receipt', type: 'expense' },
  { name: 'Nhà ở', color: '#A18DCC', icon: 'house', type: 'expense' },
  { name: 'Giải trí', color: '#7DA8A4', icon: 'coffee', type: 'expense' },
  { name: 'Sức khỏe', color: '#D1867F', icon: 'heart-pulse', type: 'expense' },
  { name: 'Giáo dục', color: '#6696AD', icon: 'book-open', type: 'expense' },
  { name: 'Khác', color: '#9C9EA6', icon: 'circle', type: 'expense' },
  { name: 'Lương', color: '#4E947A', icon: 'briefcase', type: 'income' },
  { name: 'Thưởng', color: '#79A881', icon: 'gift', type: 'income' },
  { name: 'Thu khác', color: '#729A84', icon: 'wallet', type: 'income' }
]

export const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
export const localDate = date => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
export const todayKey = () => localDate(new Date())
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
export const money = n => `${Math.round(Number(n) || 0).toLocaleString('vi-VN')} ₫`
export const compactMoney = n => { const v = Math.abs(Number(n) || 0); return v >= 1e6 ? `${(Number(n) / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr` : v >= 1000 ? `${Math.round(Number(n) / 1000)}k` : `${Number(n) || 0}` }
export const monthLabel = month => { const [y, m] = month.split('-'); return `Tháng ${Number(m)}, ${y}` }
export const dateLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
export const shortDate = date => new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
export const shiftMonth = (month, delta) => { const [y, m] = month.split('-').map(Number); return monthKey(new Date(y, m - 1 + delta, 1)) }
export const getCategory = name => CATEGORIES.find(c => c.name === name) || CATEGORIES[8]
export const categoryOptions = type => CATEGORIES.filter(c => c.type === type)
export const spentFor = (items, category, month) => items.filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(month)).reduce((s, t) => s + Number(t.amount), 0)
export const emptyData = (user = null) => ({ transactions: [], budgets: [], notifications: [], recurring: [], preferences: { alertNear: true, alertExceeded: true, alertPercent: 80, monthlySummary: false }, profile: { name: user?.user_metadata?.full_name || '', email: user?.email || '' } })
