import React from 'react';
import { Form, Input, Button, Tabs, Typography, Divider, Modal, message, Collapse, Carousel } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, DownOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import api from '@/services/api';
import './style.less';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Panel } = Collapse;

const CustomerLogin: React.FC = () => {
	const { login, register, logout, currentUser } = useModel('useAuthModel');
	const [activeTab, setActiveTab] = React.useState('1');
	const [isForgotModalVisible, setIsForgotModalVisible] = React.useState(false);
	const [form] = Form.useForm();
	const [forgotForm] = Form.useForm();

	React.useEffect(() => {
		if (currentUser) {
			logout();
		}
	}, []);

	const triggerTransition = () => {
		sessionStorage.setItem('showLoginTransition', 'true');
		const overlay = document.createElement('div');
		overlay.className = 'global-login-transition';
		overlay.id = 'global-login-transition';
		overlay.innerHTML = `<div class="chicken-loader">🍗</div><h2>Đang vào bếp...</h2>`;
		document.body.appendChild(overlay);
		void overlay.offsetWidth;
		overlay.classList.add('active');
		setTimeout(() => {
			history.push('/customer/home');
		}, 800);
	};

	const handleSubmit = async (values: any) => {
		if (activeTab === '1') {
			const success = await login(values.username.trim(), values.password, ['CUSTOMER', 'ADMIN']);
			if (success) {
				triggerTransition();
			}
		} else {
			const success = await register(values.name, values.username.trim(), values.phone, values.password);
			if (success) {
				setActiveTab('1');
				form.resetFields();
			}
		}
	};

	const handleForgotPassword = () => {
		forgotForm
			.validateFields()
			.then(async (values) => {
				try {
					const res = await api.get('/users');
					const users = res.data;
					const targetUser = users.find((u: any) => u.phone === values.phone && u.name === values.username);
					
					if (!targetUser) {
						message.error('Không tìm thấy tài khoản với thông tin cung cấp!');
						return;
					}
					
					const userId = targetUser._id || targetUser.id;
					await api.put(`/users/${userId}`, { password: values.newPassword });
					
					message.success('Mật khẩu của bạn đã được đặt lại thành công! Hãy đăng nhập bằng mật khẩu mới.');
					setIsForgotModalVisible(false);
					forgotForm.resetFields();
					setActiveTab('1');
				} catch (error) {
					message.error('Lỗi khi đổi mật khẩu, vui lòng thử lại sau.');
				}
			})
			.catch((info) => {
				console.log('Validate Failed:', info);
			});
	};

	return (
		<>

			<div className='login-split-container'>
				<div className='login-banner'>
					<div className='banner-overlay'>
						<div className="banner-content-wrapper">
							<div className="banner-carousel">
								<Carousel autoplay effect="fade" dotPosition="bottom">
									<div>
										<div className="carousel-slide">
											<img src="/welcome_discount_banner.png" alt="Welcome Discount" />
											<div className="slide-content">
												<h3 style={{ color: '#FFD700' }}>🎁 Ưu đãi khách mới!</h3>
												<p>Nhập mã <strong>WELCOME</strong> để nhận ngay ưu đãi đặc biệt cho đơn hàng đầu tiên của bạn.</p>
											</div>
										</div>
									</div>
									<div>
										<div className="carousel-slide">
											<img src="https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cơm rang dưa bò đút lò" />
											<div className="slide-content">
												<h3>Cơm rang dưa bò đút lò phô mai</h3>
												<p>Sự kết hợp phá cách: dưa bò truyền thống phủ phô mai kéo sợi nướng lò.</p>
											</div>
										</div>
									</div>
									<div>
										<div className="carousel-slide">
											<img src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cơm rang đùi gà nướng mật ong" />
											<div className="slide-content">
												<h3>Cơm rang đùi gà nướng mật ong</h3>
												<p>Đùi gà góc tư nướng mật ong thơm lừng ăn kèm cơm rang.</p>
											</div>
										</div>
									</div>
									<div>
										<div className="carousel-slide">
											<img src="https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cơm rang hải sản" />
											<div className="slide-content">
												<h3>Cơm rang hải sản</h3>
												<p>Cơm rang tôm, mực giòn sần sật, đậm vị biển cả.</p>
											</div>
										</div>
									</div>
									<div>
										<div className="carousel-slide">
											<img src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gà Rán Doki" />
											<div className="slide-content">
												<h3>Gà Rán Giòn Rụm</h3>
												<p>Miếng gà tẩm bột chiên giòn rụm bên ngoài, mọng nước bên trong.</p>
											</div>
										</div>
									</div>
									<div>
										<div className="carousel-slide">
											<img src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Khoai tây chiên" />
											<div className="slide-content">
												<h3>Khoai Tây Lắc Phô Mai</h3>
												<p>Khoai tây chiên vàng ươm lắc cùng bột phô mai mặn ngọt cực cuốn.</p>
											</div>
										</div>
									</div>

								</Carousel>
							</div>

							<div className="banner-text-bottom">
								<h1>
									Doki <span>Food</span>
								</h1>
								<p>Đỉnh cao cơm rang tơi xốp, giòn rụm đậm đà. Trải nghiệm đặt món siêu tốc, giao đĩa cơm nóng hổi bốc khói cùng topping ngập tràn!</p>
							</div>
						</div>
					</div>
				</div>

				<div className='login-form-wrapper'>
					<div className='form-container'>
						<div className='logo-mobile'>Doki Food</div>
						<h2>Xin chào!</h2>
						<p className='subtitle'>Vui lòng đăng nhập hoặc tạo tài khoản để đặt món.</p>

						<Tabs
							activeKey={activeTab}
							onChange={(key) => {
								setActiveTab(key);
								form.resetFields();
							}}
							size='large'
						>
							<TabPane tab='Đăng nhập' key='1' />
							<TabPane tab='Đăng ký' key='2' />
						</Tabs>

						<Form form={form} layout='vertical' onFinish={handleSubmit} size='large'>
							<div className={`expandable-field ${activeTab === '2' ? 'expanded' : ''}`}>
								<Form.Item
									name='name'
									rules={
										activeTab === '2'
											? [
													{ required: true, message: 'Vui lòng nhập họ tên!' },
													{
														pattern: /^[\p{L}\s]{2,50}$/u,
														message: 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dài từ 2-50 ký tự!',
													},
											  ]
											: []
									}
								>
									<Input prefix={<UserOutlined />} placeholder='Họ và tên' tabIndex={activeTab === '1' ? -1 : 0} />
								</Form.Item>
							</div>

							<Form.Item
								name='username'
								rules={[
									{
										required: true,
										message:
											activeTab === '1'
												? 'Vui lòng nhập Tên đăng nhập / Số điện thoại!'
												: 'Vui lòng nhập Tên đăng nhập!',
									},
									...(activeTab === '2' ? [{ min: 3, message: 'Tên đăng nhập (từ 3 ký tự trở lên)!' } as any] : []),
								]}
							>
								<Input
									prefix={<UserOutlined />}
									placeholder={activeTab === '1' ? 'Tên đăng nhập / Số điện thoại' : 'Tên đăng nhập'}
								/>
							</Form.Item>

							<div className={`expandable-field ${activeTab === '2' ? 'expanded' : ''}`}>
								<Form.Item
									name='phone'
									rules={
										activeTab === '2'
											? [
													{ required: true, message: 'Vui lòng nhập Số điện thoại!' },
													{
														pattern: /^(0[35789])[0-9]{8}$/,
														message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)',
													},
											  ]
											: []
									}
								>
									<Input prefix={<PhoneOutlined />} placeholder='Số điện thoại' tabIndex={activeTab === '1' ? -1 : 0} />
								</Form.Item>
							</div>

							<Form.Item
								name='password'
								rules={[
									{ required: true, message: 'Vui lòng nhập mật khẩu!' },
									...(activeTab === '2'
										? [
												{
													pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
													message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường và số!',
												} as any,
										  ]
										: []),
								]}
							>
								<Input.Password prefix={<LockOutlined />} placeholder='Mật khẩu' />
							</Form.Item>

							{activeTab === '1' && (
								<div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
									<Text type='secondary' style={{ cursor: 'pointer' }} onClick={() => setIsForgotModalVisible(true)}>
										Quên mật khẩu?
									</Text>
								</div>
							)}

							<Form.Item style={{ marginBottom: 0 }}>
								<Button type='primary' htmlType='submit' block style={{ marginTop: 0 }}>
									{activeTab === '1' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
								</Button>
							</Form.Item>

							<div
								className={`expandable-field ${activeTab === '1' ? 'expanded' : ''}`}
								style={{ textAlign: 'center', marginTop: activeTab === '1' ? 24 : 0 }}
							>
								<Text className="guest-login-btn" onClick={triggerTransition}>
									Tiếp tục dưới tư cách Khách vãng lai
								</Text>
							</div>
						</Form>

						<Divider style={{ margin: '40px 0 24px', borderColor: '#EEEEEE' }} />

						<Collapse ghost expandIconPosition='end' className='internal-collapse'>
							<Panel
								header={
									<Text type='secondary' style={{ fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>
										▸ Dành cho Nội bộ Hệ thống
									</Text>
								}
								key='1'
								style={{ textAlign: 'center' }}
							>
								<div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
									<Button
										type='dashed'
										size='large'
										onClick={() => history.push('/staff/login')}
										style={{ borderRadius: '10px', flex: 1, fontWeight: 600, color: '#666', borderColor: '#DDDDDD' }}
									>
										Nhân viên
									</Button>
									<Button
										type='dashed'
										size='large'
										onClick={() => history.push('/user/login')}
										style={{ borderRadius: '10px', flex: 1, fontWeight: 600, color: '#666', borderColor: '#DDDDDD' }}
									>
										Quản trị viên
									</Button>
								</div>
							</Panel>
						</Collapse>
					</div>

					<div className="login-footer">
						<div className="login-footer-content">
							<span><EnvironmentOutlined /> 120 Yên Lãng, Hà Nội</span>
							<span className="divider">•</span>
							<span><PhoneOutlined /> Hotline: 1900 8888</span>
						</div>
						<div className="login-footer-copyright">
							© 2026 Hệ thống Doki Food. All rights reserved.
						</div>
					</div>
				</div>

				<Modal
					title='Quên mật khẩu'
					visible={isForgotModalVisible}
					onCancel={() => setIsForgotModalVisible(false)}
					onOk={handleForgotPassword}
					okText='Đặt lại mật khẩu'
					cancelText='Hủy'
					okButtonProps={{ style: { background: '#D53E0F', borderColor: '#D53E0F' } }}
				>
					<p style={{ color: '#666', marginBottom: 24 }}>
						Vui lòng nhập thông tin để đổi mật khẩu mới.
					</p>
					<Form form={forgotForm} layout='vertical'>
						<Form.Item name='name' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
							<Input prefix={<UserOutlined />} placeholder='Nhập họ và tên đã đăng ký' />
						</Form.Item>
						<Form.Item
							name='username'
							label='Tên đăng nhập'
							rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
						>
							<Input prefix={<UserOutlined />} placeholder='Nhập tên đăng nhập' />
						</Form.Item>
						<Form.Item
							name='phone'
							label='Số điện thoại'
							rules={[
								{ required: true, message: 'Vui lòng nhập số điện thoại!' },
								{
									pattern: /^(0[35789])[0-9]{8}$/,
									message: 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)',
								},
							]}
						>
							<Input prefix={<PhoneOutlined />} placeholder='Nhập số điện thoại' />
						</Form.Item>
						<Form.Item
							name='newPassword'
							label='Mật khẩu mới'
							rules={[
								{ required: true, message: 'Vui lòng nhập mật khẩu mới!' },
								{
									pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
									message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường và số!',
								},
							]}
						>
							<Input.Password prefix={<LockOutlined />} placeholder='Nhập mật khẩu mới' />
						</Form.Item>
					</Form>
				</Modal>
			</div>
		</>
	);
};

export default CustomerLogin;
