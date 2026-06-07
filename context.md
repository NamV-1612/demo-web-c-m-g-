# Tài Liệu Đặc Tả Dự Án: Chức Năng Hiện Tại & Yêu Cầu Môi Trường (Context 4)

Tài liệu này tổng hợp **toàn bộ chức năng đã hoàn thiện** theo 4 phân quyền (Guest, Customer, Staff, Admin) và **chi tiết kỹ thuật, cấu hình môi trường** bắt buộc để dự án triển khai (deploy) thành công và hoạt động ổn định trên môi trường thực tế.

---

## PHẦN I: TỔNG QUAN CHỨC NĂNG THEO PHÂN QUYỀN

### 1. Khách Vãng Lai (Guest / Public)

- **Khám phá Trang chủ & Thực đơn:** Xem danh sách món ăn, tìm kiếm bằng từ khóa (tích hợp hiệu ứng loading sinh động), lọc theo danh mục (Tất cả, Cơm rang, Món ăn kèm, Đồ uống). Thuật toán tự động sắp xếp món từ giá cao xuống thấp ở mục "Tất cả". Giao diện thẻ món ăn tối giản, gắn huy hiệu (Badge) Gradient "Bán chạy" cao cấp.
- **Xem Chi tiết Món:** Modal xem chi tiết món ăn được thiết kế chuẩn UX chia 2 cột (2-column layout). Xem ảnh, giá cả, thành phần nguyên liệu, và danh sách các tùy chọn Topping (nhưng không được thao tác chọn mua).
- **Đăng Ký Tài Khoản:** Đăng ký thành viên mới với các trường: Họ Tên, Tên đăng nhập, Số điện thoại, Mật khẩu, Địa chỉ. Tích hợp kiểm tra trùng lặp SĐT/Tên đăng nhập.
- **Quên Mật Khẩu:** Tích hợp luồng gọi API thực tế giúp người dùng tự khôi phục tài khoản thông qua Số điện thoại.
- **Đăng Nhập Phân Quyền:** Giao diện đăng nhập hiện đại, thân thiện, chia layout 50-50 với ảnh thương hiệu Doki Food (Cơm rang) kèm Footer thông tin địa chỉ quán & Hotline. Khách hàng/Admin đăng nhập bằng Tên đăng nhập HOẶC Số điện thoại. Riêng Nhân viên (Staff) đăng nhập nhanh chỉ cần Số điện thoại. Nút "Tiếp tục dưới tư cách Khách vãng lai" được thiết kế nổi bật giúp khách dễ dàng trải nghiệm xem menu. Tích hợp các **hiệu ứng chuyển cảnh (Transition Animations)** cực kỳ bắt mắt: sơn chảy (Customer), SVG Chart (Admin), Fade-in (Staff) và màn hình chào mừng (Welcome Message) làm cho trang web sống động.
- **Cơ chế Bảo mật & Giới hạn Quyền (Protected Routes):** Không có tính năng Giỏ hàng. Các nút hành động (như "Thêm vào giỏ", "Đặt món") đều được đổi thành "Đăng nhập để đặt món". Nếu cố tình truy cập các đường dẫn như `/customer/cart`, `/customer/history`, hệ thống sẽ tự động chặn và chuyển hướng sang trang Đăng nhập.

### 2. Khách Hàng Thành Viên (Customer / User)

_Sở hữu toàn bộ tính năng của Guest, cộng thêm:_

