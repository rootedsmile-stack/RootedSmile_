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
          <span className="text-2xl font-serif font​​​​​​​​​​​​​​​​
