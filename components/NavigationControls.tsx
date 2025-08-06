
import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '../constants';

interface NavigationControlsProps {
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ onBack, onForward, canGoBack, canGoForward }) => {
  const buttonBaseStyle = "bg-white p-3 rounded-full shadow-lg text-gray-700 hover:bg-rose-500 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500";
  const disabledStyle = "opacity-50 cursor-not-allowed hover:bg-white hover:text-gray-700";

  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className={`${buttonBaseStyle} ${!canGoBack ? disabledStyle : ''}`}
        aria-label="Retourner à la page précédente"
        aria-disabled={!canGoBack}
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <button
        onClick={onForward}
        disabled={!canGoForward}
        className={`${buttonBaseStyle} ${!canGoForward ? disabledStyle : ''}`}
        aria-label="Aller à la page suivante"
        aria-disabled={!canGoForward}
      >
        <ArrowRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default NavigationControls;
