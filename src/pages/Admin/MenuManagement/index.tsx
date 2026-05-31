import React, { useState } from 'react';
import { Table, Button, Space, Tag, Form, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import '../admin.less';
import ProductModal from './components/ProductModal';

const MenuManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useModel('useMenuModel');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ isAvailable: true });
    setSelectedFile(null);
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    const toppingsList = values.toppings 
      ? values.toppings.split(',').map((t: string) => t.trim()).filter(Boolean) 
      : [];

    const productData = {
      name: values.name,
      price: values.price,
      category: values.category,
      isAvailable: values.isAvailable !== false,
      toppings: toppingsList,
      description: values.description || '',
    };

    if (values.id) {
      await updateProduct(values.id, productData, selectedFile || undefined);
    } else {
      const newProduct = {
        ...productData,
        id: 'p' + Date.now(),
      };
      await addProduct(newProduct as any, selectedFile || undefined);
    }
    
    setIsModalVisible(false);
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const columns = [
    { 
      title: 'Hình ảnh', 
      dataIndex: 'image', 
      render: (url: string, record: any) => (
        <img 
          src={url || record.image || record.imageUrl || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'} 
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
    { title: 'Giá tiền', dataIndex: 'price', render: (price: number) => <Text strong>{price?.toLocaleString()}đ</Text>, sorter: (a: any, b: any) => a.price - b.price },
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
              setSelectedFile(null);
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
      
      <Table columns={columns} dataSource={products} rowKey={(record: any) => record.id || record._id} pagination={{ pageSize: 10 }} />

      <ProductModal 
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSave}
        form={form}
        setSelectedFile={setSelectedFile}
      />
    </div>
  );
};

// Simple inline Text helper since Typography is not imported
const Text = ({ children, strong, style }: any) => (
  <span style={{ fontWeight: strong ? 'bold' : 'normal', ...style }}>{children}</span>
);

export default MenuManagement;
