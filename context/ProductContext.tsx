
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Product, ApiError } from '../types';
import { PRODUCTS } from '../constants';
import { useReservation } from './ReservationContext';
import { useNotification } from './NotificationContext'; // Keep dependency if product stock updates affect notifications

interface ProductContextType {
  products: Product[];
  activeProducts: Product[];
  isLoadingProducts: boolean;
  productError: ApiError | null;
  fetchProducts: () => Promise<void>;
  updateProductStock: (productId: number, newStock: number) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'status'>) => Promise<Product | null>;
  updateProductStatus: (productId: number, status: 'active' | 'archived') => Promise<void>;
  editProduct: (productId: number, productData: Omit<Product, 'id' | 'status'>) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>; // Soft delete
  restoreProduct: (productId: number) => Promise<void>;
  permanentlyDeleteProduct: (productId: number) => Promise<void>; // Hard delete
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [productError, setProductError] = useState<ApiError | null>(null);

  const { getReservationsByProduct, removeReservationsForProduct } = useReservation();
  const { addNotification } = useNotification();

  // Use local products data instead of backend
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(PRODUCTS);
      console.log('Products loaded from local data:', PRODUCTS);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
      console.error('Error details:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    console.log('useEffect in ProductContext is running');
    fetchProducts();
  }, [fetchProducts]);

  const activeProducts = products.filter(p => p.status === 'active');
  
  const updateStateAfterOperation = useCallback((updatedProduct?: Product | null) => {
    if (updatedProduct) {
      setProducts(prevProducts =>
        prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    } else {
      fetchProducts();
    }
  }, [fetchProducts]);

  const updateProductStock = useCallback(async (productId: number, newStock: number) => {
    setIsLoadingProducts(true);
    setProductError(null);
    const safeNewStock = Math.max(0, newStock);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setProducts(prevProducts => {
          const oldProduct = prevProducts.find(p => p.id === productId);
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
          return prevProducts.map(p => 
            p.id === productId ? { ...p, stock: safeNewStock } : p);
      });

    } catch (error) {
      console.error('Error updating product stock:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoadingProducts(false);
 }
  }, [getReservationsByProduct, addNotification, removeReservationsForProduct, fetchProducts]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'status'>) => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newId = Math.max(...products.map(p => p.id)) + 1;
      const newProduct: Product = {
        ...productData,
        id: newId,
        status: 'active'
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
      return null;
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const editProduct = useCallback(async (productId: number, productData: Omit<Product, 'id' | 'status'>) => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, ...productData } : p
        )
      );
    } catch (error) {
      console.error('Error editing product:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [updateStateAfterOperation]);

 const updateProductStatus = useCallback(async (productId: number, status: 'active' | 'archived') => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, status } : p
        )
      );
    } catch (error) {
      console.error('Error updating product status:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [updateStateAfterOperation]);
  const deleteProduct = useCallback(async (productId: number) => { // Soft delete
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, status: 'deleted' } : p
        )
      );
    } catch (error) {
      console.error('Error soft-deleting product:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [updateStateAfterOperation]);

  const restoreProduct = useCallback(async (productId: number) => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, status: 'active' } : p
        )
      );
    } catch (error) {
      console.error('Error restoring product:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [updateStateAfterOperation]);

  const permanentlyDeleteProduct = useCallback(async (productId: number) => { // Hard delete
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      removeReservationsForProduct(productId); // Keep context dependency
    } catch (error) {
      console.error('Error permanently deleting product:', error);
      setProductError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [removeReservationsForProduct]); // Add dependency

  const value = {
    products,
    activeProducts,
    isLoadingProducts,
    productError,
    fetchProducts,
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
