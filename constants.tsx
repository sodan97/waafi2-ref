
import React from 'react';
import { Product } from './types';

export const MERCHANT_WHATSAPP_NUMBER = import.meta.env.VITE_MERCHANT_WHATSAPP_NUMBER; // IMPORTANT: Remplacez par le vrai numéro du commerçant dans le fichier .env (indicatif pays + numéro, SANS le '+')

export const HERO_SLIDES = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2574&auto=format&fit=crop',
    title: 'L\'Élégance à portée de main',
    subtitle: 'Découvrez nos collections exclusives et affirmez votre style.'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2574&auto=format&fit=crop',
    title: 'Parfums d\'Exception',
    subtitle: 'Des fragrances uniques pour des moments inoubliables.'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2598&auto=format&fit=crop',
    title: 'Nouveautés High-Tech',
    subtitle: 'Accessoirisez votre quotidien avec nos dernières tendances.'
  }
];


export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Parfum 'Fleur de Nuit'",
    price: 35000,
    imageUrls: [
        "https://images.unsplash.com/photo-1585398918583-1b95b8b0a93c?q=80&w=1887&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541643600914-78b084683602?q=80&w=1887&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1887&auto=format&fit=crop",
    ],
    description: "Une fragrance envoûtante et mystérieuse, mêlant jasmin, ambre et notes boisées. Parfait pour les soirées où vous voulez laisser une impression mémorable.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 15,
    status: 'active'
  },
  {
    id: 2,
    name: "Sérum Éclat 'Or Liquide'",
    price: 22000,
    imageUrls: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop"],
    description: "Un sérum visage revitalisant enrichi en vitamines pour une peau lumineuse.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 25,
    status: 'active'
  },
  {
    id: 4,
    name: "Rouge à Lèvres 'Rouge Passion'",
    price: 12500,
    imageUrls: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1887&auto=format&fit=crop"],
    description: "Un rouge à lèvres mat longue tenue, à la couleur intense et veloutée.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 30,
    status: 'active'
  },
  {
    id: 6,
    name: "Mascara Volume 'Regard Intense'",
    price: 11000,
    imageUrls: ["https://images.unsplash.com/photo-1560790671-b765b533af5c?q=80&w=1890&auto=format&fit=crop"],
    description: "Donnez à vos cils un volume spectaculaire et une longueur infinie.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 40,
    status: 'active'
  },
  {
    id: 3,
    name: "Crème Mains 'Douceur de Karité'",
    price: 8500,
    imageUrls: ["https://images.unsplash.com/photo-1629198725902-ad28635fedeb?q=80&w=1887&auto=format&fit=crop"],
    description: "Crème nourrissante au beurre de karité pur pour des mains douces et protégées.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 50,
    status: 'active'
  },
  {
    id: 5,
    name: "Huile Corporelle 'Soleil Scintillant'",
    price: 19000,
    imageUrls: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1887&auto=format&fit=crop"],
    description: "Huile sèche qui nourrit la peau et laisse un voile doré, délicatement parfumé.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 20,
    status: 'active'
  },
  {
    id: 7,
    name: "Écharpe en Soie 'Jardin d'Hiver'",
    price: 28000,
    imageUrls: ["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2574&auto=format&fit=crop"],
    description: "Une écharpe en soie pure aux motifs floraux, parfaite pour rehausser n'importe quelle tenue.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 10,
    status: 'active'
  },
  {
    id: 8,
    name: "Sac à Main 'Élégance Parisienne'",
    price: 65000,
    imageUrls: ["https://images.unsplash.com/photo-1590737141399-365d83a83f98?q=80&w=2574&auto=format&fit=crop"],
    description: "Un sac à main en cuir structuré, l'accessoire chic et intemporel par excellence.",
    category: "Produits Cosmétiques & Accessoires",
    stock: 0,
    status: 'active'
  },
  {
    id: 9,
    name: "Montre Connectée 'Chrono-Fit'",
    price: 85000,
    imageUrls: [
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1964&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1964&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1579586337278-35d9addbbfb5?q=80&w=1964&auto=format&fit=crop"
    ],
    description: "Suivez votre activité, recevez vos notifications et restez connecté avec style. Compatible iOS et Android.",
    category: "Électronique",
    stock: 12,
    status: 'active'
  },
  {
    id: 10,
    name: "Écouteurs Sans Fil 'AuraSound'",
    price: 48000,
    imageUrls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop"],
    description: "Un son immersif et une liberté de mouvement totale pour votre musique et vos appels.",
    category: "Électronique",
    stock: 22,
    status: 'active'
  },
  {
    id: 11,
    name: "Enceinte Bluetooth 'Vibra-Sound'",
    price: 32000,
    imageUrls: ["https://images.unsplash.com/photo-1589256469207-8cdf09115723?q=80&w=2670&auto=format&fit=crop"],
    description: "Une enceinte portable puissante pour animer vos journées où que vous soyez.",
    category: "Électronique",
    stock: 18,
    status: 'active'
  }
];

export const CartIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export const MinusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
    </svg>
);

export const ArrowLeftIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const SearchIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);


export const ArrowRightIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export const BellIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);