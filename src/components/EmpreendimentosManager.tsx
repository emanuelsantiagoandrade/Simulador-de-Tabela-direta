import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

export interface EmpreendimentoData {
  id: string;
  nome: string;
  dataEntrega: string;
}

export const defaultEmpreendimentos: EmpreendimentoData[] = [
  { id: '1', nome: 'Conquista Maraponga', dataEntrega: '2027-01-31' },
  { id: '2', nome: 'Conquista Messejana', dataEntrega: '2028-05-31' },
  { id: '3', nome: 'Estilo Fátima', dataEntrega: '2027-03-30' },
  { id: '4', nome: 'Estilo Passaré', dataEntrega: '2026-10-31' },
  { id: '5', nome: 'Estilo Praia', dataEntrega: '2026-10-31' },
  { id: '6', nome: 'Lumina Fátima', dataEntrega: '2028-06-30' },
  { id: '7', nome: 'MyPlace Benfica', dataEntrega: '' },
  { id: '8', nome: 'Nature Arbo', dataEntrega: '2028-05-31' },
  { id: '9', nome: 'Nature Eusébio', dataEntrega: '2028-12-31' },
  { id: '10', nome: 'Orizon Rooftop', dataEntrega: '2029-04-30' },
  { id: '11', nome: 'Reserva Flora', dataEntrega: '' },
  { id: '12', nome: 'Seano Beach', dataEntrega: '2028-07-30' },
  { id: '13', nome: 'Viva Nova Caucaia', dataEntrega: '2027-04-30' },
  { id: '14', nome: 'Viva Vida Coqueiros', dataEntrega: '2027-09-30' },
  { id: '15', nome: 'Viva Vida Jandaia', dataEntrega: '2028-06-30' },
  { id: '16', nome: 'Viva Vida Maracanau', dataEntrega: '2027-06-30' },
  { id: '17', nome: 'Viva Vida Parque', dataEntrega: '' },
  { id: '18', nome: 'Viva Vida Siqueira', dataEntrega: '2026-09-30' },
  { id: '19', nome: 'Viva Vida Sul', dataEntrega: '2028-04-30' },
  { id: '20', nome: 'Viva Vida Tropical', dataEntrega: '2026-03-31' },
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
    setList([...list, { id: Date.now().toString(), nome: 'Novo Empreendimento', dataEntrega: '' }]);
  };

  const handleRemove = (id: string) => {
    setList(list.filter(e => e.id !== id));
  };

  const handleChange = (id: string, field: 'nome' | 'dataEntrega', value: string) => {
    setList(list.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSave = () => {
    onSave(list);
    onClose();
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
        
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
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
  );
};
