
import React, { useState, useMemo } from 'react';
import { useProduct } from '../context/ProductContext';
import { Product } from '../types';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const { editProduct, products } = useProduct();
  const [formData, setFormData] = useState({
    name: product.name,
    price: String(product.price),
    description: product.description,
    category: product.category,
    stock: String(product.stock),
  });
  const [images, setImages] = useState<string[]>(product.imageUrls);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const existingCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          files.forEach(file => {
              if (file.size > 2 * 1024 * 1024) { // 2MB limit
                  setError(`L'image "${file.name}" est trop volumineuse (max 2MB).`);
                  return;
              }
              const reader = new FileReader();
              reader.onload = (event) => {
                  if (event.target?.result) {
                      setImages(prev => [...prev, event.target!.result as string]);
                  }
              };
              reader.readAsDataURL(file);
          });
      }
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim() && (imageUrl.startsWith('http') || imageUrl.startsWith('data:image'))) {
        setImages(prev => [...prev, imageUrl.trim()]);
        setImageUrl('');
        setError('');
    } else {
        setError("Veuillez entrer une URL d'image valide.");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
      setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Object.values(formData).some(value => String(value).trim() === '')) {
        setError('Tous les champs de texte sont requis.');
        return;
    }
    
    if (images.length === 0) {
        setError("Veuillez ajouter au moins une image pour le produit.");
        return;
    }
    
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
        setError('Le prix doit être un nombre positif.');
        return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
        setError('Le stock doit être un nombre entier positif ou nul.');
        return;
    }

    const updatedProductData: Omit<Product, 'id' | 'status'> = {
      name: formData.name,
      price: priceNum,
      description: formData.description,
      category: formData.category,
      stock: stockNum,
      imageUrls: images,
    };

    editProduct(product.id, updatedProductData);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Modifier le produit</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}
          
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Nom du produit" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" name="price" placeholder="Prix (FCFA)" value={formData.price} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                    <input type="number" name="stock" placeholder="Stock initial" value={formData.stock} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                </div>

                <div>
                    <input list="categories" name="category" placeholder="Catégorie (existante ou nouvelle)" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                    <datalist id="categories">
                        {existingCategories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                    <label className="block text-sm font-medium text-gray-700">Images du produit</label>
                    <div className="flex items-center gap-2">
                         <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Coller une URL d'image" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"/>
                         <button type="button" onClick={handleAddImageUrl} className="px-4 py-2 rounded-md font-semibold text-white bg-slate-600 hover:bg-slate-700 transition-colors flex-shrink-0">Ajouter URL</button>
                    </div>
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div><span className="flex-shrink mx-4 text-gray-500 text-xs">OU</span><div className="flex-grow border-t border-gray-300"></div>
                    </div>
                     <div>
                        <label htmlFor="file-upload" className="w-full cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-sm text-gray-600 hover:border-rose-400 hover:bg-rose-50 transition-colors">
                           <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           <span className="mt-2">Téléverser des images (max 2MB)</span>
                        </label>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                    </div>
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                            {images.map((imgSrc, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={imgSrc} alt={`Aperçu ${index+1}`} className="w-full h-full object-cover rounded-md border" />
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Supprimer l'image">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-md font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                        Annuler
                    </button>
                    <button type="submit" className="px-6 py-2 rounded-md font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors">
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
