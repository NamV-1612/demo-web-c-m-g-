import React from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';

interface ProductModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  form: FormInstance<any>;
  setSelectedFile: (file: File | null) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onCancel, onSave, form, setSelectedFile }) => {
  return (
    <Modal 
      title={form.getFieldValue('id') ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"} 
      visible={visible} 
      onCancel={onCancel} 
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ style: { background: '#D53E0F', borderColor: '#D53E0F' } }}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="id" hidden><Input /></Form.Item>
        <Form.Item name="name" label="Tên món" rules={[{ required: true, message: 'Vui lòng nhập tên món!' }]}><Input /></Form.Item>
        <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}><Input placeholder="VD: Cơm rang, Món ăn kèm, Đồ uống" /></Form.Item>
        <Form.Item name="price" label="Giá tiền (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá món!' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
        <Form.Item label="Hình ảnh">
          <Upload 
            beforeUpload={(file) => {
              setSelectedFile(file);
              return false; // chan auto upload
            }}
            maxCount={1}
            onRemove={() => setSelectedFile(null)}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh từ máy tính (Cloudinary)</Button>
          </Upload>
          {form.getFieldValue('id') && <div style={{marginTop: 8, fontSize: 12, color: 'gray'}}>Nếu không chọn ảnh mới, hệ thống sẽ giữ nguyên ảnh cũ.</div>}
        </Form.Item>
        <Form.Item name="toppings" label="Toppings (cách nhau bởi dấu phẩy)"><Input placeholder="VD: Thêm trứng, Thêm xúc xích, Thêm lạp xưởng" /></Form.Item>
        <Form.Item name="description" label="Mô tả"><Input.TextArea placeholder="Mô tả món ăn" /></Form.Item>
        <Form.Item name="isAvailable" label="Đang bán?" valuePropName="checked"><Switch /></Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductModal;
