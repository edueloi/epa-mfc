import React, { useState, useEffect } from 'react';
import { Participant, Workshop } from '../types';
import { Search, Plus, CheckCircle, XCircle, Users, BookOpen, MapPin, Trash2, UserPlus, RefreshCw, Filter } from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('TODAS');

  // Modal states
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddWorkshop, setShowAddWorkshop] = useState(false);

  // New Participant Form State
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newFamilyGroup, setNewFamilyGroup] = useState('');
  const [newW1Id, setNewW1Id] = useState<number | ''>('');
  const [newW2Id, setNewW2Id] = useState<number | ''>('');

  // New Workshop Form State
  const [wsTitle, setWsTitle] = useState('');
  const [wsInstructor, setWsInstructor] = useState('');
  const [wsLocation, setWsLocation] = useState('');
  const [wsSlot, setWsSlot] = useState<'1ª Oficina' | '2ª Oficina'>('1ª Oficina');

  const loadData = async () => {
    setLoading(true);
    try {
      const [partRes, wsRes] = await Promise.all([
        fetch('/api/participants').then(r => r.json()),
        fetch('/api/workshops').then(r => r.json())
      ]);

      if (Array.isArray(partRes)) setParticipants(partRes);
      if (Array.isArray(wsRes)) setWorkshops(wsRes);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAttendance = async (participantId: number, workshopId: number, status: 'PRESENTE' | 'FALTA') => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, workshop_id: workshopId, status })
      });

      if (res.ok) {
        // Optimistic UI update
        setParticipants(prev => prev.map(p => {
          if (p.id === participantId) {
            const updated = { ...p };
            if (p.workshop1_id === workshopId) updated.attendance1_status = status;
            if (p.workshop2_id === workshopId) updated.attendance2_status = status;
            return updated;
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Erro ao registrar chamada:', err);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCity) return;

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          city: newCity,
          family_group: newFamilyGroup || 'Família MFC',
          workshop1_id: newW1Id !== '' ? Number(newW1Id) : null,
          workshop2_id: newW2Id !== '' ? Number(newW2Id) : null
        })
      });

      if (res.ok) {
        setNewName('');
        setNewCity('');
        setNewFamilyGroup('');
        setNewW1Id('');
        setNewW2Id('');
        setShowAddParticipant(false);
        loadData();
      }
    } catch (err) {
      console.error('Erro ao cadastrar participante:', err);
    }
  };

  const handleAddWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsTitle || !wsInstructor || !wsLocation) return;

    try {
      const res = await fetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: wsTitle,
          instructor: wsInstructor,
          location: wsLocation,
          time_slot: wsSlot,
          max_slots: 40
        })
      });

      if (res.ok) {
        setWsTitle('');
        setWsInstructor('');
        setWsLocation('');
        setShowAddWorkshop(false);
        loadData();
      }
    } catch (err) {
      console.error('Erro ao cadastrar oficina:', err);
    }
  };

  const handleDeleteParticipant = async (id: number) => {
    if (!confirm('Deseja realmente remover este participante?')) return;
    try {
      const res = await fetch(`/api/participants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Erro ao deletar participante:', err);
    }
  };

  // Cities list
  const cities = Array.from(new Set(participants.map(p => p.city))).filter(Boolean);

  // Filtered participants
  const filtered = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.city.toLowerCase().includes(search.toLowerCase()) ||
                          p.family_group.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCityFilter === 'TODAS' || p.city === selectedCityFilter;
    return matchesSearch && matchesCity;
  });

  // Attendance stats
  let totalPresenceMarks = 0;
  let totalAbsenceMarks = 0;
  participants.forEach(p => {
    if (p.attendance1_status === 'PRESENTE') totalPresenceMarks++;
    if (p.attendance1_status === 'FALTA') totalAbsenceMarks++;
    if (p.attendance2_status === 'PRESENTE') totalPresenceMarks++;
    if (p.attendance2_status === 'FALTA') totalAbsenceMarks++;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header & Stats Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Controle de Membros e Presença em Oficinas
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Gestão dos participantes inscritos no 5º EPA e marcação de presença pelos oficineiros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddParticipant(true)}
            className="px-4 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-emerald-400 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Participante</span>
          </button>

          <button
            onClick={() => setShowAddWorkshop(true)}
            className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Oficina</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total de Membros</p>
            <p className="text-xl font-black text-slate-900">{participants.length}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Oficinas Ativas</p>
            <p className="text-xl font-black text-slate-900">{workshops.length}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Presenças Marcadas</p>
            <p className="text-xl font-black text-emerald-600">{totalPresenceMarks}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Faltas Registradas</p>
            <p className="text-xl font-black text-rose-600">{totalAbsenceMarks}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou família..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Cidade:</span>
          <select
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODAS">Todas as Cidades ({cities.length})</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 rounded-xl border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Participante / Cidade</th>
                <th className="p-4">1ª Oficina (Horário 1)</th>
                <th className="p-4">2ª Oficina (Horário 2)</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Carregando participantes do evento...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Nenhum participante encontrado com estes critérios.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Participant Details */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <MapPin className="w-3 h-3" /> {p.city}
                        </span>
                        <span>• {p.family_group}</span>
                      </div>
                    </td>

                    {/* 1ª Oficina Attendance */}
                    <td className="p-4">
                      {p.workshop1_title ? (
                        <div className="space-y-1.5">
                          <div className="font-medium text-slate-800 line-clamp-1">{p.workshop1_title}</div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => p.workshop1_id && handleMarkAttendance(p.id, p.workshop1_id, 'PRESENTE')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                p.attendance1_status === 'PRESENTE'
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" /> Presente
                            </button>
                            <button
                              onClick={() => p.workshop1_id && handleMarkAttendance(p.id, p.workshop1_id, 'FALTA')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                p.attendance1_status === 'FALTA'
                                  ? 'bg-rose-500 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-100'
                              }`}
                            >
                              <XCircle className="w-3 h-3" /> Falta
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Nenhuma inscrita</span>
                      )}
                    </td>

                    {/* 2ª Oficina Attendance */}
                    <td className="p-4">
                      {p.workshop2_title ? (
                        <div className="space-y-1.5">
                          <div className="font-medium text-slate-800 line-clamp-1">{p.workshop2_title}</div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => p.workshop2_id && handleMarkAttendance(p.id, p.workshop2_id, 'PRESENTE')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                p.attendance2_status === 'PRESENTE'
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" /> Presente
                            </button>
                            <button
                              onClick={() => p.workshop2_id && handleMarkAttendance(p.id, p.workshop2_id, 'FALTA')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                p.attendance2_status === 'FALTA'
                                  ? 'bg-rose-500 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-100'
                              }`}
                            >
                              <XCircle className="w-3 h-3" /> Falta
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Nenhuma inscrita</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteParticipant(p.id)}
                        title="Remover participante"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Participante */}
      {showAddParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Novo Participante do EPA</h3>
              <button onClick={() => setShowAddParticipant(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pirassununga"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Família / Equipe</label>
                  <input
                    type="text"
                    placeholder="Ex: Família Silva"
                    value={newFamilyGroup}
                    onChange={(e) => setNewFamilyGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">1ª Oficina</label>
                <select
                  value={newW1Id}
                  onChange={(e) => setNewW1Id(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">Nenhuma / A definir</option>
                  {workshops.map(w => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">2ª Oficina</label>
                <select
                  value={newW2Id}
                  onChange={(e) => setNewW2Id(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="">Nenhuma / A definir</option>
                  {workshops.map(w => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddParticipant(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md"
                >
                  Cadastrar Participante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Oficina */}
      {showAddWorkshop && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Cadastrar Nova Oficina</h3>
              <button onClick={() => setShowAddWorkshop(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleAddWorkshop} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título da Oficina *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comunicação Acolhedora na Família"
                  value={wsTitle}
                  onChange={(e) => setWsTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Oficineiro / Facilitador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Roberto e Maria"
                  value={wsInstructor}
                  onChange={(e) => setWsInstructor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Local / Sala *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sala 102 - Bloco A"
                    value={wsLocation}
                    onChange={(e) => setWsLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Horário / Turno</label>
                  <select
                    value={wsSlot}
                    onChange={(e) => setWsSlot(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="1ª Oficina">1ª Oficina</option>
                    <option value="2ª Oficina">2ª Oficina</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddWorkshop(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md"
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
