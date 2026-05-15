import React from 'react';
import { Card, Button, Typography, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Product } from '@/services/typing';

const { Title, Text } = Typography;

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <Card
      hoverable
      className="premium-card"
      style={{
        marginBottom: 16,
        opacity: product.isAvailable ? 1 : 0.6,
        filter: product.isAvailable ? 'none' : 'grayscale(100%)',
      }}
      bodyStyle={{ padding: 12 }}
      cover={<img alt={product.name} src={product.imageUrl} style={{ height: 160, objectFit: 'cover' }} />}
      onClick={() => product.isAvailable && onClick(product)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>{product.name}</Title>
          <Text type="warning" strong>{product.price.toLocaleString()}đ</Text>
        </div>
        {product.isAvailable ? (
          <Button className="bouncy-btn" type="primary" shape="circle" icon={<PlusOutlined />} style={{ background: '#fa8c16', borderColor: '#fa8c16', boxShadow: '0 2px 8px rgba(250,140,22,0.4)' }} />
        ) : (
          <Tag color="error">Hết hàng</Tag>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
