
import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CartIcon, BellIcon } from '../constants';
import { View } from '../App';

interface HeaderProps {
  setView: (view: View) => void;
  onLogoClick: () => void;
  navigateToProductPage: (productId: number) => void;
}

const Header: React.FC<HeaderProps> = ({ setView, onLogoClick, navigateToProductPage }) => {
  const { itemCount } = useCart();
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setView('products');
  };

  const handleNotificationToggle = () => {
    setIsNotificationOpen(prev => !prev);
    if (!isNotificationOpen) {
        markAsRead();
    }
  };

  const handleNotificationClick = (productId: number) => {
    navigateToProductPage(productId);
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 
          className="text-3xl font-bold text-rose-500 cursor-pointer" 
          onClick={onLogoClick}
          style={{textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}
        >
          Wafi
        </h1>
        <div className="flex items-center gap-3 sm:gap-5">
          {currentUser ? (
            <div className="flex items-center gap-4 text-sm sm:text-base">
              <span className="hidden sm:inline">Bonjour, {currentUser.firstName}</span>
              {currentUser.role === 'admin' && (
                 <button onClick={() => setView('admin')} className="font-semibold text-gray-700 hover:text-rose-600">Admin</button>
              )}
              {currentUser.role !== 'admin' && (
                <button onClick={() => setView('orders')} className="font-semibold text-gray-700 hover:text-rose-600">Mes Commandes</button>
              )}
              <button onClick={handleLogout} className="font-semibold text-gray-700 hover:text-rose-600">Déconnexion</button>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm sm:text-base">
              <button onClick={() => setView('login')} className="font-semibold text-gray-700 hover:text-rose-600">Connexion</button>
              <button onClick={() => setView('register')} className="px-3 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors">S'inscrire</button>
            </div>
          )}

          <div className="relative" ref={notificationRef}>
            <button
                onClick={handleNotificationToggle}
                className="relative text-gray-700 hover:text-rose-600 transition-colors"
                aria-label="Voir les notifications"
            >
                <BellIcon className="w-8 h-8"/>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
            </button>
            {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-30">
                    <h4 className="font-bold text-gray-800 mb-2">Notifications</h4>
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">Aucune notification.</p>
                    ) : (
                        <ul className="max-h-96 overflow-y-auto space-y-2">
                            {notifications.map(notif => (
                                <li key={notif.id} className={`p-2 rounded-md ${!notif.read ? 'bg-rose-50' : ''}`}>
                                    <button onClick={() => handleNotificationClick(notif.productId)} className="text-left w-full text-sm text-gray-700 hover:text-black">
                                        {notif.message}
                                        <span className="block text-xs text-gray-400 mt-1">{new Date(notif.date).toLocaleString('fr-FR')}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
          </div>

          {currentUser?.role !== 'admin' && (
            <button 
              onClick={() => setView('cart')}
              className="relative text-gray-700 hover:text-rose-600 transition-colors"
              aria-label="Voir le panier"
            >
              <CartIcon className="w-8 h-8" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
