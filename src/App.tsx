import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShieldAlert, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Smile, 
  RotateCcw, 
  Info, 
  Download, 
  ChevronRight, 
  Check, 
  X, 
  Activity,
  SmilePlus,
  HelpCircle
} from 'lucide-react';

interface DailyLog {
  day: number;
  date: string;
  score: number; // 0-10
  timing: string;
  symptoms: string[];
  context: {
    mealChange: boolean;
    eatingFast: boolean;
    stress: boolean;
    cycle: boolean;
    otherText: string;
  };
  freeNote: string;
}

interface ChallengeDay {
  day: number;
  focus: string;
  task: string;
  completed: boolean;
}

const INITIAL_CHALLENGES: ChallengeDay[] = [
  {
    day: 1,
    focus: "Conhecer seu ponto de partida",
    task: "Registre como está se sentindo hoje e em que momentos o desconforto aparece. Não mude sua alimentação só para 'ir bem' no desafio.",
    completed: false,
  },
  {
    day: 2,
    focus: "Ritmo das refeições",
    task: "Escolha uma refeição para comer com mais calma, sentado e mastigando sem pressa.",
    completed: false,
  },
  {
    day: 3,
    focus: "Ar engolido durante o dia",
    task: "Observe se chicletes, canudos ou bebidas gaseificadas parecem acompanhar seus sintomas. Se quiser, teste reduzir apenas um desses hábitos por hoje.",
    completed: false,
  },
  {
    day: 4,
    focus: "Tamanho e rotina das refeições",
    task: "Observe se refeições muito grandes ou feitas com pressa coincidem com desconforto. Não pule refeições como compensação.",
    completed: false,
  },
  {
    day: 5,
    focus: "Fibras e intestino",
    task: "Registre mudanças recentes na ingestão de fibras ou no funcionamento intestinal. Não aumente fibras de repente nem elimine alimentos nutritivos por conta própria.",
    completed: false,
  },
  {
    day: 6,
    focus: "Movimento confortável",
    task: "Se for adequado para você, faça uma caminhada leve ou mantenha seu movimento habitual. Não use exercício como punição ou compensação alimentar.",
    completed: false,
  },
  {
    day: 7,
    focus: "Rever padrões, sem tirar conclusões apressadas",
    task: "Veja os registros e anote o que vale continuar observando. O app não deve afirmar que encontrou uma intolerância ou causa médica.",
    completed: false,
  },
];

