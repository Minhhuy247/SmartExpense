# SmartExpense — React Frontend

Giao diện quản lý tài chính cá nhân viết bằng React, Vite và CSS thuần. Đây là **giai đoạn 1: Frontend**. n8n và Supabase sẽ được tích hợp sau.

## 1. Chuẩn bị Ubuntu 24.04

Mở Terminal (`Ctrl + Alt + T`):

```bash
sudo apt update
sudo apt install -y curl unzip
```

Nếu máy chưa có Node.js, cài nvm rồi cài Node.js LTS 24:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
source ~/.bashrc
nvm install 24
nvm alias default 24
node -v
npm -v
```

Nếu Terminal báo `nvm: command not found`, đóng Terminal và mở lại hoặc chạy `source ~/.bashrc`.

## 2. Giải nén và chạy dự án

Giả sử file ZIP nằm ở `~/Downloads/SmartExpense-React-Frontend.zip`:

```bash
mkdir -p ~/Projects
unzip ~/Downloads/SmartExpense-React-Frontend.zip -d ~/Projects
cd ~/Projects/SmartExpense-React-Frontend
npm install
npm run dev
```

Mở `http://127.0.0.1:5173` trong Chrome. Trong VS Code, mở dự án bằng:

```bash
code ~/Projects/SmartExpense-React-Frontend
```

Dừng máy chủ phát triển bằng `Ctrl + C`. Khởi động lại bằng `cd ~/Projects/SmartExpense-React-Frontend && npm run dev`.

## 3. Cách dùng bản Frontend

Chọn **Khám phá giao diện** ở trang đăng nhập để vào chế độ xem trước. Dữ liệu mẫu sẽ có sẵn trong trình duyệt.

- **Tổng quan:** thu nhập, chi tiêu, chênh lệch, ngân sách còn lại, biểu đồ 6 tháng, giao dịch gần nhất.
- **Giao dịch:** thêm/sửa/xóa, tìm kiếm và lọc theo loại, danh mục, tháng; có phân trang.
- **Ngân sách:** tạo/sửa/xóa giới hạn cho từng danh mục và tháng; thanh tiến độ sử dụng.
- **Lịch thu chi:** xem giao dịch theo ngày, tổng thu và tổng chi của từng ngày.
- **Thông báo:** cảnh báo ngân sách, nhắc nhở thủ công, đánh dấu đã đọc, sửa nhắc nhở và xóa.
- **Tự động hóa:** thiết lập giao dịch định kỳ, ngưỡng cảnh báo, bật/tắt tùy chọn.
- **Tài khoản:** sửa hồ sơ, xem biểu mẫu đổi mật khẩu qua OTP, đăng xuất.

Dùng bộ chọn tháng ở góc trên bên phải để chuyển qua các tháng.

### Cảnh báo ngân sách của bản xem trước

Khi người dùng thêm, sửa hoặc xóa giao dịch/ngân sách **ngay trong ứng dụng**, giao diện sẽ tính toán lại mức chi theo tháng và danh mục:

- Đạt ngưỡng do người dùng chọn (mặc định 80%): cảnh báo gần chạm.
- Đạt đúng 100%: cảnh báo hết ngân sách.
- Vượt 100%: cảnh báo vượt ngân sách.

Cảnh báo được lưu một lần cho mỗi lần chuyển mức ngưỡng; nếu xóa thông báo thì không tự sinh lại ngay khi ngưỡng không đổi.

**Chưa có tác vụ tự chạy khi đóng trình duyệt.** Giao dịch định kỳ và báo cáo cuối tháng chỉ mới có giao diện cấu hình; các tác vụ tự chạy sẽ do WF02/WF03 của n8n đảm nhiệm trong giai đoạn Backend.

## 4. Xác thực và dữ liệu trong giai đoạn 1

Đây là **bản mẫu Frontend không dùng để bảo vệ dữ liệu thật**:

- Trang đăng nhập, đăng ký, quên mật khẩu, nhập OTP và đổi mật khẩu đã có giao diện, kiểm tra định dạng đầu vào.
- Chưa có dịch vụ đăng nhập, chưa có OTP qua Gmail, chưa có gửi email, chưa có thay đổi mật khẩu thật.
- Chế độ xem trước **không xác thực danh tính**. Không dùng nó để xuất bản website công khai hoặc xử lý dữ liệu tài chính nhạy cảm.
- Email có thể được lưu để tự điền ở lần truy cập sau. **Mật khẩu và OTP không được lưu** trong localStorage.
- Các dữ liệu giao dịch, ngân sách, nhắc nhở và quy tắc hiện lưu tại localStorage của **trình duyệt và thiết bị đang dùng**. Chưa đồng bộ qua nhiều máy, chưa phân tách dữ liệu theo tài khoản.
- Khi xóa dữ liệu website trong trình duyệt, các bản ghi chỉ có ở bản mẫu này có thể mất. Không nhập dữ liệu quan trọng vào giai đoạn 1.

## 5. Cấu trúc

```text
SmartExpense-React-Frontend/
├── index.html
├── package.json
├── vite.config.js
├── .nvmrc
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── Forms.jsx
│   │   ├── Pages.jsx
│   │   └── Ui.jsx
│   └── lib/
│       ├── data.js
│       └── data.test.js
├── KE_HOACH_BACKEND.md
└── README.md
```

Không dùng Tailwind, Bootstrap, React Router, Redux, thư viện biểu đồ, Python hay Docker trong giai đoạn Frontend. Chỉ cần Node.js, npm, React, Vite và Lucide React.

## 6. Chạy kiểm thử

```bash
npm test
npm run build
```

`npm test` kiểm tra logic tổng hợp giao dịch theo tháng và điều kiện cảnh báo 80%, 100%, vượt 100%. `npm run build` kiểm tra biên dịch Frontend sau khi chạy `npm install`.

## 7. Chỉnh giao diện

- Màu navy/vàng/be: `src/styles.css`, mục `:root`.
- Bố cục từng trang: `src/components/Pages.jsx`.
- Biểu mẫu CRUD: `src/components/Forms.jsx`.
- Trang đăng nhập/OTP: `src/components/Auth.jsx`.
- Menu, điều hướng, xử lý tương tác: `src/App.jsx`.
- Dữ liệu mẫu, thống kê, logic ngưỡng ngân sách: `src/lib/data.js`.

Vite tự tải lại giao diện khi bạn lưu file đang chạy trên máy ở chế độ phát triển.

## 8. Bước tiếp theo

Đọc `KE_HOACH_BACKEND.md` trước khi thiết kế Supabase và n8n. Không đưa Supabase `service_role` / secret key vào Frontend. Cấu hình Supabase Auth, xác thực email OTP và RLS đúng trước khi mở website ra Internet.
