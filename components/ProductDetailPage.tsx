
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftIcon } from '../constants';

interface ProductDetailPageProps {
    productId: number;
    onBack: () => void;
    navigateToProductPage: (id: number) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onBack, navigateToProductPage }) => {
    const { products, activeProducts } = useProduct();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const [isAdded, setIsAdded] = useState(false);

    const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);
    const [selectedImage, setSelectedImage] = useState(product?.imageUrls[0] || '');

    useEffect(() => {
        if (product) {
            setSelectedImage(product.imageUrls[0]);
            // Scroll to top when product changes
            window.scrollTo(0, 0);
        }
    }, [product]);

    if (!product || product.status === 'deleted') {
        return (
            <div className="text-center py-20">
                <p className="text-xl text-gray-600">Produit non trouvé.</p>
                <button onClick={onBack} className="mt-4 text-rose-600 hover:underline">Retourner à la boutique</button>
            </div>
        );
    }
    
    const isUnavailable = product.status === 'archived'; // 'deleted' status is handled by the check above
    const isOutOfStock = product.stock <= 0;
    const canAddToCart = !isOutOfStock && !isUnavailable;

    const handleAddToCart = () => {
        if (!canAddToCart) return;
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const recommendedProducts = activeProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

    return (
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl animate-fadeIn">
             <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-rose-600 font-semibold mb-6">
                <ArrowLeftIcon className="w-5 h-5" />
                Retour
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div>
                    <div className="w-full h-96 bg-gray-100 rounded-lg shadow-inner flex items-center justify-center mb-4 overflow-hidden relative">
                        <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                         {isUnavailable && (
                            <div className="absolute top-4 left-4 bg-yellow-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">ARCHIVÉ</div>
                        )}
                    </div>
                    <div className="flex gap-2 justify-center">
                        {product.imageUrls.map((img, index) => (
                            <button 
                                key={index} 
                                onClick={() => setSelectedImage(img)}
                                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-rose-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-rose-500 uppercase tracking-wider">{product.category}</span>
                    <h1 className="text-4xl font-bold text-gray-800 my-3">{product.name}</h1>
                    <p className="text-gray-600 text-base leading-relaxed mb-6">{product.description}</p>
                    
                    <div className="mt-auto">
                        <p className="text-4xl font-bold text-gray-800 mb-6">
                            {product.price.toLocaleString('fr-FR')} <span className="text-3xl text-rose-500">FCFA</span>
                        </p>
                        
                        {currentUser?.role !== 'admin' && (
                            <>
                                {isUnavailable ? (
                                    <div className="w-full py-3 px-6 text-center rounded-lg bg-gray-200 text-gray-600 font-bold">
                                        Actuellement indisponible
                                    </div>
                                ) : isOutOfStock ? (
                                    <div className="w-full py-3 px-6 text-center rounded-lg bg-red-100 text-red-700 font-bold">
                                        En rupture de stock
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!canAddToCart}
                                        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl ${isAdded ? 'bg-green-500' : 'bg-rose-500 hover:bg-rose-600'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                    >
                                        {isAdded ? 'Ajouté au panier !' : 'Ajouter au panier'}
                                    </button>
                                )}
                                {/* La ligne affichant le stock disponible a été retirée, comme demandé. */}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
                <div className="mt-20 pt-10 border-t">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Vous pourriez aussi aimer</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                         {recommendedProducts.map(recProduct => (
                            <div key={recProduct.id} onClick={() => navigateToProductPage(recProduct.id)} className="cursor-pointer">
                                 <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group">
                                    <div className="relative">
                                        <img src={recProduct.imageUrls[0]} alt={recProduct.name} className="w-full h-48 object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-md font-semibold text-gray-800 truncate">{recProduct.name}</h3>
                                        <p className="text-lg font-bold text-rose-500 mt-2">{recProduct.price.toLocaleString('fr-FR')} FCFA</p>
                                    </div>
                                </div>
                            </div>
                         ))}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;