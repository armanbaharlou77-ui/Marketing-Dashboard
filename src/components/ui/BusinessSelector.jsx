"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Building2, PlusCircle, Check } from "lucide-react";

// دیتای تستی کسب‌وکارها
const businesses = [
    { id: 1, name: "فروشگاه آنلاین موبایل" },
    { id: 2, name: "خدمات دیجیتال مارکتینگ" },
    { id: 3, name: "کافه رستوران بهار" },
];

export default function BusinessSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(businesses[0]);
    const dropdownRef = useRef(null);

    // بستن منو هنگام کلیک خارج از آن
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full mb-8 text-right" ref={dropdownRef} dir="rtl">
            {/* دکمه اصلی Select */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
                <div className="flex items-center gap-2.5">
                    <Building2 size={18} className="text-indigo-500" />
                    <span className="font-bold">{selected.name}</span>
                </div>
                <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* منوی کشویی */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full origin-top transform rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all">

                    {/* لیست کسب‌وکارها */}
                    <div className="max-h-60 overflow-y-auto space-y-1 p-1">
                        {businesses.map((business) => (
                            <button
                                key={business.id}
                                onClick={() => {
                                    setSelected(business);
                                    setIsOpen(false);
                                }}
                                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${selected.id === business.id
                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                                    }`}
                            >
                                <span>{business.name}</span>
                                {selected.id === business.id ? (
                                    <Check size={16} className="text-indigo-600" />
                                ) : (
                                    // یک فضای خالی برای حفظ تراز متن در صورت انتخاب نشدن
                                    <div className="w-4 h-4 opacity-0 transition-opacity group-hover:opacity-50">
                                        <Check size={16} className="text-slate-400" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* خط جداکننده */}
                    <div className="my-1.5 h-px w-full bg-slate-100" />

                    {/* دکمه افزودن کسب‌وکار */}
                    <button
                        onClick={() => {
                            // منطق باز کردن مودال ساخت کسب‌وکار جدید در اینجا قرار می‌گیرد
                            setIsOpen(false);
                            console.log("Add new business clicked");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                        <PlusCircle size={18} />
                        <span>افزودن کسب‌وکار جدید</span>
                    </button>
                </div>
            )}
        </div>
    );
}