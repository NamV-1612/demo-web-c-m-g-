Mô tả:
Ý tưởng chính: Xây dựng hệ thống web hỗ trợ quy trình đặt thức ăn mang về. Hệ thống cho phép khách hàng xem thực đơn, đặt món trước để đến lấy (không phục vụ tại chỗ) giúp tiết kiệm thời gian chờ đợi. Đồng thời cung cấp công cụ cho nhân viên/chủ quán tiếp nhận đơn hàng, quản lý thực đơn và thống kê doanh thu bán hàng.
1.Phân hệ Khách vãng lai (Guest)
-Xem thông tin: Khám phá trang chủ, xem thực đơn, sử dụng thanh tìm kiếm và bộ lọc món ăn.
-Chi tiết món ăn: Xem hình ảnh, giá cả, thành phần và các tùy chọn topping (nhưng không được thao tác chọn).
-Giới hạn quyền: Không có tính năng Giỏ hàng. Các nút hành động (như "Thêm vào giỏ", "Đặt món") đều được đổi thành "Đăng nhập để đặt món" và điều hướng sang trang xác thực.
-Bảo vệ luồng (Protected Routes): Tự động đẩy (redirect) người dùng về trang Đăng nhập nếu cố tình truy cập các đường dẫn dành riêng cho thành viên như giỏ hàng hay lịch sử đơn.
2.Phân hệ Khách hàng thành viên (User)
-Tài khoản: Đăng ký, đăng nhập, quản lý thông tin cá nhân.
-Đặt món & Giỏ hàng: Thêm món, tùy chỉnh topping, ghi chú riêng (ví dụ: không hành).
-Hẹn giờ & Thanh toán: Hẹn khoảng thời gian sẽ đến lấy đồ; chọn thanh toán tiền mặt khi nhận hoặc chuyển khoản QR (Không tích hợp chuyển khoản QR, nhân viên sẽ tự xác nhận lại trạng thái chuyển tiền của khách)
-Theo dõi đơn (Real-time tracking): Theo dõi tiến trình đơn hàng (Chờ xác nhận -> Đang chế biến -> Đã sẵn sàng -> Hoàn thành/Đã hủy).
-Lịch sử: Xem lại các đơn cũ, đánh giá món ăn và sử dụng nút "Đặt lại đơn này" để thao tác nhanh.
3.Phân hệ Nhân viên (Staff)
-Giao diện điều phối: Hiển thị danh sách đơn hàng theo thời gian thực (dạng Kanban board hoặc list) kèm popup thông báo khi có đơn mới.
-Xử lý đơn hàng: Tiếp nhận đơn, chuyển trạng thái sang đang chế biến, và báo hiệu "Đã sẵn sàng" để thông báo món ăn đã được bếp làm xong.
-Thanh toán: Xác nhận trạng thái thanh toán của khách (đã chuyển khoản hoặc nhận tiền mặt).
-Quản lý kho nhanh: Nút gạt bật/tắt (in-stock/out-of-stock) nhanh cho các món hoặc topping hết nguyên liệu trong ngày để ẩn khỏi ứng dụng của khách.
4.Phân hệ Quản trị viên (Admin)
-Bảng điều khiển (Dashboard): Tổng quan doanh thu trong ngày/tuần/tháng, tổng số đơn, top món bán chạy nhất.
-Quản lý Thực đơn (CRUD): Thêm, sửa, xóa danh mục và chi tiết món ăn (tên, giá, ảnh minh họa, mô tả).
-Quản lý Đơn hàng: Tra soát toàn bộ lịch sử giao dịch của hệ thống, có quyền can thiệp hủy đơn khẩn cấp.
-Quản lý Nhân sự & Khách hàng: Cấp phát/khóa tài khoản nhân viên; khóa/mở khóa (ban/unban) tài khoản khách hàng nếu có hành vi spam.
-Báo cáo & Xuất dữ liệu: Biểu đồ thống kê và tính năng xuất dữ liệu danh sách đơn hàng/doanh thu ra file Excel/CSV phục vụ đối soát kế toán.

YÊU CẦU CHUNG:
1. Frontend (client)
- Sử dụng ngôn ngữ lập trình Typescript
- Sử dụng framework ReactJS và base umiJS
- Thư viện UI có sẵn: Ant Design
2. Backend (server)
- Sử dụng Mock API, localStorage
3. Deploy 
Deploy qua netlify (Kiểm tra xem nếu dùng mock api và localStorage thì có deploy được không)
YÊU CẦU CHI TIẾT
- Trong mục pages, mỗi mục sẽ cần chia nhỏ các components, index.tsx và style.less. Phần index.tsx chỉ dùng để hiển thị các phần đã làm, tách phần CSS ra các file style.less của mỗi mục tương ứng, tuyệt đối trong các file .tsx không được chứa inline CSS.
- Sử dụng các control/component có sẵn của Antd/Project
- Sử dụng base web umi của giảng viên, khai báo và thống nhất interface trong cả project, có models; tách components, Form, tái sử dụng các components.
- Không nên thay đổi vào phần base web Umi hay các file có sẵn của dự án nếu nó ảnh hưởng tới cách vận hành web, chỉ nên sử dụng những cái sẵn có trong đấy thôi. Nếu sửa đổi không ảnh hưởng gì thì có thể sửa, các thiết lập cấu hình nên giữ nguyên
- Luôn luôn chia rõ ràng ra các thư mục: pages, models, services, mock api... Luôn luôn cập nhật route và phần cấu trúc thư mục đầu tiên khi làm. 


