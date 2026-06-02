# Tài Liệu Đặc Tả Dự Án: Chức Năng Hiện Tại & Yêu Cầu Môi Trường (Context 4)

Tài liệu này tổng hợp **toàn bộ chức năng đã hoàn thiện** theo 4 phân quyền (Guest, Customer, Staff, Admin) và **chi tiết kỹ thuật, cấu hình môi trường** bắt buộc để dự án triển khai (deploy) thành công và hoạt động ổn định trên môi trường thực tế.

---

## PHẦN I: TỔNG QUAN CHỨC NĂNG THEO PHÂN QUYỀN

### 1. Khách Vãng Lai (Guest / Public)

- **Khám phá Trang chủ & Thực đơn:** Xem danh sách món ăn, tìm kiếm bằng từ khóa, lọc theo danh mục (Tất cả, Cơm rang, Món ăn kèm, Đồ uống).
- **Xem Chi tiết Món:** Xem ảnh, giá cả, thành phần nguyên liệu, và danh sách các tùy chọn Topping (nhưng không được thao tác chọn mua).
- **Đăng Ký Tài Khoản:** Đăng ký thành viên mới với các trường: Họ Tên, Tên đăng nhập, Số điện thoại, Mật khẩu, Địa chỉ. Tích hợp kiểm tra trùng lặp SĐT/Tên đăng nhập.
- **Đăng Nhập Phân Quyền:** Đăng nhập linh hoạt bằng Tên đăng nhập HOẶC Số điện thoại. Hệ thống tự động phân tích Role để điều hướng (Admin/Staff vào trang quản trị, Customer vào trang đặt đồ).
- **Cơ chế Bảo mật & Giới hạn Quyền (Protected Routes):** Không có tính năng Giỏ hàng. Các nút hành động (như "Thêm vào giỏ", "Đặt món") đều được đổi thành "Đăng nhập để đặt món". Nếu cố tình truy cập các đường dẫn như `/customer/cart`, `/customer/history`, hệ thống sẽ tự động chặn và chuyển hướng sang trang Đăng nhập.

### 2. Khách Hàng Thành Viên (Customer / User)

_Sở hữu toàn bộ tính năng của Guest, cộng thêm:_

- **Giỏ hàng & Đặt món (`/customer/cart`):**
  - Tùy chỉnh chi tiết món: Chọn Topping, thêm **ghi chú riêng cho từng món** (ví dụ: không hành, ít cay).
  - Quản lý tùy chọn nhận hàng: Nhờ quán giao tận nơi (Ship) hoặc Tự đến lấy tại quán.
  - Quản lý địa chỉ giao hàng: Tích hợp tính năng **Chọn từ Google Maps** để lấy tọa độ và địa chỉ chuẩn xác. Tự động điền SĐT và Tên từ hồ sơ người dùng. Tự động đồng bộ danh sách địa chỉ ngầm từ backend để khắc phục lỗi thiếu dữ liệu khi tải trang. Giao diện Dropdown hiển thị đầy đủ chi tiết địa chỉ dài không bị cắt xén chữ.
  - Chọn thời gian nhận đồ: Hỗ trợ đặt "Giao ngay" hoặc "Hẹn giờ khoảng thời gian đến lấy/nhận đồ" với giao diện Dropdown, định dạng giờ thuần Việt (Sáng/Chiều - SA/CH). Hệ thống tích hợp logic chặn chọn giờ không hợp lệ, yêu cầu khoảng thời gian nhận hàng phải trễ hơn thời gian hiện tại ít nhất 30 phút để quán kịp chuẩn bị.
  - Khuyến mãi & Thanh toán: Áp dụng mã Voucher giảm giá. Chọn thanh toán tiền mặt khi nhận hoặc chuyển khoản (nhân viên sẽ tự xác nhận trạng thái chuyển tiền của khách).
  - Điều chỉnh số lượng món, xóa món trong giỏ.
