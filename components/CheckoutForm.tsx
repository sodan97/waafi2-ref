import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { MERCHANT_WHATSAPP_NUMBER } from '../constants';

interface CheckoutFormProps {
  onOrderSuccess: (whatsappUrl: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onOrderSuccess }) => {
  const { cartItems } = useCart();
  const { currentUser } = useAuth();
  const { addOrder } = useOrder();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      }));
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const isFormValid = formData.firstName && formData.lastName && formData.phone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    addOrder({
      customer: formData,
      items: cartItems,
      total: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
      userId: currentUser ? currentUser.id : null,
    });

    const customerInfoParts = [
      '*Nouvelle Commande de Belleza*',
      '-----------------------------',
      `*Client:* ${formData.firstName} ${formData.lastName}`,
      `*Téléphone:* ${formData.phone}`
    ];

    if (formData.address) {
      customerInfoParts.push(`*Adresse:* ${formData.address}`);
    }
    
    customerInfoParts.push('-----------------------------');
    const customerInfo = customerInfoParts.join('\n');
    const baseUrl = window.location.origin;
    const orderItems = cartItems.map(item => {
        const productUrl = `${baseUrl}/product/${item.id}`;
        return `*${item.name}* (x${item.quantity})
- Prix: ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
- Lien du produit: ${productUrl}
- Lien de l'image: ${item.imageUrls[0]}`;
    }).join('\n\n');
    
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalLine = `*TOTAL: ${totalPrice.toLocaleString('fr-FR')} FCFA*`;
    const closingMessage = `
Merci de confirmer la commande et de me communiquer les modalités de paiement et de livraison.`;
    const fullMessage = `${customerInfo}\n\n*Détails de la commande:*\n\n${orderItems}\n\n-----------------------------\n${totalLine}\n${closingMessage}`;
    const whatsappUrl = `https://wa.me/${MERCHANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
    
    onOrderSuccess(whatsappUrl);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
          <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
          <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
        </div>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse Complète</label>
        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ex: Cité Keur Gorgui, Lot 123, Dakar" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Numéro de Téléphone <span className="text-red-500">*</span></label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Ex: 771234567" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
      </div>
      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={!isFormValid || cartItems.length === 0}
          className="w-full sm:w-auto bg-rose-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-rose-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Commander via WhatsApp
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;