import React, { useState } from 'react';
import { Row, Col, Input, Typography, Carousel, Badge } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import ProductCard from './components/ProductCard';
import ProductCustomizationModal from './components/ProductCustomizationModal';
import { useModel, history } from 'umi';
import { Product } from '@/services/typing';
import './style.less';

const { Title } = Typography;

const CustomerHome: React.FC = () => {
  const { products } = useModel('useMenuModel');
  const { cartItems } = useModel('useCartModel');
  const { currentUser } = useModel('useAuthModel');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const cartTotalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="customer-home-page">
      <Carousel autoplay className="promo-carousel">
        <div>
          <div className="carousel-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
            <div className="slide-content">
              <h3>Khuyến Mãi Tháng 10</h3>
              <p>Giảm giá 20% cho tất cả các suất Cơm Rang Hải Sản</p>
            </div>
          </div>
        </div>
        <div>
          <div className="carousel-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
            <div className="slide-content">
              <h3>Cơm Rang 1307</h3>
              <p>Thơm ngon giòn rụm - Đặt trước lấy liền không cần chờ đợi!</p>
            </div>
          </div>
        </div>
      </Carousel>

      <div className="menu-container">
        <div className="search-bar-wrapper">
          <Input 
            size="large" 
            placeholder="Tìm kiếm món ăn (VD: cơm rang dưa bò...)" 
            prefix={<SearchOutlined />} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <Title level={3} className="menu-title">Khám Phá Thực Đơn</Title>
        <Row gutter={[24, 24]}>
          {filteredProducts.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
            </Col>
          ))}
        </Row>
      </div>

      {selectedProduct && (
        <ProductCustomizationModal 
          product={selectedProduct} 
          visible={true} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={() => setSelectedProduct(null)}
        />
      )}

      {currentUser && currentUser.role === 'customer' && cartTotalItems > 0 && (
        <div className="floating-cart" onClick={() => history.push('/customer/cart')}>
          <div className="cart-icon-wrapper">
            <Badge count={cartTotalItems} size="small">
              <ShoppingCartOutlined style={{ fontSize: 24, color: '#fff' }} />
            </Badge>
          </div>
          <div className="cart-total-text">
            <span>Giỏ hàng</span>
            <strong>{cartTotalAmount.toLocaleString()}đ</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHome;
