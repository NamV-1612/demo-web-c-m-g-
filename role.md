# Bảng Phân Công Nhiệm Vụ Dự Án (Theo Branch Repo TuMink)

Dự án được chia thành 4 nhánh (branch) chính biệt lập trên GitHub để các thành viên phát triển song song theo từng Module, nhằm tối ưu hóa tiến độ và giảm thiểu xung đột (conflict) mã nguồn. Dưới đây là chi tiết công việc và các tính năng nâng cao mà mỗi thành viên đã thực hiện:

### 1. Nam - Nhánh `feature/auth-admin` (Xác thực & Quản trị hệ thống)
*   **Authentication & Security (Xác thực & Bảo mật):** Chịu trách nhiệm toàn bộ luồng Đăng nhập, Đăng ký, bảo mật tài khoản bằng JSON Web Token (JWT). Tối ưu hóa trải nghiệm đăng nhập bằng số điện thoại (Phone-number login).
*   **Phân quyền đa tầng (Role-based Authorization):** Tự động phân luồng người dùng (Khách, Nhân viên, Admin) vào đúng giao diện tương ứng. Cấu hình bảo vệ các route (Protected Routes) để chặn hoàn toàn truy cập trái phép.
*   **Premium Admin Dashboard:** Thiết kế hệ thống bảng điều khiển trung tâm cho Admin với các biểu đồ thống kê xu hướng trực quan (Sparkline Charts, Thống kê đơn hàng mới/hủy). 
*   **Quản trị Nhân sự & Người dùng:** Xây dựng luồng cấp phát/khóa/sửa thông tin tài khoản. Tối ưu UI/UX cao cấp cho bảng quản lý người dùng (thiết kế Thẻ Tag bo góc hiển thị chức vụ, trạng thái "Đang hoạt động" theo mã màu trực quan).

### 2. Minh - Nhánh `feature/cart-kanban` (Luồng Giỏ hàng & Điều phối đơn)
*   **Advanced Cart Logic (Giỏ hàng thông minh):** Xử lý toàn bộ logic phức tạp của giỏ hàng: thêm món, tùy chỉnh đa dạng Topping, ghi chú đặc biệt cho món ăn, tính toán tổng tiền tự động và luồng Checkout mượt mà.
*   **Kanban Board (Bảng điều phối Nhân viên):** Xây dựng giao diện điều phối trạng thái đơn hàng thời gian thực của Bếp và Thu ngân theo dạng Kanban kéo thả (Chờ duyệt ➔ Đang nấu ➔ Chờ lấy ➔ Hoàn thành).
*   **Hệ thống In Hóa đơn (Thermal Bill):** Xây dựng tính năng xuất và in hóa đơn nhiệt chuyên nghiệp cho cửa hàng, hiển thị chi tiết tự động các khoản giảm giá và mã Voucher được áp dụng.
*   **Tối ưu Trải nghiệm Nhân viên (Staff UX):** Xử lý hệ thống cảnh báo đơn tự hủy sau 15 phút, Popup báo đơn mới, chuẩn hóa thao tác nút bấm (tối giản thông báo rác, thay nút "Bỏ qua" bằng nút "Hủy" dứt khoát). Cấu hình tính năng Quick Inventory (Bật/tắt nhanh tình trạng còn/hết hàng).

### 3. Long - Nhánh `feature/customer-ui-map` (Giao diện Khách & Bản đồ)
*   **Interactive Customer UI (Giao diện Tương tác Khách hàng):** Thiết kế trang chủ hiện đại, hiển thị danh sách thực đơn với font chữ động "Bán chạy" bắt mắt. Xây dựng giao diện chi tiết món ăn với Popup tùy biến size/topping chuyên nghiệp.
*   **Micro-Animations (Hiệu ứng vi chuyển động):** Nghiên cứu và áp dụng các hiệu ứng UI/UX cao cấp: Hiệu ứng món ăn bay vèo vào giỏ hàng (Fly-to-cart), hiệu ứng viền phát sáng chạy vòng quanh (Running-border glow) và nhấp nháy giỏ hàng để thu hút sự chú ý khi người dùng thêm món.
*   **Sổ địa chỉ & Tích hợp Google Maps:** Cấu hình tính năng quản lý sổ địa chỉ. Lập trình API Google Maps cho phép khách hàng ghim vị trí nhận hàng trực quan trên bản đồ, tự động chuyển đổi tọa độ thành địa chỉ text để lưu tự động.

### 4. Khánh - Nhánh `feature/menu-promo-history` (Sản phẩm, Khuyến mãi & Lịch sử)
*   **Menu Management (Quản trị Thực đơn & Kho):** Xây dựng luồng CRUD (Thêm/Sửa/Xóa) cho Admin quản lý danh mục và món ăn. Tích hợp giải pháp lưu trữ API Cloudinary để tự động hóa quá trình upload và nén hình ảnh sản phẩm.
*   **Promo Engine (Hệ thống Khuyến mãi):** Xây dựng hệ thống quản lý Mã giảm giá (Voucher) thông minh, tự động kiểm tra điều kiện áp dụng, logic đối soát để trừ/hoàn lại số lượng mã khi đơn bị hủy hoặc lỗi giao dịch.
*   **Smart Order History (Lịch sử đơn hàng):** Thiết kế trang theo dõi hành trình đơn hàng cho Khách. Tích hợp hiệu ứng ánh sáng nổi bật (Highlight borders) báo hiệu các đơn hàng vừa được hệ thống ghi nhận thành công.
*   **Tương tác Sau mua:** Tích hợp tính năng Hủy đơn chủ động (khi đang chờ duyệt), tính năng Đánh giá (Rating - chấm sao/nhận xét) và nút bấm tiện ích để Re-order (đặt lại nhanh) giỏ hàng cũ.