export default function App() {
  // Navigation: 'welcome' | 'triage' | 'home' | 'challenge' | 'log' | 'journal' | 'help' | 'summary'
  const [currentScreen, setCurrentScreen] = useState<string>('welcome');
  const [activeTab, setActiveTab] = useState<'today' | 'journal' | 'progress' | 'help'>('today');

  // Safety triage state
  const [triageAnswers, setTriageAnswers] = useState({
    urgentPain: false,
    vomitBloodOrBreath: false,
    unableToPassGasOrStool: false,
    bloodInStoolOrWeightLoss: false,
    frequentOrWorsening: false,
  });
  const [triageWarningState, setTriageWarningState] = useState<'none' | 'urgent' | 'consult'>('none');

  // Challenge & Logs state loaded from localStorage
  const [challenges, setChallenges] = useState<ChallengeDay[]>(() => {
    const saved = localStorage.getItem('comfort_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('comfort_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Current day being logged or viewed
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [todayScore, setTodayScore] = useState<number>(3);
  const [todayTiming, setTodayTiming] = useState<string>('Depois de comer');
  const [todaySymptoms, setTodaySymptoms] = useState<string[]>(['Gases']);
  const [todayContext, setTodayContext] = useState({
    mealChange: false,
    eatingFast: false,
    stress: false,
    cycle: false,
    otherText: '',
  });
  const [todayFreeNote, setTodayFreeNote] = useState<string>('');
  const [showLogSuccess, setShowLogSuccess] = useState<boolean>(false);

  // Export summary modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('comfort_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('comfort_logs', JSON.stringify(logs));
  }, [logs]);

  const handleToggleChallenge = (day: number) => {
    setChallenges(prev =>
      prev.map(c => c.day === day ? { ...c, completed: !c.completed } : c)
    );
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyLog = {
      day: selectedDayNum,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      score: todayScore,
      timing: todayTiming,
      symptoms: todaySymptoms,
      context: todayContext,
      freeNote: todayFreeNote,
    };

    // Replace or add log for this day
    setLogs(prev => {
      const filtered = prev.filter(l => l.day !== selectedDayNum);
      return [...filtered, newLog].sort((a, b) => a.day - b.day);
    });

    // Also mark challenge as completed for that day
    setChallenges(prev =>
      prev.map(c => c.day === selectedDayNum ? { ...c, completed: true } : c)
    );

    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 3000);
  };

  const checkTriageAndProceed = () => {
    if (triageAnswers.urgentPain || triageAnswers.vomitBloodOrBreath || triageAnswers.unableToPassGasOrStool) {
      setTriageWarningState('urgent');
      return;
    }
    if (triageAnswers.bloodInStoolOrWeightLoss || triageAnswers.frequentOrWorsening) {
      setTriageWarningState('consult');
      return;
    }
    setTriageWarningState('none');
    setCurrentScreen('app');
    setActiveTab('today');
  };

  const resetAppData = () => {
    if (window.confirm("Deseja reiniciar seu diário e progresso do desafio?")) {
      setChallenges(INITIAL_CHALLENGES);
      setLogs([]);
      setCurrentScreen('welcome');
      setTriageWarningState('none');
      setTriageAnswers({
        urgentPain: false,
        vomitBloodOrBreath: false,
        unableToPassGasOrStool: false,
        bloodInStoolOrWeightLoss: false,
        frequentOrWorsening: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] text-[#2D3732] flex flex-col items-center justify-start py-4 px-2 sm:py-8 font-sans selection:bg-[#E2EBDD]">
      {/* Container simulating mobile app or responsive card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E8EDE5] flex flex-col min-h-[840px] relative transition-all duration-300">
        
        {/* Top Status Bar / Header */}
        <header className="bg-[#FAFBF9] border-b border-[#EBEFE8] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E2EBDD] flex items-center justify-center text-[#4A6B53]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[#2C4033]">Mais Conforto Abdominal</h1>
              <p className="text-[11px] text-[#6B7C72]">Desafio de 7 Dias</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentScreen === 'app' && (
              <button 
                onClick={() => setCurrentScreen('help')}
                className="w-8 h-8 rounded-full bg-[#F0F4EE] hover:bg-[#E5EBE1] flex items-center justify-center text-[#526B5C] transition-colors"
                title="Avisos e Ajuda"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={resetAppData}
              className="w-8 h-8 rounded-full bg-[#F0F4EE] hover:bg-[#E5EBE1] flex items-center justify-center text-[#526B5C] transition-colors"
              title="Reiniciar App"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
          
          {/* SCREEN: WELCOME */}
          {currentScreen === 'welcome' && (
            <div className="p-6 flex flex-col items-center text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-[#EAF2E8] rounded-3xl flex items-center justify-center text-[#52795B] my-4 shadow-sm">
                <SmilePlus className="w-10 h-10" />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-[#26382E]">
                  7 dias para observar o que pode ajudar seu conforto abdominal
                </h2>
                <p className="text-sm text-[#55665D] leading-relaxed px-2">
                  Inchaço pode ter diferentes causas, e cada pessoa percebe os sintomas de um jeito. Durante esta semana, você vai testar hábitos simples e registrar como se sente. Não precisa cortar grupos inteiros de alimentos, passar fome ou buscar uma barriga “perfeita”.
                </p>
              </div>

              <div className="bg-[#F4F7F2] p-4 rounded-2xl border border-[#E4EBE0] text-left w-full space-y-2">
                <div className="flex items-start space-x-2.5 text-xs text-[#526B5C]">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#6B8A72]" />
                  <span>Este desafio não promete eliminar o inchaço nem substitui avaliação de um profissional de saúde.</span>
                </div>
              </div>

              <div className="w-full pt-4">
                <button
                  onClick={() => setCurrentScreen('triage')}
                  className="w-full py-4 bg-[#52795B] hover:bg-[#43644A] text-white font-medium rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-base cursor-pointer"
                >
                  <span>Começar com segurança</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: SAFETY TRIAGE */}
          {currentScreen === 'triage' && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7A9A82]">Checagem Inicial</span>
                <h2 className="text-xl font-bold text-[#26382E]">Você está com algum destes sinais agora?</h2>
                <p className="text-xs text-[#627368]">
                  Sua segurança em primeiro lugar. Leia com atenção antes de prosseguir.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] hover:bg-[#F2F7EF] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={triageAnswers.urgentPain}
                    onChange={e => setTriageAnswers({ ...triageAnswers, urgentPain: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#52795B] rounded"
                  />
                  <span className="text-xs text-[#3C4D43] font-medium leading-snug">
                    Dor abdominal forte e súbita.
                  </span>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] hover:bg-[#F2F7EF] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={triageAnswers.vomitBloodOrBreath}
                    onChange={e => setTriageAnswers({ ...triageAnswers, vomitBloodOrBreath: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#52795B] rounded"
                  />
                  <span className="text-xs text-[#3C4D43] font-medium leading-snug">
                    Vômito com sangue ou dificuldade importante para respirar.
                  </span>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] hover:bg-[#F2F7EF] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={triageAnswers.unableToPassGasOrStool}
                    onChange={e => setTriageAnswers({ ...triageAnswers, unableToPassGasOrStool: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#52795B] rounded"
                  />
                  <span className="text-xs text-[#3C4D43] font-medium leading-snug">
                    Barriga inchada junto com incapacidade de evacuar ou eliminar gases.
                  </span>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] hover:bg-[#F2F7EF] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={triageAnswers.bloodInStoolOrWeightLoss}
                    onChange={e => setTriageAnswers({ ...triageAnswers, bloodInStoolOrWeightLoss: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#52795B] rounded"
                  />
                  <span className="text-xs text-[#3C4D43] font-medium leading-snug">
                    Inchaço acompanhado de sangue nas fezes, perda de peso sem intenção, vômitos ou dor persistente.
                  </span>
                </label>

                <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] hover:bg-[#F2F7EF] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={triageAnswers.frequentOrWorsening}
                    onChange={e => setTriageAnswers({ ...triageAnswers, frequentOrWorsening: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#52795B] rounded"
                  />
                  <span className="text-xs text-[#3C4D43] font-medium leading-snug">
                    Sintomas frequentes, persistentes ou piorando com o tempo.
                  </span>
                </label>
              </div>

              {triageWarningState === 'urgent' && (
                <div className="bg-[#FDEDED] border border-[#F5C6C6] p-4 rounded-2xl text-[#8A2B2B] space-y-2 text-xs">
                  <div className="flex items-center space-x-2 font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-[#D32F2F]" />
                    <span>Atenção Médica Urgente Necessária</span>
                  </div>
                  <p>Não continue o desafio agora. Procure atendimento de urgência local imediatamente.</p>
                </div>
              )}

              {triageWarningState === 'consult' && (
                <div className="bg-[#FFF4E5] border border-[#FFE0B2] p-4 rounded-2xl text-[#8C6D23] space-y-2 text-xs">
                  <div className="flex items-center space-x-2 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#F57C00]" />
                    <span>Avaliação Profissional Recomendada</span>
                  </div>
                  <p>Marque uma avaliação com um profissional de saúde. Inchaço recorrente ou acompanhado de outros sintomas pode precisar de investigação.</p>
                </div>
              )}

              <div className="pt-2 flex flex-col space-y-3">
                <button
                  onClick={checkTriageAndProceed}
                  className="w-full py-4 bg-[#52795B] hover:bg-[#43644A] text-white font-medium rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
                >
                  <span>Continuar para o Desafio</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="w-full py-3 bg-transparent text-[#627368] hover:text-[#3C4D43] font-medium text-xs transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: MAIN APP WITH TABS */}
          {currentScreen === 'app' && (
            <div className="flex flex-col">
              
              {/* TAB 1: TODAY / CHALLENGE */}
              {activeTab === 'today' && (
                <div className="p-5 space-y-6 animate-fadeIn">
                  
                  {/* Daily Challenge Card */}
                  <div className="bg-gradient-to-br from-[#F2F7EF] to-[#E8F0E3] p-5 rounded-3xl border border-[#DCE6D7] shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-[#52795B] text-white text-xs font-semibold rounded-full">
                        Dia {selectedDayNum} de 7
                      </span>
                      <span className="text-xs text-[#526B5C] font-medium">
                        {challenges.find(c => c.day === selectedDayNum)?.focus}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[#26382E]">
                        {challenges.find(c => c.day === selectedDayNum)?.focus}
                      </h3>
                      <p className="text-xs text-[#48594F] leading-relaxed">
                        {challenges.find(c => c.day === selectedDayNum)?.task}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleChallenge(selectedDayNum)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
                          challenges.find(c => c.day === selectedDayNum)?.completed
                            ? 'bg-[#52795B] text-white shadow-sm'
                            : 'bg-white text-[#52795B] border border-[#DCE6D7] hover:bg-[#F9FCF8]'
                        }`}
                      >
                        {challenges.find(c => c.day === selectedDayNum)?.completed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Concluído por hoje</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>Marcar como feito</span>
                          </>
                        )}
                      </button>

                      <div className="text-[11px] text-[#6A8072]">
                        Deslize abaixo para registrar
                      </div>
                    </div>
                  </div>

                  {/* Day Selector Grid (All 7 days visible) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#526B5C] uppercase tracking-wider">
                      Selecionar Dia do Desafio
                    </label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {challenges.map(c => {
                        const isSelected = c.day === selectedDayNum;
                        return (
                          <button
                            key={c.day}
                            onClick={() => setSelectedDayNum(c.day)}
                            className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#52795B] text-white shadow-md ring-2 ring-[#52795B]/30'
                                : c.completed
                                ? 'bg-[#E8F0E3] text-[#43644A] border border-[#D0E0C8]'
                                : 'bg-[#F4F7F2] text-[#627368] hover:bg-[#EAEFE6]'
                            }`}
                          >
                            <span className="text-[11px] font-bold">Dia {c.day}</span>
                            <span className="text-[8px] opacity-90 truncate max-w-full px-0.5">
                              {c.completed ? 'Feito' : 'Pendente'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Log Form */}
                  <form onSubmit={handleSaveLog} className="bg-white p-5 rounded-3xl border border-[#E5ECE2] shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#26382E] flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-[#52795B]" />
                        <span>Registro de Sintomas (Dia {selectedDayNum})</span>
                      </h4>
                      <span className="text-[10px] text-[#82998A] bg-[#F4F7F2] px-2 py-0.5 rounded-md">Opcional</span>
                    </div>

                    {showLogSuccess && (
                      <div className="bg-[#EAF2E8] text-[#3B5C44] p-3 rounded-2xl text-xs flex items-center space-x-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Registro salvo com sucesso!</span>
                      </div>
                    )}

                    {/* Score 0 - 10 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[#48594F]">Sensação de desconforto (0 a 10):</span>
                        <span className="font-bold text-[#52795B] text-sm">{todayScore}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={todayScore}
                        onChange={e => setTodayScore(Number(e.target.value))}
                        className="w-full accent-[#52795B] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#82998A]">
                        <span>0 - Nenhum</span>
                        <span>5 - Moderado</span>
                        <span>10 - Intenso</span>
                      </div>
                    </div>

                    {/* Timing */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#48594F]">Quando apareceu?</label>
                      <select
                        value={todayTiming}
                        onChange={e => setTodayTiming(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#E0EBE0] text-xs bg-[#FAFBF9] text-[#2D3732] focus:outline-none focus:ring-2 focus:ring-[#52795B]"
                      >
                        <option value="Antes de comer">Antes de comer</option>
                        <option value="Durante ou logo após comer">Durante ou logo após comer</option>
                        <option value="Outro momento do dia">Outro momento do dia</option>
                        <option value="Não sei / Variado">Não sei / Variado</option>
                      </select>
                    </div>

                    {/* Symptoms checkbox */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#48594F]">O que mais percebeu?</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['Gases', 'Sensação de plenitude', 'Dor leve', 'Alteração intestinal'].map(sym => (
                          <label key={sym} className="flex items-center space-x-2 p-2 rounded-xl bg-[#F9FBF8] border border-[#EBEFE8] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={todaySymptoms.includes(sym)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setTodaySymptoms([...todaySymptoms, sym]);
                                } else {
                                  setTodaySymptoms(todaySymptoms.filter(s => s !== sym));
                                }
                              }}
                              className="accent-[#52795B] rounded"
                            />
                            <span className="text-[#3C4D43]">{sym}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Optional context notes */}
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-medium text-[#48594F]">O que vale anotar? (Opcional)</label>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={todayContext.mealChange}
                            onChange={e => setTodayContext({ ...todayContext, mealChange: e.target.checked })}
                            className="accent-[#52795B] rounded"
                          />
                          <span className="text-[#55665D]">Refeição ou bebida diferente</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={todayContext.eatingFast}
                            onChange={e => setTodayContext({ ...todayContext, eatingFast: e.target.checked })}
                            className="accent-[#52795B] rounded"
                          />
                          <span className="text-[#55665D]">Pressa ao comer</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={todayContext.stress}
                            onChange={e => setTodayContext({ ...todayContext, stress: e.target.checked })}
                            className="accent-[#52795B] rounded"
                          />
                          <span className="text-[#55665D]">Estresse ou correria</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={todayContext.cycle}
                            onChange={e => setTodayContext({ ...todayContext, cycle: e.target.checked })}
                            className="accent-[#52795B] rounded"
                          />
                          <span className="text-[#55665D]">Ciclo menstrual / alterações hormonais</span>
                        </label>
                      </div>
                    </div>

                    {/* Free note */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#48594F]">Algo mais que gostaria de lembrar?</label>
                      <textarea
                        rows={2}
                        value={todayFreeNote}
                        onChange={e => setTodayFreeNote(e.target.value)}
                        placeholder="Ex: Mastiguei mais devagar no almoço..."
                        className="w-full p-2.5 rounded-xl border border-[#E0EBE0] text-xs bg-[#FAFBF9] text-[#2D3732] focus:outline-none focus:ring-2 focus:ring-[#52795B]"
                      />
                    </div>

                    <p className="text-[11px] text-[#6A8072] italic leading-tight">
                      “Uma coincidência no diário não confirma que um alimento seja a causa. Use as anotações como pistas para conversar com um profissional, se necessário.”
                    </p>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#52795B] hover:bg-[#43644A] text-white font-medium rounded-xl shadow-sm text-xs transition-all cursor-pointer"
                    >
                      Salvar meu registro (Dia {selectedDayNum})
                    </button>
                  </form>

                </div>
              )}

              {/* TAB 2: JOURNAL / HISTÓRICO */}
              {activeTab === 'journal' && (
                <div className="p-5 space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#26382E]">Diário e Registros</h3>
                    <p className="text-xs text-[#627368]">
                      Seus apontamentos diários sem foco em peso ou medidas. Apenas observação com gentileza.
                    </p>
                  </div>

                  {logs.length === 0 ? (
                    <div className="text-center py-12 bg-[#FAFCF9] rounded-3xl border border-dashed border-[#D2E0CC] p-6 space-y-3">
                      <div className="w-12 h-12 bg-[#EAF2E8] rounded-2xl flex items-center justify-center text-[#52795B] mx-auto">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-[#526B5C] font-medium">Nenhum registro salvo ainda.</p>
                      <p className="text-[11px] text-[#82998A]">Vá na aba "Hoje" para salvar seu primeiro diário do desafio.</p>
                      <button
                        onClick={() => setActiveTab('today')}
                        className="px-4 py-2 bg-[#52795B] text-white rounded-xl text-xs font-medium"
                      >
                        Fazer registro agora
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map(log => (
                        <div key={log.day} className="bg-white p-4 rounded-2xl border border-[#E5ECE2] shadow-sm space-y-2">
                          <div className="flex items-center justify-between border-b border-[#F0F4EE] pb-2">
                            <span className="text-xs font-bold text-[#26382E]">Dia {log.day} ({log.date})</span>
                            <span className="px-2 py-0.5 bg-[#EAF2E8] text-[#3B5C44] text-[10px] font-semibold rounded-full">
                              Desconforto: {log.score}/10
                            </span>
                          </div>
                          
                          <div className="text-xs text-[#48594F] space-y-1">
                            <p><span className="font-medium text-[#2C4033]">Momento:</span> {log.timing}</p>
                            {log.symptoms.length > 0 && (
                              <p><span className="font-medium text-[#2C4033]">Sintomas:</span> {log.symptoms.join(', ')}</p>
                            )}
                            {log.freeNote && (
                              <p className="italic text-[#55665D] bg-[#F7F9F6] p-2 rounded-xl mt-1">
                                “{log.freeNote}”
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="pt-2">
                        <button
                          onClick={() => setShowExportModal(true)}
                          className="w-full py-3 bg-[#EAF2E8] hover:bg-[#DCEADA] text-[#3B5C44] font-medium rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Exportar resumo para conversar com um profissional</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROGRESS & DAY 7 REVIEW */}
              {activeTab === 'progress' && (
                <div className="p-5 space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#26382E]">Resumo do Desafio</h3>
                    <p className="text-xs text-[#627368]">
                      O que você percebeu durante estes 7 dias, sem diagnóstico ou conclusões apressadas.
                    </p>
                  </div>

                  <div className="bg-[#F2F7EF] p-5 rounded-3xl border border-[#DCE6D7] space-y-4">
                    <h4 className="text-sm font-bold text-[#26382E]">Seu Progresso de Hábitos</h4>
                    
                    <div className="space-y-2">
                      {challenges.map(c => (
                        <div key={c.day} className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-[#E5ECE2]">
                          <div className="flex items-center space-x-2.5">
                            {c.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#52795B] shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#B5C4BC] shrink-0" />
                            )}
                            <span className="font-medium text-[#3C4D43]">Dia {c.day}: {c.focus}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.completed ? 'bg-[#EAF2E8] text-[#3B5C44]' : 'bg-[#F4F7F2] text-[#7A9A82]'}`}>
                            {c.completed ? 'Observado' : 'Pendente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-[#E5ECE2] space-y-3">
                    <h4 className="text-sm font-bold text-[#26382E]">Reflexão Final</h4>
                    <p className="text-xs text-[#55665D] leading-relaxed">
                      Você completou sete dias de observação. Talvez tenha percebido algum padrão; talvez ainda não. Isso não confirma a causa dos sintomas nem significa que você precise cortar alimentos.
                    </p>
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="w-full py-3 bg-[#52795B] hover:bg-[#43644A] text-white font-medium rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    >
                      <span>Conversar com um profissional</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: HELP & DISCLAIMER */}
              {activeTab === 'help' && (
                <div className="p-5 space-y-5 animate-fadeIn text-xs text-[#48594F] leading-relaxed">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#26382E]">Ajuda e Avisos de Segurança</h3>
                    <p className="text-[11px] text-[#627368]">Orientações importantes sobre o uso deste mini app.</p>
                  </div>

                  <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E5ECE2] space-y-3">
                    <h4 className="font-bold text-[#2C4033] flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-[#52795B]" />
                      <span>Aviso importante</span>
                    </h4>
                    <p>
                      Este mini app é educativo e não oferece diagnóstico, prescrição ou tratamento. Os exercícios de observação não garantem que o inchaço desapareça, nem prometem barriga reta ou qualquer resultado estético.
                    </p>
                    <p>
                      A sensação de inchaço pode ter causas diferentes, e mudanças que ajudam uma pessoa podem não ajudar outra. Não faça dietas restritivas, não elimine grupos alimentares nem use laxantes ou outros produtos para tentar “desinchar” com base apenas neste conteúdo.
                    </p>
                  </div>

                  <div className="bg-[#FDEDED] p-4 rounded-2xl border border-[#F5C6C6] text-[#8A2B2B] space-y-2">
                    <h4 className="font-bold flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
                      <span>Sinais de Alerta</span>
                    </h4>
                    <p className="leading-snug">
                      Se os sintomas forem frequentes, persistentes, piorarem ou vierem acompanhados de dor importante, alterações intestinais, sangue nas fezes ou perda de peso sem intenção, procure um profissional de saúde. Para sinais graves ou súbitos, procure atendimento de urgência local.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('today')}
                    className="w-full py-3 bg-[#52795B] text-white font-medium rounded-xl text-xs"
                  >
                    Voltar para o Desafio
                  </button>
                </div>
              )}

            </div>
          )}

          {/* SCREEN: HELP DIRECT SCREEN FROM HEADER */}
          {currentScreen === 'help' && (
            <div className="p-6 space-y-5 animate-fadeIn text-xs text-[#48594F] leading-relaxed">
              <div className="flex items-center justify-between border-b border-[#EBEFE8] pb-3">
                <h3 className="text-base font-bold text-[#26382E]">Orientação Educativa e Ajuda</h3>
                <button
                  onClick={() => setCurrentScreen('app')}
                  className="w-7 h-7 bg-[#F0F4EE] rounded-full flex items-center justify-center text-[#526B5C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E5ECE2] space-y-2">
                  <h4 className="font-bold text-[#2C4033]">Sobre o Desafio</h4>
                  <p>
                    O objetivo é observar hábitos e testar ajustes simples, sem dieta restritiva nem promessa de barriga chapada. Gases e sensação de inchaço são comuns, mas sintomas frequentes ou que afetam a rotina merecem atenção.
                  </p>
                </div>

                <div className="bg-[#FDEDED] p-4 rounded-2xl border border-[#F5C6C6] text-[#8A2B2B] space-y-2">
                  <h4 className="font-bold">Quando procurar atendimento</h4>
                  <p>
                    Se os sintomas forem persistentes, vierem acompanhados de sangue nas fezes ou perda de peso sem intenção, agende uma avaliação com um profissional de saúde. Para dores fortes e súbitas, busque atendimento de urgência.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentScreen('app')}
                  className="w-full py-3 bg-[#52795B] text-white font-medium rounded-xl text-xs"
                >
                  Entendido, voltar ao app
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Bottom Navigation Bar (Only visible when in app screen) */}
        {currentScreen === 'app' && (
          <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#EBEFE8] px-4 py-2.5 flex items-center justify-around z-20 shadow-lg">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                activeTab === 'today' ? 'text-[#52795B]' : 'text-[#82998A] hover:text-[#526B5C]'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-medium">Hoje</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                activeTab === 'journal' ? 'text-[#52795B]' : 'text-[#82998A] hover:text-[#526B5C]'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-medium">Diário</span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                activeTab === 'progress' ? 'text-[#52795B]' : 'text-[#82998A] hover:text-[#526B5C]'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-medium">Progresso</span>
            </button>

            <button
              onClick={() => setActiveTab('help')}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                activeTab === 'help' ? 'text-[#52795B]' : 'text-[#82998A] hover:text-[#526B5C]'
              }`}
            >
              <Info className="w-5 h-5" />
              <span className="text-[10px] font-medium">Ajuda</span>
            </button>
          </nav>
        )}

      </div>

      {/* Export Summary Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E5ECE2]">
            <div className="flex items-center justify-between border-b border-[#EBEFE8] pb-3">
              <h3 className="text-sm font-bold text-[#26382E]">Resumo para o Profissional de Saúde</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-7 h-7 bg-[#F0F4EE] rounded-full flex items-center justify-center text-[#526B5C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F7F9F6] p-4 rounded-2xl border border-[#E2EBE0] text-xs text-[#3C4D43] space-y-2 max-h-60 overflow-y-auto">
              <p className="font-bold text-[#2C4033]">Relatório do Desafio (Mais Conforto Abdominal)</p>
              {logs.length === 0 ? (
                <p className="italic text-[#7A9A82]">Nenhum registro diário salvo ainda.</p>
              ) : (
                logs.map(l => (
                  <div key={l.day} className="border-b border-[#EBEFE8] pb-2 space-y-1">
                    <p className="font-semibold">Dia {l.day} ({l.date}) - Desconforto: {l.score}/10</p>
                    <p>Momento: {l.timing}</p>
                    {l.symptoms.length > 0 && <p>Sintomas: {l.symptoms.join(', ')}</p>}
                    {l.freeNote && <p className="italic text-[#55665D]">Obs: {l.freeNote}</p>}
                  </div>
                ))
              )}
            </div>

            <p className="text-[11px] text-[#627368]">
              Você pode copiar este resumo ou apresentar ao seu médico ou nutricionista para facilitar a conversa sobre seus sintomas e rotina.
            </p>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  const summaryText = logs.map(l => `Dia ${l.day}: Desconforto ${l.score}/10, Momento: ${l.timing}, Sintomas: ${l.symptoms.join(', ')}${l.freeNote ? ` (${l.freeNote})` : ''}`).join('\n');
                  navigator.clipboard.writeText(`Resumo Mais Conforto Abdominal:\n${summaryText}`);
                  alert("Resumo copiado para a área de transferência!");
                }}
                className="flex-1 py-3 bg-[#52795B] hover:bg-[#43644A] text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
              >
                Copiar Resumo
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-3 bg-[#F4F7F2] text-[#526B5C] font-medium rounded-xl text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
