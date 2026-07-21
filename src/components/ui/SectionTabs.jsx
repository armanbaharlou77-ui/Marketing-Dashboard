"use client";

import React from "react";

export default function SectionTabs({ tabs = [], activeTab, onTabChange }) {
  return (
    <div
      dir="rtl"
      className="sticky top-2 z-20 mb-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur-sm"
    >
      <div className="flex min-w-max items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
