import React, { useState, useRef } from 'react';
import { Modal, Input, Button, AutoComplete, message } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

interface MapModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (address: string) => void;
}

const MapModal: React.FC<MapModalProps> = ({ visible, onCancel, onConfirm }) => {
  const [mapSearchText, setMapSearchText] = useState('');
  const [submittedSearchText, setSubmittedSearchText] = useState('21.0285,105.8542');
  const [mapOptions, setMapOptions] = useState<any[]>([]);
  const searchTimeoutRef = useRef<any>(null);

  const handleMapSearch = (value: string) => {
    if (!value.trim()) {
      setMapOptions([]);
      return;
    }
    setMapSearchText(value);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=vn`);
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

  const handleMapSelect = (value: string, option: any) => {
    setMapSearchText(value);
    setSubmittedSearchText(`${option.lat},${option.lon}`);
    message.success('Đã lấy vị trí từ Bản đồ!');
  };

  const handleConfirm = () => {
    if (mapSearchText) {
      onConfirm(mapSearchText);
      message.success('Đã xác nhận địa chỉ này!');
    }
  };

  return (
    <Modal 
      title={<><EnvironmentOutlined /> Chọn vị trí trên Bản đồ</>}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      bodyStyle={{ padding: 0, borderRadius: '8px', overflow: 'hidden' }}
      closeIcon={<div style={{ background: '#f5f5f5', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</div>}
    >
      <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: '8px' }} className="map-search-input">
          <AutoComplete
            options={mapOptions}
            onSearch={handleMapSearch}
            onSelect={handleMapSelect}
            style={{ flex: 1 }}
            value={mapSearchText}
            onChange={setMapSearchText}
          >
            <Input.Search 
              size="large" 
              placeholder="Nhập địa chỉ bạn muốn tìm (VD: Hồ Gươm)..." 
              enterButton="Tìm"
              onSearch={(val) => {
                if (val.trim() && mapOptions.length === 0) {
                  setSubmittedSearchText(val);
                }
              }}
            />
          </AutoComplete>
        </div>
      </div>
      <div style={{ width: '100%', height: '400px', background: '#e6e6e6', position: 'relative' }}>
        <iframe 
          title="Google Maps"
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(submittedSearchText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
        />
      </div>
      <div style={{ padding: '16px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ borderRadius: '8px' }}>Hủy</Button>
        <Button 
          type="primary" 
          onClick={handleConfirm} 
          style={{ marginLeft: '12px', background: '#BA1A21', borderColor: '#BA1A21', borderRadius: '8px' }}
        >
          Xác nhận vị trí này
        </Button>
      </div>
    </Modal>
  );
};

export default MapModal;
