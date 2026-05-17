import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { updateMenu } from '@/services/menu';
import '../admin.less';

const MenuManagement: React.FC = () => {
  const { menu, refreshMenu } = useModel('useMenuModel');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSave = (values: any) => {
    const newProduct = {
      id: values.id || 'p' + Date.now(),
      name: values.name,
      price: values.price,
      category: values.category,
      imageUrl: values.imageUrl,
      isAvailable: values.isAvailable,
      toppings: values.toppings ? values.toppings.split(',').map((t: string) => t.trim()) : [],
    };

    let newMenu = [...menu];
    if (values.id) {
      newMenu = newMenu.map(p => p.id === values.id ? newProduct : p);
    } else {
      newMenu.push(newProduct);
    }
    
    updateMenu(newMenu);
    refreshMenu();
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    const newMenu = menu.filter(p => p.id !== id);
    updateMenu(newMenu);
    refreshMenu();
  };

  const columns = [
    { title: 'Hình ảnh', dataIndex: 'imageUrl', render: (url: string) => <img src={url} className="img-preview" /> },
    { title: 'Tên món', dataIndex: 'name', key: 'name' },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
    { title: 'Giá tiền', dataIndex: 'price', render: (price: number) => <>{price.toLocaleString()}đ</> },
    { title: 'Trạng thái', dataIndex: 'isAvailable', render: (isAvail: boolean) => <Tag color={isAvail ? 'green' : 'red'}>{isAvail ? 'Đang bán' : 'Tạm ẩn'}</Tag> },
    {
      title: 'Hành động',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { form.setFieldsValue({ ...record, toppings: record.toppings.join(', ') }); setIsModalVisible(true); }} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="header-actions">
        <h2>Quản lý Thực đơn</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm món ăn</Button>
      </div>
      
      <Table columns={columns} dataSource={menu} rowKey="id" />

      <Modal title="Thêm/Sửa Món ăn" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="name" label="Tên món" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá tiền (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="imageUrl" label="Link hình ảnh"><Input /></Form.Item>
          <Form.Item name="toppings" label="Toppings (cách nhau dấu phẩy)"><Input placeholder="VD: Thêm trứng, Thêm xúc xích" /></Form.Item>
          <Form.Item name="isAvailable" label="Đang bán?" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
