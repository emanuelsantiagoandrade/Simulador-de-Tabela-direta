import React, { useState, useEffect } from 'react';
import { X, Printer, AlertTriangle, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { EmpreendimentosManager, EmpreendimentoData, defaultEmpreendimentos } from './components/EmpreendimentosManager';

// --- Utilities ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const parseCurrency = (value: string) => {
  if (typeof value === 'number') return value;
  const numericString = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(numericString) || 0;
};

// --- Components ---
const CurrencyInput = ({ value, onChange, className = '', readOnly = false }: any) => {
  const [localValue, setLocalValue] = useState(formatCurrency(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalValue(value === 0 ? '' : value.toString().replace('.', ','));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const parsed = parseCurrency(e.target.value);
    onChange(parsed);
    setLocalValue(formatCurrency(parsed));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onFocus={!readOnly ? handleFocus : undefined}
      onBlur={!readOnly ? handleBlur : undefined}
      readOnly={readOnly}
      className={`w-full px-3 py-2 print:px-1 print:py-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:bg-blue-50/30 transition-colors outline-none text-right font-medium ${readOnly ? 'bg-transparent text-gray-700 cursor-default hover:border-transparent' : 'bg-gray-50/50'} ${className}`}
    />
  );
};

const PercentInput = ({ value, onChange, className = '', readOnly = false }: any) => {
  return (
    <div className="relative w-full group">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        readOnly={readOnly}
        step="0.01"
        className={`w-full px-3 py-2 print:px-1 print:py-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:bg-blue-50/30 transition-colors outline-none text-right pr-8 font-medium ${readOnly ? 'bg-transparent text-gray-700 cursor-default hover:border-transparent' : 'bg-gray-50/50'} ${className}`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium group-focus-within:text-blue-600 transition-colors">%</span>
    </div>
  );
};

const Field = ({ label, children, className = '' }: { label: React.ReactNode, children: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col border-b border-slate-100 last:border-0 p-3 print:p-1 ${className}`}>
    <span className="text-[16px] font-semibold text-slate-500 uppercase tracking-wider mb-1 print:text-[10px]">{label}</span>
    <div className="text-slate-900 font-medium text-[16px] print:text-[12px]">{children}</div>
  </div>
);

const PreSimulation = ({ parcelas, valorBase, dataInicio }: { parcelas: number, valorBase: number, dataInicio: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inccSimulado, setInccSimulado] = useState(0.3);

  const getSimulatedInstallments = () => {
    const list = [];
    const baseDate = dataInicio ? new Date(dataInicio + 'T12:00:00') : null;
    let currentDate = baseDate ? new Date(baseDate) : null;
    
    for (let i = 1; i <= parcelas; i++) {
      // Cálculo: valorBase * (1 + INCC)^meses
      const taxaMensal = inccSimulado / 100;
      const valorAjustado = valorBase * Math.pow(1 + taxaMensal, i - 1);
      
      list.push({
        numero: i,
        data: currentDate ? currentDate.toLocaleDateString('pt-BR') : '---',
        valor: valorAjustado
      });

      // Adiciona 1 mês
      if (currentDate) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    return list;
  };

  const installments = getSimulatedInstallments();

  return (
    <div className="bg-white print:hidden border-t border-slate-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 p-3 font-bold text-center text-sm flex items-center justify-between hover:bg-slate-100 transition-colors text-slate-700"
      >
        <span>Simulação das Parcelas Pré-Chaves (INCC)</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-slate-100">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Aviso Importante:</strong> Esta é apenas uma simulação para fins de estimativa. 
                As parcelas reais serão reajustadas mensalmente pelo <strong>INCC</strong>. 
                Como o INCC varia mês a mês, é impossível prever o valor exato das parcelas futuras.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded border border-gray-200">
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700 text-sm">
                INCC Simulado (ao mês):
              </label>
              <div className="w-32">
                <PercentInput value={inccSimulado} onChange={setInccSimulado} />
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-200 font-medium">
              Taxa total anual (INCC): <span className="text-blue-700 font-bold">{((Math.pow(1 + (inccSimulado / 100), 12) - 1) * 100).toFixed(2).replace('.', ',')}%</span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded">
            <table className="w-full text-sm text-center">
              <thead className="bg-white sticky top-0 shadow-sm">
                <tr>
                  <th className="p-2 border-b border-r border-gray-300">Parcela</th>
                  <th className="p-2 border-b border-r border-gray-300">Data</th>
                  <th className="p-2 border-b border-gray-300">Valor Estimado</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst) => (
                  <tr key={inst.numero} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2 border-r border-gray-300 font-medium">{inst.numero} / {parcelas}</td>
                    <td className="p-2 border-r border-gray-300">{inst.data}</td>
                    <td className="p-2 font-bold text-blue-800">{formatCurrency(inst.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const PosSimulation = ({ parcelas, valorBase, dataInicio }: { parcelas: number, valorBase: number, dataInicio: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ipcaSimulado, setIpcaSimulado] = useState(0.5);
  const [printSimulation, setPrintSimulation] = useState(false);

  const getSimulatedInstallments = () => {
    const list = [];
    const baseDate = dataInicio ? new Date(dataInicio + 'T12:00:00') : null;
    let currentDate = baseDate ? new Date(baseDate) : null;
    let saldoDevedor = valorBase * parcelas; // Saldo devedor inicial é o total do Pós
    
    for (let i = 1; i <= parcelas; i++) {
      // Taxa de juros: 1% fixo + IPCA simulado
      const taxaMensal = (1 + ipcaSimulado) / 100;
      
      // Juros calculados sobre o saldo devedor atual
      const juros = saldoDevedor * taxaMensal;
      
      // Amortização é o valor base da parcela (constante)
      const amortizacao = valorBase;
      
      // Valor final da parcela é a amortização + os juros do mês
      const valorParcela = amortizacao + juros;
      
      list.push({
        numero: i,
        data: currentDate ? currentDate.toLocaleDateString('pt-BR') : '---',
        valor: valorParcela,
        juros: juros,
        amortizacao: amortizacao,
        saldoDevedor: saldoDevedor
      });

      // Abate a amortização do saldo devedor para o próximo mês
      saldoDevedor -= amortizacao;
      
      // Adiciona 1 mês
      if (currentDate) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    return list;
  };

  const installments = getSimulatedInstallments();

  return (
    <div className={`bg-white border-t border-slate-100 ${printSimulation ? '' : 'print:hidden'}`}>
      <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 p-3 font-bold text-left text-sm flex items-center justify-between text-slate-700"
        >
          <span>Simulação das Parcelas Pós-Chaves (Tabela SAC)</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        <div className="pr-4 pl-2 flex items-center gap-2 print:hidden border-l border-slate-200" onClick={e => e.stopPropagation()}>
          <input 
            type="checkbox" 
            id="print-pos-sim" 
            checked={printSimulation} 
            onChange={(e) => setPrintSimulation(e.target.checked)} 
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="print-pos-sim" className="text-xs font-semibold text-slate-600 cursor-pointer uppercase tracking-wider">Imprimir</label>
        </div>
      </div>
      
      <div className={`${isOpen ? 'block' : 'hidden'} ${printSimulation ? 'print:block' : ''} p-4 space-y-4 border-t border-slate-100`}>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              <strong>Aviso Importante:</strong> Esta é apenas uma simulação para fins de estimativa utilizando o sistema de amortização constante (SAC). 
              Os juros de <strong>1% + IPCA</strong> são aplicados sobre o saldo devedor, que diminui a cada mês. 
              Como o IPCA varia mês a mês, é impossível prever o valor exato das parcelas futuras.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded border border-gray-200">
          <div className="flex items-center gap-4 print:hidden">
            <label className="font-semibold text-gray-700 text-sm">
              IPCA Simulado (ao mês):
            </label>
            <div className="w-32">
              <PercentInput value={ipcaSimulado} onChange={setIpcaSimulado} />
            </div>
          </div>
          <div className="hidden print:block text-sm text-gray-700 font-semibold">
            IPCA Simulado (ao mês): {ipcaSimulado.toFixed(2).replace('.', ',')}%
          </div>
          <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-200 font-medium">
            Taxa total anual (1% + IPCA): <span className="text-blue-700 font-bold">{((Math.pow(1 + ((1 + ipcaSimulado) / 100), 12) - 1) * 100).toFixed(2).replace('.', ',')}%</span>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto print:max-h-none print:overflow-visible border border-gray-300 rounded">
          <table className="w-full text-sm text-center">
            <thead className="bg-white sticky top-0 shadow-sm print:static">
              <tr>
                <th className="p-2 border-b border-r border-gray-300">Parcela</th>
                <th className="p-2 border-b border-r border-gray-300">Data</th>
                <th className="p-2 border-b border-r border-gray-300">Amortização</th>
                <th className="p-2 border-b border-r border-gray-300">Juros (1% + IPCA)</th>
                <th className="p-2 border-b border-r border-gray-300">Valor da Parcela</th>
                <th className="p-2 border-b border-gray-300">Saldo Devedor</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((inst) => (
                <tr key={inst.numero} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 border-r border-gray-300 font-medium">{inst.numero} / {parcelas}</td>
                  <td className="p-2 border-r border-gray-300">{inst.data}</td>
                  <td className="p-2 border-r border-gray-300 text-gray-600">{formatCurrency(inst.amortizacao)}</td>
                  <td className="p-2 border-r border-gray-300 text-red-600">+{formatCurrency(inst.juros)}</td>
                  <td className="p-2 border-r border-gray-300 font-bold text-blue-800">{formatCurrency(inst.valor)}</td>
                  <td className="p-2 text-gray-600">{formatCurrency(inst.saldoDevedor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // State
  const [empreendimentosList, setEmpreendimentosList] = useState<EmpreendimentoData[]>(() => {
    const saved = localStorage.getItem('empreendimentosList');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultEmpreendimentos;
      }
    }
    return defaultEmpreendimentos;
  });
  const [showEmpManager, setShowEmpManager] = useState(false);

  const [empreendimento, setEmpreendimento] = useState('');
  const [unidade, setUnidade] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [mesesAteEntrega, setMesesAteEntrega] = useState(0);

  const [valorUnidade, setValorUnidade] = useState(0);
  const [descontos, setDescontos] = useState(0);

  const [atoPercent, setAtoPercent] = useState(10);
  const [sinais, setSinais] = useState([
    { id: 1, label: 'Ato 1', valor: 0, data: new Date().toISOString().split('T')[0] },
    { id: 2, label: 'Sinal 1', valor: 0, data: '' },
    { id: 3, label: 'Sinal 2', valor: 0, data: '' },
    { id: 4, label: 'Sinal 3', valor: 0, data: '' },
  ]);

  const [baloesPercent, setBaloesPercent] = useState(0);
  const [baloes, setBaloes] = useState([
    { id: 1, valor: 0, data: '' },
    { id: 2, valor: 0, data: '' },
    { id: 3, valor: 0, data: '' },
    { id: 4, valor: 0, data: '' },
    { id: 5, valor: 0, data: '' },
    { id: 6, valor: 0, data: '' },
    { id: 7, valor: 0, data: '' },
    { id: 8, valor: 0, data: '' },
    { id: 9, valor: 0, data: '' },
    { id: 10, valor: 0, data: '' },
    { id: 11, valor: 0, data: '' },
    { id: 12, valor: 0, data: '' },
    { id: 13, valor: 0, data: '' },
    { id: 14, valor: 0, data: '' },
    { id: 15, valor: 0, data: '' },
  ]);

  const [prePercent, setPrePercent] = useState(30);
  const [preParcelas, setPreParcelas] = useState(0);
  const [preDataInicio, setPreDataInicio] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(15);
    return nextMonth.toISOString().split('T')[0];
  });

  const [posPercent, setPosPercent] = useState(60);
  const [posParcelas, setPosParcelas] = useState(120);
  const [posDataInicio, setPosDataInicio] = useState('');

  const [showPrintModal, setShowPrintModal] = useState(false);

  // Handlers for percentage changes to maintain 40% pre-keys logic and 60% pos-keys logic
  const handlePercentChange = (source: 'ato' | 'pre' | 'baloes' | 'pos', newVal: number) => {
    let ato = atoPercent;
    let pre = prePercent;
    let baloes = baloesPercent;
    let pos = posPercent;

    if (source === 'ato') {
      ato = newVal;
      // Ato mexe no Pré para manter o equilíbrio de 100%
      pre = 100 - ato - baloes - pos;
    } else if (source === 'baloes') {
      baloes = newVal;
      // Balões mexe no Pré para manter o equilíbrio de 100%
      pre = 100 - ato - baloes - pos;
    } else if (source === 'pre') {
      pre = newVal;
      // Pré mexe no Pós (Regra: tudo que for colocado a mais no pré deve ser subtraído do pós)
      pos = 100 - ato - baloes - pre;
    } else if (source === 'pos') {
      pos = newVal;
      // Pós mexe no Pré para manter o equilíbrio de 100%
      pre = 100 - ato - baloes - pos;
    }

    // --- Ajustes de Segurança (Apenas para evitar valores negativos absurdos) ---
    
    // Se o campo de ajuste (o que não foi editado) ficar negativo, 
    // tentamos compensar nos outros campos para manter os 100%
    if (pre < 0 && source !== 'pre') {
      pos += pre;
      pre = 0;
    }
    if (pos < 0 && source !== 'pos') {
      pre += pos;
      pos = 0;
    }

    // Garante que os valores finais não sejam negativos
    ato = Math.max(0, ato);
    pre = Math.max(0, pre);
    baloes = Math.max(0, baloes);
    pos = Math.max(0, pos);

    // Ajuste final para garantir soma 100% exata
    const soma = ato + pre + baloes + pos;
    if (Math.abs(soma - 100) > 0.01) {
      if (source === 'pre') pos = Number((100 - ato - baloes - pre).toFixed(2));
      else pre = Number((100 - ato - baloes - pos).toFixed(2));
    }

    setAtoPercent(Number(ato.toFixed(2)));
    setPrePercent(Number(pre.toFixed(2)));
    setBaloesPercent(Number(baloes.toFixed(2)));
    setPosPercent(Number(pos.toFixed(2)));
  };

  // Auto-calculate months until delivery when delivery date changes
  useEffect(() => {
    if (dataEntrega) {
      const deliveryDate = new Date(dataEntrega + 'T12:00:00');
      const currentDate = new Date();
      
      const yearsDiff = deliveryDate.getFullYear() - currentDate.getFullYear();
      const monthsDiff = deliveryDate.getMonth() - currentDate.getMonth();
      
      let totalMonths = (yearsDiff * 12) + monthsDiff;
      if (totalMonths < 0) totalMonths = 0;
      
      setMesesAteEntrega(totalMonths);

      // Set default posDataInicio to the month after delivery
      const posDate = new Date(deliveryDate);
      posDate.setMonth(posDate.getMonth() + 1);
      posDate.setDate(15); // Standard day 15
      setPosDataInicio(posDate.toISOString().split('T')[0]);
    }
  }, [dataEntrega]);

  // Auto-calculate pre parcelas when mesesAteEntrega or sinais changes
  useEffect(() => {
    const qtdSinais = sinais.filter(s => s.valor > 0).length;
    let newPreParcelas = mesesAteEntrega - qtdSinais;
    if (newPreParcelas < 0) newPreParcelas = 0;
    setPreParcelas(newPreParcelas);
  }, [mesesAteEntrega, sinais]);

  // Calculations
  const valorAposDescontos = valorUnidade - descontos;

  const valorAtoTotal = valorAposDescontos * (atoPercent / 100);
  const totalSinais = sinais.reduce((acc, curr) => acc + curr.valor, 0);
  const qtdSinaisUtilizados = sinais.filter(s => s.valor > 0).length;

  const valorBaloesTotal = valorAposDescontos * (baloesPercent / 100);
  const totalBaloes = baloes.reduce((acc, curr) => acc + curr.valor, 0);

  const valorPreTotal = valorAposDescontos * (prePercent / 100);
  const valorParcelaPre = preParcelas > 0 ? valorPreTotal / preParcelas : 0;

  const valorPosTotal = valorAposDescontos * (posPercent / 100);
  const valorParcelaPos = posParcelas > 0 ? valorPosTotal / posParcelas : 0;

  const totalPercent = atoPercent + baloesPercent + prePercent + posPercent;
  const isPercentExactly100 = Math.abs(totalPercent - 100) < 0.01;

  const totalPagoReal = totalSinais + totalBaloes + valorPreTotal + valorPosTotal;
  const isValorValid = Math.abs(totalPagoReal - valorAposDescontos) < 0.01;

  // Handlers
  const updateSinal = (id: number, field: 'valor' | 'data', value: any) => {
    setSinais(sinais.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateBalao = (id: number, field: 'valor' | 'data', value: any) => {
    setBaloes(baloes.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans text-gray-900">
      {/* Print Button - Top Right */}
      <div className="max-w-6xl mx-auto px-4 pt-6 flex justify-end print:hidden">
        <button 
          onClick={() => {
            try {
              if (window.self !== window.top) {
                setShowPrintModal(true);
              } else {
                window.print();
              }
            } catch (e) {
              setShowPrintModal(true);
            }
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Printer className="w-5 h-5" />
          Imprimir Plano
        </button>
      </div>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 pt-6 pb-8 print:py-4 print:pb-6">
        <div className="bg-white rounded-t-2xl shadow-sm overflow-hidden border border-slate-200">
          {/* Logos Section */}
          <div className="flex justify-between items-center p-6 sm:p-8">
            {/* Direcional Logo */}
            <div className="flex items-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1B4B] tracking-tighter">DIRECIONAL</h1>
            </div>
            
            {/* Riva Logo */}
            <div className="flex flex-col items-end">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1B4B] tracking-tighter leading-none">RIVA</h2>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-[0.2em] mt-1">INCORPORADORA</span>
            </div>
          </div>

          {/* Proposta Banner */}
          <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#2B2D7C] via-[#8E1F58] to-[#E3003F]">
            {/* Diagonal stripes overlay */}
            <div 
              className="absolute inset-0 opacity-20" 
              style={{ 
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 8px)' 
              }}
            ></div>
            <div className="relative py-4 text-center">
              <h2 className="text-white font-bold text-xl sm:text-2xl tracking-[0.4em] uppercase ml-[0.4em]">Proposta Tabela Direta</h2>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-6 print:max-w-none print:px-2 print:space-y-1">
        
        {/* Validation Warnings */}
        {(!isPercentExactly100 || !isValorValid) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex flex-col gap-2 print:hidden shadow-sm rounded-r-md">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500 w-5 h-5" />
              <h3 className="text-red-800 font-bold">Atenção: Inconsistências no Plano de Pagamento</h3>
            </div>
            <ul className="list-disc pl-10 text-red-700 text-sm space-y-1">
              {!isPercentExactly100 && (
                <li>
                  As porcentagens de Ato, Pré, Pós e Balões não devem passar (ou faltar) de 100%. 
                  Total atual: <strong>{totalPercent.toFixed(2)}%</strong>
                </li>
              )}
              {!isValorValid && (
                <li>
                  Os valores pagos no Ato (Sinais preenchidos), Pré, Pós e Balões não devem ser diferentes do Valor após descontos ({formatCurrency(valorAposDescontos)}). 
                  Soma atual: <strong>{formatCurrency(totalPagoReal)}</strong>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Info and Values side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-[1.7fr_1fr] gap-6 print:gap-4 items-start">
          {/* General Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
            <div className="bg-[#002699] p-3 print:p-1.5 rounded-t-xl">
              <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                Informações do Imóvel
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 p-1">
              <Field label="Empreendimento" className="sm:col-span-2 print:col-span-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    list="empreendimentos-list"
                    value={empreendimento} 
                    onChange={e => {
                      setEmpreendimento(e.target.value);
                      const emp = empreendimentosList.find(x => x.nome === e.target.value);
                      if (emp && emp.dataEntrega) setDataEntrega(emp.dataEntrega);
                    }} 
                    className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1"
                    placeholder="Digite ou selecione..."
                  />
                  <datalist id="empreendimentos-list">
                    {empreendimentosList.map(emp => (
                      <option key={emp.id} value={emp.nome} />
                    ))}
                  </datalist>
                  <button 
                    onClick={() => setShowEmpManager(true)} 
                    className="print:hidden text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Gerenciar Empreendimentos"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </Field>
              <Field label="Unidade">
                <input type="text" value={unidade} onChange={e => setUnidade(e.target.value)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" placeholder="Ex: Apto 101" />
              </Field>
              <Field label="Data de entrega">
                <input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" />
              </Field>
              <Field label="Meses até entrega" className="sm:col-span-2 print:col-span-2">
                <input type="number" value={mesesAteEntrega} onChange={e => setMesesAteEntrega(parseInt(e.target.value) || 0)} className="w-32 outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" />
              </Field>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
            <div className="bg-[#002699] p-3 print:p-1.5 rounded-t-xl">
              <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                Valores da Negociação
              </h3>
            </div>
            <div className="flex flex-col p-1">
              <Field label="Valor da Unidade">
                <CurrencyInput value={valorUnidade} onChange={setValorUnidade} className="text-lg text-left bg-transparent hover:bg-transparent focus:bg-transparent px-0 py-1" />
              </Field>
              <Field label="Descontos">
                <CurrencyInput value={descontos} onChange={setDescontos} className="text-lg text-left text-red-600 bg-transparent hover:bg-transparent focus:bg-transparent px-0 py-1" />
              </Field>
              <Field label="Valor após descontos" className="bg-blue-50/30">
                <CurrencyInput value={valorAposDescontos} onChange={() => {}} readOnly className="text-xl font-bold text-blue-800 text-left bg-transparent hover:bg-transparent focus:bg-transparent px-0 py-1" />
              </Field>
            </div>
          </div>
        </div>

        {/* ATO Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-2 gap-6 print:gap-4 items-start mb-6">
          <div className="lg:col-span-2 print:col-span-2">
            {/* ATO Section */}
            <div className="bg-white border-2 border-[#002699] rounded-xl shadow-[0_0_15px_rgba(0,38,153,0.2)] h-full flex flex-col relative overflow-hidden">
              <div className="bg-[#002699] p-3 print:p-1.5 rounded-t-lg flex justify-between items-center">
                <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                  <span className="bg-white text-[#002699] rounded-full w-8 h-8 flex items-center justify-center text-lg">1</span>
                  Ato
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 p-1">
                <Field label="Porcentagem (%)">
                  <PercentInput value={atoPercent} onChange={(val: number) => handlePercentChange('ato', val)} className="py-1 text-lg font-bold text-blue-800 bg-transparent hover:bg-transparent focus:bg-transparent px-0" />
                </Field>
                <Field label="Valor Total">
                  <CurrencyInput value={valorAtoTotal} onChange={(v: number) => { if (valorAposDescontos > 0) handlePercentChange('ato', (v / valorAposDescontos) * 100); }} className="py-1 text-lg font-bold text-blue-800 bg-transparent hover:bg-transparent focus:bg-transparent px-0" />
                </Field>
              </div>

              <div className="p-1 border-t border-slate-100">
                <div className="grid grid-cols-[1fr_1fr_1fr] bg-slate-50 border-b border-slate-100 text-xs font-semibold tracking-wider text-slate-500 uppercase text-center p-2 rounded-t-lg">
                  <div>Sinal Ato</div>
                  <div>Valor</div>
                  <div>Data</div>
                </div>
                
                {sinais.map((sinal) => (
                  <div key={sinal.id} className={`grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors items-center ${sinal.valor === 0 && !sinal.data ? 'print:hidden' : ''}`}>
                    <div className="p-2 font-medium text-slate-700 text-center">{sinal.label}</div>
                    <div className="p-2 relative">
                      {sinal.id === 1 && (
                        <div className="absolute -top-1 -right-4 bg-yellow-400 text-blue-900 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 animate-pulse print:hidden uppercase whitespace-nowrap">
                          Preencha Aqui ★
                        </div>
                      )}
                      <CurrencyInput value={sinal.valor} onChange={(v: number) => updateSinal(sinal.id, 'valor', v)} className="py-1 text-center bg-transparent hover:bg-transparent focus:bg-transparent" />
                    </div>
                    <div className="p-2">
                      <input type="date" value={sinal.data} onChange={(e) => updateSinal(sinal.id, 'data', e.target.value)} className="w-full outline-none text-center bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" />
                    </div>
                  </div>
                ))}
                
                <div className="grid grid-cols-[1fr_1fr_1fr] bg-slate-50 p-3 rounded-b-lg">
                  <div className="font-bold text-right text-sm text-slate-600 pr-4">Total Sinais:</div>
                  <div className={`font-bold text-center text-sm ${Math.abs(totalSinais - valorAtoTotal) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(totalSinais)}
                  </div>
                  <div className="text-xs text-slate-500 text-center flex items-center justify-center">
                    ({qtdSinaisUtilizados} utilizados)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="print:hidden">
            {/* Sugestão de parcelamento de ato */}
            <div className="bg-white border-2 border-[#002699] shadow-lg rounded-xl overflow-hidden animate-[pulse_3s_infinite]">
              <div className="bg-[#002699] p-3 rounded-t-lg">
                <h3 className="font-bold text-[20px] tracking-wider text-white uppercase flex items-center gap-2">
                  Sugestão de parcelamento de ato
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  Veja como ficaria o valor total de <strong className="text-slate-900">{formatCurrency(valorAtoTotal)}</strong> dividido em parcelas iguais:
                </p>
                <div className="space-y-2">
                  {[2, 3, 4].map(num => (
                    <div key={num} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-sm">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{num}x de</span>
                      <span className="font-bold text-slate-900">{formatCurrency(valorAtoTotal / num)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRE Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-2 gap-6 print:gap-4 items-start mb-6">
          <div className="lg:col-span-2 print:col-span-2">
            {/* PRE Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
              <div className="bg-[#002699] p-3 print:p-1.5 rounded-t-xl flex justify-between items-center">
                <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                  Pré-Chaves (INCC)
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 p-1">
                <Field label="Porcentagem (%)">
                  <PercentInput value={prePercent} onChange={(val: number) => handlePercentChange('pre', val)} className="py-1 text-lg font-bold text-blue-800 bg-transparent hover:bg-transparent focus:bg-transparent px-0" />
                </Field>
                <Field label="Valor Total">
                  <div className="py-1 text-lg font-bold text-blue-800 px-0">{formatCurrency(valorPreTotal)}</div>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-1 border-t border-slate-100">
                <Field label="Qtd. Parcelas">
                  <input type="number" value={preParcelas} onChange={e => setPreParcelas(parseInt(e.target.value) || 0)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1 text-lg font-bold text-blue-800" />
                </Field>
                <Field label="Valor da Parcela">
                  <div className="py-1 text-lg font-bold text-blue-800">{formatCurrency(valorParcelaPre)}</div>
                </Field>
                <Field label="Data de Início">
                  <input type="date" value={preDataInicio} onChange={e => setPreDataInicio(e.target.value)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1 font-medium" />
                </Field>
              </div>
              <PreSimulation parcelas={preParcelas} valorBase={valorParcelaPre} dataInicio={preDataInicio} />
            </div>
          </div>
        </div>

        {/* BALOES Row */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 print:grid-cols-2 gap-6 print:gap-4 items-start mb-6 ${(baloesPercent === 0 || totalBaloes === 0) ? 'print:hidden' : ''}`}>
          <div className="lg:col-span-2 print:col-span-2">
            {/* BALOES Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
              <div className="bg-[#002699] p-3 print:p-1.5 rounded-t-xl flex justify-between items-center">
                <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                  Balões
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 p-1">
                <Field label="Porcentagem (%)">
                  <PercentInput value={baloesPercent} onChange={(val: number) => handlePercentChange('baloes', val)} className="py-1 text-lg font-bold text-blue-800 bg-transparent hover:bg-transparent focus:bg-transparent px-0" />
                </Field>
                <Field label="Valor Total">
                  <div className="py-1 text-lg font-bold text-blue-800 px-0">{formatCurrency(valorBaloesTotal)}</div>
                </Field>
              </div>

              <div className="p-1 border-t border-slate-100">
                <div className="grid grid-cols-[1fr_1fr] bg-slate-50 border-b border-slate-100 text-xs font-semibold tracking-wider text-slate-500 uppercase text-center p-2 rounded-t-lg">
                  <div>Valor</div>
                  <div>Data</div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {baloes.map((balao) => (
                    <div key={balao.id} className={`grid grid-cols-[1fr_1fr] border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors items-center ${balao.valor === 0 && !balao.data ? 'print:hidden' : ''}`}>
                      <div className="p-2">
                        <CurrencyInput value={balao.valor} onChange={(v: number) => updateBalao(balao.id, 'valor', v)} className="py-1 text-center bg-transparent hover:bg-transparent focus:bg-transparent" />
                      </div>
                      <div className="p-2">
                        <input type="date" value={balao.data} onChange={(e) => updateBalao(balao.id, 'data', e.target.value)} className="w-full outline-none text-center bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-[1fr_1fr] bg-slate-50 p-3 rounded-b-lg">
                  <div className="font-bold text-right text-sm text-slate-600 pr-4">Total Balões:</div>
                  <div className={`font-bold text-center text-sm ${Math.abs(totalBaloes - valorBaloesTotal) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(totalBaloes)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="print:hidden">
            {/* Sugestão de parcelamento de balões */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <div className="bg-[#002699] p-3 rounded-t-xl">
                <h3 className="font-bold text-[20px] tracking-wider text-white uppercase flex items-center gap-2">
                  Sugestão de parcelamento de balões
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  Veja como ficaria o valor total de <strong className="text-slate-900">{formatCurrency(valorBaloesTotal)}</strong> dividido em parcelas iguais:
                </p>
                <div className="space-y-2">
                  {[2, 3, 4, 5, 6].map(num => (
                    <div key={num} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-sm">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{num}x de</span>
                      <span className="font-bold text-blue-700">{formatCurrency(valorBaloesTotal / num)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-800 text-xs leading-relaxed shadow-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <p><strong className="text-amber-900">Aviso:</strong> Os balões podem ser até 3 meses antes da entrega.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POS Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-2 gap-6 print:gap-4 items-start mb-6">
          <div className="lg:col-span-2 print:col-span-2">
            {/* POS Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
              <div className="bg-[#002699] p-3 print:p-1.5 rounded-t-xl flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                    Pós-Chaves (1% + IPCA)
                  </h3>
                  <span className="text-[15px] text-white/80">Máximo permitido: 60%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 p-1">
                <Field label="Porcentagem (%)">
                  <PercentInput value={posPercent} onChange={(val: number) => handlePercentChange('pos', val)} className="py-1 text-lg font-bold text-blue-800 bg-transparent hover:bg-transparent focus:bg-transparent px-0" />
                </Field>
                <Field label="Valor Total">
                  <div className="py-1 text-lg font-bold text-blue-800 px-0">{formatCurrency(valorPosTotal)}</div>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 p-1 border-t border-slate-100">
                <Field label="Qtd. Parcelas">
                  <input type="number" value={posParcelas} onChange={e => setPosParcelas(parseInt(e.target.value) || 0)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1 text-lg font-bold text-blue-800" />
                </Field>
                <Field label="Valor da Parcela">
                  <div className="py-1 text-lg font-bold text-blue-800">{formatCurrency(valorParcelaPos)}</div>
                </Field>
                <Field label="Data de Início">
                  <input type="date" value={posDataInicio} onChange={e => setPosDataInicio(e.target.value)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1 font-medium" />
                </Field>
              </div>
              <PosSimulation parcelas={posParcelas} valorBase={valorParcelaPos} dataInicio={posDataInicio} />
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 space-y-3 print:mt-4 print:p-4 print:text-[10px]">
          <p>1. Essa é apenas uma simulação, para valores exatos seria necessário a aprovação de crédito e inserção dos dados dentro do sistema da construtora.</p>
          <p>2. Essa proposta não garante a reserva da unidade em questão.</p>
          <p>3. Esta é uma proposta simulada com validade condicionada à política comercial do mês vigente. Os valores e condições definitivos estão sujeitos à validação e reserva oficial dentro do sistema da Direcional.</p>
        </div>
      </main>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowPrintModal(false)} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Printer className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Impressão Bloqueada</h3>
              <p className="text-gray-600 mb-6">
                Para imprimir o plano de pagamento, você precisa abrir o aplicativo em uma nova aba. O navegador bloqueia a impressão quando o site está incorporado.
              </p>
              
              <div className="flex flex-col gap-3">
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  onClick={() => setShowPrintModal(false)}
                >
                  Abrir em Nova Aba
                </a>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EmpreendimentosManager 
        isOpen={showEmpManager}
        onClose={() => setShowEmpManager(false)}
        empreendimentos={empreendimentosList}
        onSave={(newList) => {
          setEmpreendimentosList(newList);
          localStorage.setItem('empreendimentosList', JSON.stringify(newList));
        }}
      />
    </div>
  );
}