- **Giỏ hàng & Đặt món (`/customer/cart`):**
  - Tùy chỉnh chi tiết món: Chọn Topping, thêm **ghi chú riêng cho từng món** (ví dụ: không hành, ít cay).
  - Quản lý tùy chọn nhận hàng: Nhờ quán giao tận nơi (Ship) hoặc Tự đến lấy tại quán.
  - Quản lý địa chỉ giao hàng: Tích hợp tính năng **Chọn từ Google Maps** để lấy tọa độ và địa chỉ chuẩn xác. Tự động điền SĐT và Tên từ hồ sơ người dùng. Tự động đồng bộ danh sách địa chỉ ngầm từ backend để khắc phục lỗi thiếu dữ liệu khi tải trang. Giao diện Dropdown hiển thị đầy đủ chi tiết địa chỉ dài không bị cắt xén chữ.
  - Chọn thời gian nhận đồ: Hỗ trợ đặt "Giao ngay" hoặc "Hẹn giờ khoảng thời gian đến lấy/nhận đồ" với giao diện Dropdown, định dạng giờ thuần Việt (Sáng/Chiều - SA/CH). Hệ thống tích hợp logic chặn chọn giờ không hợp lệ, yêu cầu khoảng thời gian nhận hàng phải trễ hơn thời gian hiện tại ít nhất 30 phút. Thuật toán **xử lý mượt mà thời gian hẹn qua đêm (midnight crossing)**.
  - Khuyến mãi & Thanh toán: Áp dụng mã Voucher giảm giá nhanh bằng phím Enter. Hệ thống tích hợp **Popup tự động tặng Welcome Voucher** cho khách hàng mới với số lượng không giới hạn. Chọn thanh toán tiền mặt khi nhận hoặc chuyển khoản (nhân viên tự xác nhận trạng thái).
  - Điều chỉnh số lượng món, xóa món lẻ hoặc **xóa sạch toàn bộ giỏ hàng (Clear Cart)** chỉ với 1 thao tác.
- **Lịch Sử & Theo dõi Đơn Hàng (Real-time tracking) (`/customer/history`):**
  - Theo dõi trạng thái tiến trình: Chờ duyệt (Chờ xác nhận) -> Đang nấu (Đang chế biến) -> Chờ lấy (Đã sẵn sàng) -> Hoàn thành. Hệ thống tích hợp đồng hồ đếm ngược trực quan (MM:SS) 15 phút cho các đơn đang chờ duyệt. Tích hợp cơ chế thông báo (Real-time notifications) đồng bộ trạng thái đơn tức thời.
  - **Chỉnh sửa thông tin linh hoạt:** Hỗ trợ sửa địa chỉ qua Google Maps khi đơn đang ở trạng thái "Chờ duyệt". Logic hệ thống tự động **chặn/ẩn nút Sửa địa chỉ** đối với các đơn hàng chọn hình thức "Tự đến lấy" (Takeaway) để tránh lỗi dữ liệu.
  - Chức năng tiện ích: **Tìm kiếm lịch sử đơn hàng (hỗ trợ tìm tiếng Việt không dấu)**, mã vận đơn được định dạng chuẩn chuyên nghiệp **`CD_xxxx`**. Khách hàng có thể xem lại đơn cũ, Đánh giá dịch vụ (Rating) sau khi Hoàn thành; nút "Đặt lại đơn này" để sao chép nhanh đơn hàng cũ vào giỏ; xóa các lịch sử đơn đã Hủy/Hoàn thành. Hiển thị Popup thông báo nổi báo hiệu khi đồ ăn "Đã sẵn sàng / Chờ lấy".
- **Tối ưu trải nghiệm UI/UX (Mới):** Tự động cuộn lên đầu trang (Auto scroll to top) khi chuyển hướng giữa các trang Thực đơn, Giỏ hàng và Lịch sử, giúp loại bỏ cảm giác bị khựng, lỗi hiển thị khi lướt danh sách dài.
- **Tài Khoản & Sổ Địa Chỉ (`/customer/profile`):**
  - Đổi mật khẩu tiện lợi chỉ cần xác thực qua Số điện thoại và Tên đăng nhập (không cần nhớ mật khẩu cũ).
  - Cập nhật thông tin cá nhân (Họ tên, SĐT).
  - **Quản lý Sổ địa chỉ:** Thêm nhiều địa chỉ nhận hàng vào sổ, thiết lập địa chỉ mặc định để tự động điền khi đặt hàng. Thuật toán **ngăn chặn xóa địa chỉ cuối cùng** trong sổ (bắt buộc giữ lại ít nhất 1 địa chỉ để đảm bảo luồng thanh toán).

