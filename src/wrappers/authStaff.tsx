import React from 'react';
import { Redirect, useModel } from 'umi';

const AuthStaff: React.FC = ({ children }) => {
  const { currentUser } = useModel('useAuthModel');

  if (!currentUser) {
    return <Redirect to="/staff/login" />;
  }
  
  if (currentUser.role?.toLowerCase() !== 'staff' && currentUser.role?.toLowerCase() !== 'admin') {
    return <Redirect to="/403" />;
  }

  return <>{children}</>;
};

export default AuthStaff;
