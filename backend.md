# Sổ tay Ghi chú Lỗi (Backend & Frontend)

File này lưu trữ những lỗi sai logic và kỹ thuật đã từng mắc phải trong quá trình xây dựng dự án `demo-web-c-m-g-`. Mục đích là làm tài liệu tham khảo để tránh lặp lại lỗi và dễ dàng gỡ lỗi (debug) sau này.

## 1. Lỗi Bất đồng bộ khi Đăng nhập (Double Login Bug)
- **Triệu chứng:** Người dùng phải bấm Đăng nhập/Đăng ký 2 lần thì hệ thống mới cho vào trang Dashboard. Lần 1 luôn bị đá văng ra.
- **Nguyên nhân:** Lỗi quên dùng lệnh `await`. Hàm `login()` là một hàm bất đồng bộ (Promise), nhưng lệnh `if (login(...))` lại chạy ngay lập tức mà không chờ API phản hồi xong và lưu Token vào LocalStorage. Do đó, Layout kiểm tra chưa có Token nên đá văng ra ngoài.
- **Cách khắc phục:** Thêm `async/await` vào hàm xử lý nút bấm Đăng nhập/Đăng ký để buộc trình duyệt chờ lưu xong mới chuyển trang.

## 2. Lỗi Crash Server vì Typescript (Schema Mismatch)
- **Triệu chứng:** Màn hình console báo lỗi `DiagnosticCodes: [ 2551, 2339 ]`, Backend sập (exit code 1), không thể gọi bất kì API nào.
- **Nguyên nhân:** Khi mở rộng tính năng (VD: thêm trường `toppings` và `category` vào `ProductSchema` của Mongoose), đã quên không cập nhật Interface Typescript (`export interface IProduct`) ở ngay phía trên. Trình biên dịch `ts-node` thấy sự không đồng nhất nên báo lỗi và dừng chạy Server.
- **Cách khắc phục:** Luôn nhớ cập nhật cả `Mongoose Schema` VÀ `Typescript Interface` mỗi khi thêm/sửa trường dữ liệu.

## 3. Lỗi MongoDB E11000 Duplicate Key (Chỉ mục cũ)
- **Triệu chứng:** Không thể tạo tài khoản mới ở Database nội bộ dù gửi đúng dữ liệu. Lỗi báo `E11000 duplicate key error collection: users index: email_1 dup key: { email: null }`.
- **Nguyên nhân:** Ở phiên bản mã nguồn cũ, bảng User có bắt buộc nhập `email` và thiết lập `unique: true`. Tuy nhiên ở bản mới, thiết kế đã loại bỏ `email`. Vì Database nội bộ vẫn còn lưu cái "Chỉ mục (Index)" cũ đó nên nó tự chặn.
- **Cách khắc phục:** Viết một đoạn script nhỏ ép MongoDB xóa bỏ Index cũ đi: `db.users.dropIndex('email_1')`.

## 4. Lỗi Validation Mongoose (Thiếu dữ liệu bắt buộc)
- **Triệu chứng:** Admin không thể tạo tài khoản cho Staff. Lỗi báo `User validation failed: full_name: Path full_name is required`.
- **Nguyên nhân:** Trong form ở Giao diện, trường họ tên được đặt tên là `name`. API gửi lên có dạng `{ name: 'Nguyễn A' }`. Nhưng Schema của Backend lại quy định Tên đăng nhập là `name`, còn Họ tên đầy đủ phải là `full_name`. Do thiếu `full_name`, Mongoose từ chối lưu.
- **Cách khắc phục:** Sửa lại Controller Backend, tự động chèn `full_name: name` trước khi lưu vào Database.

## 5. Lỗi Phân quyền & Chặn tính năng (Hủy Đơn)
- **Triệu chứng:** Khách hàng bấm nút "Hủy đơn" không có chuyện gì xảy ra, hoặc báo lỗi 403 Forbidden.
- **Nguyên nhân:** 
  1. Frontend gọi hàm rỗng `deleteOrder()` chỉ hiện thông báo chứ không gọi API.
  2. Backend thiết lập API `PUT /api/orders/:id/status` với middleware `staffOrAdmin`, nghĩa là cấm hoàn toàn Customer không được đụng vào trạng thái đơn.
- **Cách khắc phục:** 
  - Mở middleware cho cả Customer.
  - Xử lý logic bên trong Controller: Nếu là Customer, CHỈ CHO PHÉP đổi thành `CANCELLED`, và chỉ khi đơn đang ở trạng thái `PENDING`. Bắt buộc kiểm tra ID người hủy phải đúng với ID chủ đơn hàng.

## 6. Lỗi Gọi API không tồn tại (Sửa Địa Chỉ)
- **Triệu chứng:** Giao diện có nút "Sửa ĐC", nhưng API báo lỗi 404 Not Found hoặc không hoạt động.
- **Nguyên nhân:** Frontend cố gắng gọi `PUT /api/orders/:id` để gửi `customerPhone` và `note`, nhưng Backend chưa hề viết endpoint này.
- **Cách khắc phục:** Khai báo thêm Route `PUT /api/orders/:id` và viết hàm xử lý cập nhật đơn (Chỉ cho phép cập nhật khi PENDING).

## 7. Lỗi Thiếu dữ liệu liên kết (Populate Image)
- **Triệu chứng:** Xem lịch sử đơn hàng hoặc chi tiết đơn, tên món ăn hiện lên nhưng ảnh thì bị trống.
- **Nguyên nhân:** API Get Orders chỉ trả về `productId` (một chuỗi ID vô hồn). Frontend không có dữ liệu ảnh để hiển thị.
- **Cách khắc phục:** Thêm lệnh `.populate('items.productId')` vào các truy vấn lấy Đơn hàng ở Backend để đính kèm toàn bộ dữ liệu Product (gồm cả Image) vào kết quả.
