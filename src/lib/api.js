import { supabase } from './supabase'
import { emptyData } from './data'

function assert(result) {
  if (result.error) throw result.error
  return result.data
}

export async function fetchAccountData(user) {
  const [profile, transactions, budgets, notifications, recurring, settings] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('transaction_date', { ascending: false }),
    supabase.from('budgets').select('*').eq('user_id', user.id),
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('recurring_rules').select('*').eq('user_id', user.id),
    supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle()
  ])
  for (const result of [profile, transactions, budgets, notifications, recurring, settings]) assert(result)
  const state = emptyData(user)
  state.profile.name = profile.data?.full_name || user.user_metadata?.full_name || ''
  state.transactions = (transactions.data || []).map(t => ({ id: t.id, type: t.type, category: t.category, note: t.title || t.note || '', amount: Number(t.amount), date: t.transaction_date, createdAt: t.created_at }))
  state.budgets = (budgets.data || []).map(b => ({ id: b.id, category: b.category, limit: Number(b.amount), month: b.month.slice(0, 7), note: b.note || '' }))
  state.notifications = (notifications.data || []).map(n => ({ id: n.id, title: n.title, message: n.message, kind: n.type === 'warning' ? 'budget' : n.type === 'success' ? 'system' : n.type === 'custom' ? 'custom' : 'system', read: n.is_read, date: n.created_at }))
  state.recurring = (recurring.data || []).map(r => ({ id: r.id, title: r.title, type: r.type, category: r.category, amount: Number(r.amount), day: r.day_of_month, active: r.active }))
  if (settings.data) state.preferences = { alertNear: settings.data.alert_near, alertExceeded: settings.data.alert_exceeded, alertPercent: settings.data.alert_percent, monthlySummary: settings.data.monthly_summary }
  return state
}

export async function saveTransaction(userId, input) {
  const record = { user_id: userId, title: input.note, note: input.note, category: input.category, type: input.type, amount: Number(input.amount), transaction_date: input.date, automation_processed_at: null }
  if (input.id) return assert(await supabase.from('transactions').update(record).eq('user_id', userId).eq('id', input.id).select('id').single())
  return assert(await supabase.from('transactions').insert(record).select('id').single())
}

export async function saveBudget(userId, input) {
  const record = { user_id: userId, category: input.category, amount: Number(input.limit), month: `${input.month}-01`, note: input.note || '' }
  if (input.id) return assert(await supabase.from('budgets').update(record).eq('user_id', userId).eq('id', input.id).select('id').single())
  return assert(await supabase.from('budgets').insert(record).select('id').single())
}

export async function saveRecurring(userId, input) {
  const record = { user_id: userId, title: input.title, category: input.category, type: input.type, amount: Number(input.amount), day_of_month: input.day, active: input.active }
  if (input.id) return assert(await supabase.from('recurring_rules').update(record).eq('user_id', userId).eq('id', input.id).select('id').single())
  return assert(await supabase.from('recurring_rules').insert(record).select('id').single())
}

export async function saveNotification(userId, input) {
  const record = { user_id: userId, title: input.title, message: input.message || '', type: input.kind === 'custom' ? 'custom' : 'info' }
  if (input.id) return assert(await supabase.from('notifications').update(record).eq('user_id', userId).eq('id', input.id).select('id').single())
  return assert(await supabase.from('notifications').insert(record).select('id').single())
}

export async function removeRow(userId, table, id) {
  assert(await supabase.from(table).delete().eq('user_id', userId).eq('id', id))
}

export async function setNotificationRead(userId, id) {
  let q = supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
  if (id) q = q.eq('id', id)
  assert(await q)
}

export async function toggleRecurring(userId, id, active) {
  assert(await supabase.from('recurring_rules').update({ active }).eq('user_id', userId).eq('id', id))
}

export async function savePreferences(userId, next) {
  const record = { user_id: userId, alert_near: next.alertNear, alert_exceeded: next.alertExceeded, alert_percent: Number(next.alertPercent), monthly_summary: next.monthlySummary }
  assert(await supabase.from('user_preferences').upsert(record, { onConflict: 'user_id' }))
}

export async function saveProfile(userId, name) {
  assert(await supabase.from('profiles').update({ full_name: name }).eq('id', userId))
}
