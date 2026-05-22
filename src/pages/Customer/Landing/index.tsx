import React from 'react';
import { Button, Typography } from 'antd';
import { ShoppingOutlined, UserAddOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import './style.less';

const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const { currentUser } = useModel('useAuthModel');

  return (
    <div className="landing-container">
      <div className="content-wrapper">
        <Title className="hero-title">Cơm Rang 1307</Title>
        <Paragraph className="hero-subtitle">
          Hương vị đặc trưng, cơm giòn rụm, topping ngập tràn. <br />
          Đặt món trực tuyến - Tiết kiệm thời gian, không lo chờ đợi!
        </Paragraph>
        
        <div className="action-buttons">
          <Button 
            type="primary" 
            className="btn-primary" 
            icon={<ShoppingOutlined />}
            onClick={() => history.push('/menu')}
          >
            Khám Phá Thực Đơn
          </Button>

          {!currentUser && (
            <Button 
              className="btn-secondary" 
              icon={<UserAddOutlined />}
              onClick={() => history.push('/login')}
            >
              Đăng Ký / Đăng Nhập
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
