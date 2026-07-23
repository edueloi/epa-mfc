import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle2, XCircle, MapPin, Search, RefreshCw, User } from 'lucide-react';
import { authFetch } from '../lib/authFetch';

interface WorkshopWithDetails {
  id: number;
  title: string;
  instructor: string;
  location: string;
  time_slot: string;
  present_count: number;
  absent_count: number;
  total_enrolled: number;
  participants: Array<{
    id: number;
    name: string;
    city: string;
    family_group: string;
    attendance_status: 'PRESENTE' | 'FALTA' | null;
  }>;
}

export const OficineiroView: React.FC = () => {
  const [workshops, setWorkshops] = useState<WorkshopWithDetails[]>([]);
  const [activeWorkshopId, setActiveWorkshopId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyWorkshops = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/workshops');
      if (res.ok) {
        const data = await res.json();
        setWorkshops(Array.isArray(data) ? data : []);
        setActiveWorkshopId(prev => {
          if (prev && data.some((w: WorkshopWithDetails) => w.id === prev)) return prev;
          return data.length > 0 ? data[0].id : null;
        });
      }
    } catch (err) {
      console.error('Erro ao carregar oficinas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWorkshops();
  }, []);

  const workshop = workshops.find(w => w.id === activeWorkshopId) || null;

  const handleMarkAttendance = async (participantId: number, status: 'PRESENTE' | 'FALTA') => {
    if (!workshop) return;
    const workshopId = workshop.id;

    setWorkshops(prev => prev.map(w => {
      if (w.id !== workshopId) return w;
      const prevStatus = w.participants.find(p => p.id === participantId)?.attendance_status;
      return {
        ...w,
        participants: w.participants.map(p =>
          p.id === participantId ? { ...p, attendance_status: status } : p
        ),
        present_count: status === 'PRESENTE'
          ? w.present_count + (prevStatus !== 'PRESENTE' ? 1 : 0)
          : (prevStatus === 'PRESENTE' ? w.present_count - 1 : w.present_count),
        absent_count: status === 'FALTA'
          ? w.absent_count + (prevStatus !== 'FALTA' ? 1 : 0)
          : (prevStatus === 'FALTA' ? w.absent_count - 1 : w.absent_count)
      };
    }));

    try {
      await authFetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, workshop_id: workshopId, status })
      });
    } catch (err) {
      console.error('Erro ao salvar presença:', err);
      fetchMyWorkshops();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
        <p className="font-semibold text-sm">Carregando sua oficina...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-3">
        <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
        <h3 className="text-lg font-bold text-slate-800">Nenhuma oficina vinculada</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Fale com a Comissão Organizadora para vincular seu acesso a uma oficina.
        </p>
      </div>
    );
  }

  const filteredParticipants = workshop.participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Time slot tabs, only shown when the oficineiro has more than one occurrence */}
      {workshops.length > 1 && (
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {workshops.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveWorkshopId(w.id)}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeWorkshopId === w.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {w.time_slot}
            </button>
          ))}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
            {workshop.time_slot}
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {workshop.present_count} Presentes
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <XCircle className="w-4 h-4" /> {workshop.absent_count} Faltas
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{workshop.title}</h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Oficineiro: <strong className="text-white">{workshop.instructor}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            <span>Local: <strong className="text-white">{workshop.location}</strong></span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold flex-shrink-0 flex items-center gap-1.5">
          <Users className="w-4 h-4" /> {filteredParticipants.length}
        </span>
        <button
          onClick={fetchMyWorkshops}
          title="Atualizar lista"
          className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 rounded-xl border border-slate-200 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Participants list */}
      {filteredParticipants.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          Nenhum participante inscrito nesta oficina ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredParticipants.map((p) => {
            const status = p.attendance_status;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="inline-flex items-center gap-1 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <MapPin className="w-3 h-3" /> {p.city}
                      </span>
                      <span>{p.family_group}</span>
                    </div>
                  </div>
                  {status === 'PRESENTE' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 font-extrabold rounded-full text-[9px] flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> PRESENTE
                    </span>
                  ) : status === 'FALTA' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-800 font-extrabold rounded-full text-[9px] flex-shrink-0">
                      <XCircle className="w-3 h-3" /> FALTA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 font-bold border border-amber-200 rounded-full text-[9px] flex-shrink-0">
                      PENDENTE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMarkAttendance(p.id, 'PRESENTE')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      status === 'PRESENTE'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Presente
                  </button>
                  <button
                    onClick={() => handleMarkAttendance(p.id, 'FALTA')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      status === 'FALTA'
                        ? 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-md'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Falta
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
