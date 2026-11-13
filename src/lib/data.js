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

export const STORE_KEY = 'smartexpense.frontend.v1'
export const SESSION_KEY = 'smartexpense.preview.session'
export const REMEMBER_KEY = 'smartexpense.remembered.email'
export const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
export const todayKey = () => localDate(new Date())
export function localDate(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function offsetDate(month, day, shift = 0) {
  const [y, m] = month.split('-').map(Number)
  return localDate(new Date(y, m - 1 + shift, day))
}
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
export const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('vi-VN')} ₫`
export const compactMoney = (n) => {
  const value = Math.abs(Number(n) || 0)
  if (value >= 1_000_000) return `${(Number(n) / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`
  if (value >= 1_000) return `${(Number(n) / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k`
  return `${Number(n) || 0}`
}
export const monthLabel = (month) => {
  const [y, m] = month.split('-')
  return `Tháng ${Number(m)}, ${y}`
}
export const dateLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
export const shortDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
export const shiftMonth = (month, delta) => {
  const [y, m] = month.split('-').map(Number)
  return monthKey(new Date(y, m - 1 + delta, 1))
}
export const getCategory = (name) => CATEGORIES.find((c) => c.name === name) || CATEGORIES[8]
export const categoryOptions = (type) => CATEGORIES.filter((item) => item.type === type)
export const spentFor = (items, category, month) => items.filter((t) => t.type === 'expense' && t.category === category && t.date.startsWith(month)).reduce((n, t) => n + Number(t.amount), 0)

function createSeed() {
  const month = monthKey()
  const rows = [
    ['income', 'Lương', 'Lương tháng', 14500000, 3, 0],
    ['income', 'Thưởng', 'Dự án cá nhân', 2200000, 11, 0],
    ['expense', 'Ăn uống', 'Ăn trưa', 48000, 5, 0],
    ['expense', 'Ăn uống', 'Đi siêu thị', 426000, 7, 0],
    ['expense', 'Hóa đơn', 'Internet', 220000, 8, 0],
    ['expense', 'Đi lại', 'Đổ xăng', 150000, 9, 0],
    ['expense', 'Mua sắm', 'Đồ dùng cá nhân', 360000, 10, 0],
    ['expense', 'Nhà ở', 'Tiền phòng', 3200000, 2, 0],
    ['expense', 'Ăn uống', 'Cà phê', 45000, 12, 0],
    ['expense', 'Giáo dục', 'Mua tài liệu học tập', 180000, 12, 0],
    ['expense', 'Giải trí', 'Xem phim', 120000, 6, 0],
    ['expense', 'Ăn uống', 'Ăn tối', 95000, 13, 0],
    ['income', 'Lương', 'Lương tháng trước', 14000000, 3, -1],
    ['expense', 'Nhà ở', 'Tiền phòng', 3200000, 2, -1],
    ['expense', 'Ăn uống', 'Chi tiêu ăn uống', 1950000, 9, -1],
    ['expense', 'Mua sắm', 'Mua sắm tháng trước', 850000, 13, -1],
    ['expense', 'Hóa đơn', 'Điện và nước', 540000, 10, -1],
    ['expense', 'Đi lại', 'Đi lại tháng trước', 410000, 12, -1]
  ]
  return {
    transactions: rows.map(([type, category, note, amount, day, delta]) => ({ id: uid(), type, category, note, amount, date: offsetDate(month, day, delta), createdAt: new Date().toISOString() })),
    budgets: [
      ['Ăn uống', 2500000], ['Đi lại', 700000], ['Mua sắm', 1000000], ['Giải trí', 500000], ['Hóa đơn', 700000], ['Nhà ở', 3500000], ['Giáo dục', 600000]
    ].map(([category, limit]) => ({ id: uid(), category, limit, month, note: '' })),
    notifications: [
      { id: uid(), title: 'Chào mừng đến SmartExpense', message: 'Mọi khoản thu chi của bạn được quản lý tại một nơi.', kind: 'system', read: false, date: new Date().toISOString() }
    ],
    recurring: [
      { id: uid(), title: 'Tiền phòng', type: 'expense', category: 'Nhà ở', amount: 3200000, day: 2, active: true },
      { id: uid(), title: 'Internet', type: 'expense', category: 'Hóa đơn', amount: 220000, day: 8, active: true }
    ],
    preferences: { alertNear: true, alertExceeded: true, alertPercent: 80, monthlySummary: true },
    alertLevels: {},
    profile: { name: 'Khách hàng', email: '' }
  }
}

export function loadData() {
  try {
    const stored = localStorage.getItem(STORE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed.transactions) && Array.isArray(parsed.budgets)) {
        return { ...createEmpty(), ...parsed, notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [], recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [], alertLevels: parsed.alertLevels || {}, profile: parsed.profile || createEmpty().profile, preferences: { ...createEmpty().preferences, ...parsed.preferences } }
      }
    }
  } catch {
    return createSeed()
  }
  return createSeed()
}

export function saveData(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)) } catch { return false }
  return true
}

function createEmpty() {
  return {
    transactions: [], budgets: [], notifications: [], recurring: [],
    preferences: { alertNear: true, alertExceeded: true, alertPercent: 80, monthlySummary: true },
    alertLevels: {}, profile: { name: 'Khách hàng', email: '' }
  }
}

export function reconcileAlerts(state) {
  const updates = []
  const levels = { ...state.alertLevels }
  for (const budget of state.budgets) {
    const spent = spentFor(state.transactions, budget.category, budget.month)
    const ratio = budget.limit > 0 ? 100 * spent / budget.limit : 0
    const level = ratio > 100 ? 3 : ratio >= 100 ? 2 : ratio >= state.preferences.alertPercent ? 1 : 0
    const previous = levels[budget.id] || 0
    const enabled = (level >= 2 && state.preferences.alertExceeded) || (level === 1 && state.preferences.alertNear)
    if (level > 0 && level !== previous && enabled) {
      const title = level === 3 ? `Vượt ngân sách ${budget.category}` : level === 2 ? `Đã hết ngân sách ${budget.category}` : `Sắp chạm ngân sách ${budget.category}`
      const message = `${monthLabel(budget.month)} · Đã chi ${money(spent)} trên ${money(budget.limit)} (${Math.round(ratio)}%).`
      updates.push({ id: uid(), title, message, kind: 'budget', category: budget.category, month: budget.month, read: false, date: new Date().toISOString() })
    }
    levels[budget.id] = level
  }
  return updates.length ? { ...state, alertLevels: levels, notifications: [...updates, ...state.notifications] } : { ...state, alertLevels: levels }
}
