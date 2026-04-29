import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, AlertTriangle, ChevronDown, ChevronUp, Settings, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { EmpreendimentosManager, EmpreendimentoData, defaultEmpreendimentos } from './components/EmpreendimentosManager';

// --- Constants ---
const EMPREENDIMENTOS: Record<string, { data: string, link: string }> = {
  "Conquista Maraponga": { data: "2027-01-31", link: "https://drive.google.com/drive/folders/1SG_hjajREyteMcr7_M2swybXdswYcLds?usp=drive_link" },
  "Conquista Messejana": { data: "2028-05-31", link: "https://drive.google.com/drive/folders/1LXqN4e7ib6GA37f_zSVJWk8232rs7bRi?usp=drive_link" },
  "Estilo Fátima": { data: "2027-03-30", link: "https://drive.google.com/drive/folders/14hOJLPrMCvHRzk9VGjxjQNoPrRj_nUx2?usp=drive_link" },
  "Estilo Passaré": { data: "2026-10-31", link: "https://drive.google.com/drive/folders/1GvKhDsrZ4rnEa-NuNymCKwOezcv4CGXf?usp=drive_link" },
  "Estilo Praia": { data: "2026-10-31", link: "https://drive.google.com/drive/folders/1jqFVnn8Pf5Qd-aR-GsHLkkRVCJ3a-JvU?usp=drive_link" },
  "Jandaia": { data: "2028-09-30", link: "https://drive.google.com/drive/folders/1_ojnKIEd8QPPlkCA7U65_AR2lU589a5h?usp=drive_link" },
  "Lúmina Fátima": { data: "2028-06-30", link: "https://drive.google.com/drive/folders/1gdRJMDH2e2Ecv8U8bb7C1uG-MWeETLCo?usp=drive_link" },
  "My Place Benfica": { data: "2025-08-31", link: "https://drive.google.com/drive/folders/1nqzfTcIAtUj9sdAgXlKzcKeBfVv3NlMZ?usp=drive_link" },
  "Nature Arbo": { data: "2028-05-31", link: "https://drive.google.com/drive/folders/1f_OG7VKMFagDX_UoxWK8-SgeX15kfYaN?usp=drive_link" },
  "Nature Eusébio": { data: "2028-08-31", link: "https://drive.google.com/drive/folders/1AfU2DAam5h6s6wVmSzWnTbOcUUKiNHAg?usp=drive_link" },
  "Orizon Rooftop": { data: "2029-04-30", link: "https://drive.google.com/drive/folders/1QvUfUg3-27uVDQMpAV9z60EAWCpdsMxC?usp=drive_link" },
  "Parque": { data: "2025-04-30", link: "https://drive.google.com/drive/folders/1RFswrgGeE2wOTAVt2a3uFbOXcl7CtN89?usp=drive_link" },
  "Reserva Flora": { data: "2025-07-01", link: "https://drive.google.com/drive/folders/1aQGlqupGsA672ilyPUeMxUqNRkSBTBAE?usp=drive_link" },
  "Seano Beach": { data: "2028-07-31", link: "https://drive.google.com/drive/folders/1Ou40hjybFktfT3-zQZFPqRtwdHxS8DmN?usp=drive_link" },
  "Vida Nova Caucaia": { data: "2027-04-30", link: "https://drive.google.com/drive/folders/1VelEu-DcrA8R763DiG3ifwebVwkNNPdt?usp=drive_link" },
  "Viva Vida Coqueiros": { data: "2027-09-30", link: "https://drive.google.com/drive/folders/1I8YkjufrVCB5UDVd867P-Y5QYGaQaE-_?usp=drive_link" },
  "Viva Vida Maracanaú": { data: "2027-06-30", link: "https://drive.google.com/drive/folders/1x_3GxAQIth_noN4qZjrawwZ6IO35Ibyf?usp=drive_link" },
  "Viva Vida Siqueira": { data: "2026-09-30", link: "https://drive.google.com/drive/folders/13h5L-fAHtaSusnKoB4t7j7qPbD9eH4Oc?usp=drive_link" },
  "Viva Vida Sul": { data: "2028-06-30", link: "https://drive.google.com/drive/folders/1rag3UlzyFIkTVMkTxWFO79GUeOGtGZpM?usp=drive_link" },
  "Viva Vida Tropical": { data: "2026-09-30", link: "https://drive.google.com/drive/folders/1WSWGcOTs_8_YgWJINXMjyOi391bNuSQN?usp=drive_link" }
};

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
      className={`w-full px-3 py-2 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:bg-blue-50/30 transition-colors outline-none text-right font-medium ${readOnly ? 'bg-transparent text-gray-700 cursor-default hover:border-transparent' : 'bg-gray-50/50'} ${className}`}
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
        step="0.000001"
        className={`w-full px-3 py-2 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:bg-blue-50/30 transition-colors outline-none text-right pr-8 font-medium ${readOnly ? 'bg-transparent text-gray-700 cursor-default hover:border-transparent' : 'bg-gray-50/50'} ${className}`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium group-focus-within:text-blue-600 transition-colors">%</span>
    </div>
  );
};

