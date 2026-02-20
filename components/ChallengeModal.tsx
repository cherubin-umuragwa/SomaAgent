'use client';

import React, { useState, useEffect } from 'react';
import { Resource } from '@/types';

interface Props {
  topic: string;
  resources: Resource[];
  onClose: () => void;
}

const ChallengeModal: React.FC<Props> = ({ topic, resources, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [challengeText, setChallengeText] = useState('');

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const relevantResource = resources.find(r => r.title === topic) || resources[0];
        
        const response = await fetch('/api/ai/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            resourceContent: relevantResource.content,
          }),
        });

        const data = await response.json();
        setChallengeText(data.challenge || "I couldn't generate a challenge right now. Try another topic!");
      } catch (error) {
        console.error('Error fetching challenge:', error);
        setChallengeText("Connection error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [topic, resources]);

  return (
    <div className="fixed inset-0 bg-blue-900/90 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="bg-yellow-400 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-blue-900">Mastery Challenge</h2>
            <p className="text-xs font-bold text-blue-900/60 uppercase">Topic: {topic}</p>
          </div>
          <button onClick={onClose} className="text-blue-900 text-xl font-bold">×</button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center py-12">
               <div className="w-12 h-12 border-4 border-blue-900 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
               <p className="text-slate-500 font-bold">Soma-Agent is reading your teacher&apos;s notes...</p>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="prose prose-slate whitespace-pre-wrap font-medium text-slate-800 leading-relaxed">
                 {challengeText}
               </div>
               <div className="pt-6 border-t border-slate-100 flex flex-col space-y-3">
                  <button onClick={onClose} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20">
                    Done practicing
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase">This quiz was generated based on your school&apos;s specific materials.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
