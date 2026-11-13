import test from 'node:test'
import assert from 'node:assert/strict'
import { reconcileAlerts, spentFor, money, shiftMonth, monthLabel } from './data.js'

const data = (spent, cap = 100000) => ({
  transactions: [{ id: 'tx1', type: 'expense', category: 'Ăn uống', amount: spent, date: '2026-11-12' }],
  budgets: [{ id: 'b1', category: 'Ăn uống', month: '2026-11', limit: cap }],
  notifications: [], recurring: [], alertLevels: {},
  preferences: { alertNear: true, alertExceeded: true, alertPercent: 80, monthlySummary: true }
})

test('Tổng chi chỉ lấy đúng danh mục và tháng', () => {
  const input = data(85000)
  input.transactions.push({ id: 'tx2', type: 'income', category: 'Lương', amount: 1000000, date: '2026-11-12' })
  input.transactions.push({ id: 'tx3', type: 'expense', category: 'Ăn uống', amount: 50000, date: '2026-10-12' })
  assert.equal(spentFor(input.transactions, 'Ăn uống', '2026-11'), 85000)
})

test('Cảnh báo đạt 80% chỉ tạo một lần nếu ngưỡng không đổi', () => {
  let result = reconcileAlerts(data(85000))
  assert.equal(result.notifications.length, 1)
  assert.match(result.notifications[0].title, /Sắp chạm/)
  result.notifications = []
  result = reconcileAlerts(result)
  assert.equal(result.notifications.length, 0)
})

test('Cảnh báo mức 100% và vượt 100% được phân biệt', () => {
  let result = reconcileAlerts(data(100000))
  assert.match(result.notifications[0].title, /Đã hết/)
  result.transactions[0].amount = 110000
  result = reconcileAlerts(result)
  assert.match(result.notifications[0].title, /Vượt ngân sách/)
  assert.equal(result.notifications.length, 2)
})

test('Không cảnh báo khi chưa tới ngưỡng', () => {
  const result = reconcileAlerts(data(10000))
  assert.equal(result.notifications.length, 0)
})

test('Bỏ chọn thông báo gần hết không phát cảnh báo 80%', () => {
  const input = data(90000)
  input.preferences.alertNear = false
  const result = reconcileAlerts(input)
  assert.equal(result.notifications.length, 0)
})

test('Định dạng số tiền và tháng', () => {
  assert.equal(money(1200000), '1.200.000 ₫')
  assert.equal(shiftMonth('2026-01', -1), '2025-12')
  assert.equal(monthLabel('2026-11'), 'Tháng 11, 2026')
})
