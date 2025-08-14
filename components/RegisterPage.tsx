
import React, { useState, useEffect } from 'react';
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
  const [validationErrors, setValidationErrors] = useState({
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
    // Clear specific validation error when user types
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    // Update password strength on password change
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const validateField = (name: string, value: string): string => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = 'Ce champ est requis.';
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
           error = 'Seules les lettres et les espaces sont autorisés.';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'L\'email est requis.';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Veuillez utiliser une adresse email @gmail.com.';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Le mot de passe est requis.';
        } else if (value.length < 8) {
          error = 'Le mot de passe doit contenir au moins 8 caractères.';
        }
        // Password strength check is separate
        break;
      default:
        break;
    }
    return error;
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    setValidationErrors(errors);

    // Return true if there are no errors
    return Object.values(errors).every(error => error === '');
  };

  const [passwordStrength, setPasswordStrength] = useState<'Faible' | 'Moyen' | 'Fort' | ''>('');

  // Initial check for password strength if there's an initial password value (e.g., from pre-filling)
  useEffect(() => { checkPasswordStrength(formData.password); }, [formData.password]);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length > 7) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    if (password.length === 0) setPasswordStrength('');
    else if (strength < 2) setPasswordStrength('Faible');
    else if (strength < 4) setPasswordStrength('Moyen');
    else setPasswordStrength('Fort'); // Strength 4 or more considered Fort
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) { // Validate before attempting registration
      return; // Stop submission if validation fails
    }
    // Registration logic should be inside or after successful validation

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      setView('products');
    }
 catch (error) {
      console.error("Registration failed:", error);
      setError('Échec de l\'inscription. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Créer un compte</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="firstName"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500`}
            />
            {validationErrors.firstName && <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>}
          </div>
          <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="lastName"
              placeholder="Nom"
              value={formData.lastName}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500`}
            />
            {validationErrors.lastName && <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>}
          </div>
        </div>
         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500`}
          />
          {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe <span className="text-red-500">*</span></label>
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500`}
          />
          {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
          {formData.password && ( // Show strength only if password field is not empty
            <p className={`text-xs mt-1 ${
              passwordStrength === 'Faible' ? 'text-red-500' :
              passwordStrength === 'Medium' ? 'text-orange-500' :
              passwordStrength === 'Fort' ? 'text-green-500' : ''
            }`}>
              Force du mot de passe : {passwordStrength}
            </p>
          )}
        </div>
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
