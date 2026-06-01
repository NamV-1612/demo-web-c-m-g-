import React, { useState, useMemo, useRef } from 'react';
import { Row, Col, Input, Typography, Badge, Button, Space, Empty } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, FireOutlined } from '@ant-design/icons';
import ProductCard from './components/ProductCard';
import ProductCustomizationModal from './components/ProductCustomizationModal';
import { useModel, history } from 'umi';
import { navigateWithCartTransition } from '@/utils/transition';
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
  const [placeholderText, setPlaceholderText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any>(null);
  const hasScrolledRef = useRef(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (!val) {
      hasScrolledRef.current = false;
    }

    if (!hasScrolledRef.current && val && searchWrapperRef.current) {
      hasScrolledRef.current = true;
      const topbarHeight = 64;
      const padding = 24;

      const elementPosition = searchWrapperRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topbarHeight - padding;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(val);
      setIsSearching(false);
    }, 500);
  };


  React.useEffect(() => {
    window.scrollTo(0, 0);
    const transitionEl = document.getElementById('global-login-transition');
    if (transitionEl) {
      transitionEl.classList.add('exit');
      setTimeout(() => {
        transitionEl.remove();
        // cho ti roi hien popup chao
        setTimeout(() => setIsInitialLoading(false), 1500);
      }, 800);
    } else {
      // ko co hieu ung thi delay it thoi
      setTimeout(() => setIsInitialLoading(false), 800);
    }
  }, []);

  React.useEffect(() => {
    const phrases = [
      "Hôm nay bạn muốn ăn gì?...",
      "Thử tìm 'Cơm rang dưa bò'...",
      "Hay một phần 'Kim chi Hàn Quốc'...",
      "Tìm 'Trà tắc'..."
    ];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeout: any;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];

      if (isDeleting) {
        setPlaceholderText(currentPhrase.substring(0, currentCharIndex - 1));
        currentCharIndex--;
      } else {
        setPlaceholderText(currentPhrase.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      let typeSpeed = isDeleting ? 30 : 80;

      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typeSpeed = 500;
      }

      timeout = setTimeout(type, typeSpeed);
    };

    timeout = setTimeout(type, 500);

    return () => clearTimeout(timeout);
  }, []);

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
    
    if (activeCategory === 'Tất cả') {
      return b.price - a.price;
    }
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
          <Badge count={<FireOutlined style={{ color: '#D53E0F', fontSize: 36 }} />} offset={[35, 15]}>
            <Title className="hero-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1, marginBottom: 24 }}>
              <span style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', textShadow: '0 4px 10px rgba(0,0,0,0.5)', color: '#fff' }}>Thưởng Thức Tinh Hoa</span>
              <span className="art-title" style={{ fontSize: 'clamp(60px, 10vw, 100px)', color: '#D53E0F', marginTop: '-10px', textShadow: '0 6px 15px rgba(0,0,0,0.6)' }}>Doki Food</span>
            </Title>
          </Badge>
          <Text className="hero-subtitle">Gà giòn rụm, tim rung động! Take-away nóng hổi từng giây, giòn tan từng miếng!</Text>

          <div className="hero-search-wrapper" ref={searchWrapperRef}>
            <Input
              size="large"
              placeholder={placeholderText}
              prefix={<SearchOutlined style={{ color: '#D53E0F', fontSize: 20 }} />}
              onChange={handleSearchChange}
              className="hero-search-input"
            />
          </div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section className="menu-container" style={{ minHeight: '50vh', paddingBottom: '60px' }}>
        <div className="category-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div className="menu-header" style={{ textAlign: 'left', marginBottom: 0 }}>
            <Title level={2} className="art-title" style={{ margin: 0, lineHeight: 1, fontSize: '56px' }}>
              Thực Đơn <span style={{ color: '#D53E0F' }}>Hôm Nay</span>
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

        {isSearching || isInitialLoading ? (
          <div style={{ width: '100%', padding: '100px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <span className="typing-dots" style={{ fontSize: '60px' }}>
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
            {isInitialLoading && (
              <div style={{ color: '#D53E0F', fontWeight: 500, fontSize: '24px', marginTop: '16px', animation: 'fadeIn 0.5s' }}>
                Xin chào {currentUser?.full_name || currentUser?.name || 'bạn'}! Đợi Doki lên món nha...
              </div>
            )}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ width: '100%', padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: '#888', fontSize: '16px' }}>Ối giời ơi, đầu bếp nhà Doki chưa nghĩ ra món này rồi =(((</span>}
            />
          </div>
        ) : (
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
        )}
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

      {!isInitialLoading && currentUser && (currentUser.role?.toLowerCase() === 'customer' || currentUser.role?.toLowerCase() === 'admin') && cartTotalItems > 0 && (
        <div className="floating-cart" onClick={() => navigateWithCartTransition(history, '/customer/cart')}>
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
