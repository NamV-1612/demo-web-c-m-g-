import React, { useRef, useState } from 'react';
import { Modal, Input, AutoComplete, message } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

interface CartMapModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (address: string) => void;
}

const CartMapModal: React.FC<CartMapModalProps> = ({ visible, onCancel, onConfirm }) => {
  const [mapSearchText, setMapSearchText] = useState('');
  const [submittedSearchText, setSubmittedSearchText] = useState('21.0285,105.8542'); // Hoan Kiem coords
  const [mapOptions, setMapOptions] = useState<any[]>([]);
  const searchTimeoutRef = useRef<any>(null);

  const handleMapSearch = (value: string) => {
    if (!value.trim()) {
      setMapOptions([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=vn`);
        const data = await res.json();
        const newOptions = data.map((item: any) => ({
          value: item.display_name,
          label: item.display_name,
          lat: item.lat,
          lon: item.lon
        }));
        setMapOptions(newOptions);
      } catch (err) {
        console.error('Map search error:', err);
      }
    }, 600);
  };

  return (
    <Modal 
      title={<><EnvironmentOutlined /> Tìm kiếm địa chỉ nhận hàng</>}
      visible={visible} 
      onCancel={onCancel} 
      onOk={() => {
        const finalAddress = mapSearchText.trim() ? mapSearchText : 'Vị trí đã chọn trên bản đồ';
        onConfirm(finalAddress);
        message.success('Đã chọn địa chỉ!');
      }}
      okText="Xác nhận vị trí này"
      cancelText="Hủy"
      width={700}
      zIndex={1001}
      bodyStyle={{ padding: 0 }}
      okButtonProps={{ style: { background: '#BA1A21', borderColor: '#BA1A21', borderRadius: '8px', color: 'white', fontWeight: 'bold' } }}
      cancelButtonProps={{ style: { borderRadius: '8px' } }}
    >
      <div style={{ position: 'relative', width: '100%', height: '450px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '500px', zIndex: 10 }}>
          <AutoComplete
            options={mapOptions}
            style={{ width: '100%' }}
            onSearch={handleMapSearch}
            onSelect={(value, option: any) => {
              setMapSearchText(value);
              if (option.lat && option.lon) {
                setSubmittedSearchText(`${option.lat},${option.lon}`);
              } else {
                setSubmittedSearchText(value);
              }
            }}
            value={mapSearchText}
            onChange={setMapSearchText}
          >
            <Input.Search 
              className="map-search-input"
              placeholder="Nhập địa chỉ bạn muốn tìm..." 
              enterButton="Tìm"
              size="large"
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)', borderRadius: 8 }}
              onSearch={(value) => {
                const newSearch = value.trim() || 'Hồ Hoàn Kiếm, Hà Nội';
                setSubmittedSearchText(newSearch);
              }}
            />
          </AutoComplete>
        </div>
        <iframe 
          src={`https://maps.google.com/maps?q=${encodeURIComponent(submittedSearchText)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy"
          title="Map"
        ></iframe>
      </div>
    </Modal>
  );
};

export default CartMapModal;
