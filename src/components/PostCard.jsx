import React from 'react'
import { IoMdMore } from "react-icons/io";

export default function PostCard({ product, handleEditClick }) {
    return (

        <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1  hover:shadow-[0_20px_40px_rgba(79,70,229,0.12)]"
        >

            <div className="relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />


                {product.discount && +product.discount > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-md">
                        <span>{+product.discount}٪</span>
                        <span className="text-xs font-medium">تخفیف</span>
                    </div>
                )}
                <div className="bg-red-700" onClick={() => handleEditClick(product)}>
                    <IoMdMore size={28} className="absolute bg-white/90 text-gray-600 rounded-full top-2 left-3 cursor-pointer hover:bg-white transition-all" />

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
