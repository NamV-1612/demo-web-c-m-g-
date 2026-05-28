import React from 'react';
import { Table, Tag, Button, Space, message, Popconfirm } from 'antd';
import { DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import '../admin.less';

const OrderManagement: React.FC = () => {
  const { orders, changeOrderStatus } = useModel('useOrderModel');

  const statusTextMap: any = { 
    PENDING: 'Chờ xác nhận', 
    PREPARING: 'Đang chế biến', 
    READY: 'Đã sẵn sàng', 
    COMPLETED: 'Hoàn thành', 
    CANCELLED: 'Đã hủy' 
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Mã đơn,Ngày tạo,Khách hàng,SĐT,Tổng tiền,Trạng thái\n";
    
    orders.forEach(o => {
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

  const handleEmergencyCancel = (id: string) => {
    changeOrderStatus(id, 'CANCELLED');
    message.success(`Đã hủy khẩn cấp đơn hàng ${id}`);
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (val: string) => <strong>{val}</strong> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (val: number) => moment(val).format('DD/MM/YYYY HH:mm'), sorter: (a: any, b: any) => a.createdAt - b.createdAt },
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
      render: (note: string) => {
        if (note?.includes('Khách tự đến lấy')) {
          return <Tag color="volcano" style={{ fontWeight: 'bold' }}>🏪 Nhận tại quán</Tag>;
        }
        return <Tag color="geekblue" style={{ fontWeight: 'bold' }}>🛵 Giao hàng</Tag>;
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
      render: (status: string) => {
        const s = status?.toUpperCase();
        const colorMap: any = { PENDING: 'orange', PREPARING: 'blue', READY: 'green', COMPLETED: 'gray', CANCELLED: 'red' };
        return <Tag color={colorMap[s] || 'default'}>{statusTextMap[s] || status}</Tag>;
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
      render: (_: any, record: any) => {
        const s = record.status?.toUpperCase();
        return (
          <Space>
            {s !== 'COMPLETED' && s !== 'CANCELLED' && (
              <Popconfirm overlayStyle={{ minWidth: 250 }} overlayClassName="custom-popconfirm" title="Bạn có chắc muốn hủy khẩn cấp đơn này?" onConfirm={() => handleEmergencyCancel(record.id)} okText="Có, Hủy đơn" cancelText="Không" okButtonProps={{ danger: true }}>
                <Button danger size="small" icon={<CloseCircleOutlined />}>Hủy khẩn cấp</Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="admin-page" style={{ padding: 24 }}>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Tra soát Đơn hàng</h2>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
          Xuất file báo cáo (CSV)
        </Button>
      </div>
      
      <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default OrderManagement;
