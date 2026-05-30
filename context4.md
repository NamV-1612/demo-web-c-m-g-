# Tài Liệu Đặc Tả Dự Án: Chức Năng Hiện Tại & Yêu Cầu Môi Trường (Context 4)

Tài liệu này tổng hợp **toàn bộ chức năng đã hoàn thiện** theo 4 phân quyền (Guest, Customer, Staff, Admin) và **chi tiết kỹ thuật, cấu hình môi trường** bắt buộc để dự án triển khai (deploy) thành công và hoạt động ổn định trên môi trường thực tế.

---

## PHẦN I: TỔNG QUAN CHỨC NĂNG THEO PHÂN QUYỀN

### 1. Khách Vãng Lai (Guest / Public)
- **Đăng Ký Tài Khoản:** Đăng ký thành viên mới với các trường: Họ Tên, Tên đăng nhập, Số điện thoại, Mật khẩu, Địa chỉ. Tích hợp kiểm tra trùng lặp SĐT/Tên đăng nhập.
- **Đăng Nhập Phân Quyền:** Đăng nhập linh hoạt bằng Tên đăng nhập HOẶC Số điện thoại. Hệ thống tự động phân tích Role để điều hướng (Admin/Staff vào trang quản trị, Customer vào trang đặt đồ).
- **Khám phá Thực đơn:** Xem danh sách món ăn, tìm kiếm bằng từ khóa, lọc theo danh mục (Tất cả, Cơm rang, Món ăn kèm, Đồ uống).
- **Xem Chi tiết Món:** Xem ảnh, giá cả, thành phần nguyên liệu, và danh sách các tùy chọn Topping.
- **Cơ chế Bảo mật Điều hướng:** Nếu cố gắng thực hiện các thao tác yêu cầu định danh (như nhấn "Thêm vào giỏ", truy cập URL `/customer/cart`, `/customer/history`), hệ thống sẽ tự động chặn và chuyển hướng sang trang Đăng nhập.

### 2. Khách Hàng Thành Viên (Customer)
*Sở hữu toàn bộ tính năng của Guest, cộng thêm:*
- **Giỏ hàng & Đặt món (`/customer/cart`):**
  - Quản lý tùy chọn nhận hàng: Nhờ quán giao tận nơi (Ship) hoặc Tự đến lấy tại quán.
  - Quản lý địa chỉ giao hàng: Tích hợp tính năng **Chọn từ Google Maps** để lấy tọa độ và địa chỉ chuẩn xác. Tự động điền SĐT và Tên từ hồ sơ người dùng.
  - Chọn thời gian nhận đồ: Hỗ trợ đặt "Giao ngay" hoặc "Hẹn giờ" với giao diện Dropdown, định dạng giờ thuần Việt (Sáng/Chiều - SA/CH).
  - Khuyến mãi & Thanh toán: Áp dụng mã Voucher giảm giá. Tích hợp **Phiên thanh toán ảo (Mock Payment Session)** hỗ trợ tạo mã QR chuyển khoản tự động kèm nội dung và số tiền để xác nhận thanh toán.
  - Điều chỉnh số lượng món, xóa món trong giỏ.
- **Lịch Sử Đơn Hàng (`/customer/history`):**
  - Theo dõi trạng thái đơn hàng thời gian thực: Chờ duyệt -> Đang nấu -> Chờ lấy -> Hoàn thành.
  - **Chỉnh sửa thông tin linh hoạt:** Hỗ trợ sửa địa chỉ qua Google Maps khi đơn đang ở trạng thái "Chờ duyệt".
  - Chức năng tiện ích: Đánh giá dịch vụ (Rating) sau khi Hoàn thành; nút "Đặt lại" để sao chép nhanh đơn hàng cũ vào giỏ; xóa các lịch sử đơn đã Hủy/Hoàn thành.
  - **Hệ thống Xoa dịu Khách hàng:** Nếu đơn hàng bị quán Hủy, hệ thống hiển thị thông báo Alert đỏ và **cấp tự động Mã giảm giá đền bù** (có nút Copy) trực tiếp trên giao diện lịch sử.
- **Tài Khoản & Sổ Địa Chỉ (`/customer/profile`):** 
  - Đổi mật khẩu tiện lợi chỉ cần xác thực qua Số điện thoại và Tên đăng nhập (không cần nhớ mật khẩu cũ).
  - Cập nhật thông tin cá nhân (Họ tên, SĐT).
  - **Quản lý Sổ địa chỉ:** Thêm nhiều địa chỉ nhận hàng vào sổ, thiết lập địa chỉ mặc định để tự động điền khi đặt hàng, xóa địa chỉ cũ.

