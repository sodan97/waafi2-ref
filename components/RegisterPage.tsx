
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { View } from '../App';

interface RegisterPageProps {
  setView: (view: View) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setView }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });

    if (success) {
      setView('products');
    } else {
      setError('Un compte avec cet email existe déjà.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Créer un compte</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="firstName" placeholder="Prénom" value={formData.firstName} onChange={handleChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
          <input type="text" name="lastName" placeholder="Nom" value={formData.lastName} onChange={handleChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
        </div>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
        <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
        <div>
          <button
            type="submit"
            className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-rose-600 transition-colors duration-300"
          >
            S'inscrire
          </button>
        </div>
      </form>
      <p className="text-center mt-6 text-sm">
        Déjà un compte ?{' '}
        <button onClick={() => setView('login')} className="font-semibold text-rose-600 hover:underline">
          Connectez-vous ici
        </button>
      </p>
    </div>
  );
};

export default RegisterPage;
