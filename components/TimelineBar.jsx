// components/TimelineBar.jsx
"use client";

import React, { useState } from "react";
import { BookOpen, Calendar } from "lucide-react";
import { ERAS, TIMELINE_EVENTS } from "@/lib/timelineEvents";

export default function TimelineBar({ onSelectEvent, onOpenScripture, selectedEventId }) {
  const [activeEra, setActiveEra] = useState("alla");

  // Filtrera händelser baserat på vald epok
  const filteredEvents =
    activeEra === "alla"
      ? TIMELINE_EVENTS
      : TIMELINE_EVENTS.filter((event) => event.era === activeEra);

  return (
    <div className="w-full bg-white p-4 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      
      {/* 1. Epok-väljare (Flikar med den mörka/skogsgröna #2d3732-stilen) */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-[#e8e4df] scrollbar-thin scrollbar-thumb-[#e8e4df]">
        <button
          onClick={() => setActiveEra("alla")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
            activeEra === "alla"
              ? "bg-[#2d3732] text-white border-[#2d3732] shadow-sm"
              : "bg-[#faf8f5] text-[#575c58] border-[#e8e4df] hover:border-[#2d3732]/30 hover:bg-white"
          }`}
        >
          Alla epoker
        </button>
        {ERAS.map((era) => (
          <button
            key={era.id}
            onClick={() => setActiveEra(era.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
              activeEra === era.id
                ? "bg-[#2d3732] text-white border-[#2d3732] shadow-sm"
                : "bg-[#faf8f5] text-[#575c58] border-[#e8e4df] hover:border-[#2d3732]/30 hover:bg-white"
            }`}
          >
            {era.name}
          </button>
        ))}
      </div>

      {/* 2. Händelser i tidslinjen (Kort i ljus färgpalett) */}
      <div className="flex gap-3 overflow-x-auto pt-3 pb-1 scrollbar-thin scrollbar-thumb-[#e8e4df]">
        {filteredEvents.map((event) => {
          const isSelected = selectedEventId === event.id;
          return (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className={`flex-shrink-0 flex flex-col justify-between p-3 rounded-xl border text-left cursor-pointer transition-all w-56 sm:w-64 ${
                isSelected
                  ? "bg-[#faf8f5] border-[#2d3732] ring-1 ring-[#2d3732] shadow-sm"
                  : "bg-[#faf8f5]/60 border-[#e8e4df] hover:bg-[#faf8f5] hover:border-[#2d3732]/40"
              }`}
            >
              <div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#2d3732] mb-1">
                  <Calendar className="w-3 h-3 text-[#737874]" />
                  <span>{event.year}</span>
                </div>
                <h4 className="text-xs font-semibold text-[#1a1d1b] line-clamp-2 leading-snug">
                  {event.title}
                </h4>
              </div>

              {/* Bibelreferens-knapp */}
              {event.scripture && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Förhindrar att kartan panerar när man enbart klickar på bibel-länken
                    onOpenScripture(event.scripture);
                  }}
                  className="mt-3 text-[11px] text-[#2d3732] font-medium hover:underline flex items-center gap-1 self-start bg-white border border-[#e8e4df] px-2 py-1 rounded-md shadow-2xs hover:border-[#2d3732]/30 transition-all"
                >
                  <BookOpen className="w-3 h-3 text-[#2d3732]" />
                  <span>{event.scripture.reference}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}