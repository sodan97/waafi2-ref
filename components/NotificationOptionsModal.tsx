import React, { useState } from 'react';
import { Product } from '../types';
import { View } from '../App';
import { useAuth } from '../context/AuthContext';
import { MERCHANT_WHATSAPP_NUMBER, ArrowLeftIcon } from '../constants';
import { QRCodeCanvas } from 'qrcode.react';

interface NotificationOptionsModalProps {
    product: Product;
    onClose: () => void;
    setView: (view: View) => void;
    setPendingReservation: (productId: number) => void;
}

const NotificationOptionsModal: React.FC<NotificationOptionsModalProps> = ({ product, onClose, setView, setPendingReservation }) => {
    const { currentUser } = useAuth();
    const [modalView, setModalView] = useState<'options' | 'qr'>('options');
    const [whatsAppUrl, setWhatsAppUrl] = useState('');

    const handleCreateAccount = () => {
        setPendingReservation(product.id);
        onClose();
        setView('register');
    };

    const generateWhatsAppUrl = (message: string) => {
        return `https://wa.me/${MERCHANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    };

    const handleWhatsAppNotify = () => {
        const baseUrl = window.location.origin;
        const productUrl = `${baseUrl}/product/${product.id}`;
        const productInfo = `Lien du produit: ${productUrl}\nLien de l'image: ${product.imageUrls[0]}`;
        let introMessage = '';

        if (currentUser) {
            introMessage = `Bonjour, c'est ${currentUser.firstName} ${currentUser.lastName}. Je souhaite être prévenu(e) lorsque le produit "${product.name}" sera de nouveau disponible.`;
        } else {
            introMessage = `Bonjour, je suis intéressé(e) par le produit "${product.name}" qui est en rupture de stock. Veuillez me prévenir quand il sera disponible.`;
        }
        
        const message = `${introMessage}\n\n${productInfo}`;
        
        setWhatsAppUrl(generateWhatsAppUrl(message));
        setModalView('qr');
    };

    const renderOptionsView = () => (
        <>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Produit Indisponible</h2>
            <p className="text-center text-gray-600 mb-6">
                Le produit <span className="font-semibold">{product.name}</span> est actuellement en rupture de stock.
            </p>
            
            {currentUser ? (
                <div>
                     <p className="text-center text-green-700 bg-green-100 p-3 rounded-md mb-6 text-sm">
                        Nous avons bien enregistré votre intérêt ! Vous recevrez une notification ici dès son retour.
                    </p>
                    <p className="text-center text-gray-600 mb-4">
                        Pour accélérer le réassort, vous pouvez aussi notifier le vendeur directement :
                    </p>
                     <button
                        onClick={handleWhatsAppNotify}
                        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-green-600 transition-colors"
                    >
                        Notifier le vendeur via WhatsApp
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-center text-gray-600 mb-2">Comment souhaitez-vous être prévenu(e) ?</p>
                    <button
                        onClick={handleCreateAccount}
                        className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-rose-600 transition-colors"
                    >
                        Créer un compte pour une notification auto
                    </button>
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">OU</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button
                        onClick={handleWhatsAppNotify}
                        className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-green-600 transition-colors"
                    >
                        Envoyer une demande sur WhatsApp
                    </button>
                </div>
            )}
             <button onClick={onClose} className="w-full text-center mt-8 text-sm text-gray-500 hover:text-gray-700">
                Fermer
            </button>
        </>
    );

    const renderQrView = () => (
        <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800">Notifier via WhatsApp</h3>
            <p className="mt-2 text-gray-600">Scannez ce code avec votre téléphone ou cliquez sur le bouton.</p>
            <div className="my-6 flex justify-center bg-white p-4 rounded-lg shadow-inner">
                <QRCodeCanvas value={whatsAppUrl} size={200} />
            </div>
            <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.398 1.919 6.335l-1.251 4.565 4.659-1.225zM12 21.056c-1.776 0-3.518-.591-4.965-1.742l-.357-.214-3.582.942.957-3.493-.232-.371c-1.229-1.969-1.898-4.22-1.897-6.542.003-4.903 3.985-8.889 8.89-8.891 4.901 0 8.886 3.987 8.889 8.889.003 4.904-3.984 8.89-8.889 8.891zM8.349 7.371c-.341-.772-.68-1.144-1.224-1.164-.508-.02-.897-.03-1.268-.03s-.633.165-1.002.571c-.676.71-1.921 2.04-1.921 4.975s2.322 5.824 2.479 6.014c.156.19.466.427.766.572.502.241 1.05.342 1.488.403.493.07 1.066-.02 1.411-.321.439-.372 1.448-1.83 1.68-2.583.232-.752.119-1.338-.118-1.742-.236-.403-.51-.62-.779-.821-.268-.2-.556-.301-.849-.301-.263 0-.528.05-.75.251-.222.202-.686.772-.832.93-.146.158-.292.19-.541.021-.249-.17-.983-.341-1.879-1.111-1.157-.968-1.944-2.152-2.11-2.511-.166-.359-.012-.55.15-.749.135-.166.312-.271.458-.403s.236-.201.353-.342c.118-.141.059-.281-.029-.499-.088-.218-.849-2.04-1.183-2.801z"/></svg>
                Ouvrir WhatsApp
            </a>
            <button
                onClick={() => setModalView('options')}
                className="w-full flex items-center justify-center gap-2 mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Retour
            </button>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" 
            onClick={onClose}
            style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-95 duration-300 ease-out"
                style={{ animation: 'zoomIn 0.3s ease-out forwards' }}
                onClick={e => e.stopPropagation()}
            >
                {modalView === 'options' ? renderOptionsView() : renderQrView()}
            </div>
            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes zoomIn {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default NotificationOptionsModal;