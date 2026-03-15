import React, { useState, useEffect } from 'react';
import { X, Printer, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

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
      className={`w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-right ${readOnly ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'bg-white'} ${className}`}
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
        className={`w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-right pr-6 ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'} ${className}`}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
    </div>
  );
};

const PreSimulation = ({ parcelas, valorBase, dataInicio }: { parcelas: number, valorBase: number, dataInicio: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inccSimulado, setInccSimulado] = useState(0.3);

  if (parcelas <= 0 || valorBase <= 0) return null;

  const getSimulatedInstallments = () => {
    const list = [];
    let currentDate = new Date(dataInicio + 'T12:00:00');
    
    for (let i = 1; i <= parcelas; i++) {
      // Cálculo: valorBase * (1 + INCC)^meses
      const taxaMensal = inccSimulado / 100;
      const valorAjustado = valorBase * Math.pow(1 + taxaMensal, i - 1);
      
      list.push({
        numero: i,
        data: currentDate.toLocaleDateString('pt-BR'),
        valor: valorAjustado
      });

      // Adiciona 1 mês
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return list;
  };

  const installments = getSimulatedInstallments();

  return (
    <div className="border-2 border-gray-800 shadow-sm bg-white mt-6 print:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-100 p-3 font-bold text-center border-b border-gray-800 text-lg flex items-center justify-between hover:bg-gray-200 transition-colors"
      >
        <span>Simulação das Parcelas Pré-Chaves (INCC)</span>
        {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
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

          <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-3 rounded border border-gray-200">
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
              <thead className="bg-gray-100 sticky top-0 shadow-sm">
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

  if (parcelas <= 0 || valorBase <= 0) return null;

  const getSimulatedInstallments = () => {
    const list = [];
    let currentDate = new Date(dataInicio + 'T12:00:00');
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
        data: currentDate.toLocaleDateString('pt-BR'),
        valor: valorParcela,
        juros: juros,
        amortizacao: amortizacao,
        saldoDevedor: saldoDevedor
      });

      // Abate a amortização do saldo devedor para o próximo mês
      saldoDevedor -= amortizacao;
      
      // Adiciona 1 mês
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return list;
  };

  const installments = getSimulatedInstallments();

  return (
    <div className="border-2 border-gray-800 shadow-sm bg-white mt-6 print:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-100 p-3 font-bold text-center border-b border-gray-800 text-lg flex items-center justify-between hover:bg-gray-200 transition-colors"
      >
        <span>Simulação das Parcelas Pós-Chaves (Tabela SAC)</span>
        {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
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

          <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-3 rounded border border-gray-200">
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
              <thead className="bg-gray-100 sticky top-0 shadow-sm">
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
  const [empreendimento, setEmpreendimento] = useState('Lumina Fatima');
  const [unidade, setUnidade] = useState('BL-B-0802 - Tipologia: Tipo 3Q C/S');
  const [dataEntrega, setDataEntrega] = useState('2028-06-30');
  const [mesesAteEntrega, setMesesAteEntrega] = useState(27);

  const [valorUnidade, setValorUnidade] = useState(533568.00);
  const [descontos, setDescontos] = useState(0);

  const [atoPercent, setAtoPercent] = useState(10);
  const [sinais, setSinais] = useState([
    { id: 1, label: 'Ato 1', valor: 53356.80, data: '2026-03-15' },
    { id: 2, label: 'Sinal 1', valor: 0, data: '2026-04-15' },
    { id: 3, label: 'Sinal 2', valor: 0, data: '2026-05-15' },
    { id: 4, label: 'Sinal 3', valor: 0, data: '2026-06-15' },
  ]);

  const [baloesPercent, setBaloesPercent] = useState(0);
  const [baloes, setBaloes] = useState([
    { id: 1, valor: 0, data: '2026-12-15' },
    { id: 2, valor: 0, data: '2027-12-15' },
    { id: 3, valor: 0, data: '' },
    { id: 4, valor: 0, data: '' },
    { id: 5, valor: 0, data: '' },
  ]);

  const [prePercent, setPrePercent] = useState(30);
  const [preParcelas, setPreParcelas] = useState(26);
  const [preDataInicio, setPreDataInicio] = useState('2026-07-15');

  const [posPercent, setPosPercent] = useState(60);
  const [posParcelas, setPosParcelas] = useState(120);
  const [posDataInicio, setPosDataInicio] = useState('2029-05-15');

  const [showPrintModal, setShowPrintModal] = useState(false);

  // Handlers for percentage changes to maintain 40% pre-keys logic and 60% pos-keys logic
  const handlePercentChange = (source: 'ato' | 'pre' | 'baloes' | 'pos', newVal: number) => {
    if (source === 'pos' && newVal > 60) newVal = 60;

    let current = {
      ato: atoPercent,
      pre: prePercent,
      baloes: baloesPercent,
      pos: posPercent
    };

    const diff = newVal - current[source];
    current[source] = newVal;

    let remaining = diff;

    if (remaining > 0) {
      let order: ('ato' | 'pre' | 'baloes' | 'pos')[] = [];
      if (source === 'pre') order = ['pos', 'baloes', 'ato'];
      else if (source === 'ato') order = ['pos', 'pre', 'baloes'];
      else if (source === 'baloes') order = ['pos', 'pre', 'ato'];
      else if (source === 'pos') order = ['pre', 'baloes', 'ato'];

      for (const key of order) {
        if (remaining <= 0) break;
        const take = Math.min(current[key], remaining);
        current[key] -= take;
        remaining -= take;
      }
    } else if (remaining < 0) {
      let toAdd = -remaining;
      let order: ('ato' | 'pre' | 'baloes' | 'pos')[] = [];
      
      if (source === 'pre') order = ['pos', 'baloes', 'ato'];
      else if (source === 'ato') order = ['pos', 'pre', 'baloes'];
      else if (source === 'baloes') order = ['pos', 'pre', 'ato'];
      else if (source === 'pos') order = ['pre', 'baloes', 'ato'];

      for (const key of order) {
        if (toAdd <= 0) break;
        if (key === 'pos') {
          const space = Math.max(0, 60 - current.pos);
          const add = Math.min(space, toAdd);
          current.pos += add;
          toAdd -= add;
        } else {
          current[key] += toAdd;
          toAdd = 0;
        }
      }
    }

    setAtoPercent(current.ato);
    setPrePercent(current.pre);
    setBaloesPercent(current.baloes);
    setPosPercent(current.pos);
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
    <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 mb-6 print:shadow-none print:py-2 print:mb-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          {!imageError ? (
            <img 
              src="/logo_grupodirecional.png" 
              alt="Direcional e Riva Incorporadora" 
              className="h-24 object-contain mb-2"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center mb-2">
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-4xl font-extrabold text-[#003366] tracking-tighter italic">DIRECIONAL</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-[#003366] italic">R</span>
                <span className="text-2xl font-bold text-gray-700 tracking-widest">RIVA</span>
                <span className="text-[10px] font-normal text-gray-500 tracking-widest mt-1">INCORPORADORA</span>
              </div>
            </div>
          )}
          <h2 className="text-2xl mt-4 text-gray-800 print:mt-2">Plano de pagamento <span className="font-bold">Tabela Direta</span></h2>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-6 print:space-y-4">
        
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

        {/* General Info */}
        <div className="bg-white border-2 border-gray-800 overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_2fr] border-b border-gray-300">
            <div className="bg-gray-100 p-1.5 text-right font-semibold text-sm border-r border-gray-300 flex items-center justify-end">Empreendimento:</div>
            <div className="p-1.5"><input type="text" value={empreendimento} onChange={e => setEmpreendimento(e.target.value)} className="w-full outline-none bg-transparent" /></div>
          </div>
          <div className="grid grid-cols-[1fr_2fr] border-b border-gray-300">
            <div className="bg-gray-100 p-1.5 text-right font-semibold text-sm border-r border-gray-300 flex items-center justify-end">Unidade:</div>
            <div className="p-1.5"><input type="text" value={unidade} onChange={e => setUnidade(e.target.value)} className="w-full outline-none bg-transparent" /></div>
          </div>
          <div className="grid grid-cols-[1fr_2fr] border-b border-gray-300">
            <div className="bg-gray-100 p-1.5 text-right font-semibold text-sm border-r border-gray-300 flex items-center justify-end">Data de entrega:</div>
            <div className="p-1.5 w-48"><input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="w-full outline-none bg-transparent" /></div>
          </div>
          <div className="grid grid-cols-[1fr_2fr]">
            <div className="bg-gray-100 p-1.5 text-right font-semibold text-sm border-r border-gray-300 flex items-center justify-end">Quant meses até a entrega:</div>
            <div className="p-1.5 w-24"><input type="number" value={mesesAteEntrega} onChange={e => setMesesAteEntrega(parseInt(e.target.value) || 0)} className="w-full outline-none bg-transparent" /></div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white border-2 border-gray-800 overflow-hidden shadow-sm w-full max-w-md">
          <div className="grid grid-cols-[1fr_1fr] border-b border-gray-300">
            <div className="bg-gray-100 p-1.5 text-center font-semibold text-sm border-r border-gray-300">DESCRIÇÃO</div>
            <div className="bg-gray-100 p-1.5 text-center font-semibold text-sm">VALOR</div>
          </div>
          <div className="grid grid-cols-[1fr_1fr] border-b border-gray-300">
            <div className="p-1.5 text-right font-semibold text-sm border-r border-gray-300 flex items-center justify-end">Valor da Unidade</div>
            <div className="p-1.5"><CurrencyInput value={valorUnidade} onChange={setValorUnidade} /></div>
          </div>
          <div className="grid grid-cols-[1fr_1fr] border-b border-gray-300">
            <div className="p-1.5 text-right font-semibold text-sm border-r border-gray-300 flex items-center justify-end">Descontos</div>
            <div className="p-1.5"><CurrencyInput value={descontos} onChange={setDescontos} /></div>
          </div>
          <div className="grid grid-cols-[1fr_1fr]">
            <div className="p-1.5 text-right font-semibold text-sm border-r border-gray-300 flex items-center justify-end">Valor após descontos</div>
            <div className="p-1.5"><CurrencyInput value={valorAposDescontos} onChange={() => {}} readOnly className="font-bold" /></div>
          </div>
        </div>

        {/* Main Grid for Payment Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-[12fr_7fr_5fr] gap-6 items-start">
          
          {/* Left Column: ATO, PRE, POS */}
          <div className="space-y-6">
            
            {/* ATO Section */}
            <div className="border-2 border-gray-800 shadow-sm bg-white">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-gray-800">
                <div className="bg-black text-white p-2 font-bold text-center flex items-center justify-center text-lg">ATO</div>
                <div className="bg-blue-700 text-white p-2 font-semibold text-center flex items-center justify-center border-r border-white/20">Porcentagem ato:</div>
                <div className="p-2 border-r border-gray-300 bg-gray-50 flex items-center">
                  <PercentInput value={atoPercent} onChange={(val: number) => handlePercentChange('ato', val)} className="font-bold text-lg" />
                </div>
                <div className="p-2 bg-gray-50 flex items-center">
                  <CurrencyInput 
                    value={valorAtoTotal} 
                    onChange={(v: number) => {
                      if (valorAposDescontos > 0) {
                        const newPercent = (v / valorAposDescontos) * 100;
                        handlePercentChange('ato', newPercent);
                      }
                    }} 
                    className="font-bold text-lg"
                  />
                </div>
              </div>
              
              {/* Sinais Table */}
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-300 bg-gray-100 text-sm font-semibold text-center">
                <div className="p-1.5 border-r border-gray-300">Sinal Ato</div>
                <div className="p-1.5 border-r border-gray-300">Valor</div>
                <div className="p-1.5">Data</div>
              </div>
              
              {sinais.map((sinal) => (
                <div key={sinal.id} className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-300 text-sm">
                  <div className="p-1.5 border-r border-gray-300 font-semibold flex items-center justify-center">{sinal.label}</div>
                  <div className="p-1.5 border-r border-gray-300">
                    <CurrencyInput value={sinal.valor} onChange={(v: number) => updateSinal(sinal.id, 'valor', v)} />
                  </div>
                  <div className="p-1.5">
                    <input type="date" value={sinal.data} onChange={(e) => updateSinal(sinal.id, 'data', e.target.value)} className="w-full outline-none text-center" />
                  </div>
                </div>
              ))}
              
              {/* Total Sinais */}
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-300">
                <div className="p-1.5 border-r border-gray-300 font-bold text-right">Total</div>
                <div className={`p-1.5 border-r border-gray-300 font-bold text-right ${Math.abs(totalSinais - valorAtoTotal) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(totalSinais)}
                </div>
                <div className="p-1.5 bg-gray-50"></div>
              </div>
              
              {/* Qtd Sinais */}
              <div className="grid grid-cols-[1fr_2fr] text-sm">
                <div className="p-1.5 border-r border-gray-300 font-semibold text-right">Quantidade de sinais utilizado:</div>
                <div className="p-1.5 text-center">{qtdSinaisUtilizados}</div>
              </div>
            </div>

            {/* PRE Section */}
            <div className="border-2 border-gray-800 shadow-sm bg-white">
              <div className="bg-black text-white p-2 font-bold text-center border-b border-gray-800 text-lg">
                PRÉ - CORRIGIDA POR <span className="text-yellow-400">INCC</span>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1.2fr_1.3fr] border-b border-gray-800 text-sm">
                <div className="bg-blue-700 text-white p-2 font-semibold flex items-center justify-center border-r border-white/20 text-center leading-tight">Porcentagem Pré</div>
                <div className="p-2 border-r border-gray-300 bg-gray-50 flex items-center">
                  <PercentInput value={prePercent} onChange={(val: number) => handlePercentChange('pre', val)} className="font-bold text-lg" />
                </div>
                <div className="p-2 border-r border-gray-300 font-bold text-lg flex items-center justify-center bg-gray-50">
                  {formatCurrency(valorPreTotal)}
                </div>
                <div className="grid grid-cols-[auto_1fr] bg-blue-700">
                   <div className="text-white p-1.5 px-2 font-semibold flex items-center justify-center border-r border-white/20 text-xs text-center leading-tight">Qtd.<br/>parcelas:</div>
                   <div className="p-1.5 flex items-center bg-gray-50">
                     <input type="number" value={preParcelas} onChange={e => setPreParcelas(parseInt(e.target.value) || 0)} className="w-full text-center outline-none bg-transparent font-bold text-lg" />
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-300 text-sm font-semibold text-center bg-gray-100">
                <div className="p-1.5 border-r border-gray-300"></div>
                <div className="p-1.5 border-r border-gray-300">Valor</div>
                <div className="p-1.5">Data de Início</div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] text-sm">
                <div className="bg-blue-700 text-white p-2 font-semibold flex items-center justify-center border-r border-gray-300">Parcelas até a entrega</div>
                <div className="p-2 border-r border-gray-300 flex items-center justify-center font-medium">
                  {formatCurrency(valorParcelaPre)}
                </div>
                <div className="p-2 flex items-center">
                  <input type="date" value={preDataInicio} onChange={e => setPreDataInicio(e.target.value)} className="w-full outline-none text-center" />
                </div>
              </div>
            </div>

            <PreSimulation 
              parcelas={preParcelas} 
              valorBase={valorParcelaPre} 
              dataInicio={preDataInicio} 
            />

            {/* POS Section */}
            <div className="border-2 border-gray-800 shadow-sm bg-white">
              <div className="bg-black text-white p-2 text-center border-b border-gray-800 flex flex-col items-center justify-center">
                <div className="font-bold text-lg">
                  PÓS - CORRIGIDA POR <span className="text-yellow-400">1% + IPCA</span>
                </div>
                <div className="text-xs text-gray-300 font-medium mt-0.5">
                  (O máximo permitido para o Pós-Chaves é de 60%)
                </div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1.2fr_1.3fr] border-b border-gray-800 text-sm">
                <div className="bg-blue-700 text-white p-2 font-semibold flex items-center justify-center border-r border-white/20 text-center leading-tight">Porcentagem PÓS</div>
                <div className="p-2 border-r border-gray-300 bg-gray-50 flex items-center">
                  <PercentInput value={posPercent} onChange={(val: number) => handlePercentChange('pos', val)} className="font-bold text-lg" />
                </div>
                <div className="p-2 border-r border-gray-300 font-bold text-lg flex items-center justify-center bg-gray-50">
                  {formatCurrency(valorPosTotal)}
                </div>
                <div className="grid grid-cols-[auto_1fr] bg-blue-700">
                   <div className="text-white p-1.5 px-2 font-semibold flex items-center justify-center border-r border-white/20 text-xs text-center leading-tight">Qtd.<br/>parcelas:</div>
                   <div className="p-1.5 flex items-center bg-gray-50">
                     <input type="number" value={posParcelas} onChange={e => setPosParcelas(parseInt(e.target.value) || 0)} className="w-full text-center outline-none bg-transparent font-bold text-lg" />
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-300 text-sm font-semibold text-center bg-gray-100">
                <div className="p-1.5 border-r border-gray-300"></div>
                <div className="p-1.5 border-r border-gray-300">Valor</div>
                <div className="p-1.5">Data de Início</div>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] text-sm">
                <div className="bg-blue-700 text-white p-2 font-semibold flex items-center justify-center border-r border-gray-300">Parcelas após a entrega</div>
                <div className="p-2 border-r border-gray-300 flex items-center justify-center font-medium">
                  {formatCurrency(valorParcelaPos)}
                </div>
                <div className="p-2 flex items-center">
                  <input type="date" value={posDataInicio} onChange={e => setPosDataInicio(e.target.value)} className="w-full outline-none text-center" />
                </div>
              </div>
            </div>

            <PosSimulation 
              parcelas={posParcelas} 
              valorBase={valorParcelaPos} 
              dataInicio={posDataInicio} 
            />

          </div>

          {/* Right Column: Baloes */}
          <div className="space-y-6">
            <div className="border-2 border-gray-800 shadow-sm bg-white">
              <div className="grid grid-cols-[1fr_1fr] border-b border-gray-300 text-sm">
                <div className="p-2 border-r border-gray-300 font-semibold text-center bg-gray-100">Porcentagem</div>
                <div className="p-2 flex items-center">
                  <PercentInput value={baloesPercent} onChange={(val: number) => handlePercentChange('baloes', val)} className="text-center font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_1fr] border-b border-gray-800 text-sm">
                <div className="p-2 border-r border-gray-300 font-semibold text-center bg-gray-100">Valor</div>
                <div className="p-2 text-center font-bold bg-gray-50">
                  {formatCurrency(valorBaloesTotal)}
                </div>
              </div>
              <div className="bg-black text-white p-2 font-bold text-center border-b border-gray-800 text-lg">
                Balões
              </div>
              <div className="grid grid-cols-[1fr_1fr] border-b border-gray-300 text-sm font-semibold text-center bg-gray-100">
                <div className="p-1.5 border-r border-gray-300">Valor</div>
                <div className="p-1.5">Data</div>
              </div>
              
              {baloes.map((balao) => (
                <div key={balao.id} className="grid grid-cols-[1fr_1fr] border-b border-gray-300 text-sm">
                  <div className="p-1.5 border-r border-gray-300">
                    <CurrencyInput value={balao.valor} onChange={(v: number) => updateBalao(balao.id, 'valor', v)} />
                  </div>
                  <div className="p-1.5">
                    <input type="date" value={balao.data} onChange={(e) => updateBalao(balao.id, 'data', e.target.value)} className="w-full outline-none text-center" />
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-[1fr_1fr] text-sm">
                <div className="p-2 border-r border-gray-300 font-bold text-right bg-gray-100">Total</div>
                <div className={`p-2 font-bold text-center bg-gray-50 ${Math.abs(totalBaloes - valorBaloesTotal) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(totalBaloes)}
                </div>
              </div>
            </div>
            
            {/* Print Button */}
            <div className="flex justify-end print:hidden">
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
                className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg w-full justify-center"
              >
                <Printer className="w-5 h-5" />
                Imprimir Plano
              </button>
            </div>
          </div>

          {/* Helper Column: Simuladores */}
          <div className="space-y-6 print:hidden">
            
            {/* Simulador de Ato */}
            <div className="bg-white border-2 border-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="bg-black text-white p-3 font-bold text-center border-b border-gray-800">
                Simulador de Ato
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Veja como ficaria o valor total de <strong>{formatCurrency(valorAtoTotal)}</strong> dividido em parcelas iguais:
                </p>
                <div className="space-y-2">
                  {[2, 3, 4].map(num => (
                    <div key={num} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                      <span className="font-semibold text-gray-700">{num}x de</span>
                      <span className="font-bold text-black">{formatCurrency(valorAtoTotal / num)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulador de Balões */}
            <div className="bg-white border-2 border-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="bg-blue-700 text-white p-3 font-bold text-center border-b border-gray-800">
                Simulador de Balões
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Veja como ficaria o valor total de <strong>{formatCurrency(valorBaloesTotal)}</strong> dividido em parcelas iguais:
                </p>
                <div className="space-y-2">
                  {[2, 3, 4, 5, 6].map(num => (
                    <div key={num} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                      <span className="font-semibold text-gray-700">{num}x de</span>
                      <span className="font-bold text-blue-800">{formatCurrency(valorBaloesTotal / num)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2 text-yellow-800 text-xs leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p><strong>Aviso:</strong> Os balões devem ser até no máximo 6 meses da entrega.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer AdSense */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-2 text-center z-40 print:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto bg-gray-100 h-[90px] flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300 relative overflow-hidden">
          <span className="z-10 bg-white/80 px-2 py-1 rounded">Publicidade Google AdSense (728x90)</span>
          {/* Placeholder for actual AdSense script */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
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
    </div>
  );
}
