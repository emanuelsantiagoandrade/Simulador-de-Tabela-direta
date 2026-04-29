import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

export interface EmpreendimentoData {
  id: string;
  nome: string;
  dataEntrega: string;
  linkArquivos?: string;
}

export const defaultEmpreendimentos: EmpreendimentoData[] = [
  { id: '1', nome: 'Conquista Maraponga', dataEntrega: '2027-01-31', linkArquivos: 'https://direcional.com.br' },
  { id: '2', nome: 'Conquista Messejana', dataEntrega: '2028-05-31', linkArquivos: 'https://direcional.com.br' },
  { id: '3', nome: 'Estilo Fátima', dataEntrega: '2027-03-30', linkArquivos: 'https://direcional.com.br' },
  { id: '4', nome: 'Estilo Passaré', dataEntrega: '2026-10-31', linkArquivos: 'https://direcional.com.br' },
  { id: '5', nome: 'Estilo Praia', dataEntrega: '2026-10-31', linkArquivos: 'https://direcional.com.br' },
  { id: '6', nome: 'Jandaia', dataEntrega: '2028-09-30', linkArquivos: 'https://direcional.com.br' },
  { id: '7', nome: 'Lúmina Fátima', dataEntrega: '2028-06-30', linkArquivos: 'https://direcional.com.br' },
  { id: '8', nome: 'My Place Benfica', dataEntrega: '2025-08-31', linkArquivos: 'https://direcional.com.br' },
  { id: '9', nome: 'Nature Arbo', dataEntrega: '2028-05-31', linkArquivos: 'https://direcional.com.br' },
  { id: '10', nome: 'Nature Eusébio', dataEntrega: '2028-08-31', linkArquivos: 'https://direcional.com.br' },
  { id: '11', nome: 'Orizon Rooftop', dataEntrega: '2029-04-30', linkArquivos: 'https://direcional.com.br' },
  { id: '12', nome: 'Parque', dataEntrega: '2025-04-30', linkArquivos: 'https://direcional.com.br' },
  { id: '13', nome: 'Reserva Flora', dataEntrega: '2025-07-01', linkArquivos: 'https://direcional.com.br' },
  { id: '14', nome: 'Seano Beach', dataEntrega: '2028-07-31', linkArquivos: 'https://direcional.com.br' },
  { id: '15', nome: 'Vida Nova Caucaia', dataEntrega: '2027-04-30', linkArquivos: 'https://direcional.com.br' },
  { id: '16', nome: 'Viva Vida Coqueiros', dataEntrega: '2027-09-30', linkArquivos: 'https://direcional.com.br' },
  { id: '17', nome: 'Viva Vida Maracanaú', dataEntrega: '2027-06-30', linkArquivos: 'https://direcional.com.br' },
  { id: '18', nome: 'Viva Vida Siqueira', dataEntrega: '2026-09-30', linkArquivos: 'https://direcional.com.br' },
  { id: '19', nome: 'Viva Vida Sul', dataEntrega: '2028-06-30', linkArquivos: 'https://direcional.com.br' },
  { id: '20', nome: 'Viva Vida Tropical', dataEntrega: '2026-09-30', linkArquivos: 'https://direcional.com.br' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  empreendimentos: EmpreendimentoData[];
  onSave: (list: EmpreendimentoData[]) => void;
}

export const EmpreendimentosManager: React.FC<Props> = ({ isOpen, onClose, empreendimentos, onSave }) => {
  const [list, setList] = useState<EmpreendimentoData[]>([]);

  useEffect(() => {
    if (isOpen) {
      setList([...empreendimentos]);
    }
  }, [isOpen, empreendimentos]);

  if (!isOpen) return null;

  const handleAdd = () => {
    setList([...list, { id: Date.now().toString(), nome: 'Novo Empreendimento', dataEntrega: '', linkArquivos: '' }]);
  };

  const handleRemove = (id: string) => {
    setList(list.filter(e => e.id !== id));
  };

  const handleChange = (id: string, field: 'nome' | 'dataEntrega' | 'linkArquivos', value: string) => {
    setList(list.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSave = () => {
    onSave(list);
    onClose();
  };

  const handleSort = () => {
    setList([...list].sort((a, b) => a.nome.localeCompare(b.nome)));
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Isso irá substituir sua lista atual pela lista padrão (incluindo os novos links). Deseja continuar?')) {
      setList([...defaultEmpreendimentos]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Gerenciar Empreendimentos</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-white">
          <div className="space-y-3">
            {list.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nome do Empreendimento</label>
                  <input 
                    type="text" 
                    value={emp.nome} 
                    onChange={(e) => handleChange(emp.id, 'nome', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="w-40">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Data de Entrega</label>
                  <input 
                    type="date" 
                    value={emp.dataEntrega} 
                    onChange={(e) => handleChange(emp.id, 'dataEntrega', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Link dos Arquivos</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={emp.linkArquivos || ''} 
                    onChange={(e) => handleChange(emp.id, 'linkArquivos', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="pt-5">
                  <button 
                    onClick={() => handleRemove(emp.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title="Remover"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleAdd}
            className="mt-4 flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-3 py-2 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Empreendimento
          </button>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSort}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Ordenar A-Z
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={handleRestoreDefaults}
              className="text-xs text-red-600 font-semibold hover:underline"
            >
              Restaurar Padrões
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
