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
      className={`w-full px-2 py-1 print:px-1 print:py-0 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-right ${readOnly ? 'bg-white text-gray-600 cursor-not-allowed' : 'bg-white'} ${className}`}
    />
  );
};

const PercentInput = ({ value, onChange, className = '', readOnly = false }: any) => {
  return (
    <div className="relative w-full">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        readOnly={readOnly}
        step="0.01"
        className={`w-full px-2 py-1 print:px-1 print:py-0 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-right pr-8 ${readOnly ? 'bg-white text-gray-600' : 'bg-white'} ${className}`}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
    </div>
  );
};

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
    <div className="border border-slate-200 shadow-sm bg-white print:hidden rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white p-2 font-bold text-center border-b border-slate-200 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span>Simulação das Parcelas Pré-Chaves (INCC)</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4">
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
    <div className="border border-slate-200 shadow-sm bg-white print:hidden rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white p-2 font-bold text-center border-b border-slate-200 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span>Simulação das Parcelas Pós-Chaves (Tabela SAC)</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4">
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
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700 text-sm">
                IPCA Simulado (ao mês):
              </label>
              <div className="w-32">
                <PercentInput value={ipcaSimulado} onChange={setIpcaSimulado} />
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-200 font-medium">
              Taxa total anual (1% + IPCA): <span className="text-blue-700 font-bold">{((Math.pow(1 + ((1 + ipcaSimulado) / 100), 12) - 1) * 100).toFixed(2).replace('.', ',')}%</span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded">
            <table className="w-full text-sm text-center">
              <thead className="bg-white sticky top-0 shadow-sm">
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
      )}
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

  const [imageError, setImageError] = useState(false);

  // Auto-calculate months until delivery when delivery date changes
  useEffect(() => {
    if (dataEntrega) {
      const deliveryDate = new Date(dataEntrega);
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
    <div className="min-h-screen bg-white pb-32 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm py-10 mb-16 print:shadow-none print:py-6 print:mb-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          {!imageError ? (
            <img 
              src="/logo.png" 
              alt="Direcional e Riva Incorporadora" 
              className="h-40 object-contain mb-6 print:h-32 print:mb-4"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center mb-6 print:mb-4">
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-6xl font-extrabold text-[#003366] tracking-tighter italic print:text-4xl">DIRECIONAL</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-5xl font-bold text-[#003366] italic print:text-3xl">R</span>
                <span className="text-4xl font-bold text-gray-700 tracking-widest print:text-2xl -ml-2">IVA</span>
                <span className="text-sm font-normal text-gray-500 tracking-widest mt-1 print:mt-0 print:text-[10px] ml-2">INCORPORADORA</span>
              </div>
            </div>
          )}
          <h2 className="text-2xl mt-8 text-gray-800 print:mt-6 print:text-lg">Plano de pagamento <span className="font-bold">Tabela Direta</span></h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-[1.7fr_1fr] gap-6 print:gap-1 items-start">
          {/* General Info */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="grid grid-cols-[auto_1fr] border-b border-slate-100">
              <div className="bg-white p-2 print:p-0.5 text-center font-bold text-xs tracking-wider text-slate-500 border-r border-slate-100 col-span-2 uppercase">INFORMAÇÕES DO IMÓVEL</div>
            </div>
            <div className="grid grid-cols-[auto_1fr] border-b border-slate-100">
              <div className="bg-white p-2 print:p-0.5 text-right font-semibold text-sm print:text-[10px] border-r border-slate-100 flex items-center justify-end whitespace-nowrap text-slate-600">Empreendimento:</div>
              <div className="p-2 print:p-0.5 flex items-center gap-2">
                <input 
                  type="text"
                  list="empreendimentos-list"
                  value={empreendimento} 
                  onChange={e => {
                    setEmpreendimento(e.target.value);
                    const emp = empreendimentosList.find(x => x.nome === e.target.value);
                    if (emp && emp.dataEntrega) setDataEntrega(emp.dataEntrega);
                  }} 
                  className="w-full outline-none bg-transparent print:text-[10px] font-medium"
                  placeholder="Digite ou selecione..."
                />
                <datalist id="empreendimentos-list">
                  {empreendimentosList.map(emp => (
                    <option key={emp.id} value={emp.nome} />
                  ))}
                </datalist>
                <button 
                  onClick={() => setShowEmpManager(true)} 
                  className="print:hidden text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Gerenciar Empreendimentos"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] border-b border-slate-100">
              <div className="bg-white p-2 print:p-0.5 text-right font-semibold text-sm print:text-[10px] border-r border-slate-100 flex items-center justify-end whitespace-nowrap text-slate-600">Unidade:</div>
              <div className="p-2 print:p-0.5"><input type="text" value={unidade} onChange={e => setUnidade(e.target.value)} className="w-full outline-none bg-transparent print:text-[10px] font-medium" /></div>
            </div>
            <div className="grid grid-cols-[auto_1fr] border-b border-slate-100">
              <div className="bg-white p-2 print:p-0.5 text-right font-semibold text-sm print:text-[10px] border-r border-slate-100 flex items-center justify-end whitespace-nowrap text-slate-600">Data de entrega:</div>
              <div className="p-2 print:p-0.5 w-48 print:w-auto"><input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="w-full outline-none bg-transparent print:text-[10px] font-medium" /></div>
            </div>
            <div className="grid grid-cols-[auto_1fr]">
              <div className="bg-white p-2 print:p-0.5 text-right font-semibold text-sm print:text-[10px] border-r border-slate-100 flex items-center justify-end whitespace-nowrap text-slate-600">Meses até entrega:</div>
              <div className="p-2 print:p-0.5 w-24 print:w-auto"><input type="number" value={mesesAteEntrega} onChange={e => setMesesAteEntrega(parseInt(e.target.value) || 0)} className="w-full outline-none bg-transparent print:text-[10px] font-medium" /></div>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="grid grid-cols-[1fr_1fr] border-b border-slate-100">
              <div className="bg-white p-2 print:p-0.5 text-center font-bold text-xs tracking-wider text-slate-500 border-r border-slate-100 uppercase">DESCRIÇÃO</div>
              <div className="bg-white p-2 print:p-0.5 text-center font-bold text-xs tracking-wider text-slate-500 uppercase">VALOR</div>
            </div>
            <div className="grid grid-cols-[1fr_1fr] border-b border-slate-100">
              <div className="p-2 print:p-0.5 text-right font-semibold text-sm print:text-[10px] border-r border-slate-100 flex items-center justify-end whitespace-nowrap text-slate-600">Valor da Unidade</div>
              <div className="p-2 print:p-0.5"><CurrencyInput value={valorUnidade} onChange={setValorUnidade} className="print:text-[10px] print:py-0 font-medium" /></div>
            </div>
            <div className="grid grid-cols-[1fr_1fr] border-b border-slate-100">
              <div className="p-2 print:p-0.5 text-right font-semibold text-sm print:text-[10px] border-r border-slate-100 flex items-center justify-end whitespace-nowrap text-slate-600">Descontos</div>
              <div className="p-2 print:p-0.5"><CurrencyInput value={descontos} onChange={setDescontos} className="print:text-[10px] print:py-0 font-medium text-red-500" /></div>
            </div>
            <div className="grid grid-cols-[1fr_1fr]">
              <div className="p-2 print:p-0.5 text-right font-bold text-sm print:text-[10px] border-r border-slate-100 flex items-center justify-end whitespace-nowrap text-slate-800">Valor após descontos</div>
              <div className="p-2 print:p-0.5"><CurrencyInput value={valorAposDescontos} onChange={() => {}} readOnly className="font-bold print:text-[10px] print:py-0 text-blue-700" /></div>
            </div>
          </div>
        </div>

        {/* Main Grid for Payment Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-[12fr_7fr_5fr] print:grid-cols-[1.7fr_1fr] gap-6 print:gap-2 items-start">
          
          {/* Column 1: ATO, PRE, POS */}
          <div className="contents lg:block lg:space-y-6 print:block print:space-y-1">
            
            {/* ATO Section */}
            <div className="border border-slate-200 rounded-xl shadow-md bg-white overflow-hidden order-1">
              {/* Header */}
              <div className="grid grid-cols-2 sm:grid-cols-[0.8fr_1.2fr_1fr_1.6fr] print:grid-cols-[0.8fr_1.2fr_1fr_1.6fr] border-b border-slate-200">
                <div className="bg-[#001f3f] text-white p-2 font-bold text-center flex items-center justify-center text-base sm:text-lg print:text-sm border-b sm:border-b-0 print:border-b-0 sm:border-r border-white/10">ATO</div>
                <div className="bg-white text-slate-700 p-2 font-semibold text-center flex items-center justify-center border-b sm:border-b-0 print:border-b-0 border-r border-slate-200 text-xs sm:text-sm print:text-[10px]">Porcentagem ato:</div>
                <div className="p-2 border-r border-slate-100 bg-white flex items-center">
                  <PercentInput value={atoPercent} onChange={(val: number) => handlePercentChange('ato', val)} className="font-bold text-base sm:text-lg text-blue-900" />
                </div>
                <div className="p-2 bg-white flex items-center">
                  <CurrencyInput 
                    value={valorAtoTotal} 
                    onChange={(v: number) => {
                      if (valorAposDescontos > 0) {
                        const newPercent = (v / valorAposDescontos) * 100;
                        handlePercentChange('ato', newPercent);
                      }
                    }} 
                    className="font-bold text-base sm:text-lg text-blue-900"
                  />
                </div>
              </div>
              
              {/* Sinais Table */}
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-white text-xs font-bold tracking-wider text-slate-500 uppercase text-center">
                <div className="p-2 print:p-0.5 border-r border-slate-100">Sinal Ato</div>
                <div className="p-2 print:p-0.5 border-r border-slate-100">Valor</div>
                <div className="p-2 print:p-0.5">Data</div>
              </div>
              
              {sinais.map((sinal) => (
                <div key={sinal.id} className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 text-sm print:text-xs hover:bg-slate-50 transition-colors">
                  <div className="p-2 print:p-0.5 border-r border-slate-100 font-semibold flex items-center justify-center text-slate-700">{sinal.label}</div>
                  <div className="p-2 print:p-0.5 border-r border-slate-100">
                    <CurrencyInput value={sinal.valor} onChange={(v: number) => updateSinal(sinal.id, 'valor', v)} className="print:text-xs print:py-0 font-medium" />
                  </div>
                  <div className="p-2 print:p-0.5">
                    <input type="date" value={sinal.data} onChange={(e) => updateSinal(sinal.id, 'data', e.target.value)} className="w-full outline-none text-center print:text-xs bg-transparent" />
                  </div>
                </div>
              ))}
              
              {/* Total Sinais */}
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-white">
                <div className="p-2 print:p-0.5 border-r border-slate-100 font-bold text-right text-sm print:text-xs text-slate-600">Total</div>
                <div className={`p-2 print:p-0.5 border-r border-slate-100 font-bold text-right text-sm print:text-xs ${Math.abs(totalSinais - valorAtoTotal) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(totalSinais)}
                </div>
                <div className="p-2 print:p-0.5"></div>
              </div>
              
              {/* Qtd Sinais */}
              <div className="grid grid-cols-[1fr_2fr] text-sm print:text-xs bg-white">
                <div className="p-2 print:p-0.5 border-r border-slate-100 font-semibold text-right text-slate-600">Quantidade de sinais utilizado:</div>
                <div className="p-2 print:p-0.5 text-center font-bold text-slate-800">{qtdSinaisUtilizados}</div>
              </div>
            </div>

            {/* PRE Section */}
            <div className="border border-slate-200 rounded-xl shadow-md bg-white overflow-hidden order-3">
              <div className="bg-[#001f3f] text-white p-2 font-bold text-center border-b border-slate-200 text-xs sm:text-sm print:text-[10px]">
                PRÉ - CORRIGIDA POR <span className="text-yellow-400">INCC</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 border-b border-slate-200 text-sm">
                <div className="bg-white text-slate-700 p-2 font-semibold flex items-center justify-center border-b sm:border-b-0 print:border-b-0 border-r border-slate-200 text-center leading-tight text-[9px] sm:text-[10px] print:text-[8px]">Porcentagem Pré</div>
                <div className="p-2 border-b sm:border-b-0 border-r border-slate-100 bg-white flex items-center">
                  <PercentInput value={prePercent} onChange={(val: number) => handlePercentChange('pre', val)} className="font-bold text-xs sm:text-sm text-blue-900" />
                </div>
                <div className="p-2 border-r border-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center bg-white text-blue-900">
                  {formatCurrency(valorPreTotal)}
                </div>
                <div className="grid grid-cols-[auto_1fr] bg-white">
                   <div className="text-slate-700 p-1 px-2 font-semibold flex items-center justify-center border-r border-slate-200 text-[8px] sm:text-[9px] text-center leading-tight">Qtd.<br/>parc:</div>
                   <div className="p-1 flex items-center bg-white">
                     <input type="number" value={preParcelas} onChange={e => setPreParcelas(parseInt(e.target.value) || 0)} className="w-full text-center outline-none bg-transparent font-bold text-xs sm:text-sm text-blue-900" />
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-white text-[9px] font-bold tracking-wider text-slate-500 uppercase text-center">
                <div className="p-1 print:p-0.5 border-r border-slate-100"></div>
                <div className="p-1 print:p-0.5 border-r border-slate-100">Valor</div>
                <div className="p-1 print:p-0.5">Data de Início</div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] text-[10px] print:text-[9px]">
                <div className="bg-white text-slate-700 p-2 print:p-0.5 font-semibold flex items-center justify-center border-r border-slate-200 text-center leading-tight">Parcelas até a entrega</div>
                <div className="p-2 print:p-0.5 border-r border-slate-100 flex items-center justify-center font-bold text-blue-900">
                  {formatCurrency(valorParcelaPre)}
                </div>
                <div className="p-2 print:p-0.5 flex items-center bg-white">
                  <input type="date" value={preDataInicio} onChange={e => setPreDataInicio(e.target.value)} className="w-full outline-none text-center print:text-[9px] bg-transparent font-medium" />
                </div>
              </div>
            </div>

            <div className="order-4">
              <PreSimulation 
                parcelas={preParcelas} 
                valorBase={valorParcelaPre} 
                dataInicio={preDataInicio} 
              />
            </div>

            {/* POS Section */}
            <div className="border border-slate-200 rounded-xl shadow-md bg-white overflow-hidden order-7">
              <div className="bg-[#001f3f] text-white p-2 text-center border-b border-slate-200 flex flex-col items-center justify-center">
                <div className="font-bold text-xs sm:text-sm print:text-[10px]">
                  PÓS - CORRIGIDA POR <span className="text-yellow-400">1% + IPCA</span>
                </div>
                <div className="text-[8px] sm:text-[9px] text-slate-300 font-medium mt-0.5">
                  (O máximo permitido para o Pós-Chaves é de 60%)
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 border-b border-slate-200 text-sm">
                <div className="bg-white text-slate-700 p-2 font-semibold flex items-center justify-center border-b sm:border-b-0 print:border-b-0 border-r border-slate-200 text-center leading-tight text-[9px] sm:text-[10px] print:text-[8px]">Porcentagem PÓS</div>
                <div className="p-2 border-b sm:border-b-0 border-r border-slate-100 bg-white flex items-center">
                  <PercentInput value={posPercent} onChange={(val: number) => handlePercentChange('pos', val)} className="font-bold text-xs sm:text-sm text-blue-900" />
                </div>
                <div className="p-2 border-r border-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center bg-white text-blue-900">
                  {formatCurrency(valorPosTotal)}
                </div>
                <div className="grid grid-cols-[auto_1fr] bg-white">
                   <div className="text-slate-700 p-1 px-3 font-semibold flex items-center justify-center border-r border-slate-200 text-[8px] sm:text-[9px] text-center leading-tight">Qtd.<br/>parc:</div>
                   <div className="p-1 flex items-center bg-white">
                     <input type="number" value={posParcelas} onChange={e => setPosParcelas(parseInt(e.target.value) || 0)} className="w-full text-center outline-none bg-transparent font-bold text-xs sm:text-sm text-blue-900" />
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-white text-[9px] font-bold tracking-wider text-slate-500 uppercase text-center">
                <div className="p-1 print:p-0.5 border-r border-slate-100"></div>
                <div className="p-1 print:p-0.5 border-r border-slate-100">Valor</div>
                <div className="p-1 print:p-0.5">Data de Início</div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] text-[10px] print:text-[9px]">
                <div className="bg-white text-slate-700 p-2 print:p-0.5 font-semibold flex items-center justify-center border-r border-slate-200 text-center leading-tight">Parcelas após a entrega</div>
                <div className="p-2 print:p-0.5 border-r border-slate-100 flex items-center justify-center font-bold text-blue-900">
                  {formatCurrency(valorParcelaPos)}
                </div>
                <div className="p-2 print:p-0.5 flex items-center bg-white">
                  <input type="date" value={posDataInicio} onChange={e => setPosDataInicio(e.target.value)} className="w-full outline-none text-center print:text-[9px] bg-transparent font-medium" />
                </div>
              </div>
            </div>

            <div className="order-8">
              <PosSimulation 
                parcelas={posParcelas} 
                valorBase={valorParcelaPos} 
                dataInicio={posDataInicio} 
              />
            </div>
          </div>

          {/* Column 2: Baloes */}
          <div className="contents lg:block lg:space-y-6 print:block">
            <div className="border border-slate-200 rounded-xl shadow-md bg-white overflow-hidden order-5">
              <div className="grid grid-cols-[1fr_1fr] border-b border-slate-200 text-sm">
                <div className="p-3 print:p-0.5 border-r border-slate-100 font-bold text-center bg-white text-slate-500 uppercase tracking-wider text-xs print:text-[10px]">Porcentagem</div>
                <div className="p-3 print:p-0.5 flex items-center bg-white">
                  <PercentInput value={baloesPercent} onChange={(val: number) => handlePercentChange('baloes', val)} className="text-center font-bold text-blue-900 print:text-[10px]" />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_1fr] border-b border-slate-200 text-sm">
                <div className="p-3 print:p-0.5 border-r border-slate-100 font-bold text-center bg-white text-slate-500 uppercase tracking-wider text-xs print:text-[10px]">Valor</div>
                <div className="p-3 print:p-0.5 text-center font-bold bg-white text-blue-900 print:text-[10px]">
                  {formatCurrency(valorBaloesTotal)}
                </div>
              </div>
              <div className="bg-[#001f3f] text-white p-3 font-bold text-center border-b border-slate-200 text-base sm:text-lg print:text-sm">
                Balões
              </div>
              <div className="grid grid-cols-[1fr_1fr] border-b border-slate-100 bg-white text-xs font-bold tracking-wider text-slate-500 uppercase text-center">
                <div className="p-2 print:p-0.5 border-r border-slate-100">Valor</div>
                <div className="p-2 print:p-0.5">Data</div>
              </div>
              
              {baloes.map((balao) => (
                <div key={balao.id} className="grid grid-cols-[1fr_1fr] border-b border-slate-100 text-sm print:text-xs hover:bg-slate-50 transition-colors">
                  <div className="p-2 print:p-0.5 border-r border-slate-100">
                    <CurrencyInput value={balao.valor} onChange={(v: number) => updateBalao(balao.id, 'valor', v)} className="print:text-xs print:py-0 font-medium" />
                  </div>
                  <div className="p-2 print:p-0.5">
                    <input type="date" value={balao.data} onChange={(e) => updateBalao(balao.id, 'data', e.target.value)} className="w-full outline-none text-center print:text-xs bg-transparent font-medium" />
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-[1fr_1fr] text-sm print:text-xs bg-white">
                <div className="p-3 print:p-0.5 border-r border-slate-100 font-bold text-right text-slate-600">Total</div>
                <div className={`p-3 print:p-0.5 font-bold text-center ${Math.abs(totalBaloes - valorBaloesTotal) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(totalBaloes)}
                </div>
              </div>
            </div>
            
            {/* Print Button */}
            <div className="flex justify-end print:hidden order-9">
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
                className="flex items-center gap-2 bg-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl w-full justify-center transform hover:-translate-y-0.5"
              >
                <Printer className="w-5 h-5" />
                Imprimir Plano
              </button>
            </div>
          </div>

          {/* Column 3: Simuladores */}
          <div className="contents lg:block lg:space-y-6 print:hidden">
            
            {/* Simulador de Ato */}
            <div className="bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden order-2">
              <div className="bg-[#001f3f] text-white p-3 font-bold text-center border-b border-slate-200">
                Simulador de Ato
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  Veja como ficaria o valor total de <strong className="text-slate-900">{formatCurrency(valorAtoTotal)}</strong> dividido em parcelas iguais:
                </p>
                <div className="space-y-2">
                  {[2, 3, 4].map(num => (
                    <div key={num} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{num}x de</span>
                      <span className="font-bold text-slate-900">{formatCurrency(valorAtoTotal / num)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulador de Balões */}
            <div className="bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden order-6">
              <div className="bg-blue-600 text-white p-3 font-bold text-center border-b border-slate-200">
                Simulador de Balões
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  Veja como ficaria o valor total de <strong className="text-slate-900">{formatCurrency(valorBaloesTotal)}</strong> dividido em parcelas iguais:
                </p>
                <div className="space-y-2">
                  {[2, 3, 4, 5, 6].map(num => (
                    <div key={num} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{num}x de</span>
                      <span className="font-bold text-blue-700">{formatCurrency(valorBaloesTotal / num)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-800 text-xs leading-relaxed shadow-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <p><strong className="text-amber-900">Aviso:</strong> Os balões devem ser até no máximo 6 meses da entrega.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer AdSense */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-slate-200 p-2 text-center z-40 print:hidden shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto bg-slate-50 h-[90px] flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 rounded-xl relative overflow-hidden">
          <span className="z-10 bg-white/90 px-3 py-1.5 rounded-full shadow-sm font-medium border border-slate-100">Publicidade Google AdSense (728x90)</span>
          {/* Placeholder for actual AdSense script */}
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
        </div>
      </footer>

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
