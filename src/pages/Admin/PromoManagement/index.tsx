import React, { useState } from 'react';
import { Table, Button, Space, Tag, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import '../admin.less';
import PromoModal from './components/PromoModal';

const PromoManagement: React.FC = () => {
  const { promos, addPromo, updatePromo, deletePromo } = useModel('usePromoModel');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const discountType = Form.useWatch('discountType', form);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ isActive: true, discountType: 'PERCENT', isUnlimited: false });
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    const promoData = {
      code: values.code.toUpperCase(),
      discountType: values.discountType,
      discountValue: values.discountValue,
      maxDiscountAmount: values.discountType === 'PERCENT' ? values.maxDiscountAmount : undefined,
      quantity: values.isUnlimited ? 999999 : values.quantity,
      isActive: values.isActive !== false,
    };

    let success = false;
    if (values.id) {
      success = await updatePromo(values.id, promoData);
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
      success = await addPromo(newPromo as any);
    }
    
    if (success) {
      setIsModalVisible(false);
    }
  };

  const handleDelete = (id: string) => {
    deletePromo(id);
  };

  const columns = [
    { 
      title: 'Mã Khuyến Mãi', 
      dataIndex: 'code', 
      key: 'code', 
      align: 'center',
      render: (text: string) => <Tag style={{ fontWeight: 600, padding: '4px 12px', borderRadius: 8, fontSize: 13, border: '1px dashed #D53E0F', color: '#D53E0F', background: '#fff2e8' }}>{text}</Tag>,
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
      render: (qty: number) => {
        if (qty >= 900000) return <span style={{ fontWeight: 'bold', fontSize: 18, color: '#52c41a' }}>∞</span>;
        return <span style={{ fontWeight: 'bold' }}>{qty}</span>;
      }, 
      sorter: (a: any, b: any) => a.quantity - b.quantity 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      align: 'center',
      render: (isActive: boolean) => (
        <Tag style={{ 
          fontWeight: 600, padding: '2px 10px', borderRadius: 12, fontSize: 12, border: '1px solid',
          ...(isActive 
            ? { color: '#389e0d', background: '#f6ffed', borderColor: '#b7eb8f' }
            : { color: '#cf1322', background: '#fff1f0', borderColor: '#ffa39e' })
        }}>
          {isActive ? 'Đang hoạt động' : 'Đã tắt'}
        </Tag>
      ) 
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => { 
              form.setFieldsValue({ ...record, isUnlimited: record.quantity >= 900000 }); 
              setIsModalVisible(true); 
            }} 
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa mã khuyến mãi này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 24, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Quản lý Mã Khuyến Mãi</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#D53E0F', borderColor: '#D53E0F' }}>
          Thêm mã khuyến mãi
        </Button>
      </div>
      
      <Table columns={columns} dataSource={promos} rowKey="id" pagination={{ pageSize: 10 }} />

      <PromoModal 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        form={form}
      />
    </div>
  );
};

export default PromoManagement;
