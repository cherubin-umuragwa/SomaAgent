
'use client';

import React from 'react';
import { MasteryStatus, SyllabusNode } from '@/types';

const SYLLABUS: SyllabusNode[] = [
  { id: '1', title: 'Cell Biology', subject: 'Biology', status: MasteryStatus.MASTERED, order: 1 },
  { id: '2', title: 'Plant Nutrition', subject: 'Biology', status: MasteryStatus.MASTERED, order: 2 },
  { id: '3', title: 'Human Transport', subject: 'Biology', status: MasteryStatus.IN_PROGRESS, order: 3 },
  { id: '4', title: 'Coordination', subject: 'Biology', status: MasteryStatus.LOCKED, order: 4 },
  { id: '5', title: 'Homeostasis', subject: 'Biology', status: MasteryStatus.LOCKED, order: 5 },
];

const MasteryMap: React.FC = () => {
  return (
    <div className="relative py-12 px-0 md:px-8 overflow-hidden">
      {/* Central Connector Path */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-slate-100 -translate-x-1/2 rounded-full" />
      
      <div className="space-y-16 md:space-y-24 relative">
        {SYLLABUS.map((node, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div key={node.id} className={`flex items-center justify-center w-full relative ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
              
              {/* Node Visualization Card */}
              <div className={`w-full max-w-[280px] bg-white p-6 rounded-[32px] shadow-sm border-2 transition-all duration-300 transform hover:scale-105 z-10
                ${node.status === MasteryStatus.MASTERED ? 'border-leaf-green' : 
                  node.status === MasteryStatus.IN_PROGRESS ? 'border-crane-yellow shadow-xl shadow-crane-yellow/10' : 'border-slate-100 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full
                    ${node.status === MasteryStatus.MASTERED ? 'bg-leaf-green/10 text-leaf-green' : 
                      node.status === MasteryStatus.IN_PROGRESS ? 'bg-crane-yellow/10 text-crane-yellow-dark' : 'bg-slate-50 text-slate-400'}`}
                  >
                    {node.status.replace('_', ' ')}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner ${node.status === MasteryStatus.MASTERED ? 'bg-leaf-green/10' : 'bg-slate-50'}`}>
                    {node.status === MasteryStatus.MASTERED ? '✅' : node.status === MasteryStatus.IN_PROGRESS ? '⚡' : '🔒'}
                  </div>
                </div>
                <h3 className="font-black text-slate-800 text-base md:text-lg tracking-tight mb-1">{node.title}</h3>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">{node.subject} • Unit {node.order}</p>
                
                {node.status === MasteryStatus.IN_PROGRESS && (
                   <div className="mt-5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-crane-yellow h-full w-[45%] rounded-full animate-pulse" />
                   </div>
                )}
              </div>

              {/* Connecting Graphic Arm (Desktop Only) */}
              <div className={`hidden md:block absolute top-1/2 h-1 bg-slate-100 -z-10 rounded-full
                ${isLeft ? 'left-[260px] right-1/2' : 'right-[260px] left-1/2'}`} 
              />
              
              {/* Anchored Dot on central line */}
              <div className={`absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-xl
                ${node.status === MasteryStatus.MASTERED ? 'bg-leaf-green' : 
                  node.status === MasteryStatus.IN_PROGRESS ? 'bg-crane-yellow' : 'bg-slate-200'}`} 
              />
            </div>
          );
        })}
      </div>
      
      {/* End Point Graphic */}
      <div className="flex justify-center mt-20">
         <div className="bg-slate-100 text-slate-400 p-6 rounded-full font-black text-xs uppercase tracking-[0.3em]">Final Terminal</div>
      </div>
    </div>
  );
};

export default MasteryMap;
