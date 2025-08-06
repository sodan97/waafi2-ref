
import React, { useMemo } from 'react';
import { useProduct } from '../context/ProductContext';

interface CategoryListProps {
    onSelectCategory: (category: string) => void;
}

const CategoryCard: React.FC<{ category: { name: string; imageUrl: string }; onClick: () => void }> = ({ category, onClick }) => (
    <div 
        onClick={onClick}
        className="relative rounded-lg overflow-hidden shadow-lg h-48 cursor-pointer group transform hover:-translate-y-1 transition-transform duration-300"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
        <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-colors duration-300 flex items-center justify-center">
            <h3 className="text-white text-2xl font-bold text-center p-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{category.name}</h3>
        </div>
    </div>
);

const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
  const { activeProducts } = useProduct();

  const categories = useMemo(() => {
      const categoryMap: Record<string, { name: string; imageUrl: string; productCount: number }> = {};
      const preferredOrder = ["Produits Cosmétiques & Accessoires", "Électronique"];
      
      activeProducts.forEach(product => {
          if (!categoryMap[product.category]) {
              categoryMap[product.category] = {
                  name: product.category,
                  imageUrl: product.imageUrls[0],
                  productCount: 0
              };
          }
          categoryMap[product.category].productCount++;
      });
      
      const allCategoryNames = Object.keys(categoryMap);
      
      const sortedNames = [...preferredOrder, ...allCategoryNames.filter(c => !preferredOrder.includes(c))];

      return sortedNames
        .map(name => categoryMap[name])
        .filter(Boolean); // Ensure no undefined categories are passed
  }, [activeProducts]);


  return (
    <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 border-l-4 border-rose-500 pl-4">Nos Catégories</h2>
        <p className="text-md text-gray-500 mb-8 pl-5">Parcourez nos collections par catégorie.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {categories.map(category => (
                <CategoryCard key={category.name} category={category} onClick={() => onSelectCategory(category.name)} />
            ))}
        </div>
    </div>
  );
};

export default CategoryList;