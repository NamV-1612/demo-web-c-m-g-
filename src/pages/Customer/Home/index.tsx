import React, { useState } from 'react';
import { Row, Col, Input, Typography, Badge, Button, Space } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, FireOutlined } from '@ant-design/icons';
import ProductCard from './components/ProductCard';
import ProductCustomizationModal from './components/ProductCustomizationModal';
import { useModel, history } from 'umi';
import { Product } from '@/services/typing';
import './style.less';

const { Title, Text } = Typography;

const CATEGORIES = ['Tất cả', 'Cơm rang', 'Món ăn kèm', 'Đồ uống'];

const CustomerHome: React.FC = () => {
  const { products } = useModel('useMenuModel');
  const { cartItems, addToCart } = useModel('useCartModel');
  const { currentUser } = useModel('useAuthModel');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'Tất cả' || p.category === activeCategory;
    const matchAvailable = p.isAvailable !== false;
    return matchSearch && matchCategory && matchAvailable;
  });

  const cartTotalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="customer-home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Badge count={<FireOutlined style={{ color: '#BA1A21', fontSize: 28 }} />} offset={[15, 5]}>
            <Title className="hero-title">Thưởng Thức Tinh Hoa Cơm Rang</Title>
          </Badge>
          <Text className="hero-subtitle">Đặt trước liền tay, lấy ngay không đợi. Nóng hổi và giòn rụm từng hạt cơm!</Text>
          
          <div className="hero-search-wrapper">
            <Input 
              size="large" 
              placeholder="Hôm nay bạn muốn ăn gì? (VD: Cơm rang dưa bò...)" 
              prefix={<SearchOutlined style={{ color: '#BA1A21', fontSize: 20 }} />} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
          </div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section className="menu-container">
        <div className="category-filters">
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <Button 
                key={cat} 
                className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                shape="round"
                size="large"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </Space>
        </div>

        <div className="menu-header">
          <Title level={2}>
            Thực Đơn <span style={{ color: '#BA1A21' }}>Hôm Nay</span>
          </Title>
        </div>

        <Row gutter={[24, 32]}>
          {filteredProducts.map((product, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              {/* Thêm Badge giả lập Bán chạy cho 2 sản phẩm đầu */}
              <Badge.Ribbon text={index < 2 ? '🔥 Bán chạy' : ''} color={index < 2 ? 'volcano' : 'transparent'} style={{ display: index < 2 ? 'block' : 'none' }}>
                <div style={{ height: '100%' }}>
                  <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                </div>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </section>

      {selectedProduct && (
        <ProductCustomizationModal 
          product={selectedProduct} 
          visible={true} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={(item) => {
            addToCart(item);
            setSelectedProduct(null);
          }}
        />
      )}

      {currentUser && (currentUser.role?.toLowerCase() === 'customer' || currentUser.role?.toLowerCase() === 'admin') && cartTotalItems > 0 && (
        <div className="floating-cart" onClick={() => history.push('/customer/cart')}>
          <div className="cart-icon-wrapper">
            <Badge count={cartTotalItems} size="small" style={{ backgroundColor: '#FADB14', color: '#262626', fontWeight: 'bold', boxShadow: 'none' }}>
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
