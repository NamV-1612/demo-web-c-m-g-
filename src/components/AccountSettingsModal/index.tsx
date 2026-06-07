import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useModel } from 'umi';
import { LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';

interface AccountSettingsModalProps {
	visible: boolean;
	onClose: () => void;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ visible, onClose }) => {
	const [form] = Form.useForm();
	const { currentUser, updateAccount } = useModel('useAuthModel');

	useEffect(() => {
		if (visible && currentUser) {
			form.setFieldsValue({
				newUsername: currentUser.name,
			});
		} else {
			form.resetFields();
		}
	}, [visible, currentUser, form]);

	const handleFinish = async (values: any) => {
		const success = await updateAccount(values.phone, values.username, values.newPassword);
		if (success) {
			onClose();
		}
	};

	return (
		<Modal title='Cài đặt tài khoản' visible={visible} onCancel={onClose} footer={null} destroyOnClose width={400}>
			<Form form={form} layout='vertical' onFinish={handleFinish} style={{ marginTop: 24 }}>
				<div
					style={{
						background: '#fafafa',
						padding: '12px',
						borderRadius: '8px',
						marginBottom: '24px',
						border: '1px solid #f0f0f0',
					}}
				>
					<p style={{ margin: 0, fontWeight: 500, color: '#D53E0F', marginBottom: 12 }}>Xác thực để Đổi mật khẩu</p>
					<Form.Item
						name='phone'
						rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
						style={{ marginBottom: 12 }}
					>
						<Input prefix={<PhoneOutlined />} placeholder='Số điện thoại đăng ký' size='large' />
					</Form.Item>
					<Form.Item
						name='username'
						rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
						style={{ marginBottom: 12 }}
					>
						<Input prefix={<UserOutlined />} placeholder='Tên đăng nhập' size='large' />
					</Form.Item>
					<Form.Item
						name='newPassword'
						rules={[
							{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },
							{
								pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
								message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường và số!',
							},
						]}
						style={{ marginBottom: 0 }}
					>
						<Input.Password prefix={<LockOutlined />} placeholder='Mật khẩu mới' size='large' />
					</Form.Item>
				</div>

				<Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
					<Button onClick={onClose} size='large' style={{ marginRight: 12, borderRadius: 8 }}>
						Hủy
					</Button>
					<Button type='primary' htmlType='submit' size='large' style={{ borderRadius: 8 }}>
						Lưu thay đổi
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default AccountSettingsModal;
