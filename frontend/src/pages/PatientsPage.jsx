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
      setPatients(data.patients || []);
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
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 font-['Outfit']">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 font-medium tracking-wide">Registry of all screened individuals and their risk profiles.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:min-w-[400px]">
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
          
          <select 
            className="bg-white border border-slate-100 rounded-[20px] px-6 py-4 font-bold text-sm shadow-sm outline-none"
            value={filters.tier}
            onChange={(e) => setFilters({...filters, tier: e.target.value})}
          >
            <option value="All">All Tiers</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
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
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] border-b border-slate-50">
                <th className="pb-8 pl-4">PATIENT IDENTITY</th>
                <th className="pb-8">WARD / ZONE</th>
                <th className="pb-8">KEY VITALS</th>
                <th className="pb-8">RISK TIER</th>
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
                       <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {p.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{p.patient_id.slice(0,8)}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-7">
                     <p className="font-black text-slate-700 text-xs uppercase">{p.ward || 'W-01'}</p>
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
                  <td className="py-7">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest shadow-sm border ${
                      p.risk_tier === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                      p.risk_tier === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {p.risk_tier} RISK
                    </span>
                  </td>
                  <td className="py-7 text-right pr-4">
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
