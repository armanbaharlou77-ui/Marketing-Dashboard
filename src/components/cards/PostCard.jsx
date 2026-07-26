'use client';

import React, { useEffect, useRef, useState } from 'react'
import { IoMdMore } from "react-icons/io";
import { Pencil, Power } from "lucide-react";

export default function PostCard({ product, handleEditClick, handleToggleStatus, isToggling }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const isActive = Number(product.status) === 1;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEdit = () => {
        setIsMenuOpen(false);
        handleEditClick(product);
    };

    const handleToggle = () => {
        if (isToggling) return;
        setIsMenuOpen(false);
        handleToggleStatus(product);
    };

    return (
        <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(79,70,229,0.12)]"
        >
            <div className="relative overflow-hidden">
                <div className='relative'>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.active === 0 ? (
                        <div className='absolute bg-red-500 text-white bottom-0 w-full text-base p-2 text-center'>
                            حذف شده توسط ادمین
                        </div>
                    ) : null}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {product.discount && +product.discount > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-md">
                        <span>{+product.discount}٪</span>
                        <span className="text-xs font-medium">تخفیف</span>
                    </div>
                )}

                <div className="absolute top-2 left-3 z-10" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="rounded-full bg-white/90 p-1 text-gray-600 cursor-pointer hover:bg-white transition-all"
                        aria-label="منوی محصول"
                        aria-expanded={isMenuOpen}
                    >
                        <IoMdMore size={28} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute left-0 top-full mt-1 min-w-[140px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Pencil size={15} />
                                ویرایش
                            </button>
                            <button
                                type="button"
                                onClick={handleToggle}
                                disabled={isToggling}
                                className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors disabled:opacity-60 ${isActive
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                    }`}
                            >
                                <Power size={15} />
                                {isActive ? "غیرفعال کردن" : "فعال کردن"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="text-lg mb-2 font-bold leading-tight text-gray-800 transition-colors duration-300 group-hover:text-indigo-700">
                        {product.name}
                    </h2>
                </div>

                <p className="line-clamp-2 mb-2 text-sm leading-6 text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
                    {product.description}
                </p>
                {
                    product.active === 1 && (
                        <span>
                            {
                                product.status === 1 ? <div className='bg-green-500 py-1 px-3 mb-2 rounded-lg text-white w-fit'>فعال</div> : <div className='bg-orange-400 py-1 px-3 mb-2 rounded-lg text-white w-fit'>غیر فعال</div>
                            }
                        </span>
                    )
                }


                <div className="mt-auto pt-4 border-t border-gray-100 transition-colors duration-300 group-hover:border-indigo-100">
                    <div className="flex flex-col items-end">
                        {product.discount && +product.discount > 0 && (
                            <span className="text-md font-medium text-gray-400 line-through decoration-red-400/60 decoration-2">
                                {(+product?.price).toLocaleString()}
                            </span>
                        )}

                        <div className="flex items-baseline gap-1 text-indigo-700 transition-transform duration-300 group-hover:scale-105">
                            <span className="text-xl font-black">
                                {product?.total_price ? (+product.total_price).toLocaleString() : (+product?.price).toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-indigo-500/80">
                                تومان
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
