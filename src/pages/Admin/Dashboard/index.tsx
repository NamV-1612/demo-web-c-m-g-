import React, { useState, useMemo, useRef } from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, List, DatePicker, Empty, Tooltip, Alert } from 'antd';
import { ArrowUpOutlined, ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import moment from 'moment';
import Chart from 'react-apexcharts';
import './style.less';

const { RangePicker } = DatePicker;

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const { orders } = useModel('useOrderModel');
  const { products } = useModel('useMenuModel');

  const [dateRange, setDateRange] = useState<any>(null);
  const cancelChartRef = useRef<HTMLDivElement>(null);

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

  // data bieu do doanh thu
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
        colors: ['#D53E0F'],
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (val: number) => val.toLocaleString() + 'đ' } }
      },
      series: [{ name: 'Doanh thu', data: sortedDates.map(d => data[d]) }]
    };
  }, [validOrders]);

  // data bieu do huy don
  const cancelChartData = useMemo(() => {
    let timeoutCount = 0;
    let manualCount = 0;

    cancelledOrders.forEach((o: any) => {
      const msg = (o.cancelMessage || '').toLowerCase();
      if (msg.includes('15 phút') || msg.includes('tự động')) {
        timeoutCount++;
      } else {
        manualCount++;
      }
    });

    return {
      options: {
        chart: { type: 'pie' },
        labels: ['Trễ đơn (Tự động)', 'Hủy chủ động (Khách/Quán)'],
        colors: ['#D53E0F', '#ffc107'],
        legend: { position: 'bottom' },
        dataLabels: {
          enabled: true,
          formatter: function (val: any, opts: any) {
            return opts.w.config.series[opts.seriesIndex] + " đơn";
          }
        }
      },
      series: [timeoutCount, manualCount]
    };
  }, [cancelledOrders]);

  // data cho tro ly kinh doanh
  const businessInsights = useMemo(() => {
    const insights = [];
    const totalOrders = filteredOrders.length;
    if (totalOrders === 0) return ['ℹ️ Thông tin: Chưa có dữ liệu đơn hàng trong thời gian này.'];

    const cancelRate = (cancelledOrders.length / totalOrders) * 100;
    
    // ti le huy
    if (cancelRate > 20) {
      insights.push(`🚨 Cảnh báo: Tỉ lệ hủy đơn đang rất cao (${cancelRate.toFixed(1)}%). Bạn cần xem xét lại quy trình phục vụ hoặc chất lượng món ăn.`);
    } else if (cancelRate > 10) {
      insights.push(`⚠️ Lưu ý: Tỉ lệ hủy đơn ở mức khá cao (${cancelRate.toFixed(1)}%). Hãy theo dõi thêm lý do khách hủy.`);
    } else if (cancelRate > 0) {
      insights.push(`✅ Trạng thái: Tỉ lệ hủy đơn ở mức an toàn (${cancelRate.toFixed(1)}%).`);
    } else {
      insights.push(`🌟 Tuyệt vời: Không có đơn hàng nào bị hủy trong thời gian này.`);
    }

    // auto huy
    if (cancelledOrders.length > 0) {
      const timeoutRate = (timeoutCancelledOrders.length / cancelledOrders.length) * 100;
      if (timeoutRate > 30) {
        insights.push(`⚠️ Chú ý: Có tới ${timeoutRate.toFixed(1)}% đơn hủy là do quá 15 phút quán không tiếp nhận. Hãy nhắc nhở nhân viên bếp xác nhận đơn nhanh hơn!`);
      }
    }

    // Doanh thu
    if (validOrders.length > 0) {
      const topSelling = topProducts[0]?.name;
      if (topSelling) {
        insights.push(`💡 Gợi ý: Món "${topSelling}" đang bán chạy nhất. Cân nhắc chuẩn bị thêm nguyên liệu cho món này nhé!`);
      }
    }

    return insights;
  }, [filteredOrders, cancelledOrders, validOrders, timeoutCancelledOrders, topProducts]);

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} className="dashboard-title" style={{ margin: 0, fontFamily: "'Dancing Script', cursive", color: '#000', fontSize: 36, fontWeight: 700 }}>Tổng quan Kinh doanh</Title>
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

      <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 12, backgroundColor: '#fff7e6', border: '1px solid #ffd591', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 20, marginRight: 8 }}>🤖</span>
          <strong style={{ fontSize: 16, color: '#d46b08' }}>Trợ lý Phân tích Kinh doanh</strong>
        </div>
        <Row gutter={[16, 16]}>
          {businessInsights.map((insight, idx) => {
             const match = insight.match(/^([^:]+:)(.*)$/);
             const title = match ? match[1] : '';
             const text = match ? match[2] : insight;

             return (
               <Col xs={24} md={8} key={idx}>
                 <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, border: '1px solid #ffe58f', height: '100%', fontSize: 13, color: '#595959', lineHeight: 1.6 }}>
                   {title && <strong style={{ display: 'block', marginBottom: 6, color: '#d46b08', fontSize: 14 }}>{title}</strong>}
                   {text}
                 </div>
               </Col>
             );
          })}
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={12} lg={6}>
          <Card 
            className="stat-card" 
            style={{ 
              borderRadius: 16, 
              background: '#5E0006',
              boxShadow: '0 10px 20px rgba(94, 0, 6, 0.35)', 
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.08, fontSize: '150px', color: '#fff', transform: 'rotate(-15deg)' }}>
              <DollarOutlined />
            </div>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng Doanh thu</span>}
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
              suffix={<span style={{ fontSize: '24px', marginLeft: 4 }}>đ</span>}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card 
            className="stat-card" 
            style={{ 
              borderRadius: 16, 
              background: '#D53E0F',
              boxShadow: '0 10px 20px rgba(213, 62, 15, 0.35)', 
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => history.push('/admin/orders')}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.15, fontSize: '150px', color: '#fff', transform: 'rotate(-15deg)' }}>
              <ShoppingCartOutlined />
            </div>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đơn hoàn thành</span>}
              value={validOrders.length}
              valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: '36px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Tooltip 
            title={
              <div style={{ fontFamily: "'Inter', 'Roboto', sans-serif", padding: '6px 4px', minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginRight: 16 }}>Tự động hủy (Quá 15p):</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6, color: '#fff', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' }}>{timeoutCancelledOrders.length} đơn</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginRight: 16 }}>Hủy thủ công:</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6, color: '#fff', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' }}>{cancelledOrders.length - timeoutCancelledOrders.length} đơn</span>
                </div>
              </div>
            }
            color="#D53E0F"
            overlayInnerStyle={{ borderRadius: 8, padding: '12px 16px', fontSize: '14px', boxShadow: '0 8px 24px rgba(213, 62, 15, 0.4)' }}
            placement="bottom"
          >
            <Card 
              className="stat-card" 
              onClick={() => cancelChartRef.current?.scrollIntoView({ behavior: 'smooth' })}
              style={{ 
                borderRadius: 16, 
                background: '#D53E0F',
                boxShadow: '0 10px 20px rgba(213, 62, 15, 0.35)', 
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
              background: '#EED9B9',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)', 
              border: '1px solid rgba(94, 0, 6, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => history.push('/admin/menu')}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.05, fontSize: '150px', color: '#5E0006', transform: 'rotate(-15deg)' }}>
              <ArrowUpOutlined />
            </div>
            <Statistic
              title={<span style={{ color: '#5E0006', fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Món ăn đang bán</span>}
              value={products.length}
              valueStyle={{ color: '#D53E0F', fontWeight: 900, fontSize: '36px' }}
              suffix={<span style={{ fontSize: '20px', marginLeft: 8, fontWeight: '600', color: '#5E0006' }}>món</span>}
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
                    <Progress percent={Math.round((item.sold / maxSold) * 100)} showInfo={false} strokeColor="#D53E0F" />
                  </div>
                </List.Item>
              )}
            />
            {topProducts.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0' }}><Empty description="Chưa có dữ liệu bán hàng" /></div>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }} ref={cancelChartRef}>
        <Col xs={24} lg={8}>
          <Card title="Tỉ lệ Hủy đơn" className="stat-card" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '24px' }}>
            {cancelledOrders.length > 0 ? (
              <>
                <Chart 
                  options={cancelChartData.options as any} 
                  series={cancelChartData.series} 
                  type="pie" 
                  height={300} 
                />
                <div style={{ marginTop: 16, fontSize: '12px', color: '#8c8c8c', textAlign: 'center', fontStyle: 'italic' }}>
                  *<span style={{ color: '#D53E0F', fontWeight: 'bold' }}>Trễ đơn</span>: Các đơn bị hệ thống tự động hủy do quán không tiếp nhận sau 15 phút.<br/>
                  *<span style={{ color: '#ffc107', fontWeight: 'bold' }}>Hủy chủ động</span>: Các đơn do khách hoặc quán chủ động hủy.
                </div>
              </>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Không có đơn hủy" />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
