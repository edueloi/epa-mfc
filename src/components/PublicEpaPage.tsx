import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Users, Sparkles, HeartHandshake, ShieldCheck, ArrowRight, MessageSquareHeart, Sun, Leaf, BookOpen, QrCode, Lock } from 'lucide-react';

interface PublicEpaPageProps {
  onStartSurvey: () => void;
  onGoToAttendance: () => void;
  onOpenQrCode: () => void;
}

export const PublicEpaPage: React.FC<PublicEpaPageProps> = ({ onStartSurvey, onGoToAttendance, onOpenQrCode }) => {
  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold tracking-wide uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" /> Encontro do Movimento Familiar Cristão
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none"
          >
            5º EPA em <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Pirassununga</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl"
          >
            Seja bem-vindo ao portal do 5º Encontro Pan-Americano e Formativo do MFC. 
            Participe das oficinas, momentos de espiritualidade e ajude a fortalecer o nosso encontro respondendo à pesquisa anônima de satisfação!
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-emerald-200 pt-2"
          >
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Pirassununga - SP</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Edição Especial 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pesquisa 100% Anônima</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4"
          >
            <button
              onClick={onStartSurvey}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <MessageSquareHeart className="w-5 h-5" />
              <span>Responder Pesquisa do EPA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenQrCode}
              className="px-5 py-4 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/40 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5 text-teal-400" />
              <span>Gerar QR Code / Compartilhar</span>
            </button>

            <button
              onClick={onGoToAttendance}
              className="px-5 py-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Área da Organização</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Program Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Estrutura & Programação do 5º EPA
          </h2>
          <p className="text-slate-600 text-sm">
            Tudo pensado com carinho para bem acolher as famílias de Pirassununga e região.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Estudo Pré EPA & Divulgação</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Preparação espiritual e estudo dos materiais enviados previamente às cidades para engajamento de todos.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Acolhida & Credenciamento</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Recepção calorosa de cada participante e registro ágil no credenciamento da cidade de Pirassununga.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">1ª e 2ª Oficinas Formativas</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Temas sobre família, educação dos filhos, diálogo e espiritualidade com controle de frequência pelos oficineiros.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Momento Jovem & MFC Mirim</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Atividades dinâmicas e educativas voltadas especialmente para as crianças e jovens de nossas famílias.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Animação, Missas & Liturgias</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Celebrações eucarísticas, orações conduzidas pelas comitivas das cidades e momentos de louvor.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Cuidado com a Casa Comum</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Conscientização ecológica com incentivo ao uso consciente de descartáveis e recursos naturais.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Direct Call to Action Card */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black tracking-tight">Sua Opinião é Fundamental!</h2>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            A pesquisa leva apenas 2 minutos para ser respondida. Não há identificação de nome nem cidade individual, garantindo total anonimato dos dados.
          </p>
        </div>

        <div>
          <button
            onClick={onStartSurvey}
            className="px-8 py-4 bg-white text-emerald-900 font-extrabold text-base rounded-2xl shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <MessageSquareHeart className="w-5 h-5 text-emerald-600" />
            <span>Preencher Formulário de Pesquisa</span>
          </button>
        </div>
      </section>

    </div>
  );
};
