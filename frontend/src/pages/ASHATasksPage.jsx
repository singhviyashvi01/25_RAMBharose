import React, { useState, useEffect } from 'react';
import { getAshaTasks, autoAssignTasks, getAshaWorkers, updateTaskStatus } from '../services/ashaService';

const ASHATasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [showOptimization, setShowOptimization] = useState(false);
    const [optimizing, setOptimizing] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, workersData] = await Promise.all([
                getAshaTasks(),
                getAshaWorkers()
            ]);
            setTasks(tasksData || []);
            setWorkers(workersData || []);
        } catch (err) {
            console.error("Failed to load ASHA data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAutoAssign = async () => {
        try {
            setOptimizing(true);
            await autoAssignTasks();
            await loadData();
            setShowOptimization(false);
        } catch (err) {
            console.error("Auto-assign failed:", err);
            alert("Auto-assignment engine failed. Please check backend logs.");
        } finally {
            setOptimizing(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            await loadData();
        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'All') return true;
        return task.status === activeTab;
    });

    const kpis = [
        { title: 'TOTAL TASKS', value: tasks.length, change: 'Across Zones', color: 'bg-blue-600' },
        { title: 'PENDING', value: tasks.filter(t => t.status === 'Pending').length, change: 'Action Needed', color: 'bg-red-500' },
        { title: 'IN PROGRESS', value: tasks.filter(t => t.status === 'InProgress').length, change: 'Live Tracking', color: 'bg-orange-400' },
        { title: 'COMPLETED', value: tasks.filter(t => t.status === 'Done').length, change: 'Goal Met', color: 'bg-emerald-500' },
    ];

    if (loading) {
        return (
            <div className="flex animate-pulse flex-col items-center justify-center pt-32 pb-64 text-slate-400">
                <svg className="w-12 h-12 mb-4 text-blue-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <div className="font-black tracking-widest uppercase">Syncing Field Operations...</div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 relative font-['Outfit'] pr-4">
            {/* Header section */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">OPERATIONS OVERVIEW</p>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">ASHA Field Tasks</h1>
                </div>
                <button 
                    onClick={() => setShowOptimization(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-3 uppercase"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                    Auto-Assign Tasks
                </button>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{kpi.value}</h3>
                                <span className={`text-[10px] font-bold text-slate-400`}>{kpi.change}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div className={`h-full ${kpi.color} w-3/4 rounded-full`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Task List Section */}
                <div className="col-span-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Tasks</h2>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            {['All', 'Pending', 'InProgress', 'Done'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {tab === 'InProgress' ? 'In Progress' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredTasks.length === 0 ? (
                            <div className="bg-white p-20 text-center rounded-[40px] border border-slate-50 text-slate-400 font-bold">
                                No tasks found in this category.
                            </div>
                        ) : filteredTasks.map(task => (
                            <div key={task.task_id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-8">
                                    <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${
                                        task.status === 'Done' ? 'text-emerald-500' : task.status === 'InProgress' ? 'text-orange-500' : 'text-slate-400'
                                    }`}>
                                        {task.status === 'Done' ? '✓' : task.status === 'InProgress' ? '⟳' : '!'}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight">{task.patient_name}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase ${
                                                task.patient_risk_score > 70 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                                            }`}>
                                                {task.patient_risk_score > 70 ? 'High' : 'Medium'} Risk
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {task.patient_ward}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Today'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ASSIGNED TO</p>
                                        <p className="text-sm font-black text-slate-700">{task.asha_worker_name || 'Unassigned'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {task.status === 'Pending' && (
                                            <button 
                                                onClick={() => handleStatusChange(task.task_id, 'InProgress')}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            > Start </button>
                                        )}
                                        {task.status === 'InProgress' && (
                                            <button 
                                                onClick={() => handleStatusChange(task.task_id, 'Done')}
                                                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                            > Complete </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Roster Section */}
                <div className="col-span-4 space-y-8">
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Field Roster</h2>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                {workers.length} ACTIVE
                            </span>
                        </div>

                        <div className="space-y-6">
                            {workers.map((worker, idx) => (
                                <div key={worker.asha_worker_id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                <img src={`https://ui-avatars.com/api/?name=${worker.name}&background=random`} alt="" />
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-emerald-500`}></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{worker.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {worker.current_active_tasks} / {worker.max_capacity} Tasks
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Load</p>
                                         <p className="text-xs font-black text-slate-700">{Math.round((worker.current_active_tasks / worker.max_capacity) * 100)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimization Engine Modal */}
            {showOptimization && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowOptimization(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-12 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="flex justify-between items-start relative">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-blue-700 tracking-tight">Assignment Engine</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI-Driven Route Optimization</p>
                            </div>
                            <button onClick={() => setShowOptimization(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="flex justify-between items-center py-4 border-b border-slate-50">
                                <p className="text-xs font-bold text-slate-500">Total Unassigned</p>
                                <p className="text-lg font-black text-slate-800">{tasks.filter(t => !t.asha_worker_id).length}</p>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <p className="text-xs font-bold text-slate-500">Wait Time Reduction</p>
                                <p className="text-lg font-black text-emerald-500">Est. 24% Improvement</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative">
                            <button 
                                onClick={() => setShowOptimization(false)}
                                className="py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all bg-slate-50 hover:bg-slate-100 text-slate-600"
                            > Close </button>
                            <button 
                                onClick={handleAutoAssign}
                                disabled={optimizing}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {optimizing ? 'Assigning...' : 'Confirm Auto-Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ASHATasksPage;
