# Các Chức Năng Chi Tiết Theo Từng Phân Quyền

Hệ thống được chia thành 4 phân quyền với các nhóm tính năng cụ thể bám sát với mã nguồn hiện hành (React/UmiJS):

## 1. Khách vãng lai (Guest)
- **Xem thông tin (Trang chủ)**: Khám phá thực đơn, tìm kiếm món ăn bằng từ khóa, lọc món ăn theo danh mục (Tất cả, Cơm rang, Món ăn kèm, Đồ uống).
- **Xem chi tiết**: Xem được chi tiết từng món ăn (ảnh, giá, thành phần, topping) nhưng không thể thao tác thêm vào giỏ.
- **Bảo mật**: Không có quyền sử dụng giỏ hàng. Nếu nhấn "Thêm vào giỏ" hoặc cố ý vào URL `/customer/cart`, `/customer/history`... sẽ bị chuyển hướng sang trang đăng nhập.

## 2. Khách hàng thành viên (User)
*Có đầy đủ quyền của Guest và thêm các quyền sau:*
- **Đặt món & Giỏ hàng (`/customer/cart`)**: 
  - Chọn tùy chọn nhận hàng: Nhờ quán ship (giao tận nơi) hoặc tự đến lấy.
  - Quản lý địa chỉ giao hàng: Thêm địa chỉ mới (Tên, SĐT, địa chỉ cụ thể).
  - Chọn thời gian nhận đồ (VD: Lấy ngay trong 15p, hoặc hẹn các khung giờ từ 11:00 đến 20:00).
  - Áp dụng mã khuyến mãi (voucher) để được giảm giá (theo % hoặc số tiền).
  - Thanh toán: Hỗ trợ tự động tạo mã QR chuyển khoản MB Bank chứa sẵn số tiền và nội dung chuyển.
  - Điều chỉnh số lượng món, xóa món trong giỏ.
- **Lịch sử & Theo dõi (`/customer/history`)**: 
  - Theo dõi trạng thái đơn real-time theo từng bước: Chờ duyệt -> Đang nấu -> Chờ lấy -> Hoàn thành.
  - Chỉnh sửa thông tin giao hàng (SĐT, địa chỉ) hoặc **Hủy đơn** khi đơn đang ở trạng thái "Chờ duyệt" (Pending).
  - Đánh giá chất lượng dịch vụ (Rate 1-5 sao + bình luận) sau khi đơn "Hoàn thành".
  - Chức năng "Đặt lại" để copy nhanh lại các món vào giỏ hàng.
  - Xóa lịch sử đối với các đơn đã Hủy hoặc Hoàn thành.
- **Quản lý Tài khoản (`/customer/profile`)**: Cập nhật tên hiển thị, đổi mật khẩu (có xác thực mật khẩu cũ).

## 3. Nhân viên (Staff - `/staff/dashboard`)
- **Điều phối đơn hàng (Kanban Board)**: 
  - Giao diện real-time chia 4 cột: CHỜ DUYỆT, ĐANG NẤU, CHỜ LẤY, HOÀN THÀNH.
  - Báo động: Tự động phát âm thanh thông báo và hiện popup khi có đơn mới.
  - Chuyển trạng thái đơn qua từng bước (Duyệt đơn -> Nấu xong -> Giao khách).
- **Thanh toán & In ấn**:
  - Gạt nút xác nhận "Đã thanh toán" / "Chưa thu tiền" khi kiểm tra giao dịch của khách.
  - In hóa đơn nhiệt (mã đơn, món ăn, lưu ý, tổng tiền) cho bếp và khách.
- **Quản lý tồn kho cấp tốc (Drawer)**:
  - Bật/tắt trạng thái món ăn (Hết hàng / Còn hàng) trực tiếp.
  - Bật/tắt trạng thái **cho từng Topping** của món ăn (VD: Tạm hết trân châu, hết xúc xích...).

## 4. Quản trị viên (Admin - `/admin/*`)
- **Dashboard Tổng quan**: Theo dõi các số liệu báo cáo, doanh thu tổng hợp.
- **Quản lý Thực đơn (`/admin/menu`)**: Thêm, sửa, xóa các món ăn, thiết lập giá, mô tả, ảnh và cập nhật danh mục.
- **Quản lý Mã Khuyến Mãi (`/admin/promos`)**:
  - Tạo/Sửa mã giảm giá (VD: TET2024).
  - Cấu hình loại giảm (Theo % hoặc cố định số tiền), giới hạn mức giảm tối đa.
  - Quản lý số lượng mã và trạng thái Bật/Tắt (isActive).
- **Quản lý Đơn hàng (`/admin/orders`)**:
  - Xem toàn bộ danh sách đơn hàng của hệ thống.
  - Bộ lọc thông minh theo trạng thái.
  - Hủy khẩn cấp các đơn hàng (trừ các đơn đã hoàn thành hoặc đã hủy).
  - Xuất báo cáo danh sách đơn hàng ra file CSV để phục vụ đối soát.
- **Quản lý Người dùng & Nhân sự (`/admin/users`)**:
  - Chủ động tạo và cấp phát tài khoản cho Nhân viên bếp (Staff) với Tên đăng nhập và Mật khẩu khởi tạo.
  - Quản lý danh sách mọi tài khoản, dùng nút "Khóa tài khoản" (Ban/Block) đối với khách hàng có hành vi xấu (Admin không thể tự khóa chính mình).

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
- Sử dụng **Mock API** và lưu trữ dữ liệu tại máy khách bằng **localStorage**.

**3. Triển khai (Deploy)**
- Dự án sẽ được **Deploy qua Netlify**.
