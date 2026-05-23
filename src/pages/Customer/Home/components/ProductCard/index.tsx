import React from 'react';
import { Card, Button, Tooltip } from 'antd';
import { PlusOutlined, LoginOutlined } from '@ant-design/icons';
import { Product } from '@/services/typing';
import { useModel } from 'umi';
import './style.less';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, className }) => {
  const { currentUser } = useModel('useAuthModel');
  const isGuest = !currentUser || (currentUser.role?.toLowerCase() !== 'customer' && currentUser.role?.toLowerCase() !== 'admin');

  const handleClick = () => {
    if (!product.isAvailable) return;
    onClick(product);
  };

  return (
    <Card
      hoverable
      className={`product-card ${className || ''}`}
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
        <Tooltip title="Đăng nhập để đặt món">
          <Button 
            shape="circle"
            icon={<LoginOutlined />}
            className="add-btn"
            size="large"
            onClick={(e) => { e.stopPropagation(); window.location.href = '/login'; }}
          />
        </Tooltip>
      )}
    </Card>
  );
};

export default ProductCard;
