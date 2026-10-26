// components/ScriptureModal.jsx
"use client";

import React from "react";
import { BookOpen, ExternalLink, X } from "lucide-react";

export default function ScriptureModal({ scripture, onClose }) {
  if (!scripture) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#e8e4df]">
        
        {/* Stäng-knapp */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#737874] hover:text-[#1a1d1b] p-1 rounded-lg hover:bg-[#faf8f5] transition-colors"
          aria-label="Stäng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Rubrik / Bibelreferens */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732]">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1d1b]">
            {scripture.reference}
          </h3>
        </div>

        {/* Citat / Textutdrag */}
        <blockquote className="italic border-l-4 border-[#2d3732] pl-4 py-3 text-xs sm:text-sm text-[#575c58] my-4 bg-[#faf8f5] rounded-r-xl leading-relaxed">
          "{scripture.quote}"
        </blockquote>

        {/* Fotnot / Upphovsrättsinfo & Länk till heltext */}
        <div className="mt-5 pt-3 border-t border-[#e8e4df] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#737874]">
          <span>Källa: Bibel 2000 (Citat)</span>
          {scripture.externalUrl && (
            <a
              href={scripture.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#2d3732] hover:text-[#1a1d1b] font-semibold underline transition-colors"
            >
              Läs hela kapitlet på Bibel.se
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
}