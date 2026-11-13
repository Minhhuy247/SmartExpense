import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Field } from "./Ui";
import { supabase } from "../lib/supabase";

export default function Auth({ toast }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (
      mode === "register" &&
      (password.length < 8 || password !== confirm || !fullName.trim())
    ) {
      toast(
        "Kiểm tra họ tên và mật khẩu xác nhận (tối thiểu 8 ký tự).",
        "error",
      );
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          toast("Đăng ký thành công.", "success");
        } else {
          toast("Đăng ký thành công. Vui lòng đăng nhập.", "success");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        toast("Đăng nhập thành công.", "success");
      }
    } catch (err) {
      toast(err.message || "Không thể xác thực tài khoản.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-showcase">
        <div className="auth-brand">
          <span className="auth-mark">
            <ChartNoAxesCombined size={24} />
          </span>
          <span>
            smart<span>expense</span>
          </span>
        </div>
        <div className="auth-story">
          <span className="eyebrow light">QUẢN LÝ TÀI CHÍNH CÁ NHÂN</span>
          <h1>
            Chạm tới
            <br />
            <em>tự do tài chính.</em>
          </h1>
          <p>
            Biến những con số thường ngày thành kế hoạch ý nghĩa. Mọi thứ bạn
            cần để quản lý tiền bạc, ở cùng một nơi.
          </p>
          <div className="auth-feature">
            <span>
              <WalletCards size={20} />
            </span>
            <div>
              <strong>Thu chi minh bạch</strong>
              <small>Theo dõi mọi khoản tiền theo từng tháng</small>
            </div>
          </div>
          <div className="auth-feature">
            <span>
              <TrendingUp size={20} />
            </span>
            <div>
              <strong>Ngân sách chủ động</strong>
              <small>Theo dõi chi tiêu so với hạn mức</small>
            </div>
          </div>
          <div className="auth-feature">
            <span>
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>Thông tin riêng tư</strong>
              <small>Tài khoản được bảo vệ bằng Supabase Auth</small>
            </div>
          </div>
        </div>
        <div className="auth-finance-art" aria-hidden="true">
          <div className="auth-art-grid">
            <span style={{ height: "34%" }} />
            <span style={{ height: "58%" }} />
            <span style={{ height: "45%" }} />
            <span style={{ height: "78%" }} />
            <span style={{ height: "62%" }} />
            <span style={{ height: "93%" }} />
            <span style={{ height: "73%" }} />
          </div>
          <div className="auth-art-spark">✦</div>
          <div className="auth-art-label">
            GROW WITH CONFIDENCE <strong>↗</strong>
          </div>
        </div>
        <div className="auth-footer">
          SMARTEXPENSE <span>·</span> PERSONAL FINANCE
        </div>
        <div className="decor-circle one" />
        <div className="decor-circle two" />
      </aside>
      <main className="auth-main">
        <div className="auth-form-wrap">
          {mode !== "login" && (
            <button
              className="back-link"
              type="button"
              onClick={() => {
                setMode("login");
                setPassword("");
                setConfirm("");
              }}
            >
              <ArrowLeft size={16} /> Trở về đăng nhập
            </button>
          )}
          {mode === "verify" ? (
            <>
              <span className="auth-kicker">XÁC NHẬN TÀI KHOẢN</span>
              <h2>Kiểm tra email</h2>
              <p className="auth-caption">
                Nếu đăng ký thành công, Supabase sẽ gửi liên kết xác nhận đến{" "}
                <strong>{email}</strong>. Mở email và nhấn liên kết, sau đó đăng
                nhập.
              </p>
              <button
                className="btn btn-primary btn-full"
                type="button"
                onClick={() => setMode("login")}
              >
                Đến đăng nhập <ArrowRight size={17} />
              </button>
            </>
          ) : (
            <>
              <span className="auth-kicker">
                {mode === "login" ? "CHÀO MỪNG TRỞ LẠI" : "BẮT ĐẦU NGAY"}
              </span>
              <h2>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h2>
              <p className="auth-caption">
                {mode === "login"
                  ? "Quản lý tài chính của bạn một cách dễ dàng."
                  : "Thiết lập không gian quản lý tài chính của riêng bạn."}
              </p>
              <form className="auth-form" onSubmit={submit}>
                {mode === "register" && (
                  <Field label="Họ và tên">
                    <input
                      autoComplete="name"
                      required
                      maxLength="60"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Họ và tên"
                    />
                  </Field>
                )}
                <Field label="Email">
                  <div className="input-icon">
                    <Mail size={18} />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ten@gmail.com"
                    />
                  </div>
                </Field>
                <Field label="Mật khẩu">
                  <div className="input-icon">
                    <LockKeyhole size={18} />
                    <input
                      type={visible ? "text" : "password"}
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      required
                      minLength={mode === "register" ? 8 : 1}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      className="reveal-password"
                      type="button"
                      onClick={() => setVisible(!visible)}
                      aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>
                {mode === "register" && (
                  <Field label="Nhập lại mật khẩu">
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Xác nhận mật khẩu"
                    />
                  </Field>
                )}
                <button
                  className="btn btn-primary btn-full"
                  type="submit"
                  disabled={busy}
                >
                  {busy
                    ? "Đang xử lý..."
                    : mode === "login"
                      ? "Đăng nhập"
                      : "Tạo tài khoản"}{" "}
                  <ArrowRight size={17} />
                </button>
              </form>
              <p className="auth-bottom">
                {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setPassword("");
                    setConfirm("");
                  }}
                >
                  {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
