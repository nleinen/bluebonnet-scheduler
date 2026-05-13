'use client';

import { useState } from 'react';
import { generateSchedule, Visit, Species, BreedSize } from '../lib/scheduler';
import { Download, Edit2, Check, ShieldAlert } from 'lucide-react';

export default function SchedulerApp() {
  const [dob, setDob] = useState('');
  const [firstVisit, setFirstVisit] = useState('');
  const [species, setSpecies] = useState<Species>('Dog');
  const [breedSize, setBreedSize] = useState<BreedSize>('Small');
  const [schedule, setSchedule] = useState<Visit[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!dob || !firstVisit) return;
    const results = generateSchedule(
      new Date(dob + 'T12:00:00'), 
      new Date(firstVisit + 'T12:00:00'), 
      species, 
      breedSize
    );
    setSchedule(results);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-card');
    if (!element) return;

    // Dynamically import to avoid Next.js server-side rendering errors
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin:       0.3,
      filename:     `Bluebonnet_Preventive_Care_${species}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      // This forces the engine to try to keep everything on a single page
      pagebreak:    { mode: 'avoid-all' } 
    };

    html2pdf().set(opt).from(element).save();
  };

  const updateVisit = (id: string, field: keyof Visit, value: any) => {
    setSchedule(schedule.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const formatDateForHeader = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Preventive Care Scheduler</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Species</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={species} 
                onChange={(e) => setSpecies(e.target.value as Species)}
              >
                <option value="Dog">Canine (Puppy)</option>
                <option value="Cat">Feline (Kitten)</option>
              </select>
            </div>
            
            {species === 'Dog' ? (
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Breed Size</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={breedSize} 
                  onChange={(e) => setBreedSize(e.target.value as BreedSize)}
                >
                  <option value="Small">Small/Medium (&lt; 50lbs)</option>
                  <option value="Large">Large/Giant (&gt; 50lbs)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1 opacity-0">Spacer</label>
                <div className="w-full p-2 bg-transparent"></div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Date of Birth</label>
              <input 
                type="date" 
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">First Visit Date</label>
              <input 
                type="date" 
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={firstVisit} 
                onChange={(e) => setFirstVisit(e.target.value)} 
              />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!dob || !firstVisit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Generate Optimized Schedule
          </button>
        </div>

        {/* Report Card - Now Acts as the WYSIWYG PDF Template */}
        {schedule.length > 0 && (
          <div className="relative">
            
            {/* Floating Action Button for Download (Hidden from PDF) */}
            <div className="absolute top-4 right-4 z-10" data-html2canvas-ignore="true">
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition font-medium"
              >
                <Download size={18} /> Download PDF
              </button>
            </div>

            {/* The Actual Element Being Captured */}
            <div id="report-card" className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
              
              {/* Formal Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-6 pt-4">
                <h1 className="text-3xl font-extrabold text-blue-800 uppercase tracking-widest">Bluebonnet Animal Hospital</h1>
                <p className="text-sm text-slate-600 font-medium mt-1 uppercase tracking-widest">Optimal Preventive Care Schedule</p>
              </div>

              {/* Patient Information Summary Row */}
              <div className="flex justify-between bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Patient Species</span>
                  <p className="font-semibold text-slate-900">{species}</p>
                </div>
                {species === 'Dog' && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Expected Adult Size</span>
                    <p className="font-semibold text-slate-900">{breedSize} Breed</p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Date of Birth</span>
                  <p className="font-semibold text-slate-900">{formatDateForHeader(dob)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Initial Visit</span>
                  <p className="font-semibold text-slate-900">{formatDateForHeader(firstVisit)}</p>
                </div>
              </div>

              {/* Strict Scheduling Warning Box */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-amber-600 mt-0.5 shrink-0" size={20} />
                  <p className="text-amber-900 text-sm font-medium">
                    <strong className="uppercase">Important Clinical Guideline:</strong> To ensure optimal immune system development and prevent restarting the vaccine series, please schedule your booster visits strictly within <strong>+/- 3 days</strong> of the exact target dates listed below.
                  </p>
                </div>
              </div>

              {/* Schedule List - TWO COLUMN GRID */}
              <div className="grid grid-cols-2 gap-4">
                {schedule.map((visit, index) => (
                  <div 
                    key={visit.id} 
                    className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {visit.id === 'sx' ? 'Surgery Timeline' : `Visit ${index + 1}`}
                      </span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {visit.ageDisplay} Old
                      </span>
                    </div>

                    {/* Date */}
                    <div className="font-bold text-xl text-blue-700 leading-tight mb-2">
                      {visit.formattedDate}
                    </div>
                    
                    {/* Warning Badge */}
                    <div className="h-8 mb-2">
                      {visit.isBooster && (
                        <div className="inline-flex items-center gap-1.5 p-1 px-2 bg-amber-100 border border-amber-300 rounded text-amber-900">
                          <span className="text-[9px] uppercase font-bold tracking-widest leading-none mt-0.5">Note:</span>
                          <span className="text-[11px] font-semibold leading-tight">
                            Schedule within +/- 3 days
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Services & Notes Section */}
                    <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-3">
                      
                      {/* Services */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Services & Immunizations
                          </span>
                          <button 
                            onClick={() => setEditingId(editingId === visit.id ? null : visit.id)}
                            className="text-slate-400 hover:text-blue-600 transition"
                            title={editingId === visit.id ? "Save Changes" : "Edit Details"}
                            data-html2canvas-ignore="true" // Hides the edit button from the PDF
                          >
                            {editingId === visit.id ? <Check size={14} /> : <Edit2 size={14} />}
                          </button>
                        </div>

                        {editingId === visit.id ? (
                          <input 
                            type="text" 
                            value={visit.vaccines.join(', ')}
                            onChange={(e) => updateVisit(visit.id, 'vaccines', e.target.value.split(',').map(s => s.trim()))}
                            className="w-full p-1.5 border border-slate-300 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Comma separated vaccines"
                            data-html2canvas-ignore="true" // Hide input field from PDF if accidentally left open
                          />
                        ) : (
                          <div className="font-semibold text-slate-900 text-sm">
                            {visit.vaccines.length > 0 
                              ? visit.vaccines.join(' • ') 
                              : 'Consultation & Scheduling'}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                          Notes
                        </span>
                        {editingId === visit.id ? (
                          <input 
                            type="text" 
                            value={visit.notes || ''}
                            onChange={(e) => updateVisit(visit.id, 'notes', e.target.value)}
                            className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Add clinical notes..."
                            data-html2canvas-ignore="true"
                          />
                        ) : (
                          <div className="text-xs text-slate-600 font-medium min-h-[1.25rem]">
                            {visit.notes || '--'}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
              
              {/* Print Footer */}
              <div className="mt-8 text-center text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                Generated by Bluebonnet Animal Hospital System • {new Date().toLocaleDateString()}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}