import React from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select, Checkbox } from 'antd';
import { FormInstance } from 'antd/es/form';

interface PromoModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  form: FormInstance<any>;
}

const PromoModal: React.FC<PromoModalProps> = ({ visible, onCancel, onSave, form }) => {
  const discountType = Form.useWatch('discountType', form);
  const isUnlimited = Form.useWatch('isUnlimited', form);

  return (
    <Modal 
      title={form.getFieldValue('id') ? "Chỉnh sửa mã khuyến mãi" : "Thêm mã khuyến mãi mới"} 
      visible={visible} 
      onCancel={onCancel} 
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ style: { background: '#D53E0F', borderColor: '#D53E0F' } }}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="id" hidden><Input /></Form.Item>
        <Form.Item 
          name="code" 
          label="Mã Khuyến Mãi (Code)" 
          rules={[
            { required: true, message: 'Vui lòng nhập mã!' },
            { pattern: /^[A-Za-z0-9]+$/, message: 'Mã chỉ chứa chữ không dấu và số, không có khoảng trắng!' }
          ]}
        >
          <Input placeholder="VD: TET2024, GIAM20K" style={{ textTransform: 'uppercase' }} />
        </Form.Item>
        
        <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="PERCENT">Giảm theo %</Select.Option>
            <Select.Option value="AMOUNT">Giảm số tiền cố định</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item 
          name="discountValue" 
          label={discountType === 'PERCENT' ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)"} 
          rules={[{ required: true, message: 'Vui lòng nhập mức giảm!' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} 
            max={discountType === 'PERCENT' ? 100 : undefined}
          />
        </Form.Item>

        {discountType === 'PERCENT' && (
          <Form.Item name="maxDiscountAmount" label="Số tiền giảm tối đa (VNĐ) (Tùy chọn)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Không giới hạn nếu để trống" />
          </Form.Item>
        )}

        <Form.Item name="isUnlimited" valuePropName="checked" style={{ marginBottom: 8 }}>
          <Checkbox>Không giới hạn số lượng</Checkbox>
        </Form.Item>

        {!isUnlimited && (
          <Form.Item name="quantity" label="Số lượng mã" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        )}

        <Form.Item name="isActive" label="Trạng thái kích hoạt" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PromoModal;
