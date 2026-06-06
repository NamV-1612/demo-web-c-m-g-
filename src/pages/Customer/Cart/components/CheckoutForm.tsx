import React from 'react';
import { Typography, Button, Select, Radio, Segmented, Tooltip } from 'antd';
import { EnvironmentOutlined, EnvironmentFilled, PlusOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';

const MotorbikeSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M19.44,9.03L15.41,5H11V7H14.59L17.18,9.59C15.93,10.29 15.06,11.53 14.86,13H11V11.5C11,10.67 10.33,10 9.5,10H5V12H9.5V13H8C5.79,13 4,14.79 4,17C4,19.21 5.79,21 8,21C10.12,21 11.85,19.34 11.99,17.25L15.34,18.06C15.65,19.74 17.17,21 19,21C21.21,21 23,19.21 23,17C23,14.88 21.35,13.15 19.28,13L19.44,9.03M8,19C6.9,19 6,18.1 6,17C6,15.9 6.9,15 8,15C9.1,15 10,15.9 10,17C10,18.1 9.1,19 8,19M19,19C17.9,19 17,18.1 17,17C17,15.9 17.9,15 19,15C20.1,15 21,15.9 21,17C21,18.1 20.1,19 19,19Z" />
  </svg>
);

const { Text } = Typography;
const { Option } = Select;

interface CheckoutFormProps {
  deliveryMethod: string;
  setDeliveryMethod: (val: string) => void;
  addresses: any[];
  selectedAddressId: string;
  setSelectedAddressId: (val: string) => void;
  onRemoveAddress: (id: string) => void;
  onAddAddressClick: () => void;
  pickupTimeType: string;
  setPickupTimeType: (val: string) => void;
  pickupTimeText: string;
  setPickupTimeText: (val: string) => void;
  timeOptions: { value: string; label: string }[];
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  deliveryMethod,
  setDeliveryMethod,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  onRemoveAddress,
  onAddAddressClick,
  pickupTimeType,
  setPickupTimeType,
  pickupTimeText,
  setPickupTimeText,
  timeOptions
}) => {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Segmented 
          block
          size="large"
          className="custom-segmented"
          options={[
            { label: <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon component={MotorbikeSvg} style={{ fontSize: 18 }} /> Nhờ quán ship (Giao tận nơi)</span>, value: 'delivery' },
            { label: <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><ShopOutlined style={{ fontSize: 18 }} /> Tự đến lấy tại quán</span>, value: 'pickup' }
          ]}
          value={deliveryMethod}
          onChange={(val) => setDeliveryMethod(val as string)}
        />
      </div>

      {deliveryMethod === 'delivery' && (
        <>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: 16 }}>
            <Select 
              value={selectedAddressId || undefined} 
              onChange={setSelectedAddressId} 
              style={{ flex: 1, minWidth: 0 }} 
              size="large"
              placeholder="Vui lòng thêm địa chỉ"
              className="premium-select"
              dropdownClassName="premium-dropdown"
              optionLabelProp="label"
            >
              {addresses.map(addr => {
                const safeAddress = addr.address || '';
                return (
                  <Option key={addr.id} value={addr.id} label={`${addr.name} - ${addr.phone} - ${safeAddress || 'Chưa điền địa chỉ'}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ whiteSpace: 'normal', paddingRight: '12px' }}><strong>{addr.name}</strong> - {addr.phone} ({safeAddress || 'Chưa điền địa chỉ'})</span>
                      {addr.id !== 'default' && addresses.length > 1 && (
                        <Button 
                          type="link" 
                          danger 
                          icon={<DeleteOutlined />} 
                          size="small"
                          style={{ padding: '0 8px', borderRadius: 4, background: '#fff1f0', border: '1px solid #ffa39e' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveAddress(addr.id);
                          }}
                        >Xóa</Button>
                      )}
                    </div>
                  </Option>
                );
              })}
            </Select>
            <Tooltip title="Thêm địa chỉ mới">
              <Button 
                type="dashed" 
                size="large" 
                icon={<PlusOutlined />}
                onClick={onAddAddressClick}
                style={{ 
                  borderColor: '#D53E0F', 
                  color: '#D53E0F', 
                  backgroundColor: '#fff7e6',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  boxShadow: '0 2px 0 rgba(213, 62, 15, 0.05)',
                  flexShrink: 0
                }}
              />
            </Tooltip>
          </div>
          {selectedAddressId && (
            <div className="selected-address-preview" style={{ marginBottom: 16 }}>
              <strong>Địa chỉ:</strong> {addresses.find(a => a.id === selectedAddressId)?.address || <span style={{color: 'red'}}>Chưa điền địa chỉ, vui lòng cập nhật!</span>}
            </div>
          )}
        </>
      )}
      
      {deliveryMethod === 'pickup' ? (
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff7e6', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ffd591' }}>
            <Text style={{ color: '#d46b08', fontSize: '14px' }}>
              <EnvironmentFilled style={{ marginRight: 8 }} />
              <Text strong style={{ color: '#d46b08' }}>Lưu ý:</Text> Quý khách vui lòng tới quán nhận đồ trong khoảng 1 tiếng sau khi nhận được thông báo món ăn đã hoàn thành.
            </Text>
          </div>
        </div>
      ) : (
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 16, fontSize: '15px' }}>Giờ giao hàng</Text>
          <Radio.Group value={pickupTimeType} onChange={e => setPickupTimeType(e.target.value)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Radio value="asap" style={{ fontSize: '15px' }}>Giao ngay khi xong</Radio>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio value="specific" style={{ fontSize: '15px' }}>
                Giao vào giờ
              </Radio>
              <Select
                value={pickupTimeText}
                onChange={setPickupTimeText}
                disabled={pickupTimeType !== 'specific'}
                size="large"
                style={{ width: '140px' }}
                className="premium-select"
                dropdownClassName="premium-dropdown"
              >
                  {timeOptions.map(opt => (
                    <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                  ))}
              </Select>
            </div>
          </Radio.Group>
        </div>
      )}
    </>
  );
};

export default CheckoutForm;
