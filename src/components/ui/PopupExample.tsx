'use client';

/**
 * Exemplo de uso dos componentes Popup e Toast
 * 
 * Este arquivo mostra como usar os pop-ups personalizados na aplicação.
 * Você pode copiar este código para suas páginas.
 */

import { useState } from 'react';
import { Popup, PopupType } from './popup';
import { useToast } from './Toast';
import { Button } from './button';

export const PopupExample: React.FC = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>('default');
  const [popupMessage, setPopupMessage] = useState('');
  const { showToast } = useToast();

  const showPopup = (type: PopupType, message: string) => {
    setPopupType(type);
    setPopupMessage(message);
    setPopupOpen(true);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Exemplos de Pop-ups</h2>

      {/* Pop-ups Modais */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Pop-ups Modais</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => showPopup('success', 'Operação realizada com sucesso!')}
            className="bg-green-600 hover:bg-green-700"
          >
            Success Popup
          </Button>
          <Button
            onClick={() => showPopup('error', 'Ocorreu um erro ao processar a requisição.')}
            className="bg-red-600 hover:bg-red-700"
          >
            Error Popup
          </Button>
          <Button
            onClick={() => showPopup('warning', 'Atenção: Esta ação não pode ser desfeita.')}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Warning Popup
          </Button>
          <Button
            onClick={() => showPopup('info', 'Informação importante sobre esta operação.')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Info Popup
          </Button>
        </div>
      </div>

      {/* Toasts */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Toasts (Notificações)</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => showToast({ message: 'Tarefa criada com sucesso!', type: 'success' })}
            className="bg-green-600 hover:bg-green-700"
          >
            Success Toast
          </Button>
          <Button
            onClick={() => showToast({ message: 'Erro ao salvar dados.', type: 'error' })}
            className="bg-red-600 hover:bg-red-700"
          >
            Error Toast
          </Button>
          <Button
            onClick={() => showToast({ message: 'Atenção: Verifique os dados.', type: 'warning' })}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Warning Toast
          </Button>
          <Button
            onClick={() => showToast({ message: 'Nova atualização disponível.', type: 'info' })}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Info Toast
          </Button>
        </div>
      </div>

      {/* Popup com confirmação */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Popup com Confirmação</h3>
        <Button
          onClick={() => {
            setPopupType('warning');
            setPopupMessage('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.');
            setPopupOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          Excluir Tarefa
        </Button>
      </div>

      {/* Popup Modal */}
      <Popup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupType === 'success' ? 'Sucesso!' : 
              popupType === 'error' ? 'Erro!' : 
              popupType === 'warning' ? 'Atenção!' : 
              'Informação'}
        message={popupMessage}
        type={popupType}
        onConfirm={popupType === 'warning' ? () => {
          console.log('Ação confirmada!');
          setPopupOpen(false);
        } : undefined}
        showCancel={popupType === 'warning'}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
};

