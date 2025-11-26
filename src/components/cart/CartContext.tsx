import { createContext } from 'react';
import { atom } from 'nanostores';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

export const cartStore = atom<CartState>({ items: [] });

export const CartContext = createContext({
  addItem: (item: CartItem) => {},
  removeItem: (id: string, size: string) => {},
  updateQuantity: (id: string, size: string, quantity: number) => {},
  clearCart: () => {},
  getTotal: () => 0,
});

export const addToCart = (item: CartItem) => {
  const state = cartStore.get();
  const existingItemIndex = state.items.findIndex(
    (i) => i.id === item.id && i.size === item.size
  );

  if (existingItemIndex > -1) {
    const newItems = [...state.items];
    newItems[existingItemIndex].quantity += item.quantity;
    cartStore.set({ items: newItems });
  } else {
    cartStore.set({ items: [...state.items, item] });
  }
};

export const removeFromCart = (id: string, size: string) => {
  const state = cartStore.get();
  cartStore.set({
    items: state.items.filter((item) => !(item.id === id && item.size === size)),
  });
};

export const updateCartQuantity = (id: string, size: string, quantity: number) => {
  const state = cartStore.get();
  const newItems = state.items.map((item) =>
    item.id === id && item.size === size ? { ...item, quantity } : item
  );
  cartStore.set({ items: newItems });
};

export const clearCart = () => {
  cartStore.set({ items: [] });
};

export const getCartTotal = () => {
  const state = cartStore.get();
  return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
};
