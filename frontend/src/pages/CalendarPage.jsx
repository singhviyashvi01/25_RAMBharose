import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getAppointments, createAppointment, deleteAppointment, updateAppointmentStatus } from '../services/appointmentService';
import { getPatients } from '../services/patientService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CalendarPage = () => {
    const { user } = useAuth();
    const doctor_id = user?.id;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMode, setViewMode] = useState('schedule'); // 'schedule' or 'detail'
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        patient_id: '',
        patient_name: '',
        time: '09:00',
        type: 'Consultation',
        notes: ''
    });

    const fetchInitialData = async () => {
        if (!doctor_id) return;
        try {
            setLoading(true);
            const [apptData, patientData] = await Promise.all([
                getAppointments(doctor_id),
                getPatients({ page: 1 })
            ]);
            setAppointments(apptData);
            const pList = Array.isArray(patientData) ? patientData : (patientData.patients || []);
            setPatients(pList);
        } catch (err) {
            console.error("Failed to fetch calendar data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [doctor_id]);

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        
        // Add padding for start of month
        const firstDay = date.getDay();
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add actual days
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const openScheduleModal = (date) => {
        setSelectedDate(date);
        setViewMode('schedule');
        setIsModalOpen(true);
    };

    const openDetailModal = (e, appt) => {
        e.stopPropagation();
        setSelectedAppointment(appt);
        setViewMode('detail');
        setIsModalOpen(true);
    };

    const handleDelete = async (apptId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await deleteAppointment(apptId);
            setIsModalOpen(false);
            fetchInitialData();
        } catch (err) {
            console.error("Failed to delete:", err);
            alert("Error deleting appointment");
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedDate || !formData.patient_id) return;

        try {
            const [hours, minutes] = formData.time.split(':');
            const appointmentDate = new Date(selectedDate);
            appointmentDate.setHours(parseInt(hours), parseInt(minutes));

            const selectedPatient = patients.find(p => p.patient_id === formData.patient_id);

            await createAppointment({
                patient_id: formData.patient_id,
                patient_name: selectedPatient?.name || 'Unknown',
                appointment_date: appointmentDate.toISOString(),
                type: formData.type,
                notes: formData.notes
            }, doctor_id);

            setIsModalOpen(false);
            setFormData({ patient_id: '', patient_name: '', time: '09:00', type: 'Consultation', notes: '' });
            fetchInitialData();
        } catch (err) {
            console.error("Failed to schedule:", err);
            alert("Error scheduling appointment");
        }
    };

    const getAppointmentsForDay = (date) => {
        if (!date) return [];
        return appointments.filter(a => {
            const d = new Date(a.appointment_date);
            return d.getDate() === date.getDate() && 
                   d.getMonth() === date.getMonth() && 
                   d.getFullYear() === date.getFullYear();
        });
    };

    if (loading && appointments.length === 0) return <div className="pt-20"><LoadingSpinner /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-['Outfit'] pr-4">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Schedule</p>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Clinical Calendar</h1>
                    <p className="text-sm font-medium text-slate-500">Manage your patient appointments and consultations.</p>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]">
                {/* Calendar Side */}
                <div className="flex-1 p-8 border-r border-slate-50">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-slate-800">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-slate-50 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
                        ))}
                        {daysInMonth.map((day, idx) => {
                            const dayAppts = getAppointmentsForDay(day);
                            return (
                                <div 
                                    key={idx} 
                                    className={`bg-white h-24 p-2 relative group hover:bg-blue-50/30 transition-all ${!day ? 'bg-slate-50/50' : 'cursor-pointer'}`}
                                    onClick={() => day && openScheduleModal(day)}
                                >
                                    {day && (
                                        <>
                                            <span className={`text-xs font-bold ${day.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                                                {day.getDate()}
                                            </span>
                                            <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px] no-scrollbar">
                                                {dayAppts.map((a, i) => (
                                                    <div 
                                                        key={i} 
                                                        onClick={(e) => openDetailModal(e, a)}
                                                        className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold truncate transition-all hover:scale-105 active:scale-95 ${
                                                        a.type === 'Emergency' ? 'bg-red-50 text-red-600' : 
                                                        a.type === 'Follow-up' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                        {new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {a.patient_name}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 border-2 border-blue-600 opacity-0 group-hover:opacity-100 rounded-lg pointer-events-none transition-opacity"></div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming List Side */}
                <div className="w-full md:w-80 bg-slate-50/30 p-8 flex flex-col h-full border-l border-slate-50 overflow-y-auto no-scrollbar">
                    {/* Today Section */}
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Today</h3>
                    <div className="space-y-3 mb-8">
                        {getAppointmentsForDay(new Date()).length === 0 ? (
                            <p className="text-[10px] font-bold text-slate-300 italic px-2">No visits today.</p>
                        ) : getAppointmentsForDay(new Date()).map((a, i) => (
                            <div 
                                key={i} 
                                onClick={(e) => openDetailModal(e, a)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-3 group hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className={`w-1 h-10 rounded-full ${a.type === 'Emergency' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">
                                        {new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-slate-800 text-sm truncate">{a.patient_name}</p>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(a.appointment_id);
                                            }}
                                            className="p-1 text-slate-300 hover:text-red-500 transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Future Section */}
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Upcoming Visits</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar">
                        {appointments.filter(a => {
                            const d = new Date(a.appointment_date);
                            const now = new Date();
                            now.setHours(23, 59, 59, 999); // end of today
                            return d > now;
                        }).length === 0 ? (
                            <p className="text-[10px] font-bold text-slate-300 italic px-2">No future visits.</p>
                        ) : appointments.filter(a => {
                            const d = new Date(a.appointment_date);
                            const now = new Date();
                            now.setHours(23, 59, 59, 999);
                            return d > now;
                        }).map((a, i) => (
                            <div 
                                key={i} 
                                onClick={(e) => openDetailModal(e, a)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-3 group hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className={`w-1 h-10 rounded-full ${a.type === 'Emergency' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">
                                        {new Date(a.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-slate-800 text-sm truncate">{a.patient_name}</p>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(a.appointment_id);
                                            }}
                                            className="p-1 text-slate-300 hover:text-red-500 transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <button 
                            onClick={() => openScheduleModal(new Date())}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                            New Appointment
                        </button>
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 mt-10">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{viewMode === 'schedule' ? 'Schedule' : 'Appointment Details'}</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {viewMode === 'schedule' ? selectedDate?.toDateString() : new Date(selectedAppointment?.appointment_date).toDateString()}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {viewMode === 'schedule' ? (
                                <form onSubmit={handleSchedule} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Patient Selection</label>
                                        <select 
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            value={formData.patient_id}
                                            onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                                        >
                                            <option value="">Select a patient...</option>
                                            {patients.map(p => (
                                                <option key={p.patient_id} value={p.patient_id}>{p.name} (#{p.patient_id.slice(0,6)})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Time Slot</label>
                                            <input 
                                                type="time" 
                                                required
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                value={formData.time}
                                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Type</label>
                                            <select 
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                value={formData.type}
                                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            >
                                                <option>Consultation</option>
                                                <option>Follow-up</option>
                                                <option>Emergency</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Clinical Notes</label>
                                        <textarea 
                                            rows="3"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            placeholder="Add specific instructions or reason for visit..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-[24px] shadow-xl shadow-blue-100 transition-all active:scale-95 mt-4"
                                    >
                                        CONFIRM APPOINTMENT
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 font-black">
                                                {selectedAppointment?.patient_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</p>
                                                <p className="font-bold text-slate-800 text-lg">{selectedAppointment?.patient_name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                                                <p className="font-bold text-slate-700">{new Date(selectedAppointment?.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                                <p className="font-bold text-slate-700">{selectedAppointment?.type}</p>
                                            </div>
                                        </div>
                                        {selectedAppointment?.notes && (
                                            <div className="pt-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</p>
                                                <p className="text-sm font-medium text-slate-600 italic">"{selectedAppointment.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => handleDelete(selectedAppointment.appointment_id)}
                                            className="py-4 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 font-black text-xs rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            CANCEL VISIT
                                        </button>
                                        <button 
                                            onClick={() => setIsModalOpen(false)}
                                            className="py-4 bg-slate-900 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95"
                                        >
                                            CLOSE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
