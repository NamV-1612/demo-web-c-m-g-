import React from 'react';
import { Modal, Form, Input } from 'antd';
import { FormInstance } from 'antd/es/form';

interface UserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  form: FormInstance<any>;
  loading: boolean;
  isEdit?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ visible, onCancel, onSave, form, loading, isEdit }) => {
  return (
    <Modal 
      title={isEdit ? "Cập nhật thông tin tài khoản" : "Cấp phát tài khoản Nhân viên (Staff)"} 
      visible={visible} 
      onCancel={onCancel} 
      onOk={() => form.submit()}
      okText={isEdit ? "Lưu thay đổi" : "Tạo tài khoản"}
      cancelText="Hủy"
      okButtonProps={{ style: { background: '#D53E0F', borderColor: '#D53E0F' }, loading: loading }}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item 
          name="name" 
          label="Họ tên Nhân viên" 
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input placeholder="VD: Nguyễn Văn Hùng" />
        </Form.Item>
        <Form.Item 
          name="phone" 
          label="Số điện thoại đăng nhập" 
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b/, message: 'Số điện thoại không hợp lệ (VD: 0912345678)!' }
          ]}
        >
          <Input placeholder="VD: 0912345678" disabled={isEdit} />
        </Form.Item>
        <Form.Item 
          name="password" 
          label={isEdit ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu khởi tạo"} 
          rules={[{ required: !isEdit, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password placeholder={isEdit ? "Nhập mật khẩu mới..." : "VD: 123456"} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
