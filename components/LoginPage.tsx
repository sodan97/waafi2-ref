
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { View } from '../App';

interface LoginPageProps {
  setView: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Assuming login is now async and throws on failure
      await login(email, password);
      // If login succeeds, the user is set in AuthContext,
      // and useEffect in App.tsx should handle navigation.
      // No need to call setView here directly unless necessary for state update.
      // setView(currentUser?.role === 'admin' ? 'admin' : 'products'); // Example if needed
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Connexion</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-rose-600 transition-colors duration-300"
          >
            Se connecter
          </button>
        </div>
      </form>
      <p className="text-center mt-6 text-sm">
        Pas encore de compte ?{' '}
        <button onClick={() => setView('register')} className="font-semibold text-rose-600 hover:underline">
          Inscrivez-vous ici
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
