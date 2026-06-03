import React, { useState } from 'react';
import { Drawer, Input, List, Typography, Switch, Space, Tag, message, Select } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface QuickInventoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  products: any[];
  updateProductAvailability: (id: string, isAvailable: boolean) => void;
  updateProduct: (id: string, updates: any) => void;
}

const QuickInventoryDrawer: React.FC<QuickInventoryDrawerProps> = ({
  visible,
  onClose,
  products,
  updateProductAvailability,
  updateProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [updateTick, setUpdateTick] = useState(0);

  // Lấy các danh mục duy nhất từ sản phẩm
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchCategory = true;
    if (categoryFilter === 'UNAVAILABLE') {
      matchCategory = p.isAvailable === false;
    } else if (categoryFilter !== 'ALL') {
      matchCategory = p.category === categoryFilter;
    }
    
    return matchSearch && matchCategory;
  });

  return (
    <Drawer 
      title="Quản lý Tổng kho cấp tốc" 
      placement="right" 
      onClose={onClose} 
      visible={visible} 
      width="50vw"
    >
      <div style={{ marginBottom: 16, display: 'flex', gap: '8px' }}>
        <Input 
          placeholder="Tìm kiếm món ăn theo tên..." 
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
          style={{ borderRadius: 8, flex: 1 }}
        />
        <Select 
          value={categoryFilter} 
          onChange={setCategoryFilter} 
          size="large" 
          style={{ width: 160, borderRadius: 8 }}
        >
          <Option value="ALL"><FilterOutlined /> Tất cả</Option>
          {categories.map((cat: any) => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
          <Option value="UNAVAILABLE">🔴 Đã tắt (Hết hàng)</Option>
        </Select>
      </div>
      <List
        dataSource={filteredProducts}
        renderItem={item => {
          const isUnavailable = item.isAvailable === false;
          return (
          <List.Item
            style={{ 
              display: 'block', 
              padding: '12px 8px', 
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: isUnavailable ? '#f5f5f5' : '#fff',
              opacity: isUnavailable ? 0.6 : 1,
              filter: isUnavailable ? 'grayscale(100%)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ fontSize: 14, textDecoration: isUnavailable ? 'line-through' : 'none' }}>{item.name}</Text>
                <div style={{ color: '#8c8c8c', fontSize: 12 }}>{item.price.toLocaleString()}đ</div>
              </div>
              <Switch 
                size="small"
                checked={!isUnavailable} 
                onChange={(checked) => updateProductAvailability(item.id, checked)} 
                checkedChildren="Còn" 
                unCheckedChildren="Hết"
              />
            </div>

            {/* Toppings stock toggler */}
            {item.toppings && item.toppings.length > 0 && (
              <div style={{ marginTop: 6, paddingLeft: 8, borderLeft: '2px solid #BA1A21' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Toppings:</Text>
                <Space wrap size={[4, 4]}>
                  {item.toppings.map((topping: string) => {
                    const isOutOfStock = (item.outOfStockToppings || []).includes(topping);
                    return (
                      <Tag 
                        key={topping}
                        color={isOutOfStock ? 'default' : 'orange'}
                        style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}
                        onClick={() => {
                          let newOutOfStock = [...(item.outOfStockToppings || [])];
                          if (isOutOfStock) {
                            newOutOfStock = newOutOfStock.filter((t: string) => t !== topping);
                          } else {
                            newOutOfStock.push(topping);
                          }
                          item.outOfStockToppings = newOutOfStock;
                          setUpdateTick(prev => prev + 1);

                          // Update topping availability
                          updateProduct(item.id, { outOfStockToppings: newOutOfStock } as any);
                          message.success(`Đã đổi trạng thái topping ${topping} thành: ${isOutOfStock ? 'Còn hàng' : 'Hết hàng'}`);
                        }}
                      >
                        {topping} {isOutOfStock ? '❌ Hết' : '✅ Còn'}
                      </Tag>
                    );
                  })}
                </Space>
              </div>
            )}
          </List.Item>
          );
        }}
      />
    </Drawer>
  );
};

export default QuickInventoryDrawer;