### 3. Nhân Viên (Staff)

- **Giao diện Bảng Điều Phối Đơn Hàng (Kanban Board / List):**
  - Giao diện kéo-thả/chuyển bước chia làm 4 cột trạng thái. Đặc biệt, thiết kế Thẻ Đơn Hàng (Order Card) được lấy cảm hứng từ "Kitchen Ticket" (Phiếu in bếp) cổ điển với các đường nét đứt, giúp bếp dễ dàng làm quen.
  - **Thông báo đơn mới:** Hệ thống tự động hiển thị đơn mới ngay trong cột Chờ duyệt với đồng hồ đếm ngược sinh động (MM:SS) 15 phút. Hệ thống tự động đẩy hiển thị Popup Alert đỏ cảnh báo ngay lập tức nếu đơn hàng tự động bị hủy do quá giờ xác nhận.
  - **Xử lý đơn hàng:** Khi bếp bấm nhận đơn (Nấu món này), Popup xác nhận tình trạng thanh toán sẽ xuất hiện để chốt xem khách đã chuyển khoản chưa. Chuyển trạng thái sang đang chế biến, và báo hiệu "Đã sẵn sàng" để báo khách.
- **Thanh Toán & Hóa Đơn:** Cập nhật/Xác nhận trạng thái thanh toán của khách (đã chuyển khoản hoặc nhận tiền mặt). Thiết kế Hóa đơn nhiệt (Thermal Receipt Template) chuẩn nhà hàng chuyên nghiệp. Đặc biệt hỗ trợ nút **In lại phiếu (Reprint)** ngay cả khi đơn hàng đã nằm trong cột HOÀN THÀNH.
- **Hủy Đơn Thủ Công:** Tích hợp tính năng Modal chọn/ghi lý do hủy đơn cụ thể thay vì chỉ hủy ngầm. Luồng ghi nhận lý do hủy đơn được **đồng bộ khép kín** cho cả Khách hàng, Nhân viên và Quản trị viên, và được lưu vết trực tiếp vào Database.
- **Quản lý Tồn Kho Nhanh:** Giao diện Drawer tối giản, nâng cấp hiển thị công tắc to rõ (enlarged switch) và font chữ hệ thống dễ nhìn. Tích hợp **Bộ lọc kho thông minh** giúp dễ dàng tìm kiếm món ăn. Nút gạt bật/tắt (in-stock/out-of-stock) nhanh trạng thái món ăn và từng loại Topping ngay trên giao diện nhanh (Drawer) để ẩn khỏi ứng dụng của khách mà không cần vào menu Admin. Đồng thời Staff có quyền Thêm mới và Sửa thông tin món ăn (nhưng không có quyền Xóa món ăn như Admin).

### 4. Quản Trị Viên (Admin)

- **Dashboard Tổng Quan:**
  - **Thống Kê Doanh Thu:** Theo dõi số liệu báo cáo, tổng quan doanh thu trong ngày/tuần/tháng, tổng số đơn, thống kê top các món bán chạy nhất và biểu đồ doanh thu. Logic doanh thu tự động loại bỏ các đơn đã bị Hủy, chỉ tính các đơn hợp lệ.
  - **Trợ lý Kinh Doanh Thông Minh:** Tích hợp giao diện Grid hiện đại, tự động đưa ra các câu nhận xét logic dựa trên số liệu doanh thu và tỷ lệ đơn hủy để chủ quán nắm bắt tình hình tức thời.
  - **Phân Tích Tỷ Lệ Hủy Đơn:** Bổ sung Biểu đồ tròn (Pie Chart) trực quan với Legend chi tiết, tách bạch rõ ràng nguyên nhân hủy đơn (Khách tự hủy, Quán hủy, Hủy tự động do nhân viên duyệt trễ 15 phút). Mọi tính năng báo cáo đều hỗ trợ cuộn mượt mà.
