# Các Chức Năng Chi Tiết Theo Từng Phân Quyền (Bản Cập Nhật Mới Nhất)

Hệ thống được chia thành 4 phân quyền với các nhóm tính năng cụ thể bám sát với mã nguồn hiện hành (React/UmiJS):

## 1. Khách vãng lai (Guest)
- **Xem thông tin (Trang chủ)**: Khám phá thực đơn, tìm kiếm món ăn bằng từ khóa, lọc món ăn theo danh mục (Tất cả, Cơm rang, Món ăn kèm, Đồ uống).
- **Xem chi tiết**: Xem được chi tiết từng món ăn (ảnh, giá, thành phần, topping) nhưng không thể thao tác thêm vào giỏ.
- **Bảo mật**: Không có quyền sử dụng giỏ hàng. Nếu nhấn "Thêm vào giỏ" hoặc cố ý vào URL `/customer/cart`, `/customer/history`... sẽ bị chuyển hướng sang trang đăng nhập.

## 2. Khách hàng thành viên (User)
*Có đầy đủ quyền của Guest và thêm các quyền sau:*
- **Đặt món & Giỏ hàng (`/customer/cart`)**: 
  - Chọn tùy chọn nhận hàng: Nhờ quán ship (giao tận nơi) hoặc tự đến lấy.
  - Quản lý địa chỉ giao hàng: Thêm địa chỉ mới (Tự động điền SĐT và Tên từ tài khoản), tích hợp tính năng **Chọn từ Google Maps** (Tự động tìm kiếm tọa độ và địa chỉ thông minh).
  - Chọn thời gian nhận đồ: Trực quan hóa thời gian nhận hàng (giao ngay hoặc chọn giờ) với thiết kế Dropdown cao cấp, định dạng giờ thuần Việt (Sáng/Chiều - SA/CH).
  - Áp dụng mã khuyến mãi (voucher) để được giảm giá.
  - Thanh toán: Hỗ trợ tự động tạo mã QR chuyển khoản chứa sẵn số tiền và nội dung chuyển.
  - Điều chỉnh số lượng món, xóa món trong giỏ.
- **Lịch sử & Theo dõi (`/customer/history`)**: 
  - Theo dõi trạng thái đơn real-time theo từng bước: Chờ duyệt -> Đang nấu -> Chờ lấy -> Hoàn thành.
  - Chỉnh sửa thông tin giao hàng khi đơn "Chờ duyệt": Tính năng **Sửa ĐC từ Google Maps** được đồng bộ y hệt như lúc đặt hàng.
  - Đánh giá chất lượng dịch vụ sau khi đơn "Hoàn thành".
  - Chức năng "Đặt lại" để copy nhanh lại các món vào giỏ hàng.
  - Xóa lịch sử đối với các đơn đã Hủy hoặc Hoàn thành.
  - **Thông báo & Đền bù thông minh**: 
    - Khách hàng sẽ nhận được **Alert đỏ** thông báo xin lỗi ngay trong trang Lịch sử nếu đơn bị Hủy.
    - Cung cấp **Mã giảm giá đền bù** (Copyable) trực tiếp trên giao diện để xoa dịu khách hàng.
- **Quản lý Tài khoản (`/customer/profile`)**: Đổi mật khẩu cực kỳ tinh gọn. Chỉ yêu cầu nhập đúng **Số điện thoại** và **Tên đăng nhập** để đổi mật khẩu mới (Không cần nhớ mật khẩu cũ).

## 3. Nhân viên (Staff - `/staff/dashboard`)
- **Điều phối đơn hàng (Kanban Board)**: 
  - Giao diện real-time chia 4 cột: CHỜ DUYỆT, ĐANG NẤU, CHỜ LẤY, HOÀN THÀNH.
  - Báo động: Tự động phát âm thanh thông báo và hiện popup khi có đơn mới.
  - Chuyển trạng thái đơn qua từng bước (Duyệt đơn -> Nấu xong -> Giao khách).
- **Thanh toán & In ấn**:
  - Gạt nút xác nhận "Đã thanh toán" / "Chưa thu tiền" khi kiểm tra giao dịch của khách.
  - In hóa đơn nhiệt (mã đơn, món ăn, lưu ý, tổng tiền) cho bếp và khách.
