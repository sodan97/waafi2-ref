
import React from 'react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const OrderHistoryPage: React.FC = () => {
    const { orders } = useOrder();
    const { currentUser } = useAuth();

    const userOrders = currentUser
        ? orders.filter(order => order.userId === currentUser.id)
        : [];

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-6">Mon Historique de Commandes</h2>
            {userOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-12">Vous n'avez passé aucune commande pour le moment.</p>
            ) : (
                <div className="space-y-6">
                    {userOrders.map(order => (
                        <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">Commande #{order.id.slice(-6).toUpperCase()}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Passée le {new Date(order.date).toLocaleDateString('fr-FR')} à {new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <p className="font-bold text-xl text-rose-600 flex-shrink-0 mt-2 sm:mt-0">
                                    {order.total.toLocaleString('fr-FR')} FCFA
                                 </p>
                            </div>
                            <div className="mt-4 border-t border-gray-200 pt-3">
                                <h4 className="font-semibold text-gray-700">Articles :</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                                    {order.items.map(item => (
                                        <li key={item.id}>
                                            <span className="font-medium">{item.name}</span> (x{item.quantity})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
