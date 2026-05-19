import React from 'react';
import { Table, Tag, Button, Space, message, Popconfirm } from 'antd';
import { DownloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import '../admin.less';

const OrderManagement: React.FC = () => {
  const { orders, changeOrderStatus } = useModel('useOrderModel');

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Mã đơn,Ngày tạo,Khách hàng,SĐT,Tổng tiền,Trạng thái\n";
    
    orders.forEach(o => {
      const date = moment(o.createdAt).format('DD/MM/YYYY HH:mm');
      const row = `${o.id},${date},"${o.customerName}","${o.customerPhone}",${o.totalAmount},${o.status}`;
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
    changeOrderStatus(id, 'cancelled');
    message.success(`Đã hủy khẩn cấp đơn hàng ${id}`);
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (val: string) => <strong>{val}</strong> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (val: number) => moment(val).format('DD/MM/YYYY HH:mm') },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone' },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      render: (val: number) => <span className="amount-highlight">{val.toLocaleString()}đ</span> 
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: string) => {
        const colorMap: any = { pending: 'orange', cooking: 'blue', ready: 'green', completed: 'gray', cancelled: 'red' };
        const textMap: any = { pending: 'Chờ duyệt', cooking: 'Đang nấu', ready: 'Chờ lấy', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      }
    },
    {
      title: 'Hành động',
      render: (_: any, record: any) => (
        <Space>
          {record.status !== 'completed' && record.status !== 'cancelled' && (
            <Popconfirm title="Bạn có chắc muốn hủy khẩn cấp đơn này?" onConfirm={() => handleEmergencyCancel(record.id)}>
              <Button danger size="small" icon={<CloseCircleOutlined />}>Hủy khẩn cấp</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="header-actions">
        <h2>Tra soát Đơn hàng</h2>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
          Xuất file Excel
        </Button>
      </div>
      
      <Table columns={columns} dataSource={orders} rowKey="id" />
    </div>
  );
};

export default OrderManagement;
