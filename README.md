# SmartExpense V2

ReactJS + Supabase Auth + PostgreSQL. Không có dữ liệu giả, không dùng localStorage làm database.

## Cài đặt trên Ubuntu

```bash
npm install
cp .env.example .env.local
```

Mở `.env.local` và điền **Project URL** cùng **Publishable key** từ Supabase SmartExpense-V2. Tuyệt đối không dùng secret/service-role key.

Trong Supabase SQL Editor, chạy `database_upgrade.sql` sau khi đã tạo 6 bảng gốc. Đây là SQL mở rộng cho giao dịch định kỳ và tùy chọn người dùng. Nếu dùng 3 workflow n8n, chạy thêm file `00_SUPABASE_MIGRATION.sql` trong bộ workflows đã gửi trước đó (chỉ một lần, tránh chạy lại policy trùng).

```bash
npm run dev
```

Mở địa chỉ Vite hiển thị, thường là `http://localhost:5173`. Trong Supabase Auth > URL Configuration, đặt Site URL và Redirect URL cho địa chỉ thực tế.

Đăng ký với email đã được dịch vụ email Supabase cho phép gửi; xác nhận email nếu bật Confirm email, rồi đăng nhập. Tạo giao dịch từ giao diện để WF01 trên n8n có bản ghi thật.

Các trang: Tổng quan, Giao dịch, Ngân sách, Lịch thu chi, Thông báo, Tự động hóa (quản lý quy tắc và tùy chọn), Tài khoản.

**Giới hạn:** n8n không tự chạy vì frontend được mở; cần publish các workflow và để n8n Ubuntu hoạt động. Các quy tắc định kỳ và tùy chọn lưu trên Supabase, nhưng 3 workflow n8n hiện tại chưa đọc `recurring_rules` / `user_preferences`. Chưa triển khai tự động tạo giao dịch định kỳ. Không có chức năng quên/đổi mật khẩu ở giao diện này.
