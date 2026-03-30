import React, { useState } from 'react';

const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);

  const history = [
    { date: '2023-10-28', file: 'ward_04_ncd_data.xlsx', size: '2.4 MB', status: 'Processed', rows: 842 },
    { date: '2023-10-25', file: 'ward_12_screening.csv', size: '1.1 MB', status: 'Processed', rows: 415 },
    { date: '2023-10-20', file: 'hospital_anc_records.csv', size: '3.8 MB', status: 'Error', rows: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-800">Data Upload Center</h1>
        <p className="text-gray-500 font-medium">Import population health data to refresh risk metrics and camp planning.</p>
      </div>

      {/* Upload Zone */}
      <div 
        className={`relative border-4 border-dashed rounded-[40px] p-16 transition-all duration-300 text-center space-y-6 group cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50/50 scale-95' : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-inner">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-gray-800">Drop files here to upload</h3>
          <p className="text-sm font-bold text-gray-400">Supports .csv, .xlsx up to 50MB</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 transition-all active:scale-95">
          Browse Files
        </button>
      </div>

      {/* History Table */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-4">Upload History</h3>
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50">
                <th className="pb-6 pl-4">Date</th>
                <th className="pb-6">File Name</th>
                <th className="pb-6 text-center">Status</th>
                <th className="pb-6 text-right pr-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((item, idx) => (
                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 pl-4 text-xs font-bold text-gray-400">{item.date}</td>
                  <td className="py-6">
                    <div className="font-bold text-gray-700 text-sm">{item.file}</div>
                    <div className="text-[10px] font-bold text-gray-400">{item.size}</div>
                  </td>
                  <td className="py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight ${
                      item.status === 'Processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-6 text-right pr-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {item.rows > 0 ? `${item.rows} Rows` : 'Invalid Schema'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
