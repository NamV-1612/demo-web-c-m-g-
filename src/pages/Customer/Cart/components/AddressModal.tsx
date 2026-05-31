import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

interface AddressModalProps {
  visible: boolean;
  currentUser: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  onOpenMap: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ visible, currentUser, onCancel, onSubmit, onOpenMap }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && currentUser) {
      form.setFieldsValue({
        phone: form.getFieldValue('phone') || currentUser.phone,
        name: form.getFieldValue('name') || currentUser.full_name || currentUser.name
      });
    }
  }, [visible, currentUser, form]);

  useEffect(() => {
    const handleMapAddress = (e: any) => {
      form.setFieldsValue({ address: e.detail });
    };
    window.addEventListener('map-address-selected', handleMapAddress);
    return () => window.removeEventListener('map-address-selected', handleMapAddress);
  }, [form]);

  return (
    <Modal 
      title="Thêm địa chỉ giao hàng" 
      visible={visible} 
      onCancel={() => { form.resetFields(); onCancel(); }} 
      onOk={() => form.submit()}
      okButtonProps={{ style: { background: '#BA1A21', backgroundImage: 'none', borderColor: '#BA1A21', borderRadius: '8px', color: 'white' } }}
      cancelButtonProps={{ style: { borderRadius: '8px' } }}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="name" label="Tên người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }, { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Tên chỉ chứa chữ cái (có thể 1 từ)' }]}>
          <Input placeholder="VD: Nam" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^(0[35789])[0-9]{8}$/, message: 'Số điện thoại không hợp lệ' }]}>
          <Input placeholder="VD: 0987654321" />
        </Form.Item>
        <Form.Item label="Địa chỉ cụ thể" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <Button type="dashed" onClick={onOpenMap} icon={<EnvironmentOutlined />} style={{ flex: 1, borderColor: '#1890ff', color: '#1890ff' }}>
              Chọn từ Google Maps
            </Button>
          </div>
          <Form.Item name="address" rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn địa chỉ' }]}>
            <Input.TextArea rows={3} placeholder="Hoặc điền thủ công địa chỉ nhận hàng..." />
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddressModal;
