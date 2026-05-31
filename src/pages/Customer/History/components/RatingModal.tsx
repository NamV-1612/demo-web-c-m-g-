import React, { useState, useEffect } from 'react';
import { Modal, Rate, Input } from 'antd';

const { TextArea } = Input;

interface RatingModalProps {
  visible: boolean;
  orderId: string | null;
  onCancel: () => void;
  onSubmit: (stars: number, comment: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ visible, orderId, onCancel, onSubmit }) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  // Reset state when modal becomes visible for a new order
  useEffect(() => {
    if (visible) {
      setStars(5);
      setComment('');
    }
  }, [visible, orderId]);

  return (
    <Modal
      title="Đánh giá chất lượng dịch vụ"
      visible={visible}
      onOk={() => onSubmit(stars, comment)}
      onCancel={onCancel}
      okText="Gửi đánh giá"
      cancelText="Hủy"
      okButtonProps={{ disabled: stars === 0, style: { background: '#BA1A21', borderColor: '#BA1A21' } }}
    >
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <p style={{ fontWeight: 'bold' }}>Đơn hàng: {orderId}</p>
        <Rate value={stars} onChange={setStars} style={{ fontSize: 32 }} />
        <p style={{ marginTop: 8, color: '#8c8c8c' }}>
          {stars === 5 ? 'Tuyệt vời!' : stars === 4 ? 'Hài lòng' : stars === 3 ? 'Bình thường' : stars === 2 ? 'Tệ' : stars === 1 ? 'Quá tệ!' : ''}
        </p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Bình luận / Góp ý:</label>
        <TextArea 
          rows={4} 
          placeholder="Hãy chia sẻ trải nghiệm của bạn về món ăn và dịch vụ..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default RatingModal;
