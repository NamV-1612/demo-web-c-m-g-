import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, List, DatePicker, Empty, Tooltip } from 'antd';
import { ArrowUpOutlined, ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import Chart from 'react-apexcharts';
import './style.less';

const { RangePicker } = DatePicker;

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const { orders } = useModel('useOrderModel');
  const { products } = useModel('useMenuModel');

  const [dateRange, setDateRange] = useState<any>(null);

  const filteredOrders = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return orders;
    const [start, end] = dateRange;
    return orders.filter((o: any) => {
      const orderDate = moment(o.createdAt);
      return orderDate.isSameOrAfter(start, 'day') && orderDate.isSameOrBefore(end, 'day');
    });
  }, [orders, dateRange]);

  const validOrders = filteredOrders.filter((o: any) => o.status?.toUpperCase() === 'COMPLETED');
  const cancelledOrders = filteredOrders.filter((o: any) => o.status?.toUpperCase() === 'CANCELLED');
  const timeoutCancelledOrders = filteredOrders.filter((o: any) => o.status?.toUpperCase() === 'CANCELLED' && o.cancelMessage?.includes('quá 15 phút'));
  
  const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const productSales: Record<string, number> = {};
  validOrders.forEach((o: any) => {
    o.items.forEach((item: any) => {
      if (!productSales[item.product.name]) productSales[item.product.name] = 0;
      productSales[item.product.name] += item.quantity;
    });
  });
  
  const topProducts = Object.keys(productSales).map(key => ({
    name: key,
    sold: productSales[key]
  })).sort((a, b) => b.sold - a.sold).slice(0, 5);
  
  const maxSold = topProducts.length > 0 ? topProducts[0].sold : 1;

  // Revenue Chart Data
  const revenueChartData = useMemo(() => {
    const data: Record<string, number> = {};
    validOrders.forEach((o: any) => {
      const dateStr = moment(o.createdAt).format('DD/MM');
      if (!data[dateStr]) data[dateStr] = 0;
      data[dateStr] += o.totalAmount;
    });
    
    const sortedDates = Object.keys(data).sort((a, b) => moment(a, 'DD/MM').valueOf() - moment(b, 'DD/MM').valueOf());
    
    return {
      options: {
        chart: { type: 'area', toolbar: { show: false } },
        xaxis: { categories: sortedDates },
        colors: ['#BA1A21'],
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (val: number) => val.toLocaleString() + 'đ' } }
      },
      series: [{ name: 'Doanh thu', data: sortedDates.map(d => data[d]) }]
    };
  }, [validOrders]);

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} className="dashboard-title" style={{ margin: 0 }}>Tổng quan Kinh doanh</Title>
        <RangePicker 
          format="DD/MM/YYYY" 
          value={dateRange} 
          onChange={(dates) => setDateRange(dates)} 
          placeholder={['Từ ngày', 'Đến ngày']}
          size="large"
          style={{ borderRadius: 8 }}
          popupClassName="premium-date-picker"
        />
      </div>
      <Row gutter={[24, 24]}>
        <Col xs={12} lg={6}>
          <Card 
            className="stat-card" 
            style={{ 
              borderRadius: 16, 
              background: 'linear-gradient(135deg, #73d13d 0%, #389e0d 100%)',
              boxShadow: '0 10px 20px rgba(82, 196, 26, 0.25)', 
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.15, fontSize: '150px', color: '#fff', transform: 'rotate(-15deg)' }}>
              <DollarOutlined />
            </div>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng Doanh thu</span>}
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
              suffix={<span style={{ fontSize: '24px', marginLeft: 4 }}>đ</span>}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card 
            className="stat-card" 
            style={{ 
              borderRadius: 16, 
              background: 'linear-gradient(135deg, #40a9ff 0%, #096dd9 100%)',
              boxShadow: '0 10px 20px rgba(24, 144, 255, 0.25)', 
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.15, fontSize: '150px', color: '#fff', transform: 'rotate(-15deg)' }}>
              <ShoppingCartOutlined />
            </div>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đơn hợp lệ</span>}
              value={validOrders.length}
              valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Tooltip 
            title={
              <div style={{ fontFamily: "'Inter', 'Roboto', sans-serif", padding: '6px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginRight: 16 }}>Tự động hủy (Quá 15p):</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6, color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{timeoutCancelledOrders.length} đơn</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginRight: 16 }}>Hủy thủ công:</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6, color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{cancelledOrders.length - timeoutCancelledOrders.length} đơn</span>
                </div>
              </div>
            }
            color="#a8071a"
            overlayInnerStyle={{ borderRadius: 8, padding: '12px 16px', fontSize: '14px', boxShadow: '0 8px 24px rgba(207, 19, 34, 0.4)' }}
            placement="bottom"
          >
            <Card 
              className="stat-card" 
              style={{ 
                borderRadius: 16, 
                background: 'linear-gradient(135deg, #ff4d4f 0%, #a8071a 100%)',
                boxShadow: '0 10px 20px rgba(207, 19, 34, 0.25)', 
                cursor: 'pointer',
                border: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', right: '-15%', top: '-20%', opacity: 0.15, fontSize: '150px', color: '#fff', transform: 'rotate(-15deg)' }}>
                <CloseCircleOutlined />
              </div>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng Đơn Hủy</span>}
                value={cancelledOrders.length}
                valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
              />
            </Card>
          </Tooltip>
        </Col>
        <Col xs={12} lg={6}>
          <Card 
            className="stat-card" 
            style={{ 
              borderRadius: 16, 
              background: 'linear-gradient(135deg, #b37feb 0%, #531dab 100%)',
              boxShadow: '0 10px 20px rgba(114, 46, 209, 0.25)', 
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.15, fontSize: '150px', color: '#fff', transform: 'rotate(-15deg)' }}>
              <ArrowUpOutlined />
            </div>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Món ăn đang bán</span>}
              value={products.length}
              valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
              suffix={<span style={{ fontSize: '20px', marginLeft: 8, fontWeight: 'normal' }}>món</span>}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ Doanh thu" className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '24px' }}>
            {revenueChartData.series[0].data.length > 0 ? (
              <Chart 
                options={revenueChartData.options as any} 
                series={revenueChartData.series} 
                type="area" 
                height={350} 
              />
            ) : (
              <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Không có dữ liệu doanh thu trong khoảng thời gian này" />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top 5 Món Ăn Bán Chạy Nhất" className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '24px' }}>
            <List
              dataSource={topProducts}
              renderItem={item => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Typography.Text strong>{item.name}</Typography.Text>
                      <Typography.Text style={{ color: '#595959' }}>{item.sold} lượt bán</Typography.Text>
                    </div>
                    <Progress percent={Math.round((item.sold / maxSold) * 100)} showInfo={false} strokeColor="#BA1A21" />
                  </div>
                </List.Item>
              )}
            />
            {topProducts.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0' }}><Empty description="Chưa có dữ liệu bán hàng" /></div>}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
