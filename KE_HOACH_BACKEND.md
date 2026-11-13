# SmartExpense — Kế hoạch giai đoạn 2 (Supabase + n8n)

Tài liệu này là thiết kế dự kiến, **không phải các chức năng Backend đã triển khai**.

## Kiến trúc

1. **React + Vite:** giao diện nhập và xem dữ liệu, xác thực người dùng qua Supabase Auth.
2. **Supabase Auth:** đăng ký email, đăng nhập email/mật khẩu, xác minh OTP, khôi phục và đổi mật khẩu.
3. **Supabase Postgres:** bảng dữ liệu riêng cho từng người dùng, bảo vệ bằng Row Level Security (RLS).
4. **n8n:** xử lý các workflow tự động theo lịch và các thao tác cần quy tắc nghiệp vụ; chạy server, không đưa token quản trị hoặc service role lên trình duyệt.
5. **Email:** thư xác minh/khôi phục của Supabase Auth; cấu hình SMTP phù hợp nếu cần gửi đến nhiều địa chỉ Gmail.

## Các bảng dự kiến

| Bảng | Chức năng | Trường chính |
|---|---|---|
| `profiles` | Thông tin hồ sơ người dùng | `id` (auth uid), `full_name`, `created_at` |
| `transactions` | Thu chi | `id`, `user_id`, `type`, `category`, `amount`, `note`, `date`, `created_at` |
| `budgets` | Hạn mức tháng | `id`, `user_id`, `month`, `category`, `limit_amount`, `note` |
| `notifications` | Thông báo và nhắc nhở | `id`, `user_id`, `kind`, `title`, `message`, `month`, `is_read`, `created_at` |
| `recurring_rules` | Các giao dịch định kỳ | `id`, `user_id`, `type`, `category`, `amount`, `day_of_month`, `active`, `last_run_month` |
| `automation_runs` | Nhật ký chạy n8n | `id`, `user_id`, `workflow_key`, `status`, `created_at` |

Yêu cầu ràng buộc: ngân sách duy nhất theo `(user_id, month, category)`; tiền lớn hơn 0; loại giao dịch chỉ `income/expense`; ngày đến hạn từ 1 đến 28; số tiền ở đơn vị VND kiểu số nguyên hoặc numeric. Mỗi bảng có `user_id` phải được bảo vệ để người dùng chỉ xem và thay đổi dữ liệu của chính mình. Thông báo chỉ tạo một lần theo mỗi ngưỡng/kỳ với khóa idempotency.

## Xác thực OTP Gmail

- **Đăng ký:** `supabase.auth.signUp` với email/password; tùy cấu hình Supabase có email xác minh.
- **Đăng nhập:** `supabase.auth.signInWithPassword`.
- **Quên mật khẩu:** `supabase.auth.resetPasswordForEmail`; cấu hình email template trả OTP `{{ .Token }}` và xác minh bằng `verifyOtp({ email, token, type: 'recovery' })`; sau xác minh dùng `updateUser({ password })`.
- **Đổi mật khẩu trong tài khoản:** phải tái xác thực phù hợp, OTP gửi tới email đã xác minh rồi cập nhật bằng `updateUser`.
- **Ghi nhớ:** lưu email (không lưu mật khẩu dạng văn bản); session sử dụng cơ chế Supabase Auth phù hợp.

**Lưu ý:** Supabase có thể giới hạn dịch vụ email mặc định. Khi muốn demo Gmail thật, phải kiểm tra nhà cung cấp SMTP, hạn mức và cấu hình Email Templates. Không dùng cách tạo OTP giả bên trình duyệt.

## WF01 — Xử lý giao dịch và kiểm tra điều kiện

Khi tạo/sửa/xóa giao dịch qua Frontend và Supabase, hệ thống đồng bộ thay đổi, chuẩn hóa thông tin, phân loại giao dịch theo danh mục người dùng chọn, kiểm tra dữ liệu và ghi nhật ký nếu cần. Sau một giao dịch làm thay đổi số tiền chi, Backend có thể kích hoạt kiểm tra mức sử dụng ngân sách liên quan. Luồng n8n phải chống gửi trùng khi request lặp lại.

## WF02 — Giám sát ngân sách tự động

Schedule Trigger chạy theo lịch để lấy ngân sách theo từng tháng và từng người dùng; đọc giao dịch tương ứng, tổng hợp số tiền chi, so sánh với ngưỡng cảnh báo (ví dụ 80%, 100%, vượt 100%) và ghi thông báo bằng thao tác idempotent. Nếu cùng mức cảnh báo đã có, không ghi trùng. Cho phép người dùng bật/tắt cảnh báo và chọn ngưỡng phù hợp. Có thể bổ sung gửi email khi người dùng đồng ý.

## WF03 — Giao dịch định kỳ + báo cáo tháng

Schedule Trigger chạy hằng ngày, kiểm tra quy tắc `recurring_rules`, ngày đến hạn, trạng thái bật/tắt, khóa `(rule_id, year_month)`; tự động tạo giao dịch đúng kỳ và cập nhật `last_run_month`. Luồng báo cáo cuối tháng tổng hợp thu nhập, chi tiêu, chênh lệch và danh mục chi lớn rồi lưu thông báo hoặc gửi email (nếu người dùng bật). Bảo đảm retry không tạo giao dịch trùng.

## Nguyên tắc bảo mật và triển khai

- KHÔNG để Supabase `service_role`/`secret` trong biến `VITE_...` hoặc code React.
- Bật RLS cho các bảng Supabase; kiểm thử với hai tài khoản thật.
- Mọi webhook n8n dùng cho ghi dữ liệu phải kiểm tra xác thực, chống gọi trái phép và chống replay.
- Không công khai giao diện quản trị n8n. Dùng reverse proxy, HTTPS và phân tách API công khai với endpoint quản trị.
- Dữ liệu localStorage trong bản mẫu là dữ liệu dùng thử, không tự động đồng bộ hoặc di chuyển sang Supabase.
