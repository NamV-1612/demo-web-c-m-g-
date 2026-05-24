import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Input, Button, Typography, Space } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Product, CartItem } from '@/services/typing';
import { useModel, history } from 'umi';
import './style.less';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Props {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const ProductCustomizationModal: React.FC<Props> = ({ product, visible, onClose, onAddToCart }) => {
  const { currentUser } = useModel('useAuthModel');
  const isGuest = !currentUser || (currentUser.role?.toLowerCase() !== 'customer' && currentUser.role?.toLowerCase() !== 'admin');

  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setSelectedToppings([]);
      setNote('');
    }
  }, [visible]);

  if (!product) return null;

  const toppingPrice = 5000;
  const totalPrice = (product.price + selectedToppings.length * toppingPrice) * quantity;

  const handleAdd = () => {
    if (isGuest) {
      history.push('/login');
      return;
    }
    const cartItem: CartItem = {
      cartItemId: Math.random().toString(36).substring(7),
      product,
      quantity,
      selectedToppings,
      note,
      totalPrice,
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>{product.name}</Title>}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="add" type="primary" size="large" block className="add-btn" onClick={handleAdd}>
          {isGuest ? 'Đăng nhập để đặt món' : `Thêm vào giỏ - ${totalPrice.toLocaleString()}đ`}
        </Button>,
      ]}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <img src={product.image || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="modal-image" />
      
      {product.toppings && product.toppings.length > 0 && (
        <div className="section-margin">
          <Text strong>Tùy chọn thêm (5.000đ/món)</Text>
          <Checkbox.Group 
            value={selectedToppings} 
            onChange={(values) => setSelectedToppings(values as string[])}
            className="topping-group"
            disabled={isGuest}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {(product.toppings?.filter(t => !((product as any).outOfStockToppings || []).includes(t)) || []).map(t => (
                <Checkbox key={t} value={t} style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t}</span>
                  <span style={{ color: '#BA1A21', float: 'right', marginLeft: 16 }}>+5.000đ</span>
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>
      )}

      <div className={`section-margin flex-between`}>
        <Text strong>Số lượng</Text>
        <Space>
          <Button shape="circle" icon={<MinusOutlined />} disabled={isGuest} onClick={() => setQuantity(Math.max(1, quantity - 1))} />
          <Text strong className="qty-text">{quantity}</Text>
          <Button shape="circle" icon={<PlusOutlined />} disabled={isGuest} onClick={() => setQuantity(quantity + 1)} />
        </Space>
      </div>

      <div className="section-margin">
        <Text strong>Ghi chú cho quán</Text>
        <TextArea 
          rows={3} 
          placeholder="VD: Không hành, nhiều cơm..." 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isGuest}
          style={{ marginTop: 8 }}
        />
      </div>
    </Modal>
  );
};

export default ProductCustomizationModal;
