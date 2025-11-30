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

  const handleCheckout = () => {
    const total = getTotal();
    console.log('🛒 Opening checkout with:', {
      items: cartState.items,
      total: total
    });
    
    // Dispatch event with current cart data
    window.dispatchEvent(new CustomEvent('openCheckout', { 
      detail: { 
        items: cartState.items,
        total: total
      }
    }));
    
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
              <h3 className="font-serif text-xl font-semibold text-primary-teal mb-2">
                Your cart is empty
              </h3>
              <p className="text-charcoal/60 mb-6">Add some products to get started!</p>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-primary-teal text-soft-white px-8 py-3 rounded-full font-semibold hover:bg-primary-teal/90 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartState.items.map((item, index) => (
                <div
                  key={`${item.id}-${item.size}-${index}`}
                  className="bg-white rounded-xl border border-warm-beige p-4 flex gap-4 hover:shadow-md transition"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-warm-beige to-terracotta rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-charcoal/30 font-serif">Product</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-teal mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-charcoal/60 mb-2">Size: {item.size}</p>
                    <p className="font-semibold text-primary-teal">
                      ${item.price.toFixed(2)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 bg-warm-beige rounded-full px-3 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 bg-white rounded-full text-primary-teal hover:bg-primary-teal hover:text-white transition text-sm"
                        >
                          −
                        </button>
                        <span className="font-semibold text-primary-teal w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="w-6 h-6 bg-white rounded-full text-primary-teal hover:bg-primary-teal hover:text-white transition text-sm"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-terracotta hover:text-terracotta/70 text-sm underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartState.items.length > 0 && (
          <div className="border-t border-warm-beige bg-white p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-charcoal/70">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-charcoal/70 pb-3 border-b border-warm-beige">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-serif text-xl font-bold text-primary-teal">Total</span>
                <span className="font-serif text-2xl font-bold text-primary-teal">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-primary-teal text-soft-white px-8 py-4 rounded-full font-semibold hover:bg-primary-teal/90 transition mb-3"
            >
              Proceed to Checkout
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-transparent text-primary-teal border-2 border-primary-teal px-8 py-4 rounded-full font-semibold hover:bg-primary-teal hover:text-soft-white transition"
            >
              Continue Shopping
            </button>
            
            <p className="text-xs text-center text-charcoal/50 mt-3">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        )}
      </div>

      {showCheckout && cartState.items.length > 0 && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          items={cartState.items}
          total={total}
        />
      )}
    </>
  );
}
