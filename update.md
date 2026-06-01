# Bản Cập Nhật Hệ Thống (Ngày 28/05/2026)

Dưới đây là tóm tắt toàn bộ các cập nhật, tính năng mới và các lỗi đã được khắc phục trong ngày hôm nay:

## 1. Đồng Bộ & Hiển Thị Dữ Liệu
- **Món ăn bán chạy (Customer Home):** Sửa thuật toán đếm số lượng món bán ra. Giờ đây hệ thống chỉ đếm các món ăn nằm trong các đơn hàng đã `HOÀN THÀNH` (COMPLETED).
- **Lịch sử đơn hàng (Customer History):** Bổ sung hiển thị Mã giảm giá và số tiền được giảm giá cụ thể trên hóa đơn chi tiết của khách.
- **Doanh thu (Admin Dashboard):** Sửa lỗi tính doanh thu. Doanh thu giờ đây chỉ cộng dồn từ những đơn hàng đã giao thành công (`HOÀN THÀNH`).

## 2. Giao Diện & Trải Nghiệm Nhân Viên (UX/UI)
- **Quản lý tồn kho cấp tốc:** Đã áp dụng `Optimistic UI Update`. Khi nhân viên bấm báo Hết/Còn cho các Topping, màu sắc thẻ sẽ lập tức phản hồi mượt mà không có độ trễ, không cần phải thoát ra vào lại.
- **Sắp xếp & Cảnh báo Đơn mới:**
  - Hủy bỏ các thông báo popup (notification) báo đơn mới do gây phiền nhiễu.
  - Đơn hàng ở cột `CHỜ DUYỆT` giờ tự động sắp xếp theo thứ tự: Cũ nhất ở trên cùng, Mới nhất ở dưới cùng.
  - Các đơn hàng vừa được tạo trong vòng 5 phút sẽ có hiệu ứng **viền nhấp nháy đỏ** sang trọng và hiển thị chữ `MỚI`.
- **Thẻ Đơn hàng (OrderCard):** Bổ sung dòng hiển thị "Địa chỉ nhận hàng" nằm ngay dưới số điện thoại của khách trên Kanban board để nhân viên dễ nhìn hơn.
- **Hóa đơn in nhiệt:**
  - Cải tiến giao diện hóa đơn in.
  - Nếu khách nhờ Ship: Hiển thị dòng `Địa chỉ nhận` và `Hẹn giao`.
  - Nếu khách tự tới lấy: Hiển thị dòng `Hình thức: Tự đến lấy tại quán`.

## 3. Luồng Thanh Toán & Khuyến Mãi
- **Giao diện Giỏ Hàng (QR Code):** 
  - Khôi phục luồng đặt hàng đơn giản (Phương án A): Khách quét mã QR tĩnh (chứa thông tin ngân hàng + tổng tiền) ngay tại giỏ hàng và tự tay bấm "Đặt đơn ngay".
  - Thêm dòng chú thích *"Thanh toán mã để đặt hàng"*.
- **Mã Khuyến Mãi (Voucher):**
  - Khi khách đặt đơn thành công, hệ thống tự động trừ đi `1` lượt sử dụng của Mã khuyến mãi trong Database.
  - Nếu đơn hàng bị `HỦY` (bởi nhân viên hoặc khách hàng), hệ thống sẽ tự động hoàn trả lại `1` lượt dùng cho mã đó.
- **Trạng thái Thanh toán (isPaid):**
  - Tự động hóa: Vì bỏ công tắc xác nhận thanh toán thủ công, hệ thống sẽ tự hiểu là khách đã chuyển khoản thành công khi nhân viên bấm Duyệt đơn nấu. Cụ thể, khi đơn chuyển sang trạng thái `ĐANG NẤU` (PREPARING), đơn hàng sẽ lập tức được đổi thành **Đã thanh toán**.

## 4. Fix Bugs (Sửa lỗi kỹ thuật)
- **Lỗi Màn Hình Trắng Staff Dashboard:** Sửa lỗi thiếu thư viện `moment` khiến nhân viên đăng nhập thành công nhưng trang không load được.
- **Lỗi Thông báo Đăng xuất 2 lần:** Tối ưu hóa lại luồng vòng đời React (`useEffect`), xóa bỏ triệt để các thông báo dư thừa khi thoát tài khoản.
- **Sửa API Call trên Netlify:** Cấu hình lại các hàm gọi `fetch` thành `api.get / api.post` sử dụng base URL động. Nhờ vậy không còn lỗi 404 Page Not Found khi đưa lên môi trường thật.
- **Sửa Lỗi TS2538:** Khắc phục lỗi ép kiểu dữ liệu `string` trong file cấu hình Backend Controller.
