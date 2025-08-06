
import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useReservation } from '../context/ReservationContext';

interface ProductCardProps {
  product: Product;
  onProductSelect: (id: number) => void;
  onNotifyMeClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect, onNotifyMeClick }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { addReservation, hasUserReserved } = useReservation();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };
  
  const handleNotifyClick = () => {
      if (currentUser && !hasUserReserved(product.id, currentUser.id)) {
          addReservation(product.id, currentUser.id);
      }
      onNotifyMeClick(product);
  }

  const isOutOfStock = product.stock <= 0;
  const canAddToCart = !isOutOfStock;

  const userHasReserved = currentUser ? hasUserReserved(product.id, currentUser.id) : false;

  const renderButton = () => {
    if (isOutOfStock) {
        if (userHasReserved) {
            return (
                <button
                    onClick={() => onNotifyMeClick(product)}
                    className="px-4 py-2 rounded-md font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors"
                >
                    Réservation confirmée
                </button>
            );
        }
        return (
            <button onClick={handleNotifyClick} className="px-4 py-2 rounded-md font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                Me notifier
            </button>
        );
    }

    return (
        <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`px-4 py-2 rounded-md font-semibold text-white transition-all duration-300 ${isAdded ? 'bg-green-500' : 'bg-gray-800 hover:bg-rose-500'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isAdded ? 'Ajouté !' : 'Ajouter'}
        </button>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col ${isOutOfStock ? 'opacity-90' : ''}`}>
      <button 
        className="relative block" 
        onClick={() => onProductSelect(product.id)}
        aria-label={`Voir les détails pour ${product.name}`}
      >
        <img src={product.imageUrls[0]} alt={product.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        {isOutOfStock && (
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">RUPTURE DE STOCK</div>
        )}
      </button>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 h-12 overflow-hidden flex-grow">{product.description.substring(0, 100)}...</p>
        <div className="flex justify-between items-center mt-auto pt-4">
          <p className="text-2xl font-bold text-rose-500">{product.price.toLocaleString('fr-FR')} FCFA</p>
          {currentUser?.role !== 'admin' && renderButton()}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
