import React from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  // Gère la fermeture sur appui de la touche "Echap"
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all scale-95 duration-300 ease-out"
        style={{ animation: 'zoomIn 0.3s ease-out forwards' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 z-10"
              aria-label="Fermer la fenêtre modale"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <img src={product.imageUrls[0]} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-md" />
              </div>
              <div className="flex flex-col justify-center py-4">
                <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
                <p className="text-gray-600 mt-4 text-base">{product.description}</p>
                <p className="text-3xl font-bold text-rose-500 mt-6">
                  {product.price.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProductModal;