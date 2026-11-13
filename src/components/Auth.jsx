import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, ChartNoAxesCombined, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react'
import { Field } from './Ui'
import { REMEMBER_KEY } from '../lib/data'

export default function Auth({ onEnter, toast }) {
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [otp, setOtp] = useState('')
  const [remember, setRemember] = useState(true)
  const [visible, setVisible] = useState(false)

  function saveEmail() { if (remember) localStorage.setItem(REMEMBER_KEY, email.trim()); else localStorage.removeItem(REMEMBER_KEY) }
  function login(e) {
    e.preventDefault()
    if (!email.includes('@') || password.length < 6) return toast('Vui lòng kiểm tra email và mật khẩu.', 'error')
    saveEmail()
    toast('Đăng nhập thực sẽ được kích hoạt khi kết nối Supabase.', 'info')
  }
  function register(e) {
    e.preventDefault()
    if (!fullName.trim() || !email.includes('@') || password.length < 8) return toast('Vui lòng nhập đầy đủ thông tin hợp lệ.', 'error')
    if (password !== confirm) return toast('Mật khẩu xác nhận không trùng khớp.', 'error')
    saveEmail()
    setMode('verify')
    toast('Màn hình xác nhận đã sẵn sàng. Chưa gửi email khi chưa kết nối Supabase.', 'info')
  }
  function forgot(e) {
    e.preventDefault()
    if (!email.includes('@')) return toast('Địa chỉ email chưa hợp lệ.', 'error')
    saveEmail()
    setMode('reset')
    toast('Màn hình đặt lại mật khẩu đã sẵn sàng. Chưa có email OTP được gửi.', 'info')
  }
  function verify(e) {
    e.preventDefault()
    if (otp.length !== 6) return toast('Mã OTP cần có 6 chữ số.', 'error')
    toast('Xác minh OTP sẽ hoạt động khi kết nối Supabase Auth.', 'info')
  }
  function reset(e) {
    e.preventDefault()
    if (otp.length !== 6 || password.length < 8 || password !== confirm) return toast('Vui lòng kiểm tra OTP và mật khẩu mới.', 'error')
    toast('Đổi mật khẩu bằng OTP sẽ hoạt động khi kết nối Supabase Auth.', 'info')
  }

  return <div className="auth-layout">
    <aside className="auth-showcase">
      <div className="auth-brand"><span className="auth-mark"><ChartNoAxesCombined size={24}/></span><span>smart<span>expense</span></span></div>
      <div className="auth-story"><span className="eyebrow light">QUẢN LÝ TÀI CHÍNH CÁ NHÂN</span><h1>Chạm tới<br/><em>tự do tài chính.</em></h1><p>Biến những con số thường ngày thành kế hoạch ý nghĩa. Mọi thứ bạn cần để quản lý tiền bạc, ở cùng một nơi.</p>
        <div className="auth-feature"><span><WalletCards size={20}/></span><div><strong>Thu chi minh bạch</strong><small>Theo dõi mọi khoản tiền theo từng tháng</small></div></div>
        <div className="auth-feature"><span><TrendingUp size={20}/></span><div><strong>Ngân sách chủ động</strong><small>Nhận biết khi chi tiêu gần chạm hạn mức</small></div></div>
        <div className="auth-feature"><span><ShieldCheck size={20}/></span><div><strong>Thông tin riêng tư</strong><small>Tài khoản và dữ liệu được quản lý tập trung</small></div></div>
      </div>
      <div className="auth-finance-art" aria-hidden="true"><div className="auth-art-grid"><span style={{height:'34%'}}/><span style={{height:'58%'}}/><span style={{height:'45%'}}/><span style={{height:'78%'}}/><span style={{height:'62%'}}/><span style={{height:'93%'}}/><span style={{height:'73%'}}/></div><div className="auth-art-spark">✦</div><div className="auth-art-label">GROW WITH CONFIDENCE <strong>↗</strong></div></div>
      <div className="auth-footer">SMARTEXPENSE <span>·</span> PERSONAL FINANCE</div>
      <div className="decor-circle one"/><div className="decor-circle two"/>
    </aside>
    <main className="auth-main"><div className="auth-form-wrap">
      {mode !== 'login' && <button className="back-link" type="button" onClick={() => { setMode('login'); setOtp(''); setPassword(''); setConfirm('') }}><ArrowLeft size={16}/> Trở về đăng nhập</button>}
      {mode === 'login' && <><span className="auth-kicker">CHÀO MỪNG TRỞ LẠI</span><h2>Đăng nhập</h2><p className="auth-caption">Quản lý tài chính của bạn một cách dễ dàng.</p>
        <form className="auth-form" onSubmit={login}>
          <Field label="Email"><div className="input-icon"><Mail size={18}/><input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ten@gmail.com"/></div></Field>
          <Field label="Mật khẩu"><div className="input-icon"><LockKeyhole size={18}/><input type={visible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu"/><button className="reveal-password" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></Field>
          <div className="auth-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/> Ghi nhớ email</label><button type="button" className="text-button" onClick={() => setMode('forgot')}>Quên mật khẩu?</button></div>
          <button className="btn btn-primary btn-full" type="submit">Đăng nhập <ArrowRight size={17}/></button>
        </form><p className="auth-bottom">Chưa có tài khoản? <button type="button" className="text-button" onClick={() => setMode('register')}>Đăng ký ngay</button></p></>}
      {mode === 'register' && <><span className="auth-kicker">BẮT ĐẦU NGAY</span><h2>Tạo tài khoản</h2><p className="auth-caption">Thiết lập không gian quản lý tài chính của riêng bạn.</p>
        <form className="auth-form" onSubmit={register}>
          <Field label="Họ và tên"><input autoComplete="name" required maxLength="60" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Văn A"/></Field>
          <Field label="Email"><input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ten@gmail.com" /></Field>
          <Field label="Mật khẩu"><input type="password" autoComplete="new-password" minLength="8" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 8 ký tự" /></Field>
          <Field label="Nhập lại mật khẩu"><input type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Xác nhận mật khẩu" /></Field>
          <button className="btn btn-primary btn-full" type="submit">Tạo tài khoản <ArrowRight size={17}/></button>
        </form></>}
      {mode === 'forgot' && <><span className="auth-kicker">KHÔI PHỤC TÀI KHOẢN</span><h2>Quên mật khẩu</h2><p className="auth-caption">Nhập email để xác minh và đặt lại mật khẩu.</p><form className="auth-form" onSubmit={forgot}><Field label="Email"><div className="input-icon"><Mail size={18}/><input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ten@gmail.com"/></div></Field><button className="btn btn-primary btn-full" type="submit">Tiếp tục <ArrowRight size={17}/></button></form></>}
      {mode === 'verify' && <><span className="auth-kicker">XÁC MINH EMAIL</span><h2>Nhập mã xác nhận</h2><p className="auth-caption">Nhập mã 6 chữ số gửi đến {email}.</p><form className="auth-form" onSubmit={verify}><Field label="Mã OTP"><input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}/></Field><button className="btn btn-primary btn-full" type="submit">Xác nhận email <ArrowRight size={17}/></button></form></>}
      {mode === 'reset' && <><span className="auth-kicker">ĐỔI MẬT KHẨU</span><h2>Đặt lại mật khẩu</h2><p className="auth-caption">Xác minh mã OTP và thiết lập mật khẩu mới.</p><form className="auth-form" onSubmit={reset}><Field label="Mã OTP"><input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6 chữ số" /></Field><Field label="Mật khẩu mới"><input required type="password" autoComplete="new-password" minLength="8" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 8 ký tự" /></Field><Field label="Nhập lại mật khẩu"><input required type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu mới" /></Field><button className="btn btn-primary btn-full" type="submit">Đổi mật khẩu <Check size={18}/></button></form></>}
      <div className="auth-preview"><span>Hoặc</span><button type="button" onClick={() => { saveEmail(); onEnter({ name: fullName.trim() || 'Khách hàng', email: email.trim() }) }}>Khám phá giao diện <ArrowRight size={16}/></button></div>
    </div></main>
  </div>
}
