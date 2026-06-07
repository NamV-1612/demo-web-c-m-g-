import React, { useState, useMemo, useRef } from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, List, DatePicker, Empty, Tooltip, Alert, Table, Tag, Avatar, Rate } from 'antd';
import { ArrowUpOutlined, ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined, ClockCircleOutlined, FireOutlined, TagOutlined, BellOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
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

  // rating data
  const ratingData = useMemo(() => {
    let counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRatings = 0;
    let sumStars = 0;
    
    validOrders.forEach((o: any) => {
      if (o.rating && o.rating.stars) {
        counts[o.rating.stars as keyof typeof counts]++;
        totalRatings++;
        sumStars += o.rating.stars;
      }
    });
    
    const average = totalRatings > 0 ? (sumStars / totalRatings).toFixed(1) : 0;
    return { counts, totalRatings, average: parseFloat(average as string) };
  }, [validOrders]);

  // data cho tro ly kinh doanh
  const businessInsights = useMemo(() => {
    const insights = [];
    const totalOrders = filteredOrders.length;
    if (totalOrders === 0) {
      return [
        'ℹ️ Tổng quan: Chưa có dữ liệu đơn hàng trong thời gian này.',
        '⏳ Hiệu năng: Chưa có dữ liệu thời gian tiếp nhận đơn.',
        '💡 Bán chạy: Chưa có món ăn nào được bán ra.',
        '⭐ Hài lòng: Chưa có đánh giá nào từ khách hàng.'
      ];
    }

    const cancelRate = (cancelledOrders.length / totalOrders) * 100;
    
    // 1. Tổng quan tỉ lệ hủy
    if (cancelRate > 20) {
      insights.push(`🚨 Cảnh báo: Tỉ lệ hủy đơn rất cao (${cancelRate.toFixed(1)}%). Bạn cần xem xét lại quy trình!`);
    } else if (cancelRate > 10) {
      insights.push(`⚠️ Lưu ý: Tỉ lệ hủy đơn ở mức khá cao (${cancelRate.toFixed(1)}%). Hãy theo dõi thêm lý do khách hủy.`);
    } else {
      insights.push(`✅ Trạng thái: Tỉ lệ hủy đơn ở mức an toàn (${cancelRate.toFixed(1)}%). Dịch vụ đang hoạt động tốt.`);
    }

    // 2. Hiệu năng tiếp nhận đơn (auto huy)
    if (cancelledOrders.length > 0 && timeoutCancelledOrders.length > 0) {
      const timeoutRate = (timeoutCancelledOrders.length / cancelledOrders.length) * 100;
      if (timeoutRate > 30) {
        insights.push(`⚠️ Trễ đơn: Có tới ${timeoutRate.toFixed(1)}% đơn hủy là do quá 15 phút không tiếp nhận. Hãy nhắc nhở bếp!`);
      } else {
        insights.push(`⏳ Tốc độ: Tỉ lệ hủy do trễ hẹn là ${timeoutRate.toFixed(1)}%, bếp vẫn đang xử lý đơn ở tốc độ khá tốt.`);
      }
    } else {
      insights.push(`🚀 Tốc độ: Bếp đang tiếp nhận đơn cực kỳ nhanh, không có đơn nào bị hủy do quá thời gian chờ!`);
    }

    // 3. Doanh thu (Món bán chạy)
    if (validOrders.length > 0 && topProducts.length > 0) {
      const topSelling = topProducts[0]?.name;
      insights.push(`💡 Gợi ý: Món "${topSelling}" đang bán chạy nhất. Cân nhắc chuẩn bị thêm nguyên liệu nhé!`);
    } else {
      insights.push(`💡 Gợi ý: Các món ăn đang có doanh thu khá đồng đều, hãy cân nhắc chạy thêm mã khuyến mãi!`);
    }

    // 4. Danh gia
    if (ratingData.totalRatings > 0) {
      if (ratingData.average >= 4.5) {
        insights.push(`⭐ Xuất sắc: Điểm hài lòng trung bình đạt ${ratingData.average}/5 sao. Khách hàng đang rất yêu thích dịch vụ!`);
      } else if (ratingData.average < 3.5) {
        insights.push(`⚠️ Chất lượng: Điểm hài lòng đang thấp (${ratingData.average}/5 sao). Hãy rà soát lại chất lượng ngay!`);
      } else {
        insights.push(`📈 Tích cực: Điểm hài lòng ở mức khá (${ratingData.average}/5 sao). Hãy cố gắng để đạt mức xuất sắc nhé.`);
      }
    } else {
      insights.push(`⭐ Đánh giá: Hiện tại chưa có khách hàng nào để lại điểm đánh giá cho các đơn hàng hoàn thành.`);
    }

    return insights;
  }, [filteredOrders, cancelledOrders, validOrders, timeoutCancelledOrders, topProducts, ratingData]);

  // data cho sparklines
  const sparklineRevenueData = useMemo(() => {
    return {
      options: { chart: { type: 'area', sparkline: { enabled: true } }, stroke: { curve: 'smooth', width: 2 }, fill: { opacity: 0.3 }, colors: ['#fff'], tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } } },
      series: [{ data: validOrders.slice(-10).map((o: any) => o.totalAmount) }]
    };
  }, [validOrders]);

  const sparklineOrdersData = useMemo(() => {
    return {
      options: { chart: { type: 'area', sparkline: { enabled: true } }, stroke: { curve: 'smooth', width: 2 }, fill: { opacity: 0.3 }, colors: ['#fff'], tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } } },
      series: [{ data: validOrders.slice(-10).map((o: any, i: number) => i + 1) }]
    };
  }, [validOrders]);

  // data cho peak hours
  const hourlyChartData = useMemo(() => {
    const hours = Array.from({length: 24}, () => 0);
    validOrders.forEach((o: any) => {
      const h = moment(o.createdAt).hour();
      hours[h]++;
    });
    return {
      options: {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, horizontal: false } },
        dataLabels: { enabled: false },
        xaxis: { categories: Array.from({length: 24}, (_, i) => `${i}h`), title: { text: 'Khung giờ' } },
        yaxis: { title: { text: 'Số đơn hàng' } },
        colors: ['#D53E0F']
      },
      series: [{ name: 'Số đơn', data: hours }]
    };
  }, [validOrders]);

  // data cho promo performance
  const promoStats = useMemo(() => {
    const stats: any = {};
    validOrders.forEach((o: any) => {
      if (o.voucher) {
        if (!stats[o.voucher.code]) stats[o.voucher.code] = { count: 0, totalDiscount: 0 };
        stats[o.voucher.code].count++;
        stats[o.voucher.code].totalDiscount += o.voucher.discount;
      }
    });
    return Object.keys(stats).map(k => ({ code: k, ...stats[k] })).sort((a, b) => b.count - a.count);
  }, [validOrders]);

  // recent orders
  const recentOrders = useMemo(() => {
    return [...orders].sort((a: any, b: any) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()).slice(0, 5);
  }, [orders]);

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
               <Col xs={24} md={6} key={idx}>
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
            {sparklineRevenueData.series[0].data.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Chart options={sparklineRevenueData.options as any} series={sparklineRevenueData.series} type="area" height={40} />
              </div>
            )}
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
            {sparklineOrdersData.series[0].data.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Chart options={sparklineOrdersData.options as any} series={sparklineOrdersData.series} type="area" height={40} />
              </div>
            )}
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

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<><ClockCircleOutlined /> Khung Giờ Vàng</>} className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '24px' }}>
            <Chart options={hourlyChartData.options as any} series={hourlyChartData.series} type="bar" height={350} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><BellOutlined /> Đơn Hàng Mới Nhất</>} className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '0' }}>
            <List
              itemLayout="horizontal"
              dataSource={recentOrders}
              renderItem={(item: any) => (
                <List.Item style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: item.status === 'COMPLETED' ? '#52c41a' : item.status === 'CANCELLED' ? '#ff4d4f' : '#faad14' }} icon={<ShoppingCartOutlined />} />}
                    title={<span style={{ fontWeight: 'bold' }}>#{item.id.substring(0, 8).toUpperCase()} - {item.totalAmount.toLocaleString()}đ</span>}
                    description={<span style={{ fontSize: '12px' }}>{moment(item.createdAt).fromNow()} | <strong style={{ color: item.status === 'COMPLETED' ? '#52c41a' : item.status === 'CANCELLED' ? '#ff4d4f' : '#faad14' }}>{item.status}</strong></span>}
                  />
                </List.Item>
              )}
            />
            {recentOrders.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0' }}><Empty description="Chưa có đơn hàng" /></div>}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }} ref={cancelChartRef}>
        <Col xs={24} lg={8}>
          <Card title={<><TagOutlined /> Mã Khuyến Mãi</>} className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '0' }}>
            <Table
              dataSource={promoStats}
              pagination={false}
              rowKey="code"
              scroll={{ y: 260 }}
              columns={[
                { title: 'Voucher', dataIndex: 'code', key: 'code', render: (t) => <Tag color="#D53E0F" style={{ fontWeight: 'bold', fontSize: 13, padding: '2px 6px' }}>{t}</Tag> },
                { title: 'Dùng', dataIndex: 'count', key: 'count', render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
                { title: 'Giảm', dataIndex: 'totalDiscount', key: 'totalDiscount', render: (t) => <strong style={{ color: '#D53E0F', fontSize: 14 }}>-{t.toLocaleString()}đ</strong> }
              ]}
              locale={{ emptyText: <Empty description="Chưa có mã khuyến mãi nào được dùng" /> }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Tỉ lệ Hủy đơn" className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '24px 12px' }}>
            {cancelledOrders.length > 0 ? (
              <>
                <Chart 
                  options={{ ...cancelChartData.options, legend: { position: 'bottom', fontSize: '11px' } } as any} 
                  series={cancelChartData.series} 
                  type="pie" 
                  height={220} 
                />
                <div style={{ marginTop: 12, fontSize: '11px', color: '#8c8c8c', textAlign: 'center', fontStyle: 'italic' }}>
                  *<span style={{ color: '#D53E0F', fontWeight: 'bold' }}>Trễ đơn</span>: Tự động hủy do quá 15 phút.<br/>
                  *<span style={{ color: '#ffc107', fontWeight: 'bold' }}>Hủy chủ động</span>: Khách/Quán chủ động hủy.
                </div>
              </>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Không có đơn hủy" />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><StarOutlined /> Phân Bố Đánh Giá</>} className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: '24px 16px' }}>
            {ratingData.totalRatings > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                   <div style={{ fontSize: 42, fontWeight: 'bold', color: '#faad14', lineHeight: 1 }}>{ratingData.average}</div>
                   <Rate disabled value={ratingData.average} allowHalf style={{ fontSize: 16, color: '#faad14' }} />
                   <div style={{ marginTop: 4, color: '#8c8c8c' }}>{ratingData.totalRatings} lượt đánh giá</div>
                </div>
                <div style={{ width: '100%' }}>
                   {[5, 4, 3, 2, 1].map(star => {
                     const count = ratingData.counts[star as keyof typeof ratingData.counts];
                     const percent = ratingData.totalRatings > 0 ? (count / ratingData.totalRatings) * 100 : 0;
                     return (
                       <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                         <span style={{ width: 30, color: '#595959', fontWeight: 500, fontSize: 12 }}>{star} <StarFilled style={{color: '#faad14', fontSize: 10}}/></span>
                         <Progress percent={percent} showInfo={false} strokeColor={star >= 4 ? '#52c41a' : star === 3 ? '#faad14' : '#ff4d4f'} style={{ width: 'calc(100% - 60px)', margin: '0 8px' }} />
                         <span style={{ width: 20, textAlign: 'right', color: '#8c8c8c', fontSize: 12 }}>{count}</span>
                       </div>
                     )
                   })}
                </div>
              </div>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Chưa có đánh giá nào" />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