- **Quản lý Thực đơn (CRUD) (`/admin/menu`):** Toàn quyền Thêm/Sửa/Xóa danh mục và chi tiết món ăn, cập nhật giá, mô tả, ảnh minh họa. Đồng bộ mạnh mẽ và tránh lỗi crash database.
- **Quản lý Mã Khuyến Mãi (`/admin/promos`):** Tạo/Sửa Voucher (giảm % hoặc giảm tiền mặt), thiết lập giới hạn sử dụng, bật/tắt trạng thái mã. Đảm bảo bảo mật API để ngăn chặn khách hàng lấy danh sách mã nội bộ.
- **Quản lý Đơn Hàng (`/admin/orders`):** Tra soát toàn bộ lịch sử giao dịch, phân loại trực quan nhãn **🛵 Giao hàng** và **🏪 Nhận tại quán**. Tích hợp tính năng Modal chọn lý do chi tiết khi thực hiện Hủy đơn khẩn cấp. Tích hợp tính năng báo cáo & xuất dữ liệu danh sách đơn hàng/doanh thu ra file Excel/CSV phục vụ đối soát kế toán.
- **Quản lý Người Dùng & Nhân Sự (`/admin/users`):**
  - Tách bạch thông tin Họ Tên và Tên Đăng Nhập cho các vai trò. Thiết kế bảng hiển thị sử dụng Typography và Action Icon hiện đại.
  - Phân quyền chặt chẽ API: **Chỉ Admin mới có quyền Sửa/Xóa tài khoản**, chặn hoàn toàn rủi ro từ quyền Staff.
  - Bắt buộc chuẩn hóa form số điện thoại khi tạo tài khoản nhân viên.
  - Cấp phát/Khóa tài khoản nhân viên (Staff) với cơ chế bảo mật (Mã hóa mật khẩu bằng `Bcrypt`).
  - Khóa/Mở khóa (Ban/Unban/LOCKED) tài khoản khách hàng nếu có hành vi xấu (spam) để ngăn chặn đăng nhập vào hệ thống.
- **Tối ưu trải nghiệm UI/UX Admin:** Tích hợp thanh Sidebar trượt màu trắng (Sliding white bar animation) chuyển động bám sát item đang chọn, mang lại cảm giác cực kỳ công nghệ và mượt mà. Đổi màu chữ viết tay (Dashboard) thành màu đen sang trọng.

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

## PHẦN III: ĐIỂM NHẤN CÔNG NGHỆ & TỐI ƯU TRẢI NGHIỆM (UI/UX PREMIUM)

Bên cạnh các tính năng nghiệp vụ, dự án được chú trọng đặc biệt vào Trải nghiệm Người Dùng (UX) và Giao Diện (UI) để mang lại cảm giác của một ứng dụng F&B cao cấp:

1. **Hiệu năng & Tốc độ (Performance):**
   - Tích hợp **Debounce Search** trong thanh tìm kiếm món ăn, đi kèm hiệu ứng "Typing dots..." (Dấu chấm lửng nhảy múa) và tự động cuộn mượt (Auto-scroll) khi bắt đầu gõ, giúp giảm tải API và tăng độ phản hồi.
   - Kỹ thuật **Preload Chunk** và Delay rendering được áp dụng khi chuyển cảnh từ Đăng nhập vào Home để chống giật lag (stutter) và đảm bảo các hiệu ứng CSS phức tạp chạy mượt mà ở 60fps.
