'use client';

import { useEffect, useState } from 'react';
import React from 'react';

export type PopupType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: PopupType;
  duration?: number; // Auto-close em milissegundos (0 = não fecha automaticamente)
  showCloseButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'default',
  duration = 0,
  showCloseButton = true,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  showCancel = false
}) => {
  // Auto-close após duration
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          titleColor: 'text-green-900',
          messageColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-800',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          icon: (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-700',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <>
      {/* Overlay com backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{
          animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
        }}
      />

      {/* Popup */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        style={{
          animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
        }}
      >
        <div
          className={`
            ${styles.bgColor}
            ${styles.borderColor}
            border-2
            rounded-xl
            shadow-2xl
            max-w-md
            w-full
            p-6
            pointer-events-auto
            transform
            transition-all
            duration-300
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
          style={{
            animation: isOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Ícone */}
            <div className={`${styles.iconBg} rounded-full p-2 flex-shrink-0`}>
              {styles.icon}
            </div>

            {/* Título e Mensagem */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={`${styles.titleColor} text-lg font-bold mb-2`}>
                  {title}
                </h3>
              )}
              <p className={`${styles.messageColor} text-sm leading-relaxed`}>
                {message}
              </p>
            </div>

            {/* Botão de fechar */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Botões de ação */}
          {(onConfirm || showCancel) && (
            <div className="flex gap-3 mt-6 justify-end">
              {showCancel && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {cancelText}
                </button>
              )}
              {onConfirm && (
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-white ${styles.buttonColor} rounded-lg transition-colors font-medium`}
                >
                  {confirmText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

// Hook para facilitar o uso do popup
export const usePopup = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [popupConfig, setPopupConfig] = React.useState<Omit<PopupProps, 'isOpen' | 'onClose'>>({
    message: '',
    type: 'default'
  });

  const showPopup = (config: Omit<PopupProps, 'isOpen' | 'onClose'>) => {
    setPopupConfig(config);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  const PopupComponent = () => (
    <Popup
      isOpen={isOpen}
      onClose={closePopup}
      {...popupConfig}
    />
  );

  return {
    showPopup,
    closePopup,
    PopupComponent
  };
};
