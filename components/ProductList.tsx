
import React from 'react';
import ProductCard from './ProductCard';
import { useProduct } from '../context/ProductContext';
import { Product } from '../types';

interface ProductListProps {
  category: string;
  onProductSelect: (id: number) => void;
  onNotifyMeClick: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ category, onProductSelect, onNotifyMeClick }) => {
  const { activeProducts: allProducts } = useProduct();
  const products = allProducts.filter(p => p.category === category);

  return (
    <div className="mt-2">
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 border-l-4 border-rose-500 pl-4">{category}</h2>
        <p className="text-md text-gray-500 mb-8 pl-5">Découvrez tous les produits de la catégorie {category}.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onProductSelect={onProductSelect} 
              onNotifyMeClick={onNotifyMeClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;