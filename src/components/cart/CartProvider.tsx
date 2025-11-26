import { ReactNode } from 'react';
import { CartContext, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal } from './CartContext';

interface Props {
  children: ReactNode;
}

export function CartProvider({ children }: Props) {
  const contextValue = {
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateCartQuantity,
    clearCart,
    getTotal: getCartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}
