import React, { useState, useEffect } from 'react';
import { SurveyAverages } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';
import { BarChart3, Star, Heart, ThumbsUp, ShieldCheck, Leaf, RefreshCw, Printer, MessageSquare, Quote, AlertCircle, Users, Sparkles } from 'lucide-react';
import { authFetch } from '../lib/authFetch';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<SurveyAverages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/surveys');
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Não foi possível carregar os dados estatísticos.');
        setData(null);
        return;
      }

      setData(json);
    } catch (err) {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
        <p className="font-semibold text-sm">Carregando dados estatísticos do evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-slate-600 bg-white rounded-3xl border border-slate-200 space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-400" />
        <h3 className="text-xl font-bold text-slate-800">Erro ao carregar dados</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (!data || data.total_surveys === 0) {
    return (
      <div className="space-y-5 sm:space-y-8">
        {data && data.total_participants > 0 && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800 text-white flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] sm:text-xs font-bold mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Adesão à Pesquisa</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black">
                0 <span className="text-slate-400 text-base sm:text-lg font-bold">/ {data.total_participants} inscritos</span>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Meta: 80% dos inscritos respondendo a avaliação</p>
            </div>
            <span className="text-3xl sm:text-4xl font-black text-amber-400">0%</span>
          </div>
        )}

        <div className="p-12 text-center text-slate-600 bg-white rounded-3xl border border-slate-200 space-y-4">
          <BarChart3 className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-xl font-bold text-slate-800">Nenhuma pesquisa respondida ainda</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Assim que os participantes enviarem o formulário anônimo, os gráficos e dados estatísticos serão gerados automaticamente.
          </p>
        </div>
      </div>
    );
  }

  const { averages } = data;

  // Chart 1: Main Event Dimensions
  const categoryData = [
    { name: 'Estudo Pré', score: averages.pre_study, fullMark: 5 },
    { name: 'Divulgação', score: averages.marketing, fullMark: 5 },
    { name: 'Acolhida', score: averages.welcome, fullMark: 5 },
    { name: 'Credenciamento', score: averages.checkin, fullMark: 5 },
    { name: 'Momento Jovem', score: averages.youth_moment, fullMark: 5 },
    { name: 'MFC Mirim', score: averages.mirim_moment, fullMark: 5 },
    { name: 'Animação', score: averages.animation, fullMark: 5 },
    { name: 'Missa', score: averages.mass, fullMark: 5 },
    { name: 'Liturgias', score: averages.liturgy, fullMark: 5 },
    { name: 'Rec. Naturais', score: averages.eco_friendly, fullMark: 5 },
  ];

  // Chart 2: Infrastructure Ratings
  const infraData = [
    { name: 'Acomodação', score: averages.infra_accommodation },
    { name: 'Café', score: averages.infra_breakfast },
    { name: 'Almoço', score: averages.infra_lunch },
    { name: 'Jantar', score: averages.infra_dinner },
    { name: 'Banheiros', score: averages.infra_restrooms },
    { name: 'Tecnologia', score: averages.infra_tech },
    { name: 'Hospedagem', score: averages.infra_lodging || averages.infra_accommodation },
  ];

  // Colors
  const COLORS = ['#2563eb', '#4f46e5', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 sm:space-y-8 pb-16 print:p-0">

      {/* Top Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Resultados Consolidados</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Relatório de Satisfação
          </h1>
          <p className="hidden sm:block text-slate-600 text-xs sm:text-sm">
            Consolidado das avaliações do 5º EPA em Pirassununga
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="px-3.5 py-2.5 sm:py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 sm:py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-slate-800 flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Response Rate Banner: enrolled participants vs surveys answered, with an 80% goal */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-800 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] sm:text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Adesão à Pesquisa</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black">
              {data.total_surveys} <span className="text-slate-400 text-base sm:text-lg font-bold">/ {data.total_participants} inscritos</span>
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Meta: 80% dos inscritos respondendo a avaliação
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 min-w-[140px]">
            <span className={`text-3xl sm:text-4xl font-black ${data.response_rate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {data.response_rate}%
            </span>
            <div className="w-full sm:w-40 h-2.5 bg-slate-700/60 rounded-full overflow-hidden relative">
              {/* 80% goal marker */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-white/50" style={{ left: '80%' }} />
              <div
                className={`h-full rounded-full transition-all ${data.response_rate >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(data.response_rate, 100)}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
              {data.response_rate >= 80 ? 'Meta atingida! 🎉' : `Faltam ${Math.max(0, Math.round((data.total_participants * 0.8) - data.total_surveys))} respostas para a meta`}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Card 1: Total Responses */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 sm:space-y-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500">Pesquisas Respondidas</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.total_surveys}</p>
          <span className="text-[9px] sm:text-[10px] text-blue-600 font-bold">100% Anônima</span>
        </div>

        {/* Card 2: Overall Score */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 sm:space-y-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500">Média Geral</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.avg_overall_score} <span className="text-xs font-normal text-slate-400">/5</span></p>
          <span className="text-[9px] sm:text-[10px] text-amber-600 font-bold">{Math.round((data.avg_overall_score / 5) * 100)}% Aprovação</span>
        </div>

        {/* Card 3: NPS Score */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 sm:space-y-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500">Recomendação NPS</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{data.nps_score} <span className="text-xs font-normal text-slate-400">/10</span></p>
          <span className="text-[9px] sm:text-[10px] text-indigo-600 font-bold">Índice do Participante</span>
        </div>

        {/* Card 4: Eco Score */}
        <div className="p-3.5 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5 sm:space-y-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500">Sustentabilidade</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{averages.eco_friendly} <span className="text-xs font-normal text-slate-400">/5</span></p>
          <span className="text-[9px] sm:text-[10px] text-blue-700 font-bold">Recursos Naturais</span>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">

        {/* Chart 1: Categorias do Evento */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Satisfação por Atividade</h3>
              <p className="hidden sm:block text-xs text-slate-500">Avaliação das atividades do 5º EPA (escala 1 a 5)</p>
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-1 rounded-full flex-shrink-0">
              Média 1-5
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 5, left: -25, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-45} textAnchor="end" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(val: any) => [`${val} / 5.0`, 'Nota Média']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Infraestrutura */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Infraestrutura & Alimentação</h3>
              <p className="hidden sm:block text-xs text-slate-500">Avaliação das acomodações e refeições em Pirassununga</p>
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 sm:px-2.5 py-1 rounded-full flex-shrink-0">
              Infraestrutura
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={infraData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} width={75} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(val: any) => [`${val} / 5.0`, 'Nota Média']}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Workshop Specific Ratings */}
      {data.workshop_ratings.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
          <div className="border-b border-slate-100 pb-3 sm:pb-4">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Avaliação das Oficinas</h3>
            <p className="text-xs text-slate-500">Média das notas dadas pelos participantes em cada oficina</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {data.workshop_ratings.map((ws) => {
              const aspects = [
                { label: 'Domínio do conteúdo', value: ws.avg_content },
                { label: 'Didática/clareza', value: ws.avg_didactic },
                { label: 'Material utilizado', value: ws.avg_material },
                { label: 'Interação/participação', value: ws.avg_interaction },
                { label: 'Aplicabilidade', value: ws.avg_applicability },
              ];
              return (
                <div key={ws.workshop_id} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{ws.workshop_title}</p>
                    <div className="flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{ws.avg_rating} / 5.0</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500">{ws.total_votes} votos</span>

                  <div className="space-y-1.5 pt-1 border-t border-slate-200">
                    {aspects.map((a) => (
                      <div key={a.label} className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-[11px] text-slate-600 w-28 sm:w-32 flex-shrink-0">{a.label}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((a.value / 5) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 w-8 text-right flex-shrink-0">{a.value || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* "In one word" cloud */}
      {data.epa_words.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">O 5º EPA em uma palavra</h3>
              <p className="text-xs text-slate-500">Como os participantes definiram o encontro</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.epa_words.map((word, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 font-bold text-xs sm:text-sm rounded-full"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Anonymous Testimonials & Suggestions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">

        {/* Testimonials */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Quote className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Depoimentos & Recomendações</h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {data.recent_testimonials.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum depoimento gravado ainda.</p>
            ) : (
              data.recent_testimonials.map((t, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="text-xs text-slate-700 italic">"{t.text}"</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-blue-600">Recomendação NPS: {t.nps}/10</span>
                    <span>Anônimo</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Sugestões de Melhoria</h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {data.recent_suggestions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhuma sugestão enviada ainda.</p>
            ) : (
              data.recent_suggestions.map((s, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="text-xs text-slate-700">{s.text}</p>
                  <div className="text-right text-[10px] text-slate-400">
                    <span>Participante do EPA</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
