'use client';

/**
 * Arquivo de exemplos de uso dos componentes de Pop-up
 * 
 * Este arquivo mostra como usar os diferentes tipos de pop-ups
 * Você pode copiar e adaptar estes exemplos para suas necessidades
 */

import { useState } from 'react';
import { Button } from './button';
import { Modal } from './modal';
import { Popup } from './popup';
import { useToast } from './Toast';

export const PopupExamples: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  
  const { showToast } = useToast();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Exemplos de Pop-ups</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Success Popup */}
        <Button
          onClick={() => setShowSuccess(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Success Popup
        </Button>

        {/* Error Popup */}
        <Button
          onClick={() => setShowError(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          Error Popup
        </Button>

        {/* Warning Popup */}
        <Button
          onClick={() => setShowWarning(true)}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Warning Popup
        </Button>

        {/* Info Popup */}
        <Button
          onClick={() => setShowInfo(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Info Popup
        </Button>

        {/* Confirm Popup */}
        <Button
          onClick={() => setShowConfirm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Confirm Popup
        </Button>

        {/* Custom Modal */}
        <Button
          onClick={() => setShowCustom(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Custom Modal
        </Button>

        {/* Toast Examples */}
        <Button
          onClick={() => showToast({ message: 'Operação realizada com sucesso!', type: 'success' })}
          className="bg-green-600 hover:bg-green-700"
        >
          Toast Success
        </Button>

        <Button
          onClick={() => showToast({ message: 'Erro ao processar solicitação', type: 'error' })}
          className="bg-red-600 hover:bg-red-700"
        >
          Toast Error
        </Button>

        <Button
          onClick={() => showToast({ message: 'Atenção: Verifique os dados', type: 'warning' })}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Toast Warning
        </Button>
      </div>

      {/* Success Popup */}
      <Popup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        type="success"
        title="Sucesso!"
        message="A operação foi realizada com sucesso."
      />

      {/* Error Popup */}
      <Popup
        isOpen={showError}
        onClose={() => setShowError(false)}
        type="error"
        title="Erro"
        message="Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
      />

      {/* Warning Popup */}
      <Popup
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        type="warning"
        title="Atenção"
        message="Tem certeza que deseja continuar? Esta ação não pode ser desfeita."
        onConfirm={() => {
          console.log('Ação confirmada!');
          setShowWarning(false);
        }}
        showCancel={true}
      />

      {/* Info Popup */}
      <Popup
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        type="info"
        title="Informação"
        message="Esta é uma mensagem informativa para o usuário."
      />

      {/* Confirm Popup */}
      <Popup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        type="default"
        title="Confirmar Ação"
        message="Deseja realmente executar esta ação?"
        onConfirm={() => {
          console.log('Confirmado!');
          setShowConfirm(false);
        }}
        showCancel={true}
      />

      {/* Custom Modal */}
      <Modal
        isOpen={showCustom}
        onClose={() => setShowCustom(false)}
        title="Modal Personalizado"
        message="Este é um modal personalizado com conteúdo customizado."
        type="default"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Você pode adicionar qualquer conteúdo aqui, como formulários, listas, etc.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Exemplo de conteúdo:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Formulários</li>
              <li>Tabelas</li>
              <li>Imagens</li>
              <li>Qualquer componente React</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

