import React from 'react';
import { Card, Typography, Tag, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface CartItemProps {
  item: any;
  onUpdateQuantity: (cartItemId: string, change: number) => void;
  onRemove: (cartItemId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <Card className="cart-item-card" bordered={false}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <img 
          src={item.product?.image || item.product?.imageUrl || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=150&q=80'} 
          alt={item.product?.name || 'Food'}
          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
        />
        <div style={{ flex: 1 }}>
          <Text strong className="item-name" style={{ fontSize: 16 }}>{item.product.name}</Text>
          
          <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 12 }}>
            <Button 
              size="small" 
              shape="circle" 
              onClick={() => onUpdateQuantity(item.cartItemId, -1)} 
              disabled={item.quantity <= 1}
            >-</Button>
            <Text strong style={{ fontSize: '15px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</Text>
            <Button 
              size="small" 
              shape="circle" 
              onClick={() => onUpdateQuantity(item.cartItemId, 1)}
            >+</Button>
          </div>
          <div style={{ margin: '8px 0' }}>
            {(item.selectedToppings || []).map((t: string) => <Tag key={t} color="orange" style={{ borderRadius: 12 }}>{t}</Tag>)}
          </div>
          {item.note && <div className="item-note" style={{ fontSize: 13, color: '#BA1A21', fontStyle: 'italic' }}>* Ghi chú: {item.note}</div>}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }}>
          <div className="item-price" style={{ fontSize: 16, fontWeight: 'bold', color: '#BA1A21' }}>{item.totalPrice.toLocaleString()}đ</div>
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onRemove(item.cartItemId)} style={{ marginTop: 'auto' }}>
            Xóa
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
