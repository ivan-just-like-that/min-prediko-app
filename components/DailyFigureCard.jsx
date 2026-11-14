'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Quote, Calendar } from 'lucide-react';

export default function DailyFigureCard() {
  const [figure, setFigure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyFigure() {
      try {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const monthDay = `${month}-${day}`;

        const { data, error } = await supabase
          .from('daily_figures')
          .select('*')
          .eq('month_day', monthDay)
          .maybeSingle();

        if (!error && data) {
          setFigure(data);
        }
      } catch (err) {
        console.error('Kunde inte hämta dagens gestalt:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyFigure();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-pulse">
        <div className="h-3 w-28 bg-[#f0ece6] rounded mb-3"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#f0ece6] rounded-full shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-[#f0ece6] rounded"></div>
            <div className="h-3 w-24 bg-[#f0ece6] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!figure) return null;

  const formattedDate = new Date().toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#faf8f5] text-[#2d3732] px-2.5 py-1 rounded-full border border-[#e8e4df]">
          <Calendar className="w-3 h-3" />
          Dagens gestalt • {formattedDate}
        </span>
        <span className="text-xs font-mono text-[#8c918d]">{figure.years}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        {figure.image_url && (
          <img
            src={figure.image_url}
            alt={figure.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#e8e4df] shadow-sm shrink-0 bg-[#faf8f5]"
          />
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1d1b] tracking-tight">
            {figure.name}
          </h2>
          <p className="text-xs font-medium text-[#8c918d] mt-0.5">
            {figure.role}
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
        {figure.bio}
      </p>

      {figure.quote && (
        <blockquote className="mt-4 pt-4 border-t border-[#e8e4df] flex items-start gap-3">
          <Quote className="w-4 h-4 text-[#8c918d] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm italic text-[#2d312e] leading-relaxed">
            &quot;{figure.quote}&quot;
          </p>
        </blockquote>
      )}
    </section>
  );
}