'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menylankar = [
  { name: 'Start', href: '/test-layout', icon: '🏠' },
  { name: 'Predikoidéer', href: '/predikoideer', icon: '💡' },
  { name: 'Historiska kommentarer', href: '/historik', icon: '📜' },
  { name: 'Rena grekiskan', href: '/grekiska', icon: '🇬🇷' },
  { name: 'Barn & unga', href: '/barn-och-unga', icon: '🎈' },
  { name: 'Kasualtal', href: '/kasualtal', icon: '🕊️' },
  { name: 'Bibelstudieguiden', href: '/bibelstudium', icon: '📖' },
  { name: 'Predikantpepp', href: '/predikantpepp', icon: '🌱' },
  { name: 'Populärt', href: '/populart', icon: '🔥' },
  { name: 'Pris', href: '/pris', icon: '💳' },
];

export default function Sidebar({ user, credits, isTester, authLoading, onSignOut, onOpenAuth, collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* MOBIL TOPPMENY (syns endast på mobila skärmar) */}
      <div className="md:hidden bg-white border-b border-[#e8e4df] p-4 flex justify-between items-center sticky top-0 z-30">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#575c58] hover:text-[#1a1d1b] rounded-lg border border-[#e8e4df]"
          aria-label="Öppna meny"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1a1d1b]">Predikoassistenten</span>
          <span className="bg-[#f4f0eb] text-[#2d3732] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#e8e4df]">
            beta
          </span>
        </div>
        <div className="w-8"></div>
      </div>

      {/* MÖRK OVERLAY PÅ MOBIL */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDOMENY (Desktop & Mobil overlay) */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#e8e4df] flex flex-col justify-between transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        {/* TOPP: Logotyp & Fäll ihop-knapp */}
        <div>
          <div className="p-4 border-b border-[#e8e4df] flex justify-between items-center h-16">
            {!collapsed && (
              <Link href="/test-layout" className="flex items-center gap-2 truncate">
                <span className="font-bold text-lg text-[#1a1d1b]">Predikoassistenten</span>
                <span className="bg-[#f4f0eb] text-[#2d3732] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#e8e4df]">
                  beta
                </span>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block p-1.5 text-[#575c58] hover:bg-[#faf8f5] rounded-lg transition-colors ml-auto"
              title={collapsed ? 'Fäll ut meny' : 'Fäll ihop meny'}
            >
              {collapsed ? '➔' : '⬅'}
            </button>
          </div>

          {/* MENYLÄNKAR */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {menylankar.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-[#2d3732] text-white' 
                      : 'text-[#575c58] hover:bg-[#faf8f5] hover:text-[#1a1d1b]'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.name : ''}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTEN: Inloggning, Konto & Krediter */}
        <div className="p-3 border-t border-[#e8e4df] bg-[#faf8f5]">
          {!authLoading && user ? (
            <div className="space-y-2">
              {!collapsed && (
                <div className="text-xs text-[#575c58]">
                  <div className="truncate font-semibold text-[#1a1d1b]">{user.email}</div>
                  <div className="mt-1 font-medium text-[#2d3732]">
                    {isTester ? '✨ Testkonto (Obegränsat)' : `⚡ ${credits ?? 0} sökningar kvar`}
                  </div>
                </div>
              )}
              <button
                onClick={onSignOut}
                className="w-full py-2 px-3 text-xs font-semibold text-[#1a1d1b] bg-[#e8e4df] hover:bg-[#d8d4cf] rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                🚪 {!collapsed && 'Logga ut'}
              </button>
            </div>
          ) : !authLoading && (
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-[#2d3732] hover:bg-[#1f2723] rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              🔑 {!collapsed && 'Logga in'}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}