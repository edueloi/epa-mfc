import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, CheckCircle2, XCircle, Clock, MapPin,
  Search, RefreshCw, User, ShieldCheck, Check, X, AlertCircle, Plus, Filter,
  KeyRound, Eye, EyeOff, Trash2, UserCog
} from 'lucide-react';
import { Workshop, Oficineiro } from '../types';
import { authFetch } from '../lib/authFetch';

interface WorkshopWithDetails extends Workshop {
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

export const WorkshopsView: React.FC = () => {
  const [workshops, setWorkshops] = useState<WorkshopWithDetails[]>([]);
  const [oficineiros, setOficineiros] = useState<Oficineiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'ALL' | '1ª Oficina' | '2ª Oficina'>('ALL');

  // New Workshop Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  // A theme commonly repeats at both fixed time slots for the same instructor —
  // both are checked by default; the Admin can uncheck one for a single-occurrence workshop.
  const [newSlot1Checked, setNewSlot1Checked] = useState(true);
  const [newSlot2Checked, setNewSlot2Checked] = useState(true);
  const [newOficineiroUser, setNewOficineiroUser] = useState('');
  const [newOficineiroPass, setNewOficineiroPass] = useState('');
  const [showOficineiroPass, setShowOficineiroPass] = useState(false);

  const SLOT_1_LABEL = '1ª Oficina (08:30 às 10:00)';
  const SLOT_2_LABEL = '2ª Oficina (10:30 às 12:00)';

  // Oficineiro accounts modal (per selected workshop)
  const [showOficineirosModal, setShowOficineirosModal] = useState(false);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const [wsRes, oficRes] = await Promise.all([
        authFetch('/api/workshops'),
        authFetch('/api/oficineiros')
      ]);

      if (wsRes.ok) {
        const data = await wsRes.json();
        setWorkshops(data);
        if (data.length > 0 && selectedWorkshopId === null) {
          setSelectedWorkshopId(data[0].id);
        }
      }
      if (oficRes.ok) {
        setOficineiros(await oficRes.json());
      }
    } catch (err) {
      console.error('Erro ao carregar oficinas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleMarkAttendance = async (participantId: number, workshopId: number, status: 'PRESENTE' | 'FALTA') => {
    // Optimistic UI update
    setWorkshops(prev =>
      prev.map(w => {
        if (w.id !== workshopId) return w;
        return {
          ...w,
          participants: w.participants.map(p =>
            p.id === participantId ? { ...p, attendance_status: status } : p
          ),
          present_count: status === 'PRESENTE'
            ? w.present_count + (w.participants.find(p => p.id === participantId)?.attendance_status !== 'PRESENTE' ? 1 : 0)
            : (w.participants.find(p => p.id === participantId)?.attendance_status === 'PRESENTE' ? w.present_count - 1 : w.present_count),
          absent_count: status === 'FALTA'
            ? w.absent_count + (w.participants.find(p => p.id === participantId)?.attendance_status !== 'FALTA' ? 1 : 0)
            : (w.participants.find(p => p.id === participantId)?.attendance_status === 'FALTA' ? w.absent_count - 1 : w.absent_count)
        };
      })
    );

    try {
      await authFetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, workshop_id: workshopId, status })
      });
    } catch (err) {
      console.error('Erro ao salvar presença:', err);
      fetchWorkshops(); // Rollback on error
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructor.trim()) return;

    const timeSlots = [
      ...(newSlot1Checked ? [SLOT_1_LABEL] : []),
      ...(newSlot2Checked ? [SLOT_2_LABEL] : [])
    ];
    if (timeSlots.length === 0) return;

    try {
      const res = await authFetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          instructor: newInstructor,
          location: newLocation || 'Sala Principal',
          time_slots: timeSlots,
          max_slots: 35
        })
      });

      if (!res.ok) return;
      const { ids: newWorkshopIds } = await res.json();

      // Optionally create the oficineiro login bound to every occurrence just created,
      // so the same instructor can mark attendance on both time slots with one account.
      if (newOficineiroUser.trim() && newOficineiroPass.trim()) {
        await authFetch('/api/oficineiros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: newOficineiroUser.trim(),
            password: newOficineiroPass.trim(),
            workshop_ids: newWorkshopIds
          })
        });
      }

      setNewTitle('');
      setNewInstructor('');
      setNewLocation('');
      setNewSlot1Checked(true);
      setNewSlot2Checked(true);
      setNewOficineiroUser('');
      setNewOficineiroPass('');
      setShowAddModal(false);
      fetchWorkshops();
    } catch (err) {
      console.error('Erro ao criar oficina:', err);
    }
  };

  const handleDeleteOficineiro = async (id: number) => {
    if (!confirm('Remover o acesso deste oficineiro?')) return;
    try {
      const res = await authFetch(`/api/oficineiros/${id}`, { method: 'DELETE' });
      if (res.ok) fetchWorkshops();
    } catch (err) {
      console.error('Erro ao remover oficineiro:', err);
    }
  };

  const filteredWorkshops = workshops.filter(w => {
    if (timeFilter !== 'ALL' && w.time_slot !== timeFilter) return false;
    return true;
  });

  const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId) || filteredWorkshops[0];

  const filteredParticipants = selectedWorkshop?.participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.family_group.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-xs font-bold mb-2 sm:mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Gestão de Oficinas & Oficineiros</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Chamada por Oficina
          </h1>
          <p className="hidden sm:block text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Selecione a oficina abaixo para ver o oficineiro responsável, local e a lista de participantes inscritos para marcar presenças e faltas.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none justify-center px-3 sm:px-4 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Oficina</span>
          </button>
          <button
            onClick={() => setShowOficineirosModal(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-2xl border border-slate-700 transition-all flex-shrink-0"
            title="Ver acessos de oficineiros"
          >
            <UserCog className="w-4 h-4" />
          </button>
          <button
            onClick={fetchWorkshops}
            title="Atualizar lista"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition-all flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

        {/* Left Sidebar: List of Workshops */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">

          {/* Time slot filter buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setTimeFilter('ALL')}
              className={`flex-1 py-2 sm:py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                timeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({workshops.length})
            </button>
            <button
              onClick={() => setTimeFilter('1ª Oficina')}
              className={`flex-1 py-2 sm:py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                timeFilter === '1ª Oficina' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1ª Bloco
            </button>
            <button
              onClick={() => setTimeFilter('2ª Oficina')}
              className={`flex-1 py-2 sm:py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                timeFilter === '2ª Oficina' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2º Bloco
            </button>
          </div>

          {/* Workshop Cards List */}
          <div className="space-y-3 max-h-[70vh] lg:max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                <p className="text-xs font-bold">Carregando oficinas...</p>
              </div>
            ) : filteredWorkshops.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                Nenhuma oficina encontrada.
              </div>
            ) : (
              filteredWorkshops.map((w) => {
                const isSelected = selectedWorkshop?.id === w.id;
                const total = w.total_enrolled || 0;
                const pres = w.present_count || 0;
                const abs = w.absent_count || 0;

                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorkshopId(w.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl ring-2 ring-blue-400/50'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        w.time_slot.includes('1') 
                          ? (isSelected ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-800')
                          : (isSelected ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-800')
                      }`}>
                        {w.time_slot}
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {total} inscritos
                      </span>
                    </div>

                    <h3 className={`font-black text-sm mt-2 leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {w.title}
                    </h3>

                    <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <strong>Oficineiro:</strong> {w.instructor}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {w.location}
                      </span>
                    </div>

                    {/* Attendance Mini Bar */}
                    <div className="mt-3 pt-2 border-t border-slate-200/20 flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-blue-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {pres} Presentes
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {abs} Faltas
                      </span>
                      <span className={isSelected ? 'text-slate-400' : 'text-slate-400'}>
                        {total - (pres + abs)} Pendentes
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: Attendance for Selected Workshop */}
        <div className="lg:col-span-7 space-y-4">
          {selectedWorkshop ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">

              {/* Header of selected workshop */}
              <div className="p-4 sm:p-6 bg-slate-900 text-white space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                    {selectedWorkshop.time_slot}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-blue-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {selectedWorkshop.present_count}
                    </span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {selectedWorkshop.absent_count}
                    </span>
                  </div>
                </div>

                <h2 className="text-base sm:text-xl font-black text-white leading-snug">{selectedWorkshop.title}</h2>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    <span>Oficineiro: <strong className="text-white">{selectedWorkshop.instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    <span>Local: <strong className="text-white">{selectedWorkshop.location}</strong></span>
                  </div>
                </div>
              </div>

              {/* Search bar inside selected workshop */}
              <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs text-slate-500 font-bold flex-shrink-0">
                  {filteredParticipants.length}
                </span>
              </div>

              {/* Participant List: cards on mobile, table on sm+ */}
              {filteredParticipants.length === 0 ? (
                <div className="p-8 text-center text-slate-400 min-h-[200px] flex items-center justify-center">
                  Nenhum participante encontrado nesta oficina.
                </div>
              ) : (
                <>
                  {/* Mobile: stacked cards */}
                  <div className="sm:hidden divide-y divide-slate-100">
                    {filteredParticipants.map((p) => {
                      const status = p.attendance_status;
                      return (
                        <div key={p.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 text-sm truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-500">{p.city} • {p.family_group}</p>
                            </div>
                            {status === 'PRESENTE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 font-extrabold rounded-full text-[9px] flex-shrink-0">
                                <Check className="w-3 h-3" /> PRESENTE
                              </span>
                            ) : status === 'FALTA' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-800 font-extrabold rounded-full text-[9px] flex-shrink-0">
                                <X className="w-3 h-3" /> FALTA
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 font-bold border border-amber-200 rounded-full text-[9px] flex-shrink-0">
                                PENDENTE
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleMarkAttendance(p.id, selectedWorkshop.id, 'PRESENTE')}
                              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                status === 'PRESENTE'
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              <Check className="w-4 h-4" /> Presente
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(p.id, selectedWorkshop.id, 'FALTA')}
                              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                status === 'FALTA'
                                  ? 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-md'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              <X className="w-4 h-4" /> Falta
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tablet/Desktop: table */}
                  <div className="hidden sm:block overflow-x-auto min-h-[350px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3.5">Participante</th>
                          <th className="p-3.5">Cidade / Equipe</th>
                          <th className="p-3.5 text-center">Status</th>
                          <th className="p-3.5 text-right">Ação Rápida</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                        {filteredParticipants.map((p) => {
                          const status = p.attendance_status;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5">
                                <span className="font-extrabold text-slate-900 block">{p.name}</span>
                              </td>
                              <td className="p-3.5 text-slate-500">
                                <div>{p.city}</div>
                                <div className="text-[10px] text-slate-400">{p.family_group}</div>
                              </td>
                              <td className="p-3.5 text-center">
                                {status === 'PRESENTE' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 font-extrabold rounded-full text-[10px]">
                                    <Check className="w-3 h-3 text-blue-600" /> PRESENTE
                                  </span>
                                ) : status === 'FALTA' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 font-extrabold rounded-full text-[10px]">
                                    <X className="w-3 h-3 text-rose-600" /> FALTA
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 font-bold border border-amber-200 rounded-full text-[10px]">
                                    PENDENTE
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleMarkAttendance(p.id, selectedWorkshop.id, 'PRESENTE')}
                                    title="Marcar Presença"
                                    className={`p-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                                      status === 'PRESENTE'
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md'
                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                    <span className="hidden lg:inline text-[11px]">Presente</span>
                                  </button>

                                  <button
                                    onClick={() => handleMarkAttendance(p.id, selectedWorkshop.id, 'FALTA')}
                                    title="Marcar Falta"
                                    className={`p-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                                      status === 'FALTA'
                                        ? 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-md'
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                  >
                                    <X className="w-4 h-4" />
                                    <span className="hidden lg:inline text-[11px]">Falta</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              Selecione uma oficina na lista ao lado.
            </div>
          )}
        </div>

      </div>

      {/* Modal Add Workshop */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Cadastrar Nova Oficina</h3>
            <form onSubmit={handleCreateWorkshop} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Título da Oficina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Espiritualidade Conjugal no Século XXI"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Oficineiro / Facilitador</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Casal Silva & Maria"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Local / Sala</label>
                <input
                  type="text"
                  placeholder="Ex: Auditório B"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2">Horários desta oficina</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={newSlot1Checked}
                      onChange={(e) => setNewSlot1Checked(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-800">{SLOT_1_LABEL}</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={newSlot2Checked}
                      onChange={(e) => setNewSlot2Checked(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-800">{SLOT_2_LABEL}</span>
                  </label>
                </div>
                {!newSlot1Checked && !newSlot2Checked && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5">Selecione ao menos um horário.</p>
                )}
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                <p className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                  <UserCog className="w-4 h-4" /> Acesso do Oficineiro (opcional)
                </p>
                <p className="text-[11px] text-blue-800">
                  Crie um usuário e senha para o oficineiro responsável marcar presença/falta direto desta oficina.
                </p>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Usuário</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: oficineiro.joao"
                      value={newOficineiroUser}
                      onChange={(e) => setNewOficineiroUser(e.target.value)}
                      className="w-full pl-9 pr-3 p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Senha</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showOficineiroPass ? 'text' : 'password'}
                      placeholder="Defina uma senha"
                      value={newOficineiroPass}
                      onChange={(e) => setNewOficineiroPass(e.target.value)}
                      className="w-full pl-9 pr-10 p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOficineiroPass((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showOficineiroPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 sm:py-2 bg-slate-100 font-bold text-slate-700 rounded-xl text-sm sm:text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newSlot1Checked && !newSlot2Checked}
                  className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Oficina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Acessos de Oficineiros */}
      {showOficineirosModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-blue-600" /> Acessos de Oficineiros
              </h3>
              <button onClick={() => setShowOficineirosModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <div className="space-y-2">
              {oficineiros.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  Nenhum acesso de oficineiro criado ainda. Crie um ao cadastrar uma oficina.
                </p>
              ) : (
                oficineiros.map((o) => (
                  <div key={o.id} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{o.username}</p>
                      {o.workshops.length === 0 ? (
                        <p className="text-[11px] text-slate-500">Sem oficina vinculada</p>
                      ) : (
                        <div className="space-y-0.5 mt-0.5">
                          {o.workshops.map((w) => (
                            <p key={w.id} className="text-[11px] text-slate-500 truncate">
                              {w.title} <span className="text-slate-400">• {w.time_slot}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteOficineiro(o.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
