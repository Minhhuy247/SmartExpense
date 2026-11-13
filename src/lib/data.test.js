import test from 'node:test'
import assert from 'node:assert/strict'
import { spentFor, money, shiftMonth, monthLabel, emptyData } from './data.js'

test('Không tạo dữ liệu mẫu khi chưa đăng nhập', () => {
 const state = emptyData()
 assert.equal(state.transactions.length, 0)
 assert.equal(state.budgets.length, 0)
 assert.equal(state.notifications.length, 0)
})
test('Thống kê tính đúng theo tháng', () => {
 const rows = [{type:'expense', category:'Ăn uống', amount:35000, date:'2026-11-14'}, {type:'expense', category:'Ăn uống', amount:20000,date:'2026-10-14'}]
 assert.equal(spentFor(rows,'Ăn uống','2026-11'),35000)
})
test('Định dạng', () => {
 assert.equal(money(1200000),'1.200.000 ₫')
 assert.equal(shiftMonth('2026-01',-1),'2025-12')
 assert.equal(monthLabel('2026-11'),'Tháng 11, 2026')
})
