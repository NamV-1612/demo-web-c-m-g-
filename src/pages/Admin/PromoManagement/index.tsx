import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Switch, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import '../admin.less';

const PromoManagement: React.FC = () => {
  const { promos, addPromo, updatePromo, deletePromo } = useModel('usePromoModel');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const discountType = Form.useWatch('discountType', form);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ isActive: true, discountType: 'PERCENT' });
    setIsModalVisible(true);
  };

  const handleSave = (values: any) => {
    const promoData = {
      code: values.code.toUpperCase(),
      discountType: values.discountType,
      discountValue: values.discountValue,
      maxDiscountAmount: values.discountType === 'PERCENT' ? values.maxDiscountAmount : undefined,
      quantity: values.quantity,
      isActive: values.isActive !== false,
    };

    if (values.id) {
      updatePromo(values.id, promoData);
      message.success('Đã cập nhật mã khuyến mãi thành công!');
    } else {
      // Check if code already exists
      const exists = promos.some(p => p.code.toUpperCase() === promoData.code && p.id !== values.id);
      if (exists) {
        message.error('Mã khuyến mãi này đã tồn tại!');
        return;
      }
      
      const newPromo = {
        ...promoData,
        id: 'promo' + Date.now(),
      };
      addPromo(newPromo as any);
      message.success('Đã thêm mã khuyến mãi mới thành công!');
    }
    
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    deletePromo(id);
    message.success('Đã xóa mã khuyến mãi!');
  };

  const columns = [
    { 
      title: 'Mã Khuyến Mãi', 
      dataIndex: 'code', 
      key: 'code', 
      render: (text: string) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>{text}</Tag>,
      sorter: (a: any, b: any) => a.code.localeCompare(b.code) 
    },
    { 
      title: 'Loại Giảm Giá', 
      dataIndex: 'discountType', 
      key: 'discountType',
      render: (type: string) => (
        <span>{type === 'PERCENT' ? 'Theo %' : 'Số tiền cố định'}</span>
      )
    },
    { 
      title: 'Mức Giảm', 
      key: 'discountValue',
      render: (_: any, record: any) => {
        if (record.discountType === 'PERCENT') {
          return <span>{record.discountValue}% {record.maxDiscountAmount ? `(Tối đa ${record.maxDiscountAmount.toLocaleString()}đ)` : ''}</span>;
        }
        return <span>{record.discountValue.toLocaleString()}đ</span>;
      }
    },
    { 
      title: 'Số lượng còn', 
      dataIndex: 'quantity', 
      render: (qty: number) => <span style={{ fontWeight: 'bold' }}>{qty}</span>, 
      sorter: (a: any, b: any) => a.quantity - b.quantity 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang hoạt động' : 'Đã tắt'}
        </Tag>
      ) 
    },
    {
      title: 'Hành động',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => { 
              form.setFieldsValue({ ...record }); 
              setIsModalVisible(true); 
            }} 
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 24 }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Quản lý Mã Khuyến Mãi</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#BA1A21', borderColor: '#BA1A21' }}>
          Thêm mã khuyến mãi
        </Button>
      </div>
      
      <Table columns={columns} dataSource={promos} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal 
        title={form.getFieldValue('id') ? "Chỉnh sửa mã khuyến mãi" : "Thêm mã khuyến mãi mới"} 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
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

          <Form.Item name="quantity" label="Số lượng mã" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromoManagement;
