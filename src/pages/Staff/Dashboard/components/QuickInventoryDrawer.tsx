import React, { useState } from 'react';
import { Drawer, Input, List, Typography, Switch, Space, Tag, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

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
  const [updateTick, setUpdateTick] = useState(0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Drawer 
      title="Quản lý Tồn kho cấp tốc" 
      placement="right" 
      onClose={onClose} 
      visible={visible} 
      width="50vw"
    >
      <div style={{ marginBottom: 16 }}>
        <Input 
          placeholder="Tìm kiếm món ăn theo tên hoặc danh mục..." 
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
          style={{ borderRadius: 8 }}
        />
      </div>
      <List
        dataSource={filteredProducts}
        renderItem={item => (
          <List.Item
            style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ fontSize: 14 }}>{item.name}</Text>
                <div style={{ color: '#8c8c8c', fontSize: 12 }}>{item.price.toLocaleString()}đ</div>
              </div>
              <Switch 
                size="small"
                checked={item.isAvailable !== false} 
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
                          // Optimistic UI Update
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
        )}
      />
    </Drawer>
  );
};

export default QuickInventoryDrawer;
