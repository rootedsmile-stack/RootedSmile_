import { useState, useEffect } from 'react';
import CheckoutModal from './CheckoutModal';

export default function CheckoutModalWrapper() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const handleOpenCheckout = (e: any) => {
      console.log('CheckoutModalWrapper received event:', e.detail);
      setCheckoutData(e.detail);
      setShowCheckout(true);
    };
    
    window.addEventListener('openCheckout', handleOpenCheckout);
    
    return () => {
      window.removeEventListener('openCheckout', handleOpenCheckout);
    };
  }, []);

  if (!showCheckout || !checkoutData) return null;

  return (
    <CheckoutModal
      isOpen={showCheckout}
      onClose={() => setShowCheckout(false)}
      items={checkoutData.items}
      total={checkoutData.total}
    />
  );
}
