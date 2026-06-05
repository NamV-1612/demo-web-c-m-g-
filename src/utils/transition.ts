export const navigateWithCartTransition = (history: any, path: string) => {
  // Nếu đang ở trang giỏ hàng rồi thì bỏ qua hiệu ứng, chỉ điều hướng bình thường (hoặc đứng im)
  if (path === '/customer/cart' && history.location.pathname !== '/customer/cart') {
    const transitionEl = document.createElement('div');
    transitionEl.id = 'global-cart-transition';
    transitionEl.className = 'global-cart-transition';
    transitionEl.innerHTML = `
      <div class="cart-icon">🛒</div>
      <h2>Chốt đơn! Chốt đơn!</h2>
    `;
    document.body.appendChild(transitionEl);
    
    // Kích hoạt animation fade in (mất 0.2s)
    setTimeout(() => {
      transitionEl.classList.add('active');
    }, 10);
    
    // Đợi 0.4s để người dùng đọc được chữ, sau đó push URL
    setTimeout(() => {
      history.push(path);
      
      // Đợi trang giỏ hàng render (0.2s) rồi bắt đầu fade out
      setTimeout(() => {
        transitionEl.classList.remove('active');
        // Đợi thêm 0.2s cho hiệu ứng fade out kết thúc rồi xóa
        setTimeout(() => transitionEl.remove(), 200); 
      }, 200);
    }, 400); 
  } else {
    history.push(path);
  }
};
