import React from 'react';
import { Card, Button, Typography, Tag } from 'antd';
import { PlusOutlined, LoginOutlined } from '@ant-design/icons';
import { Product } from '@/services/typing';
import { useModel, history } from 'umi';
import './style.less';

const { Title, Text } = Typography;

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { currentUser } = useModel('useAuthModel');
  const isGuest = !currentUser || currentUser.role !== 'customer';

  const handleClick = () => {
    if (!product.isAvailable) return;
    onClick(product);
  };

  return (
    <Card
      hoverable
      className={`premium-card ${product.isAvailable ? 'available' : 'unavailable'}`}
      bodyStyle={{ padding: 12 }}
      cover={<img alt={product.name} src={product.imageUrl} />}
      onClick={handleClick}
    >
      <div className="card-body-flex">
        <div>
          <Title level={5} className="title">{product.name}</Title>
          <Text type="warning" strong>{product.price.toLocaleString()}đ</Text>
        </div>
        
        {product.isAvailable ? (
          !isGuest && (
            <Button className="bouncy-btn" type="primary" shape="circle" icon={<PlusOutlined />} />
          )
        ) : (
          <Tag color="error">Hết hàng</Tag>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
