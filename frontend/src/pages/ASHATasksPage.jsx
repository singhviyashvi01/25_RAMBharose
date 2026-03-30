import React from 'react';

const ASHATasksPage = () => {
  const tasks = [
    { id: 'T-102', patient: 'Aswathy Menon', ward: 'Ward 04', task: 'Blood Sugar Follow-up', due: '2023-11-05', priority: 'HIGH', status: 'Pending' },
    { id: 'T-103', patient: 'Rahul Pillai', ward: 'Ward 12', task: 'Medication Adherence Check', due: '2023-11-06', priority: 'MEDIUM', status: 'In Progress' },
    { id: 'T-104', patient: 'Sneha Nair', ward: 'Ward 04', task: 'BP Monitoring', due: '2023-11-04', priority: 'HIGH', status: 'Overdue' },
    { id: 'T-105', patient: 'Vimal Kumar', ward: 'Ward 08', task: 'Lifestyle Counseling', due: '2023-11-08', priority: 'LOW', status: 'Pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-800">ASHA Tasks</h1>
          <p className="text-gray-500 font-medium">Coordinate community health workers and track patient follow-up tasks.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 transition-all active:scale-95">
          Assign New Task
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-10">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-50">
              <th className="pb-6">Task ID</th>
              <th className="pb-6">Patient / Ward</th>
              <th className="pb-6">Action Required</th>
              <th className="pb-6">Due Date</th>
              <th className="pb-6">Priority</th>
              <th className="pb-6">Status</th>
              <th className="pb-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-6 text-xs font-bold text-gray-400">{task.id}</td>
                <td className="py-6">
                  <div className="font-bold text-gray-800 text-sm">{task.patient}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{task.ward}</div>
                </td>
                <td className="py-6 font-bold text-gray-600 text-sm">{task.task}</td>
                <td className="py-6 text-xs font-bold text-gray-500">{task.due}</td>
                <td className="py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                    task.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 
                    task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-6">
                  <span className={`flex items-center gap-2 text-xs font-bold ${
                    task.status === 'Overdue' ? 'text-red-500' : 
                    task.status === 'In Progress' ? 'text-blue-500' : 
                    'text-gray-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      task.status === 'Overdue' ? 'bg-red-500' : 
                      task.status === 'In Progress' ? 'bg-blue-500' : 
                      'bg-gray-400'
                    }`}></div>
                    {task.status}
                  </span>
                </td>
                <td className="py-6 text-right">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ASHATasksPage;