2. **Hệ sinh thái Hiệu ứng Độc quyền (Custom Animations):**
   - **Chuyển cảnh Đăng nhập (Login Transitions):** Hiệu ứng "Giọt sơn chảy" (Drip effect) bo tròn giọt sơn cực kỳ bắt mắt khi khách hàng đăng nhập; Hiệu ứng SVG Chart khi Admin đăng nhập; và hiệu ứng Fade-in Blur-zoom khi đổi luồng.
   - **Hiệu ứng Checkout:** Thay thế các thông báo thành công (Success Message) nhàm chán bằng hiệu ứng **vẽ nét SVG Checkmark (vẽ dấu tích) nổi bật** che phủ mã QR khi khách thanh toán/đặt hàng thành công.
   - Hiệu ứng **nổi giỏ hàng (Floating Cart)** và hiệu ứng trừ tiền bay lơ lửng khi áp dụng mã giảm giá thành công.
3. **Ngôn ngữ Thiết kế Tối giản & Sang trọng (Premium Styling):**
   - **Hệ thống màu sắc (Color Palette):** Áp dụng bảng màu thương hiệu tùy chỉnh cực kỳ sang trọng (Trắng kem, Đỏ Burgundy) thay vì các mã màu đỏ chói thông thường. Đảm bảo độ tương phản (Contrast) hoàn hảo.
   - **Hệ thống thẻ (Card Design):** Thiết kế thẻ Đơn hàng Lịch sử (Order History) nằm ngang tiết kiệm không gian; Thẻ giảm giá (Voucher) được thiết kế dạng "Coupon Ticket" với đường cắt nét đứt giống giao diện Shopee/TiktokShop.
   - **Toast Notifications:** Nâng cấp toàn bộ giao diện thông báo góc màn hình (Global Messages) thành giao diện thẻ Premium Card thay vì giao diện Ant Design mặc định.
4. **Quản trị mượt mà (Admin/Staff Layout):**
   - Dashboard Admin hỗ trợ click trực tiếp vào các Thẻ Thống Kê (Clickable Cards) để chuyển hướng nhanh đến menu hoặc danh sách đơn. Thiết kế cột mốc và nhãn (Role Tags/Status Tags) bo góc với màu gradient cao cấp.

---

## PHẦN IV: CHANGELOG - TỔNG HỢP TÍNH NĂNG MỚI (Cập nhật Ngày 6 & 7/6)

Dựa trên lịch sử phát triển gần nhất, dưới đây là danh sách các tính năng (không bao gồm các thay đổi thuần về UI) đã được tích hợp thành công vào hệ thống:

### 1. Trải Nghiệm Khách Hàng & Giỏ Hàng (Customer & Cart)

- **Tách món thông minh trong giỏ:** Xử lý triệt để lỗi gộp món; các món ăn giống nhau nhưng chọn Topping khác nhau sẽ được tách thành các dòng riêng biệt.
- **Tối ưu Hẹn giờ nhận hàng:** Khắc phục lỗi chọn giờ giao qua đêm (midnight crossing) và đồng bộ hóa điều kiện chặn giờ không hợp lệ.
- **Bảo vệ dữ liệu Sổ địa chỉ:** Hệ thống tự động chặn hành vi xóa địa chỉ giao hàng cuối cùng để đảm bảo luồng thanh toán không bị gián đoạn.
- **Tính logic của Đơn Tự đến lấy:** Tự động ẩn nút "Sửa địa chỉ" khi người dùng theo dõi các đơn hàng chọn hình thức Tự đến lấy.
- **Tối ưu UX Tìm kiếm & Nhập mã:** Áp dụng thuật toán Debounce cho thanh tìm kiếm; hỗ trợ nhập và áp dụng mã khuyến mãi nhanh bằng phím `Enter`.
- **Voucher Không Giới Hạn:** Tính năng tự động hiển thị Popup tặng Welcome Voucher cho người dùng mới với số lượng sử dụng không giới hạn.
- **Sắp xếp khoa học:** Tự động sắp xếp các món ăn theo thứ tự Giá từ cao đến thấp ở danh mục "Tất cả".
- **Hiệu ứng Vi chuyển động (Micro-animations):** Tích hợp hiệu ứng bay vèo món ăn vào giỏ (Fly-to-cart) và hiệu ứng viền phát sáng lượn vòng (Running-border glow) quanh icon Giỏ hàng để thu hút sự chú ý khi người dùng thêm món mới.
- **Nâng cấp Lịch sử đơn hàng:** Giao diện thẻ đơn hàng trong mục Lịch sử được bổ sung hiệu ứng nháy viền nổi bật (Highlight borders) để thông báo trực quan các đơn hàng vừa được ghi nhận thành công lên hệ thống.
### 2. Nghiệp Vụ Nhân Viên (Staff)

