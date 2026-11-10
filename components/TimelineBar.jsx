// components/TimelineBar.jsx
"use client";

import React, { useState, useRef } from "react";
import { BookOpen, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { ERAS, TIMELINE_EVENTS } from "@/lib/timelineEvents";

export default function TimelineBar({ onSelectEvent, onOpenScripture, selectedEventId }) {
  const [activeEra, setActiveEra] = useState("alla");

  // Referenser för de två olika scroll-containrarna
  const eraContainerRef = useRef(null);
  const eventContainerRef = useRef(null);

  // Funktion för att scrolla epok-väljaren
  const scrollEras = (direction) => {
    if (eraContainerRef.current) {
      const scrollAmount = 200;
      eraContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Funktion för att scrolla händelse-korten
  const scrollEvents = (direction) => {
    if (eventContainerRef.current) {
      const scrollAmount = 300;
      eventContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Filtrera händelser baserat på vald epok
  const filteredEvents =
    activeEra === "alla"
      ? TIMELINE_EVENTS
      : TIMELINE_EVENTS.filter((event) => event.era === activeEra);

  return (
    <div className="w-full bg-white p-4 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3">
      
      {/* 1. Epok-väljare med pilar på sidorna */}
      <div className="relative flex items-center border-b border-[#e8e4df] pb-3">
        {/* Vänsterpil för epoker */}
        <button
          onClick={() => scrollEras("left")}
          className="absolute -left-3 z-10 bg-white border border-[#e8e4df] text-[#2d3732] p-1.5 rounded-full shadow-md hover:bg-[#faf8f5] transition-all hidden sm:flex items-center justify-center"
          aria-label="Scrolla epoker vänster"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scrollbar container för epoker */}
        <div
          ref={eraContainerRef}
          className="flex gap-1.5 overflow-x-auto w-full scrollbar-thin scrollbar-thumb-[#e8e4df] px-1"
        >
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

        {/* Högerpil för epoker */}
        <button
          onClick={() => scrollEras("right")}
          className="absolute -right-3 z-10 bg-white border border-[#e8e4df] text-[#2d3732] p-1.5 rounded-full shadow-md hover:bg-[#faf8f5] transition-all hidden sm:flex items-center justify-center"
          aria-label="Scrolla epoker höger"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Händelser i tidslinjen med pilar på sidorna */}
      <div className="relative flex items-center pt-1">
        {/* Vänsterpil för händelser */}
        <button
          onClick={() => scrollEvents("left")}
          className="absolute -left-3 z-10 bg-white border border-[#e8e4df] text-[#2d3732] p-1.5 rounded-full shadow-md hover:bg-[#faf8f5] transition-all hidden sm:flex items-center justify-center"
          aria-label="Scrolla händelser vänster"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollbar container för händelser */}
        <div
          ref={eventContainerRef}
          className="flex gap-3 overflow-x-auto pb-1 w-full scrollbar-thin scrollbar-thumb-[#e8e4df] px-1"
        >
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
                      e.stopPropagation();
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

        {/* Högerpil för händelser */}
        <button
          onClick={() => scrollEvents("right")}
          className="absolute -right-3 z-10 bg-white border border-[#e8e4df] text-[#2d3732] p-1.5 rounded-full shadow-md hover:bg-[#faf8f5] transition-all hidden sm:flex items-center justify-center"
          aria-label="Scrolla händelser höger"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}