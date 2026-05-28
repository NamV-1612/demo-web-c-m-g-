import React, { useState, useMemo } from 'react';
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
  const { orders } = useModel('useOrderModel');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const topProductNames = useMemo(() => {
    const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED');
    const sales: Record<string, number> = {};
    completedOrders.forEach((o: any) => {
      o.items.forEach((item: any) => {
        const pName = item.product?.name || item.name;
        if (!sales[pName]) sales[pName] = 0;
        sales[pName] += item.quantity;
      });
    });
    
    return Object.keys(sales).sort((a, b) => sales[b] - sales[a]).slice(0, 2);
  }, [orders]);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'Tất cả' || p.category === activeCategory;
    const matchAvailable = p.isAvailable !== false;
    return matchSearch && matchCategory && matchAvailable;
  }).sort((a, b) => {
    const isATop = topProductNames.includes(a.name);
    const isBTop = topProductNames.includes(b.name);
    if (isATop && !isBTop) return -1;
    if (!isATop && isBTop) return 1;
    return 0;
  });

  const cartTotalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="customer-home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <Badge count={<FireOutlined style={{ color: '#BA1A21', fontSize: 36 }} />} offset={[35, 15]}>
            <Title className="hero-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1, marginBottom: 24 }}>
              <span style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', textShadow: '0 4px 10px rgba(0,0,0,0.5)', color: '#fff' }}>Thưởng Thức Tinh Hoa</span>
              <span className="art-title" style={{ fontSize: 'clamp(60px, 10vw, 100px)', color: '#BA1A21', marginTop: '-10px', textShadow: '0 6px 15px rgba(0,0,0,0.6)' }}>Chicken Doki</span>
            </Title>
          </Badge>
          <Text className="hero-subtitle">Gà giòn rụm, tim rung động! Take-away nóng hổi từng giây, giòn tan từng miếng!</Text>
          
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
        <div className="category-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div className="menu-header" style={{ textAlign: 'left', marginBottom: 0 }}>
            <Title level={2} className="art-title" style={{ margin: 0, lineHeight: 1, fontSize: '56px' }}>
              Thực Đơn <span style={{ color: '#BA1A21' }}>Hôm Nay</span>
            </Title>
          </div>

          <Space size="middle" wrap style={{ justifyContent: 'flex-end' }}>
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

        <Row gutter={[24, 32]}>
          {filteredProducts.map((product, index) => {
            const isTopSelling = topProductNames.includes(product.name);
            return (
              <Col 
                xs={24} sm={12} md={8} lg={6} 
                key={`${product.id}-${activeCategory}-${searchTerm}`}
                className="fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Badge.Ribbon text={isTopSelling ? '🔥 Bán chạy' : ''} color={isTopSelling ? 'volcano' : 'transparent'} style={{ display: isTopSelling ? 'block' : 'none', zIndex: 10 }}>
                  <div style={{ height: '100%' }} className={isTopSelling ? 'premium-fire-wrapper' : ''}>
                    <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                  </div>
                </Badge.Ribbon>
              </Col>
            );
          })}
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
