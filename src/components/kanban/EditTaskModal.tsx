'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { UserType } from '@/constants/enums';
import { getApiBaseUrl } from '@/lib/api';
import { Popup } from '@/components/ui/popup';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  userType: UserType;
  availableUsers: any[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  userType,
  availableUsers
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story_points: 0,
    assigned_to: '',
    task_type_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [showDeleteErrorPopup, setShowDeleteErrorPopup] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Carregar dados quando o modal abrir ou a task mudar
  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        story_points: task.story_points || 0,
        assigned_to: task.assigned_to || '',
        task_type_id: task.task_type_id || ''
      });
    }
  }, [task, isOpen]);

  // Carregar tipos de tarefa
  useEffect(() => {
    if (isOpen) {
      fetchTaskTypes();
    }
  }, [isOpen]);

  const fetchTaskTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_BASE_URL}/task-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const types = await response.json();
        setTaskTypes(types);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de tarefa:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!task) return;
    setShowSaveConfirm(false);
    setLoading(true);
    try {
      // Garantir que assigned_to seja null se estiver vazio, não string vazia
      const updatesToSend = {
        ...formData,
        assigned_to: formData.assigned_to === '' ? null : formData.assigned_to,
        task_type_id: formData.task_type_id === '' ? null : formData.task_type_id
      };
      console.log('📝 Enviando atualizações da tarefa:', updatesToSend);
      await onSave(task.id, updatesToSend);
      // Mostrar popup de sucesso
      setShowSuccessPopup(true);
    } catch (error: any) {
      console.error('Erro ao salvar tarefa:', error);
      setErrorMessage(error.message || 'Erro desconhecido ao atualizar tarefa');
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!task) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!task) return;
    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      await onDelete(task.id);
      // Mostrar popup de sucesso
      setShowDeleteSuccessPopup(true);
    } catch (error: any) {
      console.error('Erro ao eliminar tarefa:', error);
      setDeleteErrorMessage(error.message || 'Erro desconhecido ao eliminar tarefa');
      setShowDeleteErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'story_points' ? parseInt(value) || 0 : value
    }));
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Editar Tarefa</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Tarefa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Tarefa *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome da tarefa"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva a tarefa"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Story Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Points
              </label>
              <input
                type="number"
                name="story_points"
                value={formData.story_points}
                onChange={handleChange}
                min="0"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Programador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programador
              </label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecionar programador</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Tarefa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Tarefa
            </label>
            <select
              name="task_type_id"
              value={formData.task_type_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecionar tipo de tarefa</option>
              {taskTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Informações da Tarefa (somente leitura) */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Informações da Tarefa</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">ID:</span> {task.id}
              </div>
              <div>
                <span className="font-medium">Status:</span> {task.status}
              </div>
              <div>
                <span className="font-medium">Criada em:</span> {new Date(task.created_at || '').toLocaleDateString('pt-PT')}
              </div>
              <div>
                <span className="font-medium">Atualizada em:</span> {new Date(task.updated_at || '').toLocaleDateString('pt-PT')}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between pt-4">
            <div>
              {userType === UserType.MANAGER && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Eliminando...' : 'Eliminar Tarefa'}
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Popup de confirmação de atualização */}
      <Popup
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        title="Confirmar Atualização"
        message="Tem certeza que deseja atualizar esta tarefa?"
        type="info"
        showCancel={true}
        confirmText="Atualizar"
        cancelText="Cancelar"
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* Popup de sucesso após atualizar */}
      <Popup
        isOpen={showSuccessPopup}
        onClose={() => {
          setShowSuccessPopup(false);
          onClose();
        }}
        title="Tarefa Atualizada!"
        message="A tarefa foi atualizada com sucesso."
        type="success"
        duration={2000}
        showCloseButton={false}
      />

      {/* Popup de erro ao atualizar */}
      <Popup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Erro ao Atualizar"
        message={errorMessage}
        type="error"
        showCloseButton={true}
      />

      {/* Popup de sucesso após eliminar */}
      <Popup
        isOpen={showDeleteSuccessPopup}
        onClose={() => {
          setShowDeleteSuccessPopup(false);
          onClose();
        }}
        title="Tarefa Eliminada!"
        message="A tarefa foi eliminada com sucesso."
        type="success"
        duration={2000}
        showCloseButton={false}
      />

      {/* Popup de erro ao eliminar */}
      <Popup
        isOpen={showDeleteErrorPopup}
        onClose={() => setShowDeleteErrorPopup(false)}
        title="Erro ao Eliminar"
        message={deleteErrorMessage}
        type="error"
        showCloseButton={true}
      />

      {/* Popup de confirmação de exclusão */}
      <Popup
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja eliminar esta tarefa? Esta ação não pode ser desfeita."
        type="warning"
        showCancel={true}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};