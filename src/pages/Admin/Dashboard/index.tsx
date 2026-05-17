import React from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, List } from 'antd';
import { ArrowUpOutlined, ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import './style.less';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const { orders } = useModel('useOrderModel');
  const { menu } = useModel('useMenuModel');

  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const productSales: Record<string, number> = {};
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      if (!productSales[item.product.name]) productSales[item.product.name] = 0;
      productSales[item.product.name] += item.quantity;
    });
  });
  
  const topProducts = Object.keys(productSales).map(key => ({
    name: key,
    sold: productSales[key]
  })).sort((a, b) => b.sold - a.sold).slice(0, 5);
  
  const maxSold = topProducts.length > 0 ? topProducts[0].sold : 1;

  return (
    <div className="admin-dashboard">
      <Title level={2} className="dashboard-title">Tổng quan Kinh doanh</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng Doanh thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Đơn thành công"
              value={completedOrders.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Đơn bị hủy"
              value={cancelledOrders.length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Món ăn đang bán"
              value={menu.length}
              prefix={<ArrowUpOutlined />}
              suffix="món"
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 24 }}>
        <Card title="Top 5 Món Ăn Bán Chạy Nhất (Đơn hoàn thành)" className="stat-card">
          <List
            dataSource={topProducts}
            renderItem={item => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Typography.Text strong>{item.name}</Typography.Text>
                    <Typography.Text type="secondary">{item.sold} lượt bán</Typography.Text>
                  </div>
                  <Progress percent={Math.round((item.sold / maxSold) * 100)} showInfo={false} strokeColor="#fa8c16" />
                </div>
              </List.Item>
            )}
          />
          {topProducts.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>Chưa có dữ liệu bán hàng</p>}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
