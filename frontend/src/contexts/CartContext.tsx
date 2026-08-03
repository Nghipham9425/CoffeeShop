import { CheckCircle2, X } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PublicProduct } from "../lib/publicApi";

const CART_STORAGE_KEY = "phu_tai_cart";

export type CartItem = {
  productId: number;
  name: string;
  imageUrl: string | null;
  price: number;
  unit: string;
  quantity: number;
  minimumOrderKg: number;
  stockQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: PublicProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  syncStock: (products: PublicProduct[]) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem(product, quantity = 1) {
        const price = product.price;
        if (!price) return;
        if (product.stockQuantity <= 0) {
          setNotice(`${product.name} hiện đã hết hàng.`);
          return;
        }

        setItems((current) => {
          const existing = current.find((item) => item.productId === product.id);

          if (existing) {
            return current.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    stockQuantity: product.stockQuantity,
                    quantity: Math.min(product.stockQuantity, item.quantity + quantity),
                  }
                : item,
            );
          }

          return [
            ...current,
            {
              productId: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              price,
              unit: product.unit,
              quantity: Math.min(product.stockQuantity, quantity),
              minimumOrderKg: product.minimumOrderKg,
              stockQuantity: product.stockQuantity,
            },
          ];
        });
        setNotice(`Đã thêm ${product.name} vào giỏ hàng.`);
      },
      updateQuantity(productId, quantity) {
        setItems((current) =>
          current
            .map((item) => item.productId === productId
              ? { ...item, quantity: Math.min(item.stockQuantity ?? quantity, Math.max(1, quantity)) }
              : item)
            .filter((item) => item.quantity > 0),
        );
      },
      syncStock(products) {
        const productById = new Map(products.map((product) => [product.id, product]));
        setItems((current) => current.map((item) => {
          const product = productById.get(item.productId);
          if (!product) return { ...item, stockQuantity: 0 };
          return {
                    ...item,
                    imageUrl: product.imageUrl,
                    stockQuantity: product.stockQuantity,
            quantity: product.stockQuantity > 0 ? Math.min(item.quantity, product.stockQuantity) : item.quantity,
          };
        }));
      },
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all duration-200 ${notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 shadow-xl">
          <CheckCircle2 className="shrink-0 text-emerald-700" size={21} />
          <span className="min-w-0 flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-stone-500 hover:bg-stone-100" aria-label="Đóng thông báo">
            <X size={17} />
          </button>
        </div>
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