- **Lịch Sử & Theo dõi Đơn Hàng (Real-time tracking) (`/customer/history`):**
  - Theo dõi trạng thái tiến trình: Chờ duyệt (Chờ xác nhận) -> Đang nấu (Đang chế biến) -> Chờ lấy (Đã sẵn sàng) -> Hoàn thành. Hệ thống tích hợp đồng hồ đếm ngược trực quan (MM:SS) 15 phút cho các đơn đang chờ duyệt.
  - **Chỉnh sửa thông tin linh hoạt:** Hỗ trợ sửa địa chỉ qua Google Maps khi đơn đang ở trạng thái "Chờ duyệt".
  - Chức năng tiện ích: Xem lại đơn cũ, Đánh giá dịch vụ (Rating) sau khi Hoàn thành; nút "Đặt lại đơn này" để sao chép nhanh đơn hàng cũ vào giỏ; xóa các lịch sử đơn đã Hủy/Hoàn thành. Hiển thị Popup thông báo nổi báo hiệu khi đồ ăn "Đã sẵn sàng / Chờ lấy" cho khách hàng.
- **Tài Khoản & Sổ Địa Chỉ (`/customer/profile`):**
  - Đổi mật khẩu tiện lợi chỉ cần xác thực qua Số điện thoại và Tên đăng nhập (không cần nhớ mật khẩu cũ).
  - Cập nhật thông tin cá nhân (Họ tên, SĐT).
  - **Quản lý Sổ địa chỉ:** Thêm nhiều địa chỉ nhận hàng vào sổ, thiết lập địa chỉ mặc định để tự động điền khi đặt hàng, xóa địa chỉ cũ.

### 3. Nhân Viên (Staff)

- **Giao diện Bảng Điều Phối Đơn Hàng (Kanban Board / List):**
  - Giao diện kéo-thả/chuyển bước chia làm 4 cột trạng thái: CHỜ DUYỆT, ĐANG NẤU, CHỜ LẤY, HOÀN THÀNH.
  - **Thông báo đơn mới:** Hệ thống tự động hiển thị đơn mới ngay trong cột Chờ duyệt với đồng hồ đếm ngược sinh động (MM:SS) 15 phút. Hệ thống tự động đẩy hiển thị Popup Alert đỏ cảnh báo ngay lập tức nếu đơn hàng tự động bị hủy do quá giờ xác nhận.
  - **Xử lý đơn hàng:** Tiếp nhận đơn, chuyển trạng thái sang đang chế biến, và báo hiệu "Đã sẵn sàng / Chờ lấy" để thông báo cho khách món ăn đã làm xong.
- **Thanh Toán & Hóa Đơn:** Cập nhật/Xác nhận trạng thái thanh toán của khách (đã chuyển khoản hoặc nhận tiền mặt). Hỗ trợ in hóa đơn nhiệt cho bếp và khách hàng (chứa mã đơn, món ăn, lưu ý, tổng tiền).
- **Hủy Đơn Thủ Công:** Staff có quyền hủy đơn (VD: hết nguyên liệu).
- **Quản lý Tồn Kho Nhanh:** Nút gạt bật/tắt (in-stock/out-of-stock) nhanh trạng thái món ăn và từng loại Topping ngay trên giao diện nhanh (Drawer) để ẩn khỏi ứng dụng của khách mà không cần vào menu Admin. Đồng thời Staff có quyền Thêm mới và Sửa thông tin món ăn (nhưng không có quyền Xóa món ăn như Admin).

### 4. Quản Trị Viên (Admin)

- **Dashboard Tổng Quan:** Theo dõi số liệu báo cáo, tổng quan doanh thu trong ngày/tuần/tháng, tổng số đơn, thống kê top các món bán chạy nhất và biểu đồ doanh thu. Logic doanh thu tự động loại bỏ các đơn đã bị Hủy, chỉ tính các đơn hợp lệ. Đặc biệt bổ sung widget cảnh báo chuyên sâu: Thống kê Tổng Số Đơn Hủy và Tỉ lệ Đơn Bị Hủy Tự Động Do Quá Thời Gian Phản Hồi (15 phút).
- **Quản lý Thực đơn (CRUD) (`/admin/menu`):** Toàn quyền Thêm/Sửa/Xóa danh mục và chi tiết món ăn, cập nhật giá, mô tả, ảnh minh họa. Đồng bộ mạnh mẽ và tránh lỗi crash database.
- **Quản lý Mã Khuyến Mãi (`/admin/promos`):** Tạo/Sửa Voucher (giảm % hoặc giảm tiền mặt), thiết lập giới hạn sử dụng, bật/tắt trạng thái mã. Đảm bảo bảo mật API để ngăn chặn khách hàng lấy danh sách mã nội bộ.
- **Quản lý Đơn Hàng (`/admin/orders`):** Tra soát toàn bộ lịch sử giao dịch, phân loại trực quan nhãn **🛵 Giao hàng** và **🏪 Nhận tại quán**. Làm nổi bật cột Hẹn lấy, hỗ trợ lọc trạng thái, can thiệp hủy đơn khẩn cấp. Tích hợp tính năng báo cáo & xuất dữ liệu danh sách đơn hàng/doanh thu ra file Excel/CSV phục vụ đối soát kế toán.
- **Quản lý Người Dùng & Nhân Sự (`/admin/users`):**
  - Tách bạch thông tin Họ Tên và Tên Đăng Nhập cho các vai trò.
  - **Hiển thị thông tin:** Hiển thị đầy đủ Tên, Tên đăng nhập và Số điện thoại của người dùng.
  - Cấp phát/Khóa tài khoản nhân viên (Staff) với cơ chế bảo mật (Mã hóa mật khẩu bằng `Bcrypt`).
  - Khóa/Mở khóa (Ban/Unban/LOCKED) tài khoản khách hàng nếu có hành vi xấu (spam) để ngăn chặn đăng nhập vào hệ thống.

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

