import React from 'react';
import { Redirect, useModel } from 'umi';

const AuthAdmin: React.FC = ({ children }) => {
  const { currentUser } = useModel('useAuthModel');

  if (!currentUser) {
    // Nếu chưa đăng nhập, vì admin mặc định của Antd pro có trang user/login nên có thể trỏ về đó
    return <Redirect to="/user/login" />;
  }
  
  if (currentUser.role?.toLowerCase() !== 'admin') {
    return <Redirect to="/403" />;
  }

  return <>{children}</>;
};

export default AuthAdmin;
