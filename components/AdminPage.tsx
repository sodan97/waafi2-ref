import React, { useState, useMemo, useRef } from 'react';
import { useOrder } from '../context/OrderContext';
import { useProduct } from '../context/ProductContext';
import { useReservation } from '../context/ReservationContext';
import { useAuth } from '../context/AuthContext';
import { SearchIcon, PlusIcon, TrashIcon, EditIcon } from '../constants';
import DataTable from './DataTable';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import { Product } from '../types';

const ProductManager: React.FC = () => {
    const { products, updateProductStock, updateProductStatus, editProduct, deleteProduct, restoreProduct, permanentlyDeleteProduct } = useProduct();
    const [stockLevels, setStockLevels] = useState<Record<number, string>>({});
    const [notification, setNotification] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);
    const [generalNotification, setGeneralNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [statusFilter, setStatusFilter] = useState<'actifs' | 'archives' | 'corbeille'>('actifs');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const notificationTimeoutRef = useRef<number | null>(null);

    const categories = useMemo(() => ['Tous', ...Array.from(new Set(products.filter(p => p.status !== 'deleted').map(p => p.category)))], [products]);
    
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setGeneralNotification({ message, type });
        notificationTimeoutRef.current = window.setTimeout(() => {
            setGeneralNotification(null);
        }, 4000);
    };

    const handleStockChange = (productId: number, value: string) => {
        setStockLevels(prev => ({ ...prev, [productId]: value }));
    };

    const handleUpdateClick = (productId: number) => {
        const newStockValue = stockLevels[productId];
        if (newStockValue === undefined || newStockValue.trim() === '') return;

        const newStock = parseInt(newStockValue, 10);
        if (!isNaN(newStock) && newStock >= 0) {
            updateProductStock(productId, newStock);
            setNotification({ id: productId, message: 'Stock mis à jour !', type: 'success' });
            setStockLevels(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
            setTimeout(() => setNotification(null), 2500);
        } else {
            setNotification({ id: productId, message: 'Valeur invalide', type: 'error' });
            setTimeout(() => setNotification(null), 2500);
        }
    };
    
    const handleDelete = (product: Product) => {
        if (window.confirm(`Voulez-vous vraiment déplacer le produit "${product.name}" vers la corbeille ? Il ne sera plus visible par les clients mais pourra être restauré.`)) {
            deleteProduct(product.id);
            showNotification(`Le produit "${product.name}" a été déplacé vers la corbeille.`);
        }
    };

    const handleRestore = (product: Product) => {
        restoreProduct(product.id);
        showNotification(`Le produit "${product.name}" a été restauré.`);
    };

    const handlePermanentDelete = (product: Product) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT le produit "${product.name}" ? Cette action est irréversible.`)) {
            permanentlyDeleteProduct(product.id);
            showNotification(`Le produit "${product.name}" a été supprimé définitivement.`, 'error');
        }
    };

    const getStockColor = (stock: number) => {
        if (stock === 0) return 'text-red-600 bg-red-100';
        if (stock <= 10) return 'text-orange-600 bg-orange-100';
        return 'text-green-600 bg-green-100';
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => {
                if (statusFilter === 'actifs') return p.status === 'active';
                if (statusFilter === 'archives') return p.status === 'archived';
                if (statusFilter === 'corbeille') return p.status === 'deleted';
                return false;
            })
            .filter(p => activeCategory === 'Tous' || p.category === activeCategory)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, activeCategory, searchTerm, statusFilter]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            {generalNotification && (
                <div 
                    className={`p-4 mb-6 rounded-lg text-white font-semibold text-center ${generalNotification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} 
                    role="alert"
                >
                    {generalNotification.message}
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Gestion des Produits</h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors shadow flex items-center justify-center gap-2"
                >
                    <span className="pointer-events-none flex items-center gap-2">
                      <PlusIcon className="w-5 h-5" />
                      Ajouter un produit
                    </span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4 items-center flex-wrap">
                <div className="relative flex-grow w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                 <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-600">Filtre:</span>
                    <button onClick={() => setStatusFilter('actifs')} className={`px-3 py-1 text-sm rounded-full ${statusFilter === 'actifs' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Actifs</button>
                    <button onClick={() => setStatusFilter('archives')} className={`px-3 py-1 text-sm rounded-full ${statusFilter === 'archives' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Archivés</button>
                    <button onClick={() => setStatusFilter('corbeille')} className={`px-3 py-1 text-sm rounded-full ${statusFilter === 'corbeille' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Corbeille</button>
                </div>
            </div>
             <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
                <span className="font-semibold text-sm text-gray-600 flex-shrink-0">Catégorie:</span>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-200 ${
                            activeCategory === category
                            ? 'bg-rose-500 text-white shadow'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className={`bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg ${product.status !== 'active' ? 'opacity-70' : ''}`}>
                        <div className="relative">
                            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-48 object-cover" />
                            {product.status !== 'active' && (
                                <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded ${
                                    product.status === 'archived' ? 'bg-yellow-500' : 'bg-red-600'
                                }`}>
                                    {product.status.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">{product.category}</p>
                            <h4 className="font-bold text-lg text-gray-800 mt-1 mb-3 flex-grow">{product.name}</h4>
                            
                            <div className="flex justify-between items-center mb-4">
                               <span className="text-sm text-gray-600">Stock actuel :</span>
                               <span className={`font-bold px-2.5 py-1 rounded-md text-sm ${getStockColor(product.stock)}`}>
                                    {product.stock} unités
                               </span>
                            </div>

                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    placeholder="Nouveau stock"
                                    value={stockLevels[product.id] ?? ''}
                                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                                    min="0"
                                    aria-label={`Nouveau stock pour ${product.name}`}
                                />
                                <button
                                    onClick={() => handleUpdateClick(product.id)}
                                    className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={stockLevels[product.id] === undefined || stockLevels[product.id].trim() === ''}
                                >
                                    OK
                                </button>
                            </div>
                             {notification && notification.id === product.id && (
                                <p className={`text-sm mt-2 text-center font-semibold ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                  {notification.message}
                                </p>
                            )}

                             <div className="flex justify-around items-center mt-4 pt-4 border-t border-gray-200">
                                {product.status === 'deleted' ? (
                                    <>
                                        <button onClick={() => handleRestore(product)} className="text-sm font-semibold text-green-600 hover:text-green-800">Restaurer</button>
                                        <button onClick={() => handlePermanentDelete(product)} className="text-sm font-semibold text-red-600 hover:text-red-800 flex items-center gap-1">
                                            <span className="pointer-events-none flex items-center gap-1">
                                                <TrashIcon className="w-4 h-4" />
                                                Supprimer Déf.
                                            </span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setEditingProduct(product)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                            <span className="pointer-events-none flex items-center gap-1">
                                                <EditIcon className="w-4 h-4"/>
                                                Modifier
                                            </span>
                                        </button>
                                        {product.status === 'active' ? (
                                            <button onClick={() => updateProductStatus(product.id, 'archived')} className="text-sm font-semibold text-yellow-600 hover:text-yellow-800">Archiver</button>
                                        ) : (
                                            <button onClick={() => updateProductStatus(product.id, 'active')} className="text-sm font-semibold text-green-600 hover:text-green-800">Réactiver</button>
                                        )}
                                        <button onClick={() => handleDelete(product)} className="text-sm font-semibold text-red-500 hover:text-red-700 flex items-center gap-1">
                                            <span className="pointer-events-none flex items-center gap-1">
                                                <TrashIcon className="w-4 h-4" />
                                                Corbeille
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredProducts.length === 0 && <p className="text-center text-gray-500 py-12">Aucun produit ne correspond à vos critères.</p>}
            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} />}
            {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
        </div>
    );
}

const OrderManager: React.FC = () => {
    const { orders, updateOrderStatus, isLoading, error } = useOrder();
    const { users } = useAuth();

    const columns = useMemo(() => [
        { Header: 'ID Commande', accessor: 'id' as const },
        { Header: 'Prénom', accessor: 'firstName' as const },
        { Header: 'Nom', accessor: 'lastName' as const },
        { Header: 'Email Client', accessor: 'email' as const },
        { Header: 'Téléphone', accessor: 'phone' as const },
        { Header: 'Date', accessor: 'date' as const },
        { Header: 'Heure', accessor: 'time' as const },
        { Header: 'Total (FCFA)', accessor: 'total' as const },
        { Header: 'Articles', accessor: 'items' as const },
        {
            Header: 'Statut',
            accessor: 'status' as const,
            Cell: ({ value, row }) => { // 'value' est la valeur actuelle du statut, 'row' est l'objet commande
                return (
                    <select
                        value={value || 'Pas commencé'} // Utilisez la valeur actuelle ou 'Pas commencé' par défaut
                        onChange={(e) => {
                            updateOrderStatus(row.original.id, e.target.value);
                            // Example if you had an update function in useOrder context:
                            // updateOrderStatus(row.original.id, e.target.value);
                        }}
                    >
                        <option value="Pas commencé">Pas commencé</option>
                        <option value="En traitement">En traitement</option>
                        <option value="Terminée">Terminée</option>
                    </select>
                );
            }
        },
    ], []);

    const data = useMemo(() => orders.map(order => {
        const user = users.find(u => u.id === order.userId);
        return {
            id: order.id.slice(-6).toUpperCase(),
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            email: user?.email ?? 'Invité',
            phone: order.customer.phone,
            date: new Date(order.date).toLocaleDateString('fr-FR'),
            time: new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            total: order.total.toLocaleString('fr-FR'),
            items: order.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
            status: order.status || 'Pas commencé', // Ensure status is included, default if missing
        };
    }), [orders, users]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4">Historique des Commandes</h3>
            {isLoading ? (
                <p className="text-center text-gray-500 py-12">Chargement des commandes...</p>
            ) : error ? (
                <p className="text-center text-red-600 py-12">Erreur lors du chargement des commandes : {error}</p>
            ) : (
                <DataTable columns={columns} data={data} exportFilename="commandes_belleza" />
            )}
        </div>
    );
}

// Assuming you might have a separate component for Order History if needed elsewhere
// For now, the OrderManager component serves this purpose within AdminPage.
// If you had a separate OrderHistoryPage component, you would apply similar logic there.
const OrderHistoryPage: React.FC = () => {
     // If this were a separate component, you'd fetch and display orders here.
     // Since OrderManager is used within AdminPage, this component is not directly used.
     return (
         <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
             <h3 className="text-2xl font-bold mb-4">Order History Page Placeholder</h3>
             {/* Content would go here */}
        </div>
    );
}

const ReservationManager: React.FC = () => {
    const { reservations } = useReservation();
    const { products } = useProduct();
    const { users } = useAuth();
    const { orders } = useOrder();

    const columns = useMemo(() => [
        { Header: 'Produit Réservé', accessor: 'productName' as const },
        { Header: 'Prénom', accessor: 'firstName' as const },
        { Header: 'Nom', accessor: 'lastName' as const },
        { Header: 'Email Client', accessor: 'email' as const },
        { Header: 'Téléphone', accessor: 'phone' as const },
        { Header: 'Date Demande', accessor: 'reservationDate' as const },
    ], []);

    const data = useMemo(() => {
        return reservations.map(res => {
            const product = products.find(p => p.id === res.productId);
            const user = users.find(u => u.id === res.userId);
            
            const userOrders = orders
                .filter(o => o.userId === res.userId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            const userPhone = userOrders.length > 0 ? userOrders[0].customer.phone : 'N/A';

            return {
                productName: product?.name ?? 'Inconnu',
                firstName: user?.firstName ?? 'Inconnu',
                lastName: user?.lastName ?? 'Inconnu',
                email: user?.email ?? 'Inconnu',
                phone: userPhone,
                reservationDate: new Date(res.date).toLocaleDateString('fr-FR'),
            };
        });
    }, [reservations, products, users, orders]);

    return (
         <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4">Produits Réservés (en attente de stock)</h3>
             <DataTable columns={columns} data={data} exportFilename="reservations_belleza" />
        </div>
    );
}


const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('products');

    const TABS = [
        { id: 'products', label: 'Gestion des Produits' },
        { id: 'reservations', label: 'Gestion des Réservations' },
        { id: 'orders', label: 'Historique des Commandes' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Panneau d'Administration</h2>

            <div className="flex border-b border-gray-200 mb-6 flex-wrap">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-6 font-semibold text-center transition-colors duration-200 ${activeTab === tab.id ? 'border-b-2 border-rose-500 text-rose-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="transition-opacity duration-300">
                {activeTab === 'products' && <ProductManager />}
                {activeTab === 'reservations' && <ReservationManager />}
                {activeTab === 'orders' && <OrderManager />}
            </div>
        </div>
    );
};

export default AdminPage;