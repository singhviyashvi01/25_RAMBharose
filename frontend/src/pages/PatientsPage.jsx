import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '../services/patientService';

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tier: 'All',
    ward: 'All'
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients({
        tier: filters.tier !== 'All' ? filters.tier : undefined,
        ward: filters.ward !== 'All' ? filters.ward : undefined,
        search: searchTerm || undefined
      });
      // Handle different possible response shapes
      const pList = Array.isArray(data) ? data : (data.patients || []);
      setPatients(pList);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const handleRowClick = (id) => {
    navigate(`/patients/${id}`);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 font-['Outfit'] pr-4">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl">
            Manage and monitor high-risk populations across assigned wards with real-time risk scoring and clinical oversight.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export to CSV
          </button>
          <button
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Register Patient
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 relative">
          <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search by ID, Name or Ward..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[24px] font-bold text-sm shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <select
            className="w-full bg-white border border-slate-100 rounded-[20px] px-6 py-4 font-bold text-sm shadow-sm outline-none appearance-none"
            value={filters.tier}
            onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
          >
            <option value="All">All Tiers</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>

        <div className="col-span-2 bg-white border border-slate-100 rounded-[20px] px-6 py-4 flex items-center justify-between cursor-pointer shadow-sm group">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">More Filters</span>
          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden p-10">
        {loading ? (
          <div className="py-20 text-center animate-pulse space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Querying Patient Master DB...</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] border-b border-slate-50">
                  <th className="pb-8 pl-4">PATIENT IDENTITY</th>
                  <th className="pb-8">WARD / ZONE</th>
                  <th className="pb-8">KEY VITALS</th>
                  <th className="pb-8 text-center">RISK LEVEL</th>
                  <th className="pb-8 text-right pr-4">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No patients found matching your criteria.</td>
                  </tr>
                ) : patients.map((p) => (
                  <tr
                    key={p.patient_id}
                    onClick={() => handleRowClick(p.patient_id)}
                    className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <td className="py-7 pl-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-inner transition-transform group-hover:scale-105 ${p.risk_tier === 'High' ? 'bg-red-50 text-red-600' :
                            p.risk_tier === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{p.patient_id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-7">
                      <p className="font-black text-slate-700 text-xs uppercase">{p.ward || 'General'}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{p.gender}, {p.age}y</p>
                    </td>
                    <td className="py-7">
                      <div className="flex items-center gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">BP</p>
                          <p className="text-xs font-black text-slate-700">{p.systolic_bp}/{p.diastolic_bp}</p>
                        </div>
                        <div className="w-px h-6 bg-slate-100"></div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">BMI</p>
                          <p className="text-xs font-black text-slate-700">{p.bmi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-7 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner flex-shrink-0">
                          <div
                            className={`h-full rounded-full ${p.risk_tier === 'High' ? 'bg-red-600' :
                                p.risk_tier === 'Medium' ? 'bg-amber-600' : 'bg-emerald-400'
                              }`}
                            style={{ width: `${p.overall_risk}%` }}
                          ></div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest shadow-sm border ${p.risk_tier === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                            p.risk_tier === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {p.risk_tier.toUpperCase()} RISK
                        </span>
                      </div>
                    </td>
                    <td className="py-7 text-right pr-4">
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="mt-10 flex justify-between items-center py-4 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {patients.length} patients in cohort</p>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-[10px] font-black">1</button>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Emergency Alert Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="flex items-center gap-3 bg-white px-6 py-4 rounded-[28px] shadow-2xl border border-slate-100 hover:-translate-y-1 transition-all active:scale-95 group">
          <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:animate-pulse">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 11v4m0 0l-2-2m2 2l2-2" /></svg>
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight uppercase">Emergency Alert</span>
        </button>
      </div>
    </div>
  );
};

export default PatientsPage;
