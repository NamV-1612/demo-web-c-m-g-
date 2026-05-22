import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, List, DatePicker, Empty } from 'antd';
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

  const completedOrders = filteredOrders.filter((o: any) => o.status?.toUpperCase() === 'COMPLETED');
  const cancelledOrders = filteredOrders.filter((o: any) => o.status?.toUpperCase() === 'CANCELLED');
  const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const productSales: Record<string, number> = {};
  completedOrders.forEach((o: any) => {
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
    completedOrders.forEach((o: any) => {
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
  }, [completedOrders]);

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
        />
      </div>
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
              value={products.length}
              prefix={<ArrowUpOutlined />}
              suffix="món"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={16}>
          <Card title="Biểu đồ Doanh thu" className="stat-card" style={{ height: '100%' }}>
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
        <Col span={8}>
          <Card title="Top 5 Món Ăn Bán Chạy Nhất" className="stat-card" style={{ height: '100%' }}>
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