- **Hệ thống tự động hóa**:
  - **Tự động Hủy**: Tự động quét và HỦY các đơn hàng "Chờ duyệt" đã treo quá 30 phút, đồng thời cấp ngầm **Voucher đền bù 5.000đ** cho khách.
  - **Hủy thủ công**: Khi Staff buộc phải hủy đơn của khách (do hết nguyên liệu...), hệ thống tự động cấp **Voucher đền bù 15.000đ** gửi về lịch sử của khách.
- **Quản lý tồn kho cấp tốc (Drawer)**: Bật/tắt trạng thái món ăn và **từng Topping**.

## 4. Quản trị viên (Admin - `/admin/*`)
- **Dashboard Tổng quan**: Theo dõi số liệu báo cáo, biểu đồ doanh thu. **Logic doanh thu:** Tự động cộng dồn doanh thu cho tất cả các đơn hàng Hợp lệ (Trừ các đơn đã bị Hủy).
- **Quản lý Thực đơn (`/admin/menu`)**: Thêm, sửa, xóa các món ăn, thiết lập giá, mô tả, ảnh và cập nhật danh mục.
- **Quản lý Mã Khuyến Mãi (`/admin/promos`)**: Tạo/Sửa mã giảm giá (VD: TET2024), cấu hình loại giảm, giới hạn, bật/tắt.
- **Quản lý Đơn hàng (`/admin/orders`)**:
  - Xem toàn bộ danh sách đơn hàng, hiển thị rõ cột **Hẹn lấy** (thời gian khách muốn nhận).
  - Bộ lọc thông minh theo trạng thái.
  - Hủy khẩn cấp các đơn hàng và cấp mã đền bù tự động giống tính năng của Staff.
  - Xuất báo cáo danh sách đơn hàng ra file CSV.
- **Quản lý Người dùng & Nhân sự (`/admin/users`)**:
  - Bảng dữ liệu tự động bóc tách và phân biệt rõ ràng **Họ tên** và **Tên đăng nhập** cho mọi vai trò (Customer/Staff).
  - Chủ động tạo và cấp phát tài khoản cho Nhân viên bếp.
  - Quản lý danh sách mọi tài khoản. **Bảo mật dữ liệu**: Tự động che giấu (`***`) Tên đăng nhập (Số điện thoại) của Khách hàng, chỉ giữ lại họ tên để bảo vệ quyền riêng tư.
  - Dùng nút "Khóa tài khoản" (Ban/Block) đối với khách hàng có hành vi xấu.

## YÊU CẦU CHUNG VỀ KỸ THUẬT

**1. Frontend (Client)**
- **Ngôn ngữ**: Typescript.
- **Framework**: ReactJS kết hợp với base UmiJS.
- **Thư viện UI**: Ant Design (ưu tiên dùng các component có sẵn của Antd/Project).
- **Cấu trúc & CSS**: 
  - Phải chia rõ ràng thư mục (pages, models, services, mock api...).
  - Component hóa: Mỗi page cần chia nhỏ component, `index.tsx` và `style.less`.
  - Tách bạch CSS: Style phải để vào `style.less`, tuyệt đối **không được chứa inline CSS** trong các file `.tsx`.
  - Giữ nguyên thiết lập cấu hình của base web UmiJS (từ giảng viên), khai báo interface thống nhất trong dự án.

**2. Backend (Server)**
- **Nền tảng**: Node.js, Express.js (TypeScript).
- **Cơ sở dữ liệu**: MongoDB.
- **Xác thực**: JWT (JSON Web Token) & BcryptJS.
- **Lưu trữ ảnh**: Cloudinary (Upload tự động bằng Multer).

**3. Triển khai (Deploy)**
- **Frontend**: Triển khai qua Netlify / Vercel (Hỗ trợ SPA tốt, giao diện phản hồi nhanh).
- **Backend**: Triển khai qua Render.com / Railway (Web Services) kết nối qua API thực tế. Yêu cầu thiết lập khởi chạy Server sau khi Database đã kết nối xong để tránh lỗi Buffering Timeout.
- **Database**: MongoDB Atlas (Cloud Database), yêu cầu thiết lập Network Access (IP Access List) thành `0.0.0.0/0` để cho phép hệ thống từ Render/Netlify truy cập được vào cơ sở dữ liệu.
