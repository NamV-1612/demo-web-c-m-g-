import React from 'react';
import { Redirect, useModel } from 'umi';

const AuthCustomer: React.FC = ({ children }) => {
  const { currentUser } = useModel('useAuthModel');

  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  if (currentUser.role?.toLowerCase() !== 'customer' && currentUser.role?.toLowerCase() !== 'admin') {
    return <Redirect to="/403" />;
  }

  return <>{children}</>;
};

export default AuthCustomer;
