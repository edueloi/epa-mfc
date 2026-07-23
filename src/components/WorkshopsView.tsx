import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, CheckCircle2, XCircle, Clock, MapPin, 
  Search, RefreshCw, User, ShieldCheck, Check, X, AlertCircle, Plus, Filter 
} from 'lucide-react';
import { Workshop } from '../types';

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
  const [loading, setLoading] = useState(true);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'ALL' | '1ª Oficina' | '2ª Oficina'>('ALL');
  
  // New Workshop Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('1ª Oficina');

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workshops');
      if (res.ok) {
        const data = await res.json();
        setWorkshops(data);
        if (data.length > 0 && selectedWorkshopId === null) {
          setSelectedWorkshopId(data[0].id);
        }
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
      await fetch('/api/attendance', {
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

    try {
      const res = await fetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          instructor: newInstructor,
          location: newLocation || 'Sala Principal',
          time_slot: newTimeSlot,
          max_slots: 35
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewInstructor('');
        setNewLocation('');
        setShowAddModal(false);
        fetchWorkshops();
      }
    } catch (err) {
      console.error('Erro ao criar oficina:', err);
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
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Gestão de Oficinas & Oficineiros</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Chamada por Oficina
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Selecione a oficina abaixo para ver o oficineiro responsável, local e a lista de participantes inscritos para marcar presenças e faltas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-2xl hover:bg-emerald-400 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Oficina</span>
          </button>
          <button
            onClick={fetchWorkshops}
            title="Atualizar lista"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: List of Workshops */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Time slot filter buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setTimeFilter('ALL')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                timeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({workshops.length})
            </button>
            <button
              onClick={() => setTimeFilter('1ª Oficina')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                timeFilter === '1ª Oficina' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1ª Bloco
            </button>
            <button
              onClick={() => setTimeFilter('2ª Oficina')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                timeFilter === '2ª Oficina' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2º Bloco
            </button>
          </div>

          {/* Workshop Cards List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-500 mb-2" />
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
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl ring-2 ring-emerald-400/50'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        w.time_slot.includes('1') 
                          ? (isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800')
                          : (isSelected ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-teal-100 text-teal-800')
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
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {w.location}
                      </span>
                    </div>

                    {/* Attendance Mini Bar */}
                    <div className="mt-3 pt-2 border-t border-slate-200/20 flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-400">
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

        {/* Right Section: Attendance Table for Selected Workshop */}
        <div className="lg:col-span-7 space-y-4">
          {selectedWorkshop ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
              
              {/* Header of selected workshop */}
              <div className="p-6 bg-slate-900 text-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    {selectedWorkshop.time_slot}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {selectedWorkshop.present_count} Presentes
                    </span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {selectedWorkshop.absent_count} Faltas
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-black text-white">{selectedWorkshop.title}</h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Oficineiro: <strong className="text-white">{selectedWorkshop.instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Local: <strong className="text-white">{selectedWorkshop.location}</strong></span>
                  </div>
                </div>
              </div>

              {/* Search bar inside selected workshop */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar inscrito por nome ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-xs text-slate-500 font-bold flex-shrink-0">
                  {filteredParticipants.length} inscritos
                </span>
              </div>

              {/* Participant List Table */}
              <div className="overflow-x-auto min-h-[350px]">
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
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          Nenhum participante encontrado nesta oficina.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => {
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
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-[10px]">
                                  <Check className="w-3 h-3 text-emerald-600" /> PRESENTE
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
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-md'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                  <span className="hidden sm:inline text-[11px]">Presente</span>
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
                                  <span className="hidden sm:inline text-[11px]">Falta</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-900">Cadastrar Nova Oficina</h3>
            <form onSubmit={handleCreateWorkshop} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Título da Oficina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Espiritualidade Conjugal no Século XXI"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Local / Sala</label>
                  <input
                    type="text"
                    placeholder="Ex: Auditório B"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bloco de Horário</label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="1ª Oficina">1ª Oficina</option>
                    <option value="2ª Oficina">2ª Oficina</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-extrabold rounded-xl shadow-md"
                >
                  Salvar Oficina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
