import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RatingInput } from './RatingInput';
import { EpaLoading } from './EpaLoading';
import { Workshop, SurveyResponse } from '../types';
import logoEpa from '../images/logo-epa.png';
import {
  ShieldCheck, Send, BookOpen, HeartHandshake, Building, Users, Sparkles, Church,
  ThumbsUp, MessageSquare, AlertCircle, FileCheck2, ArrowRight, ArrowLeft,
  Lock, PartyPopper
} from 'lucide-react';

interface SurveyFormPageProps {
  onSuccess: () => void;
}

type SectionId = 'prep' | 'reception' | 'infra' | 'workshops' | 'moments' | 'liturgy' | 'recommend' | 'suggestions' | 'consent';

// Fixed set of firework burst origins/colors for the splash "typing" screen —
// deterministic so the animation looks the same every load, no Math.random() needed.
const FIREWORKS = [
  { x: '18%', y: '22%', color: '#2563eb', delay: 0.1 },
  { x: '82%', y: '20%', color: '#f59e0b', delay: 0.3 },
  { x: '25%', y: '75%', color: '#4f46e5', delay: 0.55 },
  { x: '78%', y: '72%', color: '#ec4899', delay: 0.2 },
  { x: '50%', y: '12%', color: '#10b981', delay: 0.45 },
  { x: '10%', y: '48%', color: '#f59e0b', delay: 0.65 },
  { x: '90%', y: '50%', color: '#2563eb', delay: 0.35 },
];

const FIREWORK_PARTICLE_ANGLES = Array.from({ length: 10 }, (_, i) => (i * 360) / 10);

const Firework: React.FC<{ x: string; y: string; color: string; delay: number }> = ({ x, y, color, delay }) => (
  <div className="absolute" style={{ left: x, top: y }}>
    {FIREWORK_PARTICLE_ANGLES.map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const distance = 46;
      return (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, top: 0, left: 0 }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            x: Math.cos(rad) * distance,
            y: Math.sin(rad) * distance,
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{ duration: 0.9, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.3 }}
        />
      );
    })}
  </div>
);

const SECTION_META: Record<SectionId, { icon: React.ReactNode; iconBg: string; title: string }> = {
  prep: { icon: <BookOpen className="w-5 h-5" />, iconBg: 'bg-blue-100 text-blue-800', title: 'Preparação & Divulgação' },
  reception: { icon: <HeartHandshake className="w-5 h-5" />, iconBg: 'bg-indigo-100 text-indigo-800', title: 'Recepção & Credenciamento' },
  infra: { icon: <Building className="w-5 h-5" />, iconBg: 'bg-sky-100 text-sky-800', title: 'Infraestrutura & Alimentação' },
  workshops: { icon: <Users className="w-5 h-5" />, iconBg: 'bg-purple-100 text-purple-800', title: 'Avaliação das Oficinas' },
  moments: { icon: <Sparkles className="w-5 h-5" />, iconBg: 'bg-amber-100 text-amber-800', title: 'Momentos Especiais & Animação' },
  liturgy: { icon: <Church className="w-5 h-5" />, iconBg: 'bg-indigo-100 text-indigo-800', title: 'Liturgia & Ecologia' },
  recommend: { icon: <ThumbsUp className="w-5 h-5" />, iconBg: 'bg-blue-100 text-blue-800', title: 'Recomendação & NPS' },
  suggestions: { icon: <MessageSquare className="w-5 h-5" />, iconBg: 'bg-slate-100 text-slate-800', title: 'Sugestões Gerais' },
  consent: { icon: <FileCheck2 className="w-5 h-5" />, iconBg: 'bg-slate-100 text-slate-800', title: 'Termo de Privacidade' },
};