## PHẦN III: CÁC TÍNH NĂNG CHƯA HOÀN THIỆN & ĐỊNH HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI

Dưới đây là danh sách các tính năng chưa được lập trình (hiện chỉ nằm trên ý tưởng) hoặc cần được nâng cấp trong các phiên bản tiếp theo của dự án:

1. **Hệ Thống Hủy Đơn Tự Động & Đền Bù Voucher (Auto Cancel & Compensation):**
   - _Hiện trạng:_ Đã hoàn thiện tính năng đếm ngược 15 phút ở trạng thái "Chờ duyệt", đơn hàng sẽ bị tự động Hủy nếu quá thời hạn này và hệ thống phát ra cảnh báo Popup cho cả Staff và Customer.
   - _Định hướng:_ Cần lập trình thêm phần tự động sinh mã Voucher (VD: đền bù 5.000đ - 15.000đ) gửi kèm qua hộp thư khách hàng để xoa dịu trải nghiệm khi đơn bị hủy tự động.
2. **Thanh Toán Trực Tuyến & Cổng Thanh Toán (Online Payment):**
   - _Hiện trạng:_ Khách hàng chọn chuyển khoản nhưng nhân viên phải đối soát thủ công bằng mắt và tự ấn xác nhận "Đã thanh toán".
   - _Định hướng:_ Tích hợp phiên thanh toán ảo (Mock Payment Session) hoặc cổng thanh toán thật (VNPay, Momo), hỗ trợ tạo mã QR động chứa sẵn số tiền và nội dung chuyển khoản. Khi tiền vào tài khoản, hệ thống tự động cập nhật trạng thái đơn thành "Đã thanh toán".
3. **Hệ Thống Cảnh Báo & Thông Báo Nâng Cao (Advanced Notifications):**
   - _Hiện trạng:_ Đã triển khai được các Popup thông báo nổi trên Frontend (như báo khách hàng đồ đã sẵn sàng, báo nhân viên đơn đã tự hủy) thông qua cơ chế Polling 30 giây lấy API 1 lần.
   - _Định hướng:_ Nâng cấp kiến trúc lên WebSockets/Socket.io kết hợp âm thanh báo động (`Ring ring`) cho thời gian phản hồi siêu tốc độ (Real-time đích thực) thay vì Polling, giúp tiết kiệm băng thông và tăng độ nhạy bén cho nhân viên bếp.
4. **Quản Lý Tồn Kho Nguyên Liệu Thực Tế:**
   - _Hiện trạng:_ Quản lý kho dạng "Nút gạt" (Bật/Tắt - Hết/Còn) thủ công do Staff thao tác.
   - _Định hướng:_ Xây dựng hệ thống định lượng (Recipe). Ví dụ: 1 Cơm rang = 200g cơm + 1 quả trứng. Khi khách đặt hàng, hệ thống tự động trừ lùi số lượng nguyên liệu trong kho thật và tự động ẩn món khi nguyên liệu chạm mức 0.

---

**Tổng Kết:** Hiện tại mã nguồn đã được tối ưu hóa toàn bộ các lỗi liên đới tới bất đồng bộ và timeout. Luồng triển khai Github -> Netlify (FE) và Github -> Render (BE) đã được cấu hình thông suốt. Đảm bảo khai báo đúng biến môi trường và thiết lập IP trên MongoDB Atlas là dự án sẵn sàng vận hành trên môi trường thực tế.