- **Quản lý Hóa Đơn (Thermal Bill):** Hoàn thiện module in hóa đơn nhiệt chuyên nghiệp; sửa lỗi để hóa đơn giờ đây có thể hiển thị chính xác chi tiết tên Mã giảm giá và số tiền được trừ. Thêm tính năng In lại hóa đơn (Reprint) linh hoạt ngay cả khi đơn hàng đã chuyển sang trạng thái "Hoàn thành".
- **Kiểm soát Thanh toán:** Tích hợp Popup xác nhận thanh toán xuất hiện tự động ngay khi nhân viên bấm "Nhận nấu đơn", đi kèm công tắc bật/tắt (Toggle) tình trạng thanh toán cực kỳ tiện lợi.
- **Quy trình Hủy đơn chặt chẽ & Tối ưu thao tác:** Bắt buộc nhân viên phải chọn/nhập lý do khi hủy đơn; chuẩn hóa nút "Bỏ qua" mập mờ thành nút "Hủy" dứt khoát. Đồng thời, gỡ bỏ triệt để các thông báo rác (spam messages) nhảy lên màn hình khi nhân viên thao tác nhanh. Dữ liệu lý do hủy được truyền xuyên suốt qua Backend, lưu vào Database và báo ngược lại cho khách hàng.

### 3. Nghiệp Vụ Quản Trị (Admin)

- **Trợ lý Dashboard & Biểu đồ:** Ra mắt tính năng Trợ lý Kinh doanh thông minh (tự phân tích bằng logic) và Biểu đồ Tròn (Pie chart) thống kê tỉ lệ hủy đơn kèm phân loại chi tiết (Khách hủy vs Quán hủy vs Hệ thống tự hủy).
- **Chuyển hướng nhanh:** Các thẻ thống kê (Valid Orders, Total Menu) trên Dashboard nay đã có thể Click để chuyển hướng nhanh chóng đến trang quản lý tương ứng.
- **Quản lý Nhân sự & Chuẩn hóa dữ liệu:** Bắt buộc nhập đúng định dạng Số điện thoại khi khởi tạo tài khoản nhân viên. Siết chặt bảo mật API: chỉ duy nhất Admin mới thao tác được việc Sửa/Xóa tài khoản.
- **Nâng cấp Thẻ trạng thái (Status Tags):** Làm đẹp hiển thị của thẻ trạng thái trong Quản lý người dùng, thiết kế dạng bo góc bo tròn cao cấp (Premium pill shape) với mã màu Xanh (Đang hoạt động) và Đỏ (Bị khóa) để mang lại trải nghiệm chuyên nghiệp.

### 4. Hệ Thống & Phân Quyền (System & Auth)

- **API Khôi phục Tài khoản:** Triển khai luồng gọi API thực tế cho chức năng Quên mật khẩu và Đổi mật khẩu thành công.
- **Chuyển đổi Luồng linh hoạt:** Thêm nút chức năng (Quick Switch Toggle) để chuyển đổi nhanh qua lại giữa màn hình đăng nhập của Admin và Staff.
- **Thông báo Real-time:** Hoàn thiện hạ tầng hệ thống đẩy thông báo (Real-time notifications) báo trạng thái đơn hàng cho Khách hàng và thông báo đơn mới cho Nhân viên bếp.

---

## PHẦN V: CÁC TÍNH NĂNG CHƯA HOÀN THIỆN & ĐỊNH HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI

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
