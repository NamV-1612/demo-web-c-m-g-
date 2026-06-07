import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
	PieChartOutlined,
	AppstoreOutlined,
	ContainerOutlined,
	ContactsOutlined,
	UserOutlined,
	LogoutOutlined,
	MenuUnfoldOutlined,
	MenuFoldOutlined,
	GiftOutlined,
} from '@ant-design/icons';
import { history, useModel } from 'umi';
import './AdminLayout.less';

import AccountSettingsModal from '@/components/AccountSettingsModal';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = ({ children }) => {
	const { currentUser, logout } = useModel('useAuthModel');
	const [collapsed, setCollapsed] = useState(false);
	const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [bgStyle, setBgStyle] = useState({ top: 20, height: 40, opacity: 0 });

	useEffect(() => {
		const timer = setTimeout(() => {
			if (wrapperRef.current) {
				const selectedEl = wrapperRef.current.querySelector('.ant-menu-item-selected') as HTMLElement;
				if (selectedEl) {
					const wrapperRect = wrapperRef.current.getBoundingClientRect();
					const selectedRect = selectedEl.getBoundingClientRect();
					setBgStyle({
						top: selectedRect.top - wrapperRect.top,
						height: selectedRect.height,
						opacity: 1,
					});
				}
			}
		}, 100);
		return () => clearTimeout(timer);
	}, [history.location.pathname, collapsed]);

	const handleMenuClick = ({ key }: { key: string }) => {
		history.push(key);
	};

	const handleLogout = () => {
		logout();
		history.push('/admin/login');
	};

	const userMenu = (
		<Menu>
			<Menu.Item key='profile' icon={<UserOutlined />} onClick={() => setIsAccountModalVisible(true)}>
				Cài đặt tài khoản
			</Menu.Item>
			<Menu.Divider />
			<Menu.Item key='logout' icon={<LogoutOutlined />} onClick={handleLogout} danger>
				Đăng xuất
			</Menu.Item>
		</Menu>
	);

	return (
		<Layout className='admin-layout-container'>
			<Sider trigger={null} collapsible collapsed={collapsed} className='admin-sider' width={250}>
				<div className='admin-logo'>
					<span className='logo-icon' style={{ display: 'none' }}></span>
					{!collapsed && <span className='logo-text'>Doki Admin</span>}
				</div>
				<div style={{ position: 'relative' }} ref={wrapperRef}>
					<div
						className='sliding-bg'
						style={{
							position: 'absolute',
							left: 8,
							right: 8,
							height: bgStyle.height,
							backgroundColor: '#ffffff',
							borderRadius: 8,
							top: bgStyle.top,
							opacity: bgStyle.opacity,
							transition: 'top 0.3s cubic-bezier(0.645, 0.045, 0.355, 1), height 0.3s ease, opacity 0.3s ease',
							zIndex: 0,
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
						}}
					/>
					<Menu
						mode='inline'
						selectedKeys={[history.location.pathname]}
						onClick={handleMenuClick}
						className='admin-menu'
						style={{ position: 'relative', zIndex: 1 }}
						items={[
							{
								key: '/admin/dashboard',
								icon: <PieChartOutlined />,
								label: 'Tổng quan',
							},
							{
								key: '/admin/menu',
								icon: <AppstoreOutlined />,
								label: 'Quản lý Thực đơn',
							},
							{
								key: '/admin/orders',
								icon: <ContainerOutlined />,
								label: 'Quản lý Đơn hàng',
							},
							{
								key: '/admin/promos',
								icon: <GiftOutlined />,
								label: 'Quản lý Mã Khuyến Mãi',
							},
							{
								key: '/admin/users',
								icon: <ContactsOutlined />,
								label: 'Quản lý Người dùng',
							},
						]}
					/>
				</div>
			</Sider>

			<Layout className='site-layout'>
				<Header className='admin-header'>
					<div className='header-left'>
						{React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
							className: 'trigger',
							onClick: () => setCollapsed(!collapsed),
						})}
						<h2 className='header-title'>Hệ thống Quản trị</h2>
					</div>
					<div className='header-right'>
						<Dropdown overlay={userMenu} placement='bottomRight'>
							<span className='user-dropdown-link' style={{ cursor: 'pointer' }}>
								<Avatar style={{ backgroundColor: '#D53E0F' }} icon={<UserOutlined />} />
								<span className='user-name' style={{ marginLeft: 8 }}>
									{currentUser?.full_name || 'Quản trị viên'}
								</span>
							</span>
						</Dropdown>
					</div>
				</Header>

				<Content className='admin-content'>{children}</Content>
			</Layout>

			<AccountSettingsModal visible={isAccountModalVisible} onClose={() => setIsAccountModalVisible(false)} />
		</Layout>
	);
};

export default AdminLayout;
