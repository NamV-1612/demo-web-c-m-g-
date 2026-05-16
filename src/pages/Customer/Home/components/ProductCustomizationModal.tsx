import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Input, Button, Typography, Space } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Product, CartItem } from '@/services/typing';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Props {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const ProductCustomizationModal: React.FC<Props> = ({ product, visible, onClose, onAddToCart }) => {
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

  const toppingPrice = 5000; // Giả sử mỗi topping giá 5k
  const totalPrice = (product.price + selectedToppings.length * toppingPrice) * quantity;

  const handleAdd = () => {
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
        <Button key="add" type="primary" size="large" block style={{ background: '#fa8c16', borderColor: '#fa8c16' }} onClick={handleAdd}>
          Thêm vào giỏ - {totalPrice.toLocaleString()}đ
        </Button>,
      ]}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
      
      {product.toppings && product.toppings.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Tùy chọn thêm (5.000đ/món)</Text>
          <Checkbox.Group 
            options={product.toppings} 
            value={selectedToppings} 
            onChange={(values) => setSelectedToppings(values as string[])}
            style={{ display: 'flex', flexDirection: 'column', marginTop: 8, gap: 8 }}
          />
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Số lượng</Text>
        <Space>
          <Button shape="circle" icon={<MinusOutlined />} onClick={() => setQuantity(Math.max(1, quantity - 1))} />
          <Text strong style={{ fontSize: 18, width: 20, textAlign: 'center' }}>{quantity}</Text>
          <Button shape="circle" icon={<PlusOutlined />} onClick={() => setQuantity(quantity + 1)} />
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Ghi chú cho quán</Text>
        <TextArea 
          rows={3} 
          placeholder="VD: Không hành, nhiều cơm..." 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginTop: 8 }}
        />
      </div>
    </Modal>
  );
};

export default ProductCustomizationModal;