const Field = ({ label, children, className = '' }: { label: React.ReactNode, children: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col border-b border-slate-100 last:border-0 p-3 ${className} break-inside-avoid`}>
    <span className="text-[16px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
    <div className="text-slate-900 font-medium text-[16px]">{children}</div>
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
    <div className={`bg-white border-t border-slate-100 ${printSimulation ? '' : 'print:hidden'}`} data-html2canvas-ignore={!printSimulation ? "true" : "false"}>
      <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 p-3 font-bold text-left text-sm flex items-center justify-between text-slate-700"
          data-html2canvas-ignore="true"
        >
          <span>Simulação das Parcelas Pós-Chaves (Tabela SAC)</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        <div className="pr-4 pl-2 flex items-center gap-2 print:hidden border-l border-slate-200" onClick={e => e.stopPropagation()} data-html2canvas-ignore="true">
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
  const [tipoTabela, setTipoTabela] = useState<'direta' | 'investidor'>('direta');

  const [nomeCliente, setNomeCliente] = useState('');
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
  const mainRef = useRef<HTMLElement>(null);

  // Handlers for percentage changes to maintain 40% pre-keys logic and 60% pos-keys logic
  const handlePercentChange = (source: 'ato' | 'pre' | 'baloes' | 'pos', newVal: number) => {
    let ato = atoPercent;
    let pre = prePercent;
    let baloes = baloesPercent;
    let pos = tipoTabela === 'investidor' ? 0 : posPercent;

    if (source === 'ato') {
      ato = newVal;
      if (tipoTabela === 'investidor') {
        pre = 100 - ato - baloes;
      } else {
        pre = 100 - ato - baloes - pos;
      }
    } else if (source === 'baloes') {
      baloes = newVal;
      if (tipoTabela === 'investidor') {
        pre = 100 - ato - baloes;
      } else {
        pre = 100 - ato - baloes - pos;
      }
    } else if (source === 'pre') {
      pre = newVal;
      if (tipoTabela === 'investidor') {
        // If pre is changed in investor mode, we adjust ato or baloes? 
        // User probably expects pre to be 100 - ato - baloes automatically
        // but if they edit PRE, we adjust baloes to compensate.
        baloes = 100 - ato - pre;
      } else {
        pos = 100 - ato - baloes - pre;
      }
    } else if (source === 'pos' && tipoTabela !== 'investidor') {
      pos = newVal;
      pre = 100 - ato - baloes - pos;
    }

    // --- Ajustes de Segurança ---
    if (tipoTabela === 'investidor') {
      pos = 0;
      if (pre < 0) {
        ato += pre;
        pre = 0;
      }
      if (ato < 0) {
        baloes += ato;
        ato = 0;
      }
    } else {
      if (pre < 0 && source !== 'pre') {
        pos += pre;
        pre = 0;
      }
      if (pos < 0 && source !== 'pos') {
        pre += pos;
        pos = 0;
      }
    }

    // Garante que os valores finais não sejam negativos
    ato = Math.max(0, ato);
    pre = Math.max(0, pre);
    baloes = Math.max(0, baloes);
    pos = Math.max(0, pos);

    // Ajuste final para garantir soma 100% exata
    const soma = ato + pre + baloes + pos;
    if (Math.abs(soma - 100) > 0.000001) {
      if (tipoTabela === 'investidor') {
        pre = Number((100 - ato - baloes).toFixed(6));
      } else if (source === 'pre') {
        pos = Number((100 - ato - baloes - pre).toFixed(6));
      } else {
        pre = Number((100 - ato - baloes - pos).toFixed(6));
      }
    }

    setAtoPercent(Number(ato.toFixed(6)));
    setPrePercent(Number(pre.toFixed(6)));
    setBaloesPercent(Number(baloes.toFixed(6)));
    setPosPercent(Number(pos.toFixed(6)));
  };

  // Effect to adjust percentages when table type changes
  useEffect(() => {
    if (tipoTabela === 'investidor') {
      const remainingForPre = Math.max(0, 100 - atoPercent - baloesPercent);
      setPosPercent(0);
      setPrePercent(Number(remainingForPre.toFixed(6)));
    } else {
      // Logic for returning to 'direta'
      if (posPercent === 0) {
        setPosPercent(60);
        setPrePercent(Math.max(0, Number((100 - atoPercent - baloesPercent - 60).toFixed(6))));
      }
    }
  }, [tipoTabela]);

  // Auto-calculate months until delivery when delivery date changes
  useEffect(() => {
    if (dataEntrega) {
      if (dataEntrega === 'Entregue') {
        setMesesAteEntrega(0);
        return;
      }
      
      const deliveryDate = new Date(dataEntrega + 'T12:00:00');
      if (isNaN(deliveryDate.getTime())) {
        setMesesAteEntrega(0);
        return;
      }
      
      const currentDate = new Date();
      
      const yearsDiff = deliveryDate.getFullYear() - currentDate.getFullYear();
      const monthsDiff = deliveryDate.getMonth() - currentDate.getMonth();
      
      // Adicionamos +1 pois o mês de entrega também conta como mês de pré
      let totalMonths = (yearsDiff * 12) + monthsDiff + 1;
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
  const isPercentExactly100 = Math.abs(totalPercent - 100) < 0.0001;

  const totalPagoReal = totalSinais + totalBaloes + valorPreTotal + valorPosTotal;
  const isValorValid = Math.abs(totalPagoReal - valorAposDescontos) < 0.1;

  // Auto-fill or adjust Ato 1 based on valorAtoTotal
  useEffect(() => {
    const utilizedSignals = sinais.filter(s => s.valor > 0);
    const currentTotal = sinais.reduce((acc, s) => acc + s.valor, 0);
    
    // Case 1: All signals are 0, initial state
    if (valorAtoTotal > 0 && currentTotal === 0) {
      setSinais(prev => prev.map(s => s.id === 1 ? { ...s, valor: valorAtoTotal } : s));
      return;
    }

    // Case 2: Only Ato 1 has value, adjust it to match valorAtoTotal
    if (utilizedSignals.length === 1 && utilizedSignals[0].label === 'Ato 1') {
      if (Math.abs(utilizedSignals[0].valor - valorAtoTotal) > 0.01) {
        setSinais(prev => prev.map(s => s.id === 1 ? { ...s, valor: valorAtoTotal } : s));
      }
    }
  }, [valorAtoTotal]);

  // Auto-calculate signals dates and preDataInicio
  useEffect(() => {
    const atoDateStr = sinais[0].data;
    if (!atoDateStr) return;

    const atoDate = new Date(atoDateStr + 'T12:00:00');
    let lastDate = new Date(atoDate);
    let updatedSinais = false;
    const newSinais = [...sinais];

    for (let i = 1; i < newSinais.length; i++) {
      if (newSinais[i].valor > 0) {
        const nextDate = new Date(atoDate);
        nextDate.setMonth(atoDate.getMonth() + i);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        if (newSinais[i].data !== nextDateStr) {
          newSinais[i].data = nextDateStr;
          updatedSinais = true;
        }
        lastDate = new Date(nextDate);
      }
    }

    if (updatedSinais) {
      setSinais(newSinais);
    }

    // Update preDataInicio: 15th of the month following the last signal
    const preDate = new Date(lastDate);
    preDate.setMonth(lastDate.getMonth() + 1);
    preDate.setDate(15);
    const preDateStr = preDate.toISOString().split('T')[0];
    if (preDataInicio !== preDateStr) {
      setPreDataInicio(preDateStr);
    }
  }, [sinais[0].data, sinais[1].valor, sinais[2].valor, sinais[3].valor]);

  // Handlers
  const updateSinal = (id: number, field: 'valor' | 'data', value: any) => {
    setSinais(sinais.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateBalao = (id: number, field: 'valor' | 'data', value: any) => {
    setBaloes(baloes.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const applyAtoSuggestion = (num: number) => {
    const valorParcela = valorAtoTotal / num;
    const newSinais = sinais.map((s, idx) => {
      if (idx < num) {
        return { ...s, valor: valorParcela };
      }
      return { ...s, valor: 0, data: '' };
    });
    setSinais(newSinais);
  };

  const applyBaloesSuggestion = (num: number) => {
    const valorParcela = valorBaloesTotal / num;
    const now = new Date();
    let startYear = now.getFullYear();
    let startMonth;

    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    if (currentMonth < 5 || (currentMonth === 5 && currentDay <= 15)) {
      startMonth = 5; // Jun
    } else if (currentMonth < 11 || (currentMonth === 11 && currentDay <= 15)) {
      startMonth = 11; // Dec
    } else {
      startMonth = 5;
      startYear++;
    }

    const newBaloes = baloes.map((b, idx) => {
      if (idx < num) {
        let finalMonth = startMonth;
        let finalYear = startYear;

        for (let i = 0; i < idx; i++) {
          if (finalMonth === 5) {
            finalMonth = 11;
          } else {
            finalMonth = 5;
            finalYear++;
          }
        }

        const date = new Date(finalYear, finalMonth, 15);
        return { 
          ...b, 
          valor: valorParcela, 
          data: date.toISOString().split('T')[0] 
        };
      }
      return { ...b, valor: 0, data: '' };
    });
    setBaloes(newBaloes);
  };

  const currentEmpData = empreendimentosList.find(emp => emp.nome === empreendimento);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans text-gray-900">
      {/* Table Type Selector and Print Button */}
      <div className="max-w-6xl mx-auto px-4 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setTipoTabela('direta')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tipoTabela === 'direta' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tabela Direta
          </button>
          <button
            onClick={() => setTipoTabela('investidor')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tipoTabela === 'investidor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tabela Investidor
          </button>
        </div>
        
        <div className="flex gap-3">
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
      </div>

      <div id="pdf-capture-container" className="bg-slate-50">
        {/* Header */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-8">
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
                <h2 className="text-white font-bold text-xl sm:text-2xl tracking-[0.4em] uppercase ml-[0.4em]">
                  Proposta {tipoTabela === 'direta' ? 'Tabela Direta' : 'Tabela Investidor'}
                </h2>
              </div>
            </div>
          </div>
        </header>

        <main 
          ref={mainRef} 
          id="proposta-content"
          className="max-w-6xl mx-auto px-4 space-y-6"
        >
          
          {/* Validation Status */}
          <div className="print:hidden space-y-4">
            {(!isPercentExactly100 || !isValorValid) ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex flex-col gap-2 shadow-sm rounded-r-md transition-all">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-500 w-5 h-5" />
                  <h3 className="text-red-800 font-bold uppercase tracking-wider text-sm">Inconsistências no Plano</h3>
                </div>
                <ul className="list-disc pl-10 text-red-700 text-xs space-y-1 font-medium">
                  {!isPercentExactly100 && (
                    <li>
                      {tipoTabela === 'direta' 
                        ? 'Soma das porcentagens deve ser 100%.' 
                        : 'Ato + Mensais + Balões deve ser 100%.'
                      } 
                      Atual: <span className="font-bold">{totalPercent.toFixed(4)}%</span>
                    </li>
                  )}
                  {!isValorValid && (
                    <li>
                      {tipoTabela === 'direta'
                        ? 'Soma dos valores (Ato + Parcelas + Balões) diferente do total.'
                        : 'Pagamentos não somam o valor total do imóvel.'
                      }
                      Faltam/Sobram: <span className="font-bold">{formatCurrency(valorAposDescontos - totalPagoReal)}</span>
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 flex items-center justify-between shadow-sm rounded-r-md transition-all">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-500 w-5 h-5" />
                  <div>
                    <h3 className="text-emerald-800 font-bold uppercase tracking-wider text-sm">Plano Validado</h3>
                    <p className="text-emerald-600 text-[10px] font-medium">As porcentagens e valores estão perfeitamente equilibrados.</p>
                  </div>
                </div>
                <div className="flex gap-4 text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-emerald-100">
                  <span>Soma: 100%</span>
                  <span>Total: {formatCurrency(totalPagoReal)}</span>
                </div>
              </div>
            )}
          </div>

        {/* Info and Values side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start break-inside-avoid">
          {/* General Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
            <div className="bg-[#002699] p-3 rounded-t-xl">
              <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                Informações do Imóvel
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 p-1">
              <Field label="Nome do Cliente" className="sm:col-span-2">
                <input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" placeholder="Nome completo do cliente" />
              </Field>
              <Field label="Empreendimento" className="sm:col-span-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      list="empreendimentos-list"
                      value={empreendimento} 
                      onChange={e => {
                        const nome = e.target.value;
                        setEmpreendimento(nome);
                        
                        // Prioridade para a constante EMPREENDIMENTOS
                        if (EMPREENDIMENTOS[nome]) {
                          setDataEntrega(EMPREENDIMENTOS[nome].data);
                        } else {
                          const emp = empreendimentosList.find(x => x.nome === nome);
                          if (emp && emp.dataEntrega) setDataEntrega(emp.dataEntrega);
                        }
                      }} 
                      className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1"
                      placeholder="Digite ou selecione..."
                    />
                    <datalist id="empreendimentos-list">
                      {[...empreendimentosList]
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                        .map(emp => (
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

                  {currentEmpData?.linkArquivos && (
                    <div className="flex justify-start print:hidden" data-html2canvas-ignore="true">
                      <a 
                        href={currentEmpData.linkArquivos} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg no-underline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                        Ver Arquivos do Empreendimento
                      </a>
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Unidade">
                <input type="text" value={unidade} onChange={e => setUnidade(e.target.value)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" placeholder="Ex: Apto 101" />
              </Field>
              <Field label="Data de entrega">
                <input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="w-full outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" />
              </Field>
              <Field label="Meses até entrega" className="sm:col-span-2">
                <input type="number" value={mesesAteEntrega} onChange={e => setMesesAteEntrega(parseInt(e.target.value) || 0)} className="w-32 outline-none bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 transition-colors py-1" />
              </Field>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col">
            <div className="bg-[#002699] p-3 rounded-t-xl">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-6">
          <div className="lg:col-span-2">
            {/* ATO Section */}
            <div className="bg-white border-2 border-[#002699] rounded-xl shadow-[0_0_15px_rgba(0,38,153,0.2)] h-full flex flex-col relative overflow-hidden break-inside-avoid">
              <div className="bg-[#002699] p-3 rounded-t-lg flex justify-between items-center">
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
                        <>
                          <div className="absolute -top-1 -right-4 bg-yellow-400 text-blue-900 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm z-10 animate-pulse print:hidden uppercase whitespace-nowrap" data-html2canvas-ignore="true">
                            Preencha Aqui ★
                          </div>
                          {!sinal.data && (
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-red-600 text-[10px] font-bold animate-blink whitespace-nowrap z-20">
                              Preencha a data
                            </div>
                          )}
                        </>
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
                    <div key={num} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-sm group">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{num}x de</span>
                        <span className="font-bold text-slate-900">{formatCurrency(valorAtoTotal / num)}</span>
                      </div>
                      <button 
                        onClick={() => applyAtoSuggestion(num)}
                        className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors uppercase tracking-wider shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Aplicar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRE Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-6">
          <div className="lg:col-span-2">
            {/* PRE Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col break-inside-avoid">
              <div className="bg-[#002699] p-3 rounded-t-xl flex justify-between items-center">
                <h3 className="font-bold text-[25px] tracking-wider text-white uppercase flex items-center gap-2">
                  {tipoTabela === 'direta' ? 'Pré-Chaves (INCC)' : 'Mensais (Sem Correção)'}
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
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-6 ${(baloesPercent === 0 || totalBaloes === 0) ? 'print:hidden' : ''}`}>
          <div className="lg:col-span-2">
            {/* BALOES Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col break-inside-avoid">
              <div className="bg-[#002699] p-3 rounded-t-xl flex justify-between items-center">
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
                    <div key={num} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-sm group">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{num}x de</span>
                        <span className="font-bold text-blue-700">{formatCurrency(valorBaloesTotal / num)}</span>
                      </div>
                      <button 
                        onClick={() => applyBaloesSuggestion(num)}
                        className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors uppercase tracking-wider shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Aplicar
                      </button>
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
        {tipoTabela === 'direta' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-6">
            <div className="lg:col-span-2">
              {/* POS Section */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col break-inside-avoid">
                <div className="bg-[#002699] p-3 rounded-t-xl flex justify-between items-center">
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
        )}

        {/* Footer Text */}
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 space-y-3">
          <p>1. Essa é apenas uma simulação, para valores exatos seria necessário a aprovação de crédito e inserção dos dados dentro do sistema da construtora.</p>
          <p>2. Essa proposta não garante a reserva da unidade em questão.</p>
          <p>3. Esta é uma proposta simulada com validade condicionada à política comercial do mês vigente. Os valores e condições definitivos estão sujeitos à validação e reserva oficial dentro do sistema da Direcional.</p>
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-right italic">
            Última atualização em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* QR Code Section */}
        {EMPREENDIMENTOS[empreendimento] && (
          <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm break-inside-avoid">
            <QRCodeSVG value={EMPREENDIMENTOS[empreendimento].link} size={100} />
            <p className="mt-3 text-slate-700 font-bold text-sm uppercase tracking-wider">
              Escaneie para acessar os arquivos do empreendimento
            </p>
          </div>
        )}
      </main>
    </div>

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
