import React from 'react';
import { Typography, Button, Select, Radio, Segmented, Tooltip } from 'antd';
import { EnvironmentOutlined, EnvironmentFilled, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

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
            { label: '🛵 Nhờ quán ship (Giao tận nơi)', value: 'delivery' },
            { label: '🏪 Tự đến lấy tại quán', value: 'pickup' }
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
                      {addr.id !== 'default' && (
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
                  borderColor: '#BA1A21', 
                  color: '#BA1A21', 
                  backgroundColor: '#fff7e6',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  boxShadow: '0 2px 0 rgba(186, 26, 33, 0.05)',
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
