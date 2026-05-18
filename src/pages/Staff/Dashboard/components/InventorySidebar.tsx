import React from 'react';
import { Drawer, List, Switch, Typography } from 'antd';
import { useModel } from 'umi';

const { Text } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const InventorySidebar: React.FC<Props> = ({ visible, onClose }) => {
  const { menu, toggleProductAvailability } = useModel('useMenuModel');

  return (
    <Drawer title="Quản lý Tồn kho cấp tốc" placement="right" onClose={onClose} visible={visible} width={320}>
      <List
        dataSource={menu}
        renderItem={item => (
          <List.Item
            actions={[
              <Switch 
                checked={item.isAvailable} 
                onChange={(checked) => toggleProductAvailability(item.id, checked)} 
                checkedChildren="Còn" 
                unCheckedChildren="Hết"
              />
            ]}
          >
            <List.Item.Meta
              title={item.name}
              description={<Text type="secondary">{item.price.toLocaleString()}đ</Text>}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default InventorySidebar;
