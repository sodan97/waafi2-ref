
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS as initialProducts } from '../constants';
import { useReservation } from './ReservationContext';
import { useNotification } from './NotificationContext';

interface ProductContextType {
  products: Product[];
  activeProducts: Product[];
  updateProductStock: (productId: number, newStock: number) => void;
  addProduct: (productData: Omit<Product, 'id' | 'status'>) => void;
  updateProductStatus: (productId: number, status: 'active' | 'archived') => void;
  editProduct: (productId: number, productData: Omit<Product, 'id' | 'status'>) => void;
  deleteProduct: (productId: number) => void; // Soft delete
  restoreProduct: (productId: number) => void;
  permanentlyDeleteProduct: (productId: number) => void; // Hard delete
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_KEY = 'belleza-products';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_KEY);
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.every(p => 'status' in p)) {
            return parsed;
        }
      }
      return initialProducts.map(p => ({ ...p, status: p.status || 'active' }));
    } catch (error) {
      console.error("Failed to load products from local storage, using initial data.", error);
      return initialProducts.map(p => ({ ...p, status: p.status || 'active' }));
    }
  });

  const { getReservationsByProduct, removeReservationsForProduct } = useReservation();
  const { addNotification } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products to local storage", error);
    }
  }, [products]);

  const activeProducts = products.filter(p => p.status === 'active');

  const updateProductStock = (productId: number, newStock: number) => {
    const safeNewStock = Math.max(0, newStock);

    setProducts(prevProducts => {
        const oldProduct = prevProducts.find(p => p.id === productId);
        const newProducts = prevProducts.map(p =>
            p.id === productId ? { ...p, stock: safeNewStock } : p
        );

        if (oldProduct && oldProduct.stock <= 0 && safeNewStock > 0) {
            const reservations = getReservationsByProduct(productId);
            if (reservations.length > 0) {
                reservations.forEach(reservation => {
                    addNotification({
                        userId: reservation.userId,
                        message: `Bonne nouvelle ! Le produit "${oldProduct.name}" que vous attendiez est de nouveau en stock.`,
                        productId: oldProduct.id,
                    });
                });
                removeReservationsForProduct(productId);
            }
        }
        return newProducts;
    });
  };
  
  const addProduct = (productData: Omit<Product, 'id' | 'status'>) => {
    setProducts(prevProducts => {
        const newId = prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) + 1 : 1;
        const newProduct: Product = {
            id: newId,
            ...productData,
            status: 'active',
        };
        return [...prevProducts, newProduct];
    });
  };
  
  const updateProductStatus = (productId: number, status: 'active' | 'archived') => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, status } : p
      )
    );
  };

  const editProduct = (productId: number, productData: Omit<Product, 'id' | 'status'>) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, ...productData, id: productId } : p
      )
    );
  };

  const deleteProduct = (productId: number) => { // Soft delete
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, status: 'deleted' } : p
      )
    );
  };

  const restoreProduct = (productId: number) => {
    setProducts(prevProducts =>
        prevProducts.map(p =>
            p.id === productId ? { ...p, status: 'active' } : p
        )
    );
  };

  const permanentlyDeleteProduct = (productId: number) => { // Hard delete
    removeReservationsForProduct(productId);
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const value = {
    products, 
    activeProducts, 
    updateProductStock, 
    addProduct, 
    updateProductStatus, 
    editProduct, 
    deleteProduct, 
    restoreProduct, 
    permanentlyDeleteProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
