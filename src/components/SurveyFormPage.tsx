import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RatingInput } from './RatingInput';
import { Workshop, SurveyResponse } from '../types';
import { ShieldCheck, Send, BookOpen, Megaphone, HeartHandshake, Building, Users, Sparkles, Church, Leaf, ThumbsUp, MessageSquare, AlertCircle } from 'lucide-react';

interface SurveyFormPageProps {
  onSuccess: () => void;
}

export const SurveyFormPage: React.FC<SurveyFormPageProps> = ({ onSuccess }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [preStudyRating, setPreStudyRating] = useState<number>(5);
  const [preStudyComment, setPreStudyComment] = useState<string>('');
  
  const [marketingRating, setMarketingRating] = useState<number>(5);
  const [marketingComment, setMarketingComment] = useState<string>('');

  const [welcomeRating, setWelcomeRating] = useState<number>(5);
  const [checkinRating, setCheckinRating] = useState<number>(5);

  // Infra
  const [infraAccommodation, setInfraAccommodation] = useState<number>(5);
  const [infraBreakfast, setInfraBreakfast] = useState<number>(5);
  const [infraLunch, setInfraLunch] = useState<number>(5);
  const [infraDinner, setInfraDinner] = useState<number>(5);
  const [infraRestrooms, setInfraRestrooms] = useState<number>(5);
  const [infraTech, setInfraTech] = useState<number>(5);
  
  const [infraLodgingUsed, setInfraLodgingUsed] = useState<boolean>(true);
  const [infraLodgingRating, setInfraLodgingRating] = useState<number>(5);

  // Workshops
  const [workshop1Id, setWorkshop1Id] = useState<number | ''>('');
  const [workshop1Rating, setWorkshop1Rating] = useState<number>(5);
  
  const [workshop2Id, setWorkshop2Id] = useState<number | ''>('');
  const [workshop2Rating, setWorkshop2Rating] = useState<number>(5);

  // Moments
  const [youthMomentRating, setYouthMomentRating] = useState<number>(5);
  const [mirimMomentRating, setMirimMomentRating] = useState<number>(5);
  const [animationRating, setAnimationRating] = useState<number>(5);
  const [massRating, setMassRating] = useState<number>(5);
  const [liturgyRating, setLiturgyRating] = useState<number>(5);
  const [ecoFriendlyRating, setEcoFriendlyRating] = useState<number>(5);

  // Recommendation & Comments
  const [recommendationText, setRecommendationText] = useState<string>('');
  const [recommendationNps, setRecommendationNps] = useState<number>(10);
  const [generalSuggestions, setGeneralSuggestions] = useState<string>('');

  useEffect(() => {
    fetch('/api/workshops')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWorkshops(data);
          if (data.length > 0) {
            const w1 = data.find(w => w.time_slot === '1ª Oficina') || data[0];
            const w2 = data.find(w => w.time_slot === '2ª Oficina') || data[1] || data[0];
            if (w1) setWorkshop1Id(w1.id);
            if (w2) setWorkshop2Id(w2.id);
          }
        }
      })
      .catch(err => console.error('Erro ao buscar oficinas:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: SurveyResponse = {
      pre_study_rating: preStudyRating,
      pre_study_comment: preStudyComment,
      marketing_rating: marketingRating,
      marketing_comment: marketingComment,
      welcome_rating: welcomeRating,
      checkin_rating: checkinRating,

      infra_accommodation: infraAccommodation,
      infra_breakfast: infraBreakfast,
      infra_lunch: infraLunch,
      infra_dinner: infraDinner,
      infra_restrooms: infraRestrooms,
      infra_tech: infraTech,
      infra_lodging_used: infraLodgingUsed,
      infra_lodging_rating: infraLodgingUsed ? infraLodgingRating : 0,

      workshop1_id: workshop1Id !== '' ? Number(workshop1Id) : undefined,
      workshop1_rating: workshop1Rating,
      workshop2_id: workshop2Id !== '' ? Number(workshop2Id) : undefined,
      workshop2_rating: workshop2Rating,

      youth_moment_rating: youthMomentRating,
      mirim_moment_rating: mirimMomentRating,
      animation_rating: animationRating,
      mass_rating: massRating,
      liturgy_rating: liturgyRating,
      eco_friendly_rating: ecoFriendlyRating,

      recommendation_text: recommendationText,
      recommendation_nps: recommendationNps,
      general_suggestions: generalSuggestions
    };

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar respostas do formulário.');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar o formulário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const w1Options = workshops.filter(w => w.time_slot === '1ª Oficina' || w.time_slot === 'Geral');
  const w2Options = workshops.filter(w => w.time_slot === '2ª Oficina' || w.time_slot === 'Geral');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Form Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pesquisa 100% Anônima • 5º EPA Pirassununga</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Formulário de Avaliação e Satisfação
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Sua opinião sincera ajudará a coordenação do MFC a aprimorar nossos próximos encontros. Nenhuma informação pessoal é gravada.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* SECTION 1: Preparação Pré-EPA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">1. Preparação & Divulgação</h2>
              <p className="text-xs text-slate-500">Estudo prévio e divulgação do 5º EPA na sua cidade</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <RatingInput
                label="Estudo Pré EPA"
                sublabel="Qualidade do material preparatório enviado para as paróquias/cidades."
                value={preStudyRating}
                onChange={setPreStudyRating}
              />
              <input
                type="text"
                placeholder="Comentário sobre o Estudo Pré EPA (opcional)"
                value={preStudyComment}
                onChange={(e) => setPreStudyComment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-3">
              <RatingInput
                label="Divulgação do 5º EPA na sua cidade"
                sublabel="Como foi a informação e engajamento na sua região."
                value={marketingRating}
                onChange={setMarketingRating}
              />
              <input
                type="text"
                placeholder="Comentário sobre a divulgação (opcional)"
                value={marketingComment}
                onChange={(e) => setMarketingComment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Recepção em Pirassununga */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">2. Recepção & Credenciamento</h2>
              <p className="text-xs text-slate-500">Acolhida inicial na chegada a Pirassununga</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RatingInput
              label="Acolhida"
              sublabel="Atendimento, carinho e recepção da equipe."
              value={welcomeRating}
              onChange={setWelcomeRating}
            />
            <RatingInput
              label="Credenciamento"
              sublabel="Agilidade e organização na entrega de crachás/materiais."
              value={checkinRating}
              onChange={setCheckinRating}
            />
          </div>
        </div>

        {/* SECTION 3: Infraestrutura */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">3. Infraestrutura & Alimentação</h2>
              <p className="text-xs text-slate-500">Acomodações, refeições, recursos e instalações</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RatingInput
              label="Acomodação geral"
              value={infraAccommodation}
              onChange={setInfraAccommodation}
            />
            <RatingInput
              label="Café da Manhã"
              value={infraBreakfast}
              onChange={setInfraBreakfast}
            />
            <RatingInput
              label="Almoço"
              value={infraLunch}
              onChange={setInfraLunch}
            />
            <RatingInput
              label="Jantar"
              value={infraDinner}
              onChange={setInfraDinner}
            />
            <RatingInput
              label="Banheiros"
              sublabel="Limpeza e disponibilidade das instalações sanitárias."
              value={infraRestrooms}
              onChange={setInfraRestrooms}
            />
            <RatingInput
              label="Recursos Tecnológicos"
              sublabel="Som, projeção, Iluminação e microfones."
              value={infraTech}
              onChange={setInfraTech}
            />
          </div>

          {/* Hospedagem Variant */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">
                Você utilizou a Hospedagem do evento?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInfraLodgingUsed(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    infraLodgingUsed
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-white border text-slate-600'
                  }`}
                >
                  Sim, utilizei
                </button>
                <button
                  type="button"
                  onClick={() => setInfraLodgingUsed(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !infraLodgingUsed
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white border text-slate-600'
                  }`}
                >
                  Não me hospedei
                </button>
              </div>
            </div>

            {infraLodgingUsed && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <RatingInput
                  label="Avaliação da Hospedagem"
                  sublabel="Conforto, recepção e estrutura do local de hospedagem."
                  value={infraLodgingRating}
                  onChange={setInfraLodgingRating}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* SECTION 4: Oficinas Formativas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">4. Avaliação das Oficinas</h2>
              <p className="text-xs text-slate-500">Selecione qual oficina você participou em cada horário</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1ª Oficina */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                1ª Oficina Participada
              </label>
              <select
                value={workshop1Id}
                onChange={(e) => setWorkshop1Id(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione a 1ª Oficina...</option>
                {(w1Options.length > 0 ? w1Options : workshops).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.instructor})
                  </option>
                ))}
              </select>

              <RatingInput
                label="Nota para a 1ª Oficina"
                value={workshop1Rating}
                onChange={setWorkshop1Rating}
              />
            </div>

            {/* 2ª Oficina */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                2ª Oficina Participada
              </label>
              <select
                value={workshop2Id}
                onChange={(e) => setWorkshop2Id(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione a 2ª Oficina...</option>
                {(w2Options.length > 0 ? w2Options : workshops).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.instructor})
                  </option>
                ))}
              </select>

              <RatingInput
                label="Nota para a 2ª Oficina"
                value={workshop2Rating}
                onChange={setWorkshop2Rating}
              />
            </div>

          </div>
        </div>

        {/* SECTION 5: Momentos Especiais & Espiritualidade */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">5. Momentos Especiais & Animação</h2>
              <p className="text-xs text-slate-500">Atividades direcionadas, louvor e animação do evento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RatingInput
              label="Momento Jovem"
              value={youthMomentRating}
              onChange={setYouthMomentRating}
            />
            <RatingInput
              label="Momento MFC Mirim"
              value={mirimMomentRating}
              onChange={setMirimMomentRating}
            />
            <RatingInput
              label="Animação & Músicas"
              value={animationRating}
              onChange={setAnimationRating}
            />
          </div>
        </div>

        {/* SECTION 6: Celebrações & Sustentabilidade */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">6. Liturgia & Conscientização Ecológica</h2>
              <p className="text-xs text-slate-500">Missas, orações das cidades e respeito aos recursos naturais</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RatingInput
              label="Missa do EPA"
              sublabel="Celebração Eucarística."
              value={massRating}
              onChange={setMassRating}
            />
            <RatingInput
              label="Liturgias & Orações"
              sublabel="Orações preparadas pelas comitivas das cidades."
              value={liturgyRating}
              onChange={setLiturgyRating}
            />
            <RatingInput
              label="Respeito aos Recursos Naturais"
              sublabel="Uso consciente de descartáveis e cuidado ambiental."
              value={ecoFriendlyRating}
              onChange={setEcoFriendlyRating}
            />
          </div>
        </div>

        {/* SECTION 7: Recomendação & Depoimento */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">7. Recomendação & NPS</h2>
              <p className="text-xs text-slate-500">Como você recomendaria o EPA para quem não pôde participar?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1">
                De 0 a 10, o quanto você recomendaria o EPA para um amigo ou família do MFC?
              </label>
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRecommendationNps(i)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
                      recommendationNps === i
                        ? 'bg-emerald-500 text-slate-950 scale-110 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-sm font-semibold text-slate-800 block mb-1">
                Como você recomendaria o EPA para quem não pôde vir nesta edição? (Depoimento)
              </label>
              <textarea
                rows={3}
                placeholder="Escreva aqui uma mensagem inspiradora ou conselho para os membros da sua paróquia/cidade..."
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: Sugestões Gerais */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">8. Sugestões & Comentários Gerais</h2>
              <p className="text-xs text-slate-500">Espaço livre para elogios, críticas construtivas e ideias para o 6º EPA</p>
            </div>
          </div>

          <textarea
            rows={3}
            placeholder="Deixe aqui suas sugestões de melhoria para os próximos encontros do MFC..."
            value={generalSuggestions}
            onChange={(e) => setGeneralSuggestions(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-3"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? 'Enviando Respostas...' : 'Finalizar e Enviar Avaliação do EPA'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
