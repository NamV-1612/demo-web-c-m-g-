import React, { useState, useMemo } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, DatePicker, Modal, Radio, Input, Typography } from 'antd';
import { DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import '../admin.less';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const OrderManagement: React.FC = () => {
  const { orders, changeOrderStatus } = useModel('useOrderModel');
  const [dateRange, setDateRange] = useState<any>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('Khách hàng đổi ý');
  const [otherReason, setOtherReason] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const statusTextMap: any = { 
    PENDING: 'Chờ xác nhận', 
    PREPARING: 'Đang chế biến', 
    READY: 'Đã sẵn sàng', 
    COMPLETED: 'Hoàn thành', 
    CANCELLED: 'Đã hủy' 
  };

  const filteredOrders = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return orders;
    const [start, end] = dateRange;
    return orders.filter((o: any) => {
      const orderDate = moment(o.createdAt);
      return orderDate.isSameOrAfter(start, 'day') && orderDate.isSameOrBefore(end, 'day');
    });
  }, [orders, dateRange]);

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Mã đơn,Ngày tạo,Khách hàng,SĐT,Tổng tiền,Trạng thái\n";
    
    filteredOrders.forEach(o => {
      const date = moment(o.createdAt).format('DD/MM/YYYY HH:mm');
      const statusLabel = statusTextMap[o.status?.toUpperCase()] || o.status;
      const row = `${o.id},${date},"${o.customerName}","${o.customerPhone}",${o.totalAmount},"${statusLabel}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_don_hang_${moment().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất file báo cáo CSV thành công!');
  };

  const handleEmergencyCancel = (id: string, reason: string) => {
    changeOrderStatus(id, 'CANCELLED', reason);
    message.success(`Đã hủy khẩn cấp đơn hàng ${id}`);
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (val: string) => <strong>{val}</strong> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (val: number) => moment(val).format('DD/MM/YYYY HH:mm'), sorter: (a: any, b: any) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf() },
    { title: 'Hẹn lấy', dataIndex: 'pickupTime', render: (val: string) => val === 'asap' ? 'Lấy ngay' : (val || 'Không có') },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone' },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      render: (val: number) => <span className="amount-highlight" style={{ fontWeight: 'bold', color: '#f5222d' }}>{val.toLocaleString()}đ</span>,
      sorter: (a: any, b: any) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Phân loại',
      dataIndex: 'note',
      align: 'center',
      render: (note: string) => {
        if (note?.includes('Khách tự đến lấy')) {
          return <Tag style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 12, fontSize: 12, border: '1px solid', color: '#d4380d', background: '#fff2e8', borderColor: '#ffbb96' }}>🏪 Nhận tại quán</Tag>;
        }
        return <Tag style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 12, fontSize: 12, border: '1px solid', color: '#1d39c4', background: '#f0f5ff', borderColor: '#adc6ff' }}>🛵 Giao hàng</Tag>;
      },
      filters: [
        { text: 'Nhận tại quán', value: 'pickup' },
        { text: 'Giao hàng', value: 'delivery' },
      ],
      onFilter: (value: any, record: any) => {
        const isPickup = record.note?.includes('Khách tự đến lấy');
        return value === 'pickup' ? isPickup : !isPickup;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      render: (status: string) => {
        const s = status?.toUpperCase() || '';
        const styleMap: Record<string, any> = {
          PENDING: { color: '#d48806', background: '#fffb8f', borderColor: '#ffe58f' },
          PREPARING: { color: '#0958d9', background: '#e6f7ff', borderColor: '#91caff' },
          READY: { color: '#389e0d', background: '#f6ffed', borderColor: '#b7eb8f' },
          COMPLETED: { color: '#595959', background: '#fafafa', borderColor: '#d9d9d9' },
          CANCELLED: { color: '#cf1322', background: '#fff1f0', borderColor: '#ffa39e' }
        };
        const st = styleMap[s] || { color: '#595959', background: '#fafafa', borderColor: '#d9d9d9' };
        
        return <Tag style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 12, fontSize: 12, border: '1px solid', ...st }}>{statusTextMap[s] || status}</Tag>;
      },
      filters: [
        { text: 'Chờ xác nhận', value: 'PENDING' },
        { text: 'Đang chế biến', value: 'PREPARING' },
        { text: 'Đã sẵn sàng', value: 'READY' },
        { text: 'Hoàn thành', value: 'COMPLETED' },
        { text: 'Đã hủy', value: 'CANCELLED' },
      ],
      onFilter: (value: any, record: any) => record.status?.toUpperCase() === value
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_: any, record: any) => {
        const s = record.status?.toUpperCase();
        return (
          <Space>
            {s !== 'COMPLETED' && s !== 'CANCELLED' && (
              <Button 
                danger 
                size="small" 
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setCancelOrderId(record.id);
                  setIsCancelModalVisible(true);
                }}
              >
                Hủy khẩn cấp
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 24, fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Tra soát Đơn hàng</h2>
        <Space>
          <RangePicker 
            format="DD/MM/YYYY" 
            value={dateRange} 
            onChange={(dates) => setDateRange(dates)} 
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
            Xuất file báo cáo (CSV)
          </Button>
        </Space>
      </div>
      
      <Table columns={columns} dataSource={filteredOrders} rowKey="id" pagination={{ pageSize: 10 }} />

      <Modal
        title="Lý do hủy đơn hàng (Khẩn cấp)"
        visible={isCancelModalVisible}
        onCancel={() => {
          setIsCancelModalVisible(false);
          setCancelReason('Khách hàng đổi ý');
          setOtherReason('');
          setCancelOrderId(null);
        }}
        onOk={() => {
          const finalReason = cancelReason === 'Lý do khác' ? otherReason : cancelReason;
          if (cancelReason === 'Lý do khác' && !finalReason.trim()) {
            return;
          }
          if (cancelOrderId) {
            handleEmergencyCancel(cancelOrderId, finalReason);
          }
          setIsCancelModalVisible(false);
        }}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true, disabled: cancelReason === 'Lý do khác' && !otherReason.trim() }}
      >
        <div style={{ padding: '10px 0' }}>
          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>Vui lòng chọn lý do hủy đơn:</Text>
          <Radio.Group onChange={(e) => setCancelReason(e.target.value)} value={cancelReason} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Radio value="Hết nguyên liệu / Hết món">Hết nguyên liệu / Hết món</Radio>
            <Radio value="Khách hàng đổi ý">Khách hàng đổi ý</Radio>
            <Radio value="Không liên lạc được với khách hàng">Không liên lạc được với khách hàng</Radio>
            <Radio value="Lý do khác">Lý do khác</Radio>
          </Radio.Group>
          
          {cancelReason === 'Lý do khác' && (
            <Input.TextArea
              rows={3}
              placeholder="Nhập lý do của bạn..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagement;
