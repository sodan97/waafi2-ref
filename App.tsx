
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import CartView from './components/CartView';
import ProductDetailPage from './components/ProductDetailPage';
import { Product } from './types';
import HeroCarousel from './components/HeroCarousel';
import CategoryList from './components/CategoryList';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminPage from './components/AdminPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import NotificationOptionsModal from './components/NotificationOptionsModal';
import { useAuth } from './context/AuthContext';
import { useReservation } from './context/ReservationContext';
import NavigationControls from './components/NavigationControls';

export type View = 'products' | 'cart' | 'login' | 'register' | 'admin' | 'orders';

interface HistoryState {
  view: View;
  selectedCategory: string | null;
}

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryState[]>([{ view: 'products', selectedCategory: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [notificationOptionsProduct, setNotificationOptionsProduct] = useState<Product | null>(null);
  const [pendingReservationProductId, setPendingReservationProductId] = useState<number | null>(null);
  
  const { currentUser } = useAuth();
  const { addReservation } = useReservation();
  const prevUserRef = useRef(currentUser);

  useEffect(() => {
    const prevUser = prevUserRef.current;
    if (!prevUser && currentUser) {
      // On login, reset history
      const initialView = currentUser.role === 'admin' ? 'admin' : 'products';
      const initialHistoryState: HistoryState = { view: initialView, selectedCategory: null };
      setHistory([initialHistoryState]);
      setHistoryIndex(0);

      if (pendingReservationProductId) {
        addReservation(pendingReservationProductId, currentUser.id);
        setPendingReservationProductId(null);
      }
    } else if (prevUser && !currentUser) {
      // On logout, reset history
      const initialHistoryState: HistoryState = { view: 'products', selectedCategory: null };
      setHistory([initialHistoryState]);
      setHistoryIndex(0);
    }
    prevUserRef.current = currentUser;
  }, [currentUser, pendingReservationProductId, addReservation]);

  const { view, selectedCategory } = history[historyIndex] || { view: 'products', selectedCategory: null };

  const navigate = (location: HistoryState) => {
    const currentLocation = history[historyIndex];
    if (location.view === currentLocation.view && location.selectedCategory === currentLocation.selectedCategory) {
      return;
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(location);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  };
  
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const setView = (view: View) => {
    setSelectedProductId(null); // Fix: Always clear product detail view when changing main view
    navigate({ view, selectedCategory: null });
  };

  const handleSelectCategory = (category: string) => {
    navigate({ view: 'products', selectedCategory: category });
  };
  
  const handleLogoClick = () => {
    setSelectedProductId(null);
     if (currentUser?.role === 'admin') {
      navigate({ view: 'admin', selectedCategory: null });
    } else {
      navigate({ view: 'products', selectedCategory: null });
    }
  };

  const navigateToProductPage = (id: number) => {
    setSelectedProductId(id);
  };
  
  const handleContinueShopping = () => {
    navigate({ view: 'products', selectedCategory: null });
  }

  const renderContent = () => {
    if (selectedProductId) {
      return <ProductDetailPage productId={selectedProductId} onBack={() => setSelectedProductId(null)} navigateToProductPage={navigateToProductPage} />;
    }

    switch(view) {
      case 'login':
        return <LoginPage setView={setView} />;
      case 'register':
        return <RegisterPage setView={setView} />;
      case 'admin':
        return currentUser?.role === 'admin' ? <AdminPage /> : <p>Accès non autorisé.</p>;
      case 'orders':
        return currentUser ? <OrderHistoryPage /> : <LoginPage setView={setView} />;
      case 'cart':
        if (currentUser?.role === 'admin') {
            return <p className="text-center text-xl">L'accès au panier est réservé aux clients.</p>;
        }
        return <CartView onContinueShopping={handleContinueShopping} />;
      case 'products':
      default:
        if (currentUser?.role === 'admin') {
            return <AdminPage />;
        }
        if (selectedCategory) {
          return <ProductList category={selectedCategory} onProductSelect={navigateToProductPage} onNotifyMeClick={setNotificationOptionsProduct} />;
        }
        return (
          <>
            <HeroCarousel />
            <CategoryList onSelectCategory={handleSelectCategory} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header setView={setView} onLogoClick={handleLogoClick} navigateToProductPage={navigateToProductPage} />
      <main className="container mx-auto px-4 py-8">
        {!selectedProductId && (
             <NavigationControls
                onBack={goBack}
                onForward={goForward}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
             />
        )}
        {renderContent()}
      </main>
      <footer className="text-center py-6 bg-white border-t mt-12">
          <p className="text-gray-500">&copy; 2025 Wafi. Tous droits réservés.</p>
      </footer>
      {notificationOptionsProduct && (
        <NotificationOptionsModal
          product={notificationOptionsProduct}
          onClose={() => setNotificationOptionsProduct(null)}
          setView={setView}
          setPendingReservation={setPendingReservationProductId}
        />
      )}
    </div>
  );
};

export default App;