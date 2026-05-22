import React from 'react';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Product } from '@/services/typing';
import { useModel } from 'umi';
import './style.less';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { currentUser } = useModel('useAuthModel');
  const isGuest = !currentUser || (currentUser.role?.toLowerCase() !== 'customer' && currentUser.role?.toLowerCase() !== 'admin');

  const handleClick = () => {
    if (!product.isAvailable) return;
    onClick(product);
  };

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <img 
          alt={product.name} 
          src={product.image || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'} 
          style={{ filter: isGuest ? 'grayscale(30%)' : 'none' }}
        />
      }
      onClick={handleClick}
    >
      <div className="product-info">
        <span className="product-title">{product.name}</span>
        <span className="product-price">{product.price.toLocaleString()}đ</span>
      </div>
      {!isGuest ? (
        <Button 
          shape="circle" 
          icon={<PlusOutlined />} 
          className="add-btn"
          size="large"
        />
      ) : (
        <Button 
          type="primary"
          className="login-to-order-btn"
          onClick={(e) => { e.stopPropagation(); window.location.href = '/login'; }}
        >
          Đăng nhập để đặt món
        </Button>
      )}
    </Card>
  );
};

export default ProductCard;
