import React, { useState, useEffect } from 'react';
import { Participant, Workshop, City } from '../types';
import { authFetch } from '../lib/authFetch';
import { Search, Plus, CheckCircle, XCircle, Users, BookOpen, MapPin, Trash2, UserPlus, RefreshCw, Filter, MapPinPlus } from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('TODAS');

  // Modal states
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddWorkshop, setShowAddWorkshop] = useState(false);
  const [showManageCities, setShowManageCities] = useState(false);

  // New Participant Form State
  const [newName, setNewName] = useState('');
  const [newCityId, setNewCityId] = useState<number | ''>('');
  const [newFamilyGroup, setNewFamilyGroup] = useState('');
  const [newW1Id, setNewW1Id] = useState<number | ''>('');
  const [newW2Id, setNewW2Id] = useState<number | ''>('');

  // New Workshop Form State
  const [wsTitle, setWsTitle] = useState('');
  const [wsInstructor, setWsInstructor] = useState('');
  const [wsLocation, setWsLocation] = useState('');
  const [wsSlot, setWsSlot] = useState<'1ª Oficina' | '2ª Oficina'>('1ª Oficina');

  // New City Form State
  const [newCityName, setNewCityName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [partRes, wsRes, cityRes] = await Promise.all([
        authFetch('/api/participants').then(r => r.json()),
        authFetch('/api/workshops').then(r => r.json()),
        authFetch('/api/cities').then(r => r.json())
      ]);

      if (Array.isArray(partRes)) setParticipants(partRes);
      if (Array.isArray(wsRes)) setWorkshops(wsRes);
      if (Array.isArray(cityRes)) setCities(cityRes);
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
      const res = await authFetch('/api/attendance', {
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
    if (!newName || !newCityId) return;

    try {
      const res = await authFetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          city_id: Number(newCityId),
          family_group: newFamilyGroup || 'Família MFC',
          workshop1_id: newW1Id !== '' ? Number(newW1Id) : null,
          workshop2_id: newW2Id !== '' ? Number(newW2Id) : null
        })
      });

      if (res.ok) {
        setNewName('');
        setNewCityId('');
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
      const res = await authFetch('/api/workshops', {
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

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    try {
      const res = await authFetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCityName.trim() })
      });

      if (res.ok) {
        setNewCityName('');
        loadData();
      }
    } catch (err) {
      console.error('Erro ao cadastrar cidade:', err);
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!confirm('Remover esta cidade? Participantes já cadastrados com ela não serão afetados.')) return;
    try {
      const res = await authFetch(`/api/cities/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      console.error('Erro ao remover cidade:', err);
    }
  };

  const handleDeleteParticipant = async (id: number) => {
    if (!confirm('Deseja realmente remover este participante?')) return;
    try {
      const res = await authFetch(`/api/participants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Erro ao deletar participante:', err);
    }
  };

  // Cities list (for the filter bar, derived from actually-enrolled participants)
  const enrolledCities = Array.from(new Set(participants.map(p => p.city))).filter(Boolean);

  // Each workshop theme has two occurrences (one per time slot) — split them so the
  // "1ª Oficina" and "2ª Oficina" selects only ever show the matching occurrence.
  const w1Options = workshops.filter(w => w.time_slot.startsWith('1ª'));
  const w2Options = workshops.filter(w => w.time_slot.startsWith('2ª'));

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
    <div className="space-y-5 sm:space-y-8 pb-16">

      {/* Header & Stats Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Membros & Presença
          </h1>
          <p className="hidden sm:block text-slate-600 text-xs sm:text-sm">
            Gestão dos participantes inscritos no 5º EPA e marcação de presença pelos oficineiros.
          </p>
        </div>

        <div className="grid grid-cols-2 md:flex items-center gap-2">
          <button
            onClick={() => setShowAddParticipant(true)}
            className="px-3 sm:px-4 py-2.5 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Participante</span>
          </button>

          <button
            onClick={() => setShowAddWorkshop(true)}
            className="px-3 sm:px-4 py-2.5 bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Oficina</span>
          </button>

          <button
            onClick={() => setShowManageCities(true)}
            className="col-span-2 md:col-span-1 px-3 sm:px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <MapPinPlus className="w-4 h-4" />
            <span>Gerenciar Cidades</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Total de Membros</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{participants.length}</p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Oficinas Ativas</p>
            <p className="text-lg sm:text-xl font-black text-slate-900">{new Set(workshops.map(w => w.title)).size}</p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Presenças</p>
            <p className="text-lg sm:text-xl font-black text-blue-600">{totalPresenceMarks}</p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold flex-shrink-0">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Faltas</p>
            <p className="text-lg sm:text-xl font-black text-rose-600">{totalAbsenceMarks}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou família..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODAS">Todas as Cidades ({enrolledCities.length})</option>
            {enrolledCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2.5 sm:p-2 text-slate-500 hover:text-slate-800 bg-slate-50 rounded-xl border border-slate-200 flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Participants: cards on mobile, table on sm+ */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          Carregando participantes do evento...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          Nenhum participante encontrado com estes critérios.
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{p.name}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <MapPin className="w-3 h-3" /> {p.city}
                      </span>
                      <span>{p.family_group}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteParticipant(p.id)}
                    title="Remover participante"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {p.workshop1_title ? (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">1ª Oficina</p>
                    <p className="text-xs font-medium text-slate-800 line-clamp-1">{p.workshop1_title}</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => p.workshop1_id && handleMarkAttendance(p.id, p.workshop1_id, 'PRESENTE')}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                          p.attendance1_status === 'PRESENTE'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Presente
                      </button>
                      <button
                        onClick={() => p.workshop1_id && handleMarkAttendance(p.id, p.workshop1_id, 'FALTA')}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                          p.attendance1_status === 'FALTA'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Falta
                      </button>
                    </div>
                  </div>
                ) : null}

                {p.workshop2_title ? (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">2ª Oficina</p>
                    <p className="text-xs font-medium text-slate-800 line-clamp-1">{p.workshop2_title}</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => p.workshop2_id && handleMarkAttendance(p.id, p.workshop2_id, 'PRESENTE')}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                          p.attendance2_status === 'PRESENTE'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Presente
                      </button>
                      <button
                        onClick={() => p.workshop2_id && handleMarkAttendance(p.id, p.workshop2_id, 'FALTA')}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                          p.attendance2_status === 'FALTA'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Falta
                      </button>
                    </div>
                  </div>
                ) : null}

                {!p.workshop1_title && !p.workshop2_title && (
                  <p className="text-xs text-slate-400 italic">Nenhuma oficina inscrita</p>
                )}
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: table */}
          <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
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
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">

                      {/* Participant Details */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="inline-flex items-center gap-1 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
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
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-100'
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
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-100'
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Novo Participante */}
      {showAddParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Novo Participante do EPA</h3>
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
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cidade *</label>
                  <select
                    required
                    value={newCityId}
                    onChange={(e) => setNewCityId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                  >
                    <option value="">Selecione a cidade...</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Família / Equipe</label>
                  <input
                    type="text"
                    placeholder="Ex: Família Silva"
                    value={newFamilyGroup}
                    onChange={(e) => setNewFamilyGroup(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">1ª Oficina</label>
                <select
                  value={newW1Id}
                  onChange={(e) => setNewW1Id(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                >
                  <option value="">Nenhuma / A definir</option>
                  {w1Options.map(w => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">2ª Oficina</label>
                <select
                  value={newW2Id}
                  onChange={(e) => setNewW2Id(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                >
                  <option value="">Nenhuma / A definir</option>
                  {w2Options.map(w => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddParticipant(false)}
                  className="px-4 py-3 sm:py-2 bg-slate-100 text-slate-700 font-bold text-sm sm:text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 sm:py-2 bg-blue-600 text-white font-extrabold text-sm sm:text-xs rounded-xl shadow-md"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Cadastrar Nova Oficina</h3>
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
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
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
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Local / Sala *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sala 102 - Bloco A"
                    value={wsLocation}
                    onChange={(e) => setWsLocation(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Horário / Turno</label>
                  <select
                    value={wsSlot}
                    onChange={(e) => setWsSlot(e.target.value as any)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                  >
                    <option value="1ª Oficina">1ª Oficina</option>
                    <option value="2ª Oficina">2ª Oficina</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddWorkshop(false)}
                  className="px-4 py-3 sm:py-2 bg-slate-100 text-slate-700 font-bold text-sm sm:text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 sm:py-2 bg-slate-900 text-white font-extrabold text-sm sm:text-xs rounded-xl shadow-md"
                >
                  Salvar Oficina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Cidades */}
      {showManageCities && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Gerenciar Cidades</h3>
              <button onClick={() => setShowManageCities(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleAddCity} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nome da nova cidade..."
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="flex-1 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-blue-600 text-white font-extrabold text-sm rounded-xl shadow-md flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {cities.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma cidade cadastrada.</p>
              ) : (
                cities.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" /> {c.name}
                    </span>
                    <button
                      onClick={() => handleDeleteCity(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
