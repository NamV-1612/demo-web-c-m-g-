import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import '../admin.less';

const MenuManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useModel('useMenuModel');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ isAvailable: true });
    setIsModalVisible(true);
  };

  const handleSave = (values: any) => {
    const toppingsList = values.toppings 
      ? values.toppings.split(',').map((t: string) => t.trim()).filter(Boolean) 
      : [];

    const productData = {
      name: values.name,
      price: values.price,
      category: values.category,
      imageUrl: values.imageUrl || '',
      image: values.imageUrl || '', // maintain both fields for compatibility
      isAvailable: values.isAvailable !== false,
      toppings: toppingsList,
    };

    if (values.id) {
      updateProduct(values.id, productData);
      message.success('Đã cập nhật món ăn thành công!');
    } else {
      const newProduct = {
        ...productData,
        id: 'p' + Date.now(),
      };
      addProduct(newProduct as any);
      message.success('Đã thêm món ăn mới thành công!');
    }
    
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    message.success('Đã xóa món ăn!');
  };

  const columns = [
    { 
      title: 'Hình ảnh', 
      dataIndex: 'imageUrl', 
      render: (url: string, record: any) => (
        <img 
          src={url || record.image || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'} 
          className="img-preview" 
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      ) 
    },
    { title: 'Tên món', dataIndex: 'name', key: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', filters: [
      { text: 'Cơm rang', value: 'Cơm rang' },
      { text: 'Món ăn kèm', value: 'Món ăn kèm' },
      { text: 'Đồ uống', value: 'Đồ uống' },
    ], onFilter: (value: any, record: any) => record.category === value },
    { title: 'Giá tiền', dataIndex: 'price', render: (price: number) => <Text strong>{price.toLocaleString()}đ</Text>, sorter: (a: any, b: any) => a.price - b.price },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isAvailable', 
      render: (isAvail: boolean) => (
        <Tag color={isAvail !== false ? 'green' : 'red'}>
          {isAvail !== false ? 'Đang bán' : 'Tạm ẩn'}
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
              form.setFieldsValue({ 
                ...record, 
                toppings: record.toppings ? record.toppings.join(', ') : '' 
              }); 
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
        <h2 style={{ margin: 0 }}>Quản lý Thực đơn</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#BA1A21', borderColor: '#BA1A21' }}>
          Thêm món ăn
        </Button>
      </div>
      
      <Table columns={columns} dataSource={products} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal 
        title={form.getFieldValue('id') ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"} 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="name" label="Tên món" rules={[{ required: true, message: 'Vui lòng nhập tên món!' }]}><Input /></Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}><Input placeholder="VD: Cơm rang, Món ăn kèm, Đồ uống" /></Form.Item>
          <Form.Item name="price" label="Giá tiền (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá món!' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="imageUrl" label="Link hình ảnh"><Input placeholder="https://..." /></Form.Item>
          <Form.Item name="toppings" label="Toppings (cách nhau bởi dấu phẩy)"><Input placeholder="VD: Thêm trứng, Thêm xúc xích, Thêm lạp xưởng" /></Form.Item>
          <Form.Item name="isAvailable" label="Đang bán?" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Simple inline Text helper since Typography is not imported
const Text = ({ children, strong, style }: any) => (
  <span style={{ fontWeight: strong ? 'bold' : 'normal', ...style }}>{children}</span>
);

export default MenuManagement;
