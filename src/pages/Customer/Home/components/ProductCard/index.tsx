import React from 'react';
import { Card, Button, Tooltip, Typography } from 'antd';
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
      <div className="product-info" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <Typography.Paragraph 
          className="product-title" 
          ellipsis={{ rows: 2, tooltip: product.name }}
          style={{ fontSize: '18px', fontWeight: 'bold', color: '#262626', marginBottom: '8px', minHeight: '44px', lineHeight: '22px' }}
        >
          {product.name}
        </Typography.Paragraph>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', width: '100%' }}>
          <div className="product-price" style={{ color: '#D53E0F', fontWeight: 900, fontSize: '18px' }}>
            {product.price.toLocaleString()}đ
          </div>
          {!isGuest ? (
            <Button 
              shape="circle" 
              icon={<PlusOutlined />} 
              className="add-btn"
              style={{ width: 36, height: 36, minWidth: 36 }}
            />
          ) : (
            <Tooltip title="Đăng nhập để đặt món">
              <Button 
                shape="circle"
                icon={<LoginOutlined />}
                className="add-btn"
                style={{ width: 36, height: 36, minWidth: 36 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/login'; }}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
