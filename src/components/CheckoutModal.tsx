import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    size: string;
  }>;
  total: number;
}

function CheckoutForm({ onSuccess, total }: { onSuccess: () => void; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-warm-beige/30 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-charcoal/70">Total Amount</span>
          <span className="text-2xl font-serif font-bold text-primary-teal">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <PaymentElement />

      {message && (
        <div className="p-4 bg-terracotta/10 border border-terracotta rounded-xl">
          <p className="text-terracotta text-sm">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-primary-teal text-soft-white px-8 py-4 rounded-full font-semibold hover:bg-primary-teal/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>

      <p className="text-xs text-center text-charcoal/50">
        🔒 Secure payment powered by Stripe
      </p>
    </form>
  );
}

export default function CheckoutModal({ isOpen, onClose, items, total }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && items.length > 0) {
      createPaymentIntent();
    }
  }, [isOpen, items]);

  const createPaymentIntent = async () => {
    setIsLoadingIntent(true);
    setError('');

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
          })),
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoadingIntent(false);
    }
  };

  const handleSuccess = async () => {
    try {
      const { db } = await import('../lib/firebase/client');
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      
      await addDoc(collection(db, 'orders'), {
        items: items,
        total: total,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }

    window.location.href = '/success';
  };

  if (!isOpen) return null;

  const appearance = {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#004F54',
      colorBackground: '#FCF7F2',
      colorText: '#1F2933',
      colorDanger: '#C26A4A',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-soft-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-soft-white border-b border-warm-beige px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <h2 className="font-serif text-3xl font-bold text-primary-teal">
            Secure Checkout
          </h2>
          <button
            onClick={onClose}
            className="text-primary-teal hover:text-terracotta transition p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-6">
          <div className="mb-6">
            <h3 className="font-serif text-xl font-semibold text-primary-teal mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-charcoal/60">
                      {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-primary-teal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {isLoadingIntent ? (
            <div className="py-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-charcoal/70">Initializing secure payment...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-terracotta mb-4">{error}</p>
              <button
                onClick={createPaymentIntent}
                className="text-primary-teal hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm onSuccess={handleSuccess} total={total} />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
}