### 3. Nhân Viên (Staff)
- **Bảng Điều Phối Đơn Hàng (Kanban Board):** 
  - Giao diện kéo-thả/chuyển bước chia làm 4 cột trạng thái: CHỜ DUYỆT, ĐANG NẤU, CHỜ LẤY, HOÀN THÀNH.
  - **Báo động Đơn mới:** Hệ thống tự động phát âm thanh và hiển thị Popup thông báo khi có đơn đặt hàng mới từ khách.
- **Thanh Toán & Hóa Đơn:** Cập nhật trạng thái "Đã thanh toán" / "Chưa thu tiền"; hỗ trợ in hóa đơn nhiệt cho bếp và khách hàng (chứa mã đơn, món ăn, lưu ý, tổng tiền).
- **Hệ Thống Hủy Tự Động & Đền Bù:**
  - **Auto Cancel:** Quét và tự động hủy các đơn "Chờ duyệt" bị treo quá 30 phút, đồng thời ngầm gửi **Voucher đền bù 5.000đ** cho khách.
  - **Hủy Thủ Công:** Nếu Staff buộc phải hủy đơn (VD: hết nguyên liệu), hệ thống tự động sinh **Voucher đền bù 15.000đ** tặng khách hàng.
- **Quản lý Tồn Kho Nhanh:** Bật/tắt trạng thái món ăn và từng loại Topping ngay trên giao diện nhanh (Drawer) mà không cần vào menu Admin. Đồng thời Staff có quyền Thêm mới và Sửa thông tin món ăn (nhưng không có quyền Xóa món ăn như Admin).

### 4. Quản Trị Viên (Admin)
- **Dashboard Tổng Quan:** Theo dõi số liệu báo cáo, biểu đồ doanh thu. Logic doanh thu tự động loại bỏ các đơn đã bị Hủy, chỉ tính các đơn hợp lệ.
- **Quản lý Thực đơn (`/admin/menu`):** Toàn quyền Thêm/Sửa/Xóa món ăn, cập nhật giá, mô tả, ảnh, và danh mục. Đồng bộ mạnh mẽ và tránh lỗi crash database.
- **Quản lý Mã Khuyến Mãi (`/admin/promos`):** Tạo/Sửa Voucher (giảm % hoặc giảm tiền mặt), thiết lập giới hạn sử dụng, bật/tắt trạng thái mã. Đảm bảo bảo mật API để ngăn chặn khách hàng lấy danh sách mã nội bộ.
- **Quản lý Đơn Hàng (`/admin/orders`):** Xem toàn bộ danh sách, phân loại trực quan nhãn **🛵 Giao hàng** và **🏪 Nhận tại quán**. Làm nổi bật cột Hẹn lấy, hỗ trợ lọc trạng thái, hủy đơn khẩn cấp (có tự động đền bù), xuất dữ liệu ra file CSV.
- **Quản lý Người Dùng & Nhân Sự (`/admin/users`):**
  - Tách bạch thông tin Họ Tên và Tên Đăng Nhập cho các vai trò.
  - **Bảo Mật Dữ Liệu:** Tự động che giấu Số điện thoại (Tên đăng nhập) của Customer bằng chuỗi `***` để bảo vệ quyền riêng tư, chỉ hiển thị tên.
  - Có quyền cấp tài khoản Staff với cơ chế bảo mật (Mã hóa mật khẩu bằng `Bcrypt`). Có tính năng khóa (Ban/Block/LOCKED) tài khoản khách hàng có hành vi xấu để ngăn chặn đăng nhập vào hệ thống.

---

## PHẦN II: YÊU CẦU MÔI TRƯỜNG & CẤU HÌNH DEPLOY

Để hệ thống chạy mượt mà, không dính lỗi Timeout hay sập Server, bắt buộc tuân thủ các thông số môi trường và cấu hình CI/CD sau đây:

### 1. Frontend (Client - Giao Diện)
- **Nền Tảng Cốt Lõi:** ReactJS (viết bằng TypeScript), tích hợp framework UmiJS và thư viện giao diện Ant Design.
- **Môi Trường Build (Node.js):** Yêu cầu Node.js phiên bản 20.x (như định nghĩa trong `engines` của package.json).
- **Lệnh Khởi Chạy:**
  - Cục bộ (Local): `npm run start:dev`
  - Đóng gói (Build): `npm run build`
