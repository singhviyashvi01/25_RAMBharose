import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPatients } from '../services/patientService';
import { simulateRisk } from '../services/simulatorService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RiskSimulatorPage = () => {
    const [patients, setPatients] = useState([]);
    const [patientIndex, setPatientIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Simulation States
    const [factors, setFactors] = useState({
        bmi: 25.0,
        sbp: 120,
        hba1c: 5.5,
        glucose: 100,
        smoking_status: 0,
        activity_level: 0
    });
    const [simulating, setSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [clinicianNote, setClinicianNote] = useState('');

    // Initial Data Load
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const data = await getPatients({ page: 1 });
                const pList = Array.isArray(data) ? data : (data.patients || []);
                setPatients(pList);
            } catch (err) {
                console.error('Failed to load patients for simulator:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const currentPatient = patients.length > 0 ? patients[patientIndex] : null;

    // Reset factors when patient changes
    useEffect(() => {
        if (currentPatient) {
            setFactors({
                bmi: currentPatient.bmi || 25.0,
                sbp: currentPatient.systolic_bp || 120,
                hba1c: currentPatient.hba1c || 5.5,
                glucose: currentPatient.blood_glucose_fasting || 100,
                smoking_status: currentPatient.smoking_status || 0,
                activity_level: 0
            });
            setSimulationResult(null);
        }
    }, [currentPatient]);

    const handleSliderChange = (key, val) => {
        setFactors(prev => ({ ...prev, [key]: parseFloat(val) }));
    };

    const changePatient = () => {
        if (patients.length > 0) {
            setPatientIndex((prev) => (prev + 1) % patients.length);
        }
    };

    const handleRunSimulation = async () => {
        if (!currentPatient) return;
        try {
            setSimulating(true);
            const overrides = {
                bmi: factors.bmi,
                systolic_bp: factors.sbp,
                hba1c: factors.hba1c,
                blood_glucose_fasting: factors.glucose,
                smoking_status: factors.smoking_status
            };
            const res = await simulateRisk(currentPatient.patient_id, overrides);
            setSimulationResult(res);
        } catch (err) {
            console.error('Failed simulation:', err);
        } finally {
            setSimulating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex animate-pulse flex-col items-center justify-center pt-32 pb-64 text-slate-400">
                <svg className="w-12 h-12 mb-4 text-blue-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <div className="font-black tracking-widest uppercase">Loading Patient Cohort...</div>
            </div>
        );
    }

    if (patients.length === 0) {
        return (
            <div className="text-center pt-32 pb-64 text-slate-500 font-bold">
                No patients available for simulation. Please upload a dataset first.
            </div>
        );
    }

    const currentRisk = currentPatient.overall_risk || 0;
    const simulatedOverall = simulationResult ? simulationResult.simulated.overall_risk : currentRisk;
    const reductionDelta = simulationResult ? (simulationResult.simulated.overall_risk - currentRisk).toFixed(1) : 0;
    const isImproved = reductionDelta < 0;

    const chartData = {
        labels: ['Current Risk', 'Simulated Risk'],
        datasets: [
            {
                data: [currentRisk, simulatedOverall],
                backgroundColor: ['#f97316', simulatedOverall < currentRisk ? '#10b981' : '#ef4444'],
                borderRadius: 12,
                barPercentage: 0.6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' } } },
            y: { display: false, grid: { display: false }, min: 0, max: 100 },
        },
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700 font-['Outfit'] pr-4">
            {/* Header Section */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{currentPatient.name}</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {currentPatient.patient_id.slice(0, 8)}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentPatient.gender}, {currentPatient.age}y</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{currentPatient.primary_condition || 'Active Case'}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={changePatient}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-black text-slate-600 transition-all active:scale-95 border border-slate-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    Next Patient
                </button>
            </div>

            <div className="grid grid-cols-12 gap-8 items-stretch">
                {/* Parameters Panel */}
                <div className="col-span-8 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Intervention Sliders</h3>
                    
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                        {/* BMI */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Target BMI</label>
                                <span className="text-sm font-black text-blue-600">{factors.bmi} <span className="text-[10px]">kg/m²</span></span>
                            </div>
                            <input 
                                type="range" min="15" max="45" step="0.1" value={factors.bmi} 
                                onChange={(e) => handleSliderChange('bmi', e.target.value)}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            />
                        </div>

                        {/* SBP */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Target SBP</label>
                                <span className="text-sm font-black text-blue-600">{factors.sbp} <span className="text-[10px]">mmHg</span></span>
                            </div>
                            <input 
                                type="range" min="90" max="200" value={factors.sbp} 
                                onChange={(e) => handleSliderChange('sbp', e.target.value)}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            />
                        </div>

                        {/* HbA1c */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Target HbA1c</label>
                                <span className="text-sm font-black text-blue-600">{factors.hba1c} %</span>
                            </div>
                            <input 
                                type="range" min="4" max="14" step="0.1" value={factors.hba1c} 
                                onChange={(e) => handleSliderChange('hba1c', e.target.value)}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            />
                        </div>

                        {/* Fasting Glucose */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Fasting Glucose</label>
                                <span className="text-sm font-black text-blue-600">{factors.glucose} mg/dL</span>
                            </div>
                            <input 
                                type="range" min="60" max="400" value={factors.glucose} 
                                onChange={(e) => handleSliderChange('glucose', e.target.value)}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            />
                        </div>

                        {/* Toggles */}
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleSliderChange('smoking_status', factors.smoking_status === 1 ? 0 : 1)}
                                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${factors.smoking_status === 1 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-100 opacity-60'}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Smoking Cessation</span>
                            </button>
                            <button 
                                onClick={() => handleSliderChange('activity_level', factors.activity_level === 1 ? 0 : 1)}
                                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${factors.activity_level === 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-100 opacity-60'}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Increased Activity</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={handleRunSimulation}
                            disabled={simulating}
                            className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-sm tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {simulating ? 'PROCESSING AI PREDICTION...' : 'RUN RISK SIMULATION'}
                        </button>
                    </div>
                </div>

                {/* Results & Action Sidebar */}
                <div className="col-span-4 space-y-6">
                    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Projection Results</h3>
                        
                        <div className="flex items-center justify-around py-2">
                            <div className="text-center group">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Before</p>
                                <div className="text-4xl font-black text-slate-300 line-through">{currentRisk}%</div>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </div>
                            <div className="text-center group">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">After</p>
                                <div className={`text-5xl font-black tracking-tighter ${isImproved ? 'text-emerald-500' : 'text-blue-600'}`}>{simulatedOverall}%</div>
                            </div>
                        </div>

                        {simulationResult && (
                            <div className={`p-6 rounded-3xl border ${isImproved ? 'bg-emerald-50/50 border-emerald-100' : 'bg-blue-50/50 border-blue-100'}`}>
                                <div className="flex justify-between items-center mb-3">
                                   <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Reduction Potential</p>
                                   <span className={`text-lg font-black ${isImproved ? 'text-emerald-600' : 'text-blue-600'}`}>{reductionDelta}%</span>
                                </div>
                                <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                                   "{simulationResult.simulation_summary}"
                                </p>
                            </div>
                        )}

                        <div className="h-40 w-full">
                           <Bar data={chartData} options={chartOptions} />
                        </div>

                        <div className="space-y-3 pt-4">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[20px] font-black text-xs tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3">
                                GENERATE ACTION PLAN
                            </button>
                            <button 
                                onClick={() => setSimulationResult(null)}
                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-[20px] font-black text-[10px] tracking-widest transition-all border border-slate-100"
                            >
                                RESET SIMULATION
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskSimulatorPage;