export const SurveyFormPage: React.FC<SurveyFormPageProps> = ({ onSuccess }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [splashPhase, setSplashPhase] = useState<'typing' | 'logo'>('typing');
  const [typedText, setTypedText] = useState('');
  const SPLASH_WORD = 'EPAAAAAAAA!';
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Type out "EPAAAAAAAA!" one letter at a time.
    const LETTER_DELAY_MS = 220;
    for (let i = 1; i <= SPLASH_WORD.length; i++) {
      timers.push(setTimeout(() => setTypedText(SPLASH_WORD.slice(0, i)), LETTER_DELAY_MS * i));
    }

    const typingDuration = LETTER_DELAY_MS * SPLASH_WORD.length;
    timers.push(setTimeout(() => setSplashPhase('logo'), typingDuration + 600));
    timers.push(setTimeout(() => setShowSplash(false), typingDuration + 600 + 2200));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Form State
  const [preStudyRating, setPreStudyRating] = useState<number>(0);
  const [preStudyComment, setPreStudyComment] = useState<string>('');

  const [marketingRating, setMarketingRating] = useState<number>(0);
  const [marketingComment, setMarketingComment] = useState<string>('');

  const [welcomeRating, setWelcomeRating] = useState<number>(0);
  const [checkinRating, setCheckinRating] = useState<number>(0);

  // Infra
  const [infraAccommodation, setInfraAccommodation] = useState<number>(0);
  const [infraBreakfast, setInfraBreakfast] = useState<number>(0);
  const [infraLunch, setInfraLunch] = useState<number>(0);
  const [infraDinner, setInfraDinner] = useState<number>(0);
  const [infraRestrooms, setInfraRestrooms] = useState<number>(0);
  const [infraTech, setInfraTech] = useState<number>(0);

  const [infraLodgingUsed, setInfraLodgingUsed] = useState<boolean>(true);
  const [infraLodgingRating, setInfraLodgingRating] = useState<number>(0);

  // Workshops
  const [participatedWorkshops, setParticipatedWorkshops] = useState<boolean | null>(null);
  const [workshop1Id, setWorkshop1Id] = useState<number | ''>('');
  const [workshop1Rating, setWorkshop1Rating] = useState<number>(0);

  const [workshop2Id, setWorkshop2Id] = useState<number | ''>('');
  const [workshop2Rating, setWorkshop2Rating] = useState<number>(0);

  // Moments
  const [youthMomentRating, setYouthMomentRating] = useState<number>(0);
  const [mirimMomentRating, setMirimMomentRating] = useState<number>(0);
  const [animationRating, setAnimationRating] = useState<number>(0);
  const [massRating, setMassRating] = useState<number>(0);
  const [liturgyRating, setLiturgyRating] = useState<number>(0);
  const [ecoFriendlyRating, setEcoFriendlyRating] = useState<number>(0);

  // Recommendation & Comments
  const [recommendationText, setRecommendationText] = useState<string>('');
  const [recommendationNps, setRecommendationNps] = useState<number>(10);
  const [epaWord, setEpaWord] = useState<string>('');
  const [generalSuggestions, setGeneralSuggestions] = useState<string>('');

  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/workshops')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWorkshops(data);
        }
      })
      .catch(err => console.error('Erro ao buscar oficinas:', err));
  }, []);

  const w1Options = workshops.filter(w => w.time_slot.startsWith('1ª') || w.time_slot === 'Geral');
  const w2Options = workshops.filter(w => w.time_slot.startsWith('2ª') || w.time_slot === 'Geral');

  // -----------------------------------------------------------------------
  // One question (or small self-contained group) per screen.
  // -----------------------------------------------------------------------
  type Question = { section: SectionId; render: () => React.ReactNode; isAnswered?: () => boolean };

  const questions: Question[] = [
    {
      section: 'prep',
      isAnswered: () => preStudyRating > 0,
      render: () => (
        <RatingInput
          label="Estudo Pré EPA"
          sublabel="Qualidade do material preparatório enviado para as paróquias/cidades."
          value={preStudyRating}
          onChange={setPreStudyRating}
          comment={preStudyComment}
          onCommentChange={setPreStudyComment}
          commentPlaceholder="Comentário sobre o Estudo Pré EPA (opcional)"
        />
      ),
    },
    {
      section: 'prep',
      isAnswered: () => marketingRating > 0,
      render: () => (
        <RatingInput
          label="Divulgação do 5º EPA na sua cidade"
          sublabel="Como foi a informação e engajamento na sua região."
          value={marketingRating}
          onChange={setMarketingRating}
          comment={marketingComment}
          onCommentChange={setMarketingComment}
          commentPlaceholder="Comentário sobre a divulgação (opcional)"
        />
      ),
    },
    {
      section: 'reception',
      isAnswered: () => welcomeRating > 0,
      render: () => (
        <RatingInput
          label="Acolhida"
          sublabel="Atendimento, carinho e recepção da equipe."
          value={welcomeRating}
          onChange={setWelcomeRating}
        />
      ),
    },
    {
      section: 'reception',
      isAnswered: () => checkinRating > 0,
      render: () => (
        <RatingInput
          label="Credenciamento"
          sublabel="Agilidade e organização na entrega de crachás/materiais."
          value={checkinRating}
          onChange={setCheckinRating}
        />
      ),
    },
    { section: 'infra', isAnswered: () => infraAccommodation > 0, render: () => <RatingInput label="Acomodação geral" value={infraAccommodation} onChange={setInfraAccommodation} /> },
    { section: 'infra', isAnswered: () => infraBreakfast > 0, render: () => <RatingInput label="Café da Manhã" value={infraBreakfast} onChange={setInfraBreakfast} /> },
    { section: 'infra', isAnswered: () => infraLunch > 0, render: () => <RatingInput label="Almoço" value={infraLunch} onChange={setInfraLunch} /> },
    { section: 'infra', isAnswered: () => infraDinner > 0, render: () => <RatingInput label="Jantar" value={infraDinner} onChange={setInfraDinner} /> },
    {
      section: 'infra',
      isAnswered: () => infraRestrooms > 0,
      render: () => (
        <RatingInput
          label="Banheiros"
          sublabel="Limpeza e disponibilidade das instalações sanitárias."
          value={infraRestrooms}
          onChange={setInfraRestrooms}
        />
      ),
    },
    {
      section: 'infra',
      isAnswered: () => infraTech > 0,
      render: () => (
        <RatingInput
          label="Recursos Tecnológicos"
          sublabel="Som, projeção, iluminação e microfones."
          value={infraTech}
          onChange={setInfraTech}
        />
      ),
    },
    {
      section: 'infra',
      isAnswered: () => !infraLodgingUsed || infraLodgingRating > 0,
      render: () => (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-sm font-bold text-slate-800">
              Você utilizou a Hospedagem do evento?
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInfraLodgingUsed(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  infraLodgingUsed ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                Sim, utilizei
              </button>
              <button
                type="button"
                onClick={() => setInfraLodgingUsed(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !infraLodgingUsed ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600'
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
      ),
    },
    {
      section: 'workshops',
      isAnswered: () => participatedWorkshops !== null,
      render: () => (
        <div>
          <label className="text-sm font-bold text-slate-800 block mb-3">
            Você participou de alguma oficina no 5º EPA?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setParticipatedWorkshops(true)}
              className={`py-4 rounded-2xl font-bold text-sm transition-all ${
                participatedWorkshops === true
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sim, participei
            </button>
            <button
              type="button"
              onClick={() => setParticipatedWorkshops(false)}
              className={`py-4 rounded-2xl font-bold text-sm transition-all ${
                participatedWorkshops === false
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Não participei
            </button>
          </div>
        </div>
      ),
    },
    ...(participatedWorkshops
      ? [
          {
            section: 'workshops' as SectionId,
            isAnswered: () => workshop1Id !== '' && workshop1Rating > 0,
            render: () => (
              <div className="space-y-3">
                <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                  1ª Oficina Participada
                </label>
                <select
                  value={workshop1Id}
                  onChange={(e) => setWorkshop1Id(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione a 1ª Oficina...</option>
                  {(w1Options.length > 0 ? w1Options : workshops).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.instructor})
                    </option>
                  ))}
                </select>

                <RatingInput label="Nota para a 1ª Oficina" value={workshop1Rating} onChange={setWorkshop1Rating} />
              </div>
            ),
          },
          {
            section: 'workshops' as SectionId,
            isAnswered: () => workshop2Id !== '' && workshop2Rating > 0,
            render: () => (
              <div className="space-y-3">
                <label className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                  2ª Oficina Participada
                </label>
                <select
                  value={workshop2Id}
                  onChange={(e) => setWorkshop2Id(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione a 2ª Oficina...</option>
                  {(w2Options.length > 0 ? w2Options : workshops).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.instructor})
                    </option>
                  ))}
                </select>

                <RatingInput label="Nota para a 2ª Oficina" value={workshop2Rating} onChange={setWorkshop2Rating} />
              </div>
            ),
          },
        ]
      : []),
    { section: 'moments', isAnswered: () => youthMomentRating > 0, render: () => <RatingInput label="Momento Jovem" value={youthMomentRating} onChange={setYouthMomentRating} /> },
    { section: 'moments', isAnswered: () => mirimMomentRating > 0, render: () => <RatingInput label="Momento MFC Mirim" value={mirimMomentRating} onChange={setMirimMomentRating} /> },
    { section: 'moments', isAnswered: () => animationRating > 0, render: () => <RatingInput label="Animação & Músicas" value={animationRating} onChange={setAnimationRating} /> },
    { section: 'liturgy', isAnswered: () => massRating > 0, render: () => <RatingInput label="Missa do EPA" sublabel="Celebração Eucarística." value={massRating} onChange={setMassRating} /> },
    {
      section: 'liturgy',
      isAnswered: () => liturgyRating > 0,
      render: () => (
        <RatingInput
          label="Liturgias & Orações"
          sublabel="Orações preparadas pelas comitivas das cidades."
          value={liturgyRating}
          onChange={setLiturgyRating}
        />
      ),
    },
    {
      section: 'liturgy',
      isAnswered: () => ecoFriendlyRating > 0,
      render: () => (
        <RatingInput
          label="Respeito aos Recursos Naturais"
          sublabel="Uso consciente de descartáveis e cuidado ambiental."
          value={ecoFriendlyRating}
          onChange={setEcoFriendlyRating}
        />
      ),
    },
    {
      section: 'recommend',
      isAnswered: () => true,
      render: () => (
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
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl font-extrabold text-sm transition-all ${
                  recommendationNps === i
                    ? 'bg-blue-600 text-white scale-110 shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      section: 'recommend',
      isAnswered: () => recommendationText.trim().length > 0,
      render: () => (
        <div>
          <label className="text-sm font-semibold text-slate-800 block mb-1">
            Como você recomendaria o EPA para quem não pôde vir nesta edição? (Depoimento)
          </label>
          <textarea
            rows={4}
            placeholder="Escreva aqui uma mensagem inspiradora ou conselho para os membros da sua paróquia/cidade..."
            value={recommendationText}
            onChange={(e) => setRecommendationText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ),
    },
    {
      section: 'recommend',
      isAnswered: () => epaWord.trim().length > 0,
      render: () => (
        <div>
          <label className="text-sm font-semibold text-slate-800 block mb-1">
            Em uma palavra ou frase, como você definiria o 5º EPA?
          </label>
          <p className="text-xs text-slate-500 mb-2">Ex: "Renovação", "Família em movimento", "Encontro com Deus"...</p>
          <input
            type="text"
            maxLength={100}
            placeholder="Escreva aqui..."
            value={epaWord}
            onChange={(e) => setEpaWord(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ),
    },
    {
      section: 'suggestions',
      isAnswered: () => generalSuggestions.trim().length > 0,
      render: () => (
        <textarea
          rows={5}
          placeholder="Deixe aqui suas sugestões de melhoria para os próximos encontros do MFC..."
          value={generalSuggestions}
          onChange={(e) => setGeneralSuggestions(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ),
    },
    {
      section: 'consent',
      render: () => (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Esta pesquisa é <strong>100% anônima</strong>: não coletamos nome, cidade individual, e-mail ou qualquer
            dado que possa identificar o respondente. As respostas serão utilizadas exclusivamente pela Comissão
            Organizadora do 5º EPA Pirassununga e pelo Movimento Familiar Cristão (MFC) para fins estatísticos e de
            melhoria contínua dos próximos encontros, em conformidade com a Lei Geral de Proteção de Dados (LGPD -
            Lei nº 13.709/2018).
          </p>

          <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
            />
            <span className="text-sm font-semibold text-slate-800">
              Li e estou de acordo com o Termo de Responsabilidade e Privacidade acima, e desejo enviar minhas
              respostas de forma anônima.
            </span>
          </label>

          {!consentAccepted && (
            <p className="text-xs text-slate-500 text-center">
              Aceite o termo de responsabilidade acima para habilitar o envio.
            </p>
          )}
        </div>
      ),
    },
  ];

  const totalSteps = questions.length;
  const currentQuestion = questions[stepIndex];
  const currentMeta = SECTION_META[currentQuestion.section];
  const isLastStep = stepIndex === totalSteps - 1;
  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const isNewSection = stepIndex === 0 || questions[stepIndex - 1].section !== currentQuestion.section;

  const goNext = () => {
    if (isLastStep) return;
    setDirection(1);
    setStepIndex(i => Math.min(i + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex(i => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!consentAccepted) {
      setErrorMsg('É necessário aceitar o Termo de Responsabilidade e Privacidade para enviar a pesquisa.');
      return;
    }

    setIsSubmitting(true);

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

      participated_workshops: !!participatedWorkshops,
      workshop1_id: participatedWorkshops && workshop1Id !== '' ? Number(workshop1Id) : undefined,
      workshop1_rating: participatedWorkshops ? workshop1Rating : undefined,
      workshop2_id: participatedWorkshops && workshop2Id !== '' ? Number(workshop2Id) : undefined,
      workshop2_rating: participatedWorkshops ? workshop2Rating : undefined,

      youth_moment_rating: youthMomentRating,
      mirim_moment_rating: mirimMomentRating,
      animation_rating: animationRating,
      mass_rating: massRating,
      liturgy_rating: liturgyRating,
      eco_friendly_rating: ecoFriendlyRating,

      recommendation_text: recommendationText,
      recommendation_nps: recommendationNps,
      epa_word: epaWord,
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

  // ---------------------------------------------------------------------
  // SPLASH — animated entrance with glow + ring reveal, before anything else shows
  // ---------------------------------------------------------------------
  if (showSplash) {
    return (
      <AnimatePresence mode="wait">
        {splashPhase === 'typing' ? (
          <motion.div
            key="typing"
            className="min-h-screen w-full bg-white flex items-center justify-center px-4 overflow-hidden relative"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {FIREWORKS.map((fw, i) => (
              <Firework key={i} {...fw} />
            ))}

            <h1
              className="relative z-10 text-6xl sm:text-8xl font-black tracking-tighter text-slate-900 flex items-center italic"
              style={{ textShadow: '0 4px 24px rgba(37, 99, 235, 0.25)' }}
            >
              {typedText.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: 'backOut' }}
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                className="inline-block w-2 sm:w-2.5 h-12 sm:h-20 bg-blue-600 ml-2"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              />
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="splash"
            className="min-h-screen w-full bg-white flex items-center justify-center px-4 overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Expanding glow behind the logo */}
            <motion.div
              className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-blue-400/20 blur-3xl"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.3, 1], opacity: [0, 0.9, 0.6] }}
              transition={{ duration: 1.8, ease: 'easeOut', times: [0, 0.6, 1] }}
            />

            {/* Rotating ring that "opens up" around the logo */}
            <motion.div
              className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border-2 border-blue-500/40 border-t-transparent"
              initial={{ scale: 0.4, opacity: 0, rotate: 0 }}
              animate={{ scale: 1, opacity: [0, 1, 1, 0], rotate: 220 }}
              transition={{ duration: 2.1, ease: 'easeOut', times: [0, 0.3, 0.75, 1] }}
            />

            <motion.img
              src={logoEpa}
              alt="Logo 5º EPA Pirassununga"
              className="relative w-44 h-44 sm:w-60 sm:h-60 object-contain drop-shadow-xl"
              initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
              animate={{ scale: [0.3, 1.12, 1], opacity: 1, rotate: 0 }}
              transition={{ duration: 1.3, ease: 'easeOut', times: [0, 0.65, 1], delay: 0.1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ---------------------------------------------------------------------
  // INTRO SCREEN — plain white, no dark chrome, fully responsive
  // ---------------------------------------------------------------------
  if (!started) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md sm:max-w-lg text-center space-y-6">

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-white shadow-md border border-slate-100 p-2.5 flex items-center justify-center"
          >
            <img src={logoEpa} alt="Logo 5º EPA Pirassununga" className="w-full h-full object-contain" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Pesquisa 100% Anônima • Sem identificação</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Pesquisa de Satisfação
            <span className="block text-blue-600">5º EPA Pirassununga</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-slate-600 text-sm sm:text-base leading-relaxed"
          >
            Não pedimos seu nome, cidade ou qualquer dado pessoal. Suas respostas são
            <strong className="text-slate-800"> totalmente anônimas</strong> e ajudam a coordenação do MFC a preparar
            encontros ainda melhores. Uma pergunta por vez, no seu ritmo!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="grid grid-cols-3 gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-slate-600"
          >
            <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Sem dados pessoais</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>{totalSteps} perguntas rápidas</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <PartyPopper className="w-4 h-4 text-blue-600" />
              <span>Avalie de 1 a 5</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <button
              onClick={() => setStarted(true)}
              className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Começar Pesquisa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // STEP CONTENT — one question per screen, plain white background
  // ---------------------------------------------------------------------
  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -30 : 30 }),
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="max-w-xl mx-auto px-4 py-5 pb-10">

        {/* Progress header */}
        <div className="sticky top-0 z-30 -mx-4 px-4 pt-1 pb-2 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white shadow-sm border border-slate-100 p-1 flex items-center justify-center flex-shrink-0">
                <img src={logoEpa} alt="Logo EPA" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-bold text-slate-500">
                {stepIndex + 1}/{totalSteps}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anônima</span>
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {isNewSection && (
                <div className="flex items-center gap-3 pb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${currentMeta.iconBg}`}>
                    {currentMeta.icon}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">{currentMeta.title}</h2>
                </div>
              )}

              {currentQuestion.render()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={goNext}
                disabled={currentQuestion.isAnswered ? !currentQuestion.isAnswered() : false}
                className="flex-1 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Próxima</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !consentAccepted}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <EpaLoading label="Enviando..." size="sm" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Finalizar e Enviar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
