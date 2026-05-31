import React from 'react';
import { Modal, Form, Input } from 'antd';
import { FormInstance } from 'antd/es/form';

interface UserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  form: FormInstance<any>;
  loading: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ visible, onCancel, onSave, form, loading }) => {
  return (
    <Modal 
      title="Cấp phát tài khoản Nhân viên (Staff)" 
      visible={visible} 
      onCancel={onCancel} 
      onOk={() => form.submit()}
      okText="Tạo tài khoản"
      cancelText="Hủy"
      okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' }, loading: loading }}
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
          label="Tên đăng nhập (Số điện thoại)" 
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9A-Za-z]+$/, message: 'Chỉ chứa số hoặc chữ viết liền không dấu!' }
          ]}
        >
          <Input placeholder="VD: 0912345678 hoặc STAFF2" />
        </Form.Item>
        <Form.Item 
          name="password" 
          label="Mật khẩu khởi tạo" 
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu khởi tạo!' }]}
        >
          <Input.Password placeholder="VD: 123456" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
