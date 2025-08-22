import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { MERCHANT_WHATSAPP_NUMBER } from '../constants';

interface CheckoutFormProps {
  onOrderSuccess: (whatsappUrl: string, orderId: string) => void;
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
  const [errors, setErrors] = useState({
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
    // Clear previous error for the field when it's changed
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const validateForm = () => {
    const newErrors = { firstName: '', lastName: '', address: '', phone: '' };
    let isValid = true;

    // First Name validation: only letters and spaces, not empty
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis.';
      isValid = false;
    } else if (!/^[a-zA-Z\sÀàÂâÄäÈèÉéÊêËëÎîÏïÔôÖöÙùÛûÜüÇç'-]+$/.test(formData.firstName)) {
       newErrors.firstName = 'Le prénom ne doit contenir que des lettres.';
       isValid = false;
    }

    // Last Name validation: only letters and spaces, not empty
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis.';
      isValid = false;
    } else if (!/^[a-zA-Z\sÀàÂâÄäÈèÉéÊêËëÎîÏïÔôÖöÙùÛûÜüÇç'-]+$/.test(formData.lastName)) {
       newErrors.lastName = 'Le nom ne doit contenir que des lettres.';
       isValid = false;
    }

    // Phone validation: only digits, not empty
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis.';
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Le numéro de téléphone ne doit contenir que des chiffres.';
      isValid = false;
    }
     // Optional: Basic length check for phone (adjust as needed)
     // else if (formData.phone.trim().length < 8) { // Example minimum length
     //   newErrors.phone = 'Le numéro de téléphone est trop court.';
     //   isValid = false;
     // }

    // Address validation: basic check if not empty when filled
    // No specific format validation for address here, just if it's filled

    setErrors(newErrors);
    return isValid;
  };

  // Determine overall form validity based on the errors state and required fields
  const isFormValid = !errors.firstName && !errors.lastName && !errors.phone && formData.firstName.trim() !== '' && formData.lastName.trim() !== '' && formData.phone.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 if (!isFormValid || cartItems.length === 0) return;

    // Make handleSubmit async
    const submitOrder = async () => {
      const orderData = {
        customer: formData,
        items: cartItems,
        total: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        userId: currentUser ? currentUser.id : null,
      };

      // Await the addOrder function
      const newOrder = await addOrder(orderData);

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
    
      // Handle the potential undefined return value (failure)
      if (newOrder) {
        // If order succeeded, call onOrderSuccess with the new order ID
        onOrderSuccess(whatsappUrl, newOrder.id);
      } else {
        // Handle failure (e.g., show an error message to the user)
        console.error('Failed to create order via API');
      }
    };
    submitOrder(); // Call the async function
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
          <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
 {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
          <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
 {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse Complète</label>
        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ex: Cité Keur Gorgui, Lot 123, Dakar" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
 {/* No error display for optional address unless you add specific validation rules */}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Numéro de Téléphone <span className="text-red-500">*</span></label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Ex: 771234567" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
 {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
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