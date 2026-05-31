import React from 'react';
import { Col, Typography } from 'antd';
import { Order } from '@/services/typing';
import OrderCard from './OrderCard';

const { Title } = Typography;

interface KanbanColumnProps {
  title: string;
  data: Order[];
  className: string;
  onStatusChange: (id: string, newStatus: string) => void;
  onPrint: (order: Order) => void;
  onPaymentChange: (id: string, isPaid: boolean) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, data, className, onStatusChange, onPrint, onPaymentChange }) => {
  return (
    <Col span={6}>
      <div className={`kanban-col ${className}`}>
        <div className="col-header">
          <Title level={5} className="col-title">{title}</Title>
          <span className="badge">{data.length}</span>
        </div>
        <div className="col-body" style={{ minHeight: 'calc(100vh - 250px)', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', padding: 8 }}>
          {data.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusChange={onStatusChange} 
              onPrint={onPrint}
              onPaymentChange={onPaymentChange}
            />
          ))}
        </div>
      </div>
    </Col>
  );
};

export default KanbanColumn;
