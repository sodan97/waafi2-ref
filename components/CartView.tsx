
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { TrashIcon, PlusIcon, MinusIcon } from '../constants';
import CheckoutForm from './CheckoutForm';
import { QRCodeCanvas } from 'qrcode.react';

interface CartViewProps {
  onContinueShopping: () => void;
}

const CartView: React.FC<CartViewProps> = ({ onContinueShopping }) => {
  const { cartItems, updateQuantity, removeFromCart, itemCount, clearCart } = useCart();
  const [checkoutState, setCheckoutState] = useState<{ isSubmitted: boolean; whatsappUrl: string; }>({ 
    isSubmitted: false, 
    whatsappUrl: '' 
  });

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleOrderSuccess = (whatsappUrl: string) => {
    setCheckoutState({ isSubmitted: true, whatsappUrl });
    clearCart();
  };

  if (checkoutState.isSubmitted) {
    return (
        <div className="text-center bg-green-50 p-6 sm:p-8 rounded-lg transition-all duration-500 ease-in-out border border-green-200 max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-green-800">Commande envoyée !</h3>
            <p className="mt-2 text-gray-700">Votre commande a été enregistrée. Scannez ce QR code ou cliquez sur le bouton pour finaliser sur WhatsApp.</p>
            <div className="my-6 flex justify-center bg-white p-4 rounded-lg shadow-inner">
                <QRCodeCanvas value={checkoutState.whatsappUrl} size={200} fgColor="#15803d" />
            </div>
            <p className="text-gray-600 mb-4 text-sm">Ou, si vous avez WhatsApp sur cet appareil :</p>
            <a
                href={checkoutState.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.398 1.919 6.335l-1.251 4.565 4.659-1.225zM12 21.056c-1.776 0-3.518-.591-4.965-1.742l-.357-.214-3.582.942.957-3.493-.232-.371c-1.229-1.969-1.898-4.22-1.897-6.542.003-4.903 3.985-8.889 8.89-8.891 4.901 0 8.886 3.987 8.889 8.889.003 4.904-3.984 8.89-8.889 8.891zM8.349 7.371c-.341-.772-.68-1.144-1.224-1.164-.508-.02-.897-.03-1.268-.03s-.633.165-1.002.571c-.676.71-1.921 2.04-1.921 4.975s2.322 5.824 2.479 6.014c.156.19.466.427.766.572.502.241 1.05.342 1.488.403.493.07 1.066-.02 1.411-.321.439-.372 1.448-1.83 1.68-2.583.232-.752.119-1.338-.118-1.742-.236-.403-.51-.62-.779-.821-.268-.2-.556-.301-.849-.301-.263 0-.528.05-.75.251-.222.202-.686.772-.832.93-.146.158-.292.19-.541.021-.249-.17-.983-.341-1.879-1.111-1.157-.968-1.944-2.152-2.11-2.511-.166-.359-.012-.55.15-.749.135-.166.312-.271.458-.403s.236-.201.353-.342c.118-.141.059-.281-.029-.499-.088-.218-.849-2.04-1.183-2.801z"/></svg>
                Ouvrir WhatsApp
            </a>
            <button onClick={onContinueShopping} className="mt-6 block mx-auto text-rose-600 hover:text-rose-700 font-semibold">
                Retourner à la boutique
            </button>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-6">Votre Panier</h2>
      
      {itemCount === 0 ? (
        <p className="text-center text-gray-500 py-12">Votre panier est vide.</p>
      ) : (
        <>
          <div className="space-y-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4">
                <img src={item.imageUrls[0]} alt={item.name} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600">{item.price.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed" disabled={item.quantity <= 1}><MinusIcon className="w-4 h-4" /></button>
                    <span className="px-4 font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-600 hover:bg-gray-100"><PlusIcon className="w-4 h-4" /></button>
                  </div>
                  <p className="font-bold text-lg w-28 text-right">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-right">
            <p className="text-2xl font-bold">Total: <span className="text-rose-600">{totalPrice.toLocaleString('fr-FR')} FCFA</span></p>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Finaliser la commande</h3>
            <CheckoutForm onOrderSuccess={handleOrderSuccess} />
          </div>
        </>
      )}
    </div>
  );
};

export default CartView;
