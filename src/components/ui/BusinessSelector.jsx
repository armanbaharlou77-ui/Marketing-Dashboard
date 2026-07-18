"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Building2, PlusCircle } from "lucide-react";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";
import AddBusinessModal from "@/components/modals/AddBusinessModal";

export default function BusinessSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const { activeBusiness, businesses, setActiveBusiness } = useActiveBusiness();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedBusiness = activeBusiness || businesses[0] || null;

  return (
    <div className="relative mb-6 w-full text-right border-b-4 pb-6  border-indigo-300" ref={dropdownRef} dir="rtl">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <div className="flex items-center gap-2.5">
          <Building2 size={18} className="text-indigo-500" />
          <span className="font-bold">
            {selectedBusiness?.name || selectedBusiness?.title || "انتخاب کسب‌وکار"}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full origin-top transform rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all">
          <div className="max-h-60 space-y-1 overflow-y-auto p-1">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => {
                  setActiveBusiness(business);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${selectedBusiness?.id === business.id
                  ? "bg-indigo-50 font-bold text-indigo-700"
                  : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <span>{business.name || business.title || "کسب‌وکار"}</span>
                {selectedBusiness?.id === business.id ? (
                  <Check size={16} className="text-indigo-600" />
                ) : (
                  <div className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-50">
                    <Check size={16} className="text-slate-400" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="my-1.5 h-px w-full bg-slate-100" />

          <button
            onClick={() => {
              setIsOpen(false);
              setIsAddBusinessOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            <PlusCircle size={18} />
            <span>افزودن کسب‌وکار جدید</span>
          </button>
        </div>
      )}

      <AddBusinessModal
        open={isAddBusinessOpen}
        onOpenChange={setIsAddBusinessOpen}
      />
    </div>
  );
}
