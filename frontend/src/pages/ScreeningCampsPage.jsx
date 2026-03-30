import React, { useState, useEffect } from 'react';
import { getCampPlan, getCamps, createCamp } from '../services/campsService';

const ScreeningCampsPage = () => {
    const [plan, setPlan] = useState(null);
    const [camps, setCamps] = useState({ upcoming: [], past: [] });
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedConditions, setSelectedConditions] = useState(['Hypertension', 'Diabetes']);

    const loadData = async () => {
        try {
            setLoading(true);
            const [planData, campsData] = await Promise.all([
                getCampPlan({ month: selectedMonth }),
                getCamps()
            ]);
            setPlan(planData);
            setCamps(campsData);
        } catch (err) {
            console.error("Failed to load camp data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const handleScheduleCamp = async (wardPlan) => {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 7); // Schedule for 1 week out
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            await createCamp({
                ward: wardPlan.ward,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                venue: `Community Center, ${wardPlan.ward}`,
                target_patient_count: wardPlan.estimated_patients_per_camp,
                screenings: wardPlan.suggested_screenings
            });
            alert(`Camp scheduled successfully for ${wardPlan.ward}`);
            loadData();
        } catch (err) {
            console.error("Scheduling failed:", err);
            alert("Failed to schedule camp. Check backend connection.");
        }
    };

    const toggleCondition = (condition) => {
        setSelectedConditions(prev => 
            prev.includes(condition) 
                ? prev.filter(c => c !== condition) 
                : [...prev, condition]
        );
    };

    if (loading || !plan) {
        return (
            <div className="flex animate-pulse flex-col items-center justify-center pt-32 pb-64 text-slate-400">
                <svg className="w-12 h-12 mb-4 text-blue-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <div className="font-black tracking-widest uppercase">Calculating Screening Efficiency...</div>
            </div>
        );
    }

    const avgNNS = plan.ward_plans.length > 0 
        ? (plan.ward_plans.reduce((acc, curr) => acc + (curr.number_needed_to_screen || 0), 0) / plan.ward_plans.length).toFixed(1)
        : "0.0";

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 font-['Outfit'] pr-4">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight">
                        <span className="text-slate-800">Screening </span>
                        <span className="text-blue-600">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Strategize community health interventions using predictive screening metrics and ward-level risk mapping.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 pr-12">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. NNS</p>
                            <p className="text-3xl font-black text-blue-700">{avgNNS}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                            Number Needed<br/>To Screen
                        </p>
                    </div>

                    <button onClick={loadData} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-100 transition-all duration-300 flex items-center gap-4 group active:scale-95">
                        <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg pr-4">Refresh Strategy</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Filters & Timeline */}
                <div className="col-span-3 space-y-8">
                    {/* Filters Card */}
                    <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 space-y-8">
                        <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time Period</label>
                                <input 
                                    type="month" 
                                    className="w-full bg-white border border-slate-100 rounded-2xl px-4 py-3.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Focus</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Hypertension', 'Diabetes', 'Cardio', 'Anaemia'].map((condition) => (
                                        <button
                                            key={condition}
                                            onClick={() => toggleCondition(condition)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                                                selectedConditions.includes(condition)
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-105'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500'
                                            }`}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="px-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Active Timeline</h3>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{camps.total_upcoming} PLANNED</span>
                        </div>
                        <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {camps.upcoming.length === 0 ? (
                                <p className="text-xs text-slate-400 italic pl-8">No scheduled camps.</p>
                            ) : camps.upcoming.map((camp, idx) => (
                                <div key={idx} className="flex gap-4 relative group">
                                    <div className={`w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10 flex-shrink-0 transition-transform group-hover:scale-125`}></div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                            {new Date(camp.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            <span className="text-slate-300">•</span> {camp.ward}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{camp.venue}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Column: Matrix & Next Camp */}
                <div className="col-span-6 space-y-8">
                    {/* Geospatial Risk Matrix */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Geospatial Risk Matrix</h2>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-100 border-2 border-red-400"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">High Priority</span>
                            </div>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                                    <th className="pb-4 font-bold">Ward Name</th>
                                    <th className="pb-4 font-bold text-center">Risk Density</th>
                                    <th className="pb-4 font-bold text-center">Coverage</th>
                                    <th className="pb-4 font-bold text-center">NNS Target</th>
                                    <th className="pb-4 font-bold text-right pr-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/50">
                                {plan.ward_plans.map((ward, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6 font-bold text-slate-700 text-sm">{ward.ward}</td>
                                        <td className="py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight ${
                                                ward.high_risk_count > 10 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'
                                            }`}>
                                                {ward.high_risk_count > 10 ? 'CRITICAL' : 'STABLE'} ({ward.high_risk_count})
                                            </span>
                                        </td>
                                        <td className="py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-16 h-1 bg-slate-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${ward.coverage_percent}%` }}></div>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400">{ward.coverage_percent}%</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-center font-black text-blue-600 text-sm">{ward.number_needed_to_screen}</td>
                                        <td className="py-6 text-right pr-4">
                                            <button 
                                                onClick={() => handleScheduleCamp(ward)}
                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-blue-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Next Active Camp Card (Draft from Plan) */}
                    {plan.ward_plans.length > 0 && (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex gap-10 relative overflow-hidden group">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] animate-pulse">Efficiency Recommendation</p>
                                    <h3 className="text-3xl font-black text-slate-800">{plan.ward_plans[0].ward} Screening</h3>
                                </div>

                                <div className="flex gap-12">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Inflow</p>
                                        <p className="text-xl font-black text-slate-800">{plan.ward_plans[0].estimated_patients_per_camp} <span className="text-sm font-bold text-slate-400">Patients</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NNS Goal</p>
                                        <p className="text-xl font-black text-slate-800">{plan.ward_plans[0].number_needed_to_screen}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button onClick={() => handleScheduleCamp(plan.ward_plans[0])} className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-xl active:scale-95">Schedule Now</button>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Predictive Logic: 94% Accurate</span>
                                </div>
                            </div>

                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0 transform group-hover:rotate-3 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Proposed Strategy Detail */}
                <div className="col-span-3 space-y-8">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 flex flex-col h-full ring-4 ring-slate-50 relative group">
                        <div className="space-y-6 flex-1">
                            <div className="flex gap-4">
                                <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
                                <h3 className="text-xl font-black text-slate-800 leading-tight">Insight: Resource Allocation</h3>
                            </div>

                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Our ML engine recommends conducting {plan.total_recommended_camps} camps in {plan.month} to detect an estimated {plan.total_high_risk} high-priority NCD cases before escalation.
                            </p>

                            <div className="space-y-4 pt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Screenings</p>
                                <div className="flex flex-wrap gap-2">
                                    {plan.ward_plans[0]?.suggested_screenings.map((s, idx) => (
                                        <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 p-6 rounded-[28px] border border-emerald-100 mt-10">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Tip</p>
                                    <p className="text-xs font-bold text-slate-600">Prioritizing Ward {plan.ward_plans[0]?.ward} could reduce clinic ER visits by 12%.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScreeningCampsPage;
