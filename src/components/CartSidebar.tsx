import { useContext, useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { CartContext, cartStore } from './cart/CartContext';
import CheckoutModal from './CheckoutModal';

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const cartState = useStore(cartStore);
  const { removeItem, updateQuantity, getTotal } = useContext(CartContext);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener('openCart', handleOpen);
    window.addEventListener('closeCart', handleClose);
    
    return () => {
      window.removeEventListener('openCart', handleOpen);
      window.removeEventListener('closeCart', handleClose);
    };
  }, []);

  useEffect(() => {
    const handleOpenCheckout = (e: any) => {
      setShowCheckout(true);
      setIsOpen(false);
    };
    
    window.addEventListener('openCheckout', handleOpenCheckout);
    
    return () => {
      window.removeEventListener('openCheckout', handleOpenCheckout);
    };
  }, []);

  const handleCheckout = () => {
    setShowCheckout(true);
    setIsOpen(false);
  };

  const total = getTotal();
  const itemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[998] transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-soft-white shadow-2xl z-[999] transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-warm-beige bg-white flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold text-primary-teal">
            Your Cart ({itemCount})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-primary-teal hover:text-terracotta transition p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartState.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">🛒</div>
              <h​​​​​​​​​​​​​​​​