- **Triển Khai (Deployment):**
  - **Nền Tảng Đề Xuất:** **Netlify** hoặc **Vercel** (Hỗ trợ cấu hình SPA mặc định cực tốt).
  - **CI/CD Tự Động:** Yêu cầu liên kết trực tiếp Github Repository với Netlify. Đặt `Build command` là `npm run build` và `Publish directory` là `dist`.
  - **Cấu hình Kết nối Backend:** Link URL Backend cần được cập nhật cứng tại các file `src/services/api.ts` và `src/services/auth.ts`. (Hiện tại đã được trỏ chuẩn về `https://demo-web-c-m-g.onrender.com/api`).

### 2. Backend (Server - Xử Lý Logic)
- **Nền Tảng Cốt Lõi:** Node.js, Express.js (viết bằng TypeScript).
- **Dịch Vụ Lưu Trữ & Triển Khai:** **Render.com** (Web Service) hoặc **Railway**.
- **Cơ Chế Khởi Động Chống Treo (Anti-Cold Start):** Bắt buộc phải duy trì thiết lập hiện tại trong file `server.ts`: Server Express **chỉ được phép gọi `app.listen()` sau khi hàm `mongoose.connect()` trả về thành công**. Nếu để Express mở port trước khi kết nối xong Database, quá trình Cold Start của nền tảng miễn phí (Render) sẽ làm nghẽn hàng đợi (Buffer Timeout 10000ms), dẫn tới sập ứng dụng.
- **Lệnh Khởi Chạy:**
  - Cục bộ (Local): `npm run dev`
  - Đóng gói (Build): `npm run build` (Biên dịch Typescript bằng `tsc` ra thư mục `dist`)
  - Chạy thực tế (Prod): `npm run start` (Chạy `node dist/server.js`)

### 3. Cơ Sở Dữ Liệu & Tài Nguyên Bên Thứ Ba
#### A. MongoDB Atlas (Cloud Database)
- Hệ quản trị CSDL NoSQL lưu trữ toàn bộ dữ liệu của hệ thống.
- **YÊU CẦU BẮT BUỘC VỀ NETWORK ACCESS (Bảo Mật):**
  - IP của các nền tảng Deploy như Render thay đổi liên tục. Do đó, trong trang quản trị MongoDB Atlas -> **Network Access** -> Chọn **Add IP Address** -> Chọn **Allow Access From Anywhere**.
  - Thiết lập này sẽ tạo ra quy tắc **`0.0.0.0/0`**, cho phép Backend Server có thể truy cập vào Database. NẾU KHÔNG CÓ THIẾT LẬP NÀY, Backend sẽ liên tục báo lỗi Timeout và sập.

#### B. Cloudinary (Lưu Trữ Hình Ảnh)
- Nơi tự động lưu trữ ảnh món ăn thông qua thư viện Multer-Cloudinary.

### 4. Thiết Lập Biến Môi Trường (Environment Variables - `.env`)
Khi cấu hình Backend trên Render, bắt buộc phải nhập đủ các thông số biến môi trường sau vào phần **Environment** của nền tảng:

```env
# Cấu hình Cổng (Thường Render tự cấp, nếu khai báo thì để 5000)
PORT=5000

# Link kết nối CSDL MongoDB Atlas (Đổi thành user/pass thực tế)
MONGODB_URI=mongodb+srv://admin:admin@cluster0.1ubwsvh.mongodb.net/doan_db?appName=Cluster0

# Khóa bí mật dùng để mã hóa JSON Web Token (Đăng nhập)
JWT_SECRET=chicken_doki

# Khóa cấu hình Cloudinary (Quản lý Ảnh)
CLOUDINARY_CLOUD_NAME=ddmow44bt
CLOUDINARY_API_KEY=297692159679124
CLOUDINARY_API_SECRET=q3uMLzl3H2bDhePuRppEcejOMYA
```

---
**Tổng Kết:** Hiện tại mã nguồn đã được tối ưu hóa toàn bộ các lỗi liên đới tới bất đồng bộ và timeout. Luồng triển khai Github -> Netlify (FE) và Github -> Render (BE) đã được cấu hình thông suốt. Đảm bảo khai báo đúng biến môi trường và thiết lập IP trên MongoDB Atlas là dự án sẵn sàng vận hành trên môi trường thực tế.
