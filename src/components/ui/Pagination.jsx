"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page = 1,
  perPage = 20,
  count = 0,
  isLastPage = false,
  onPageChange,
  disabled = false,
}) {
  const totalCount = Number(count) || 0;
  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage) || 1);
  const isFirst = currentPage <= 1;
  const isLast =
    Number(isLastPage) === 1 ||
    currentPage >= totalPages ||
    totalCount === 0;

  if (totalCount === 0) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:rounded-2xl sm:px-5">
      <p className="text-sm font-medium text-slate-500">
        نمایش {from} تا {to} از {totalCount} مورد
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || isFirst}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
          قبلی
        </button>

        <span className="min-w-24 rounded-xl bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-700">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={disabled || isLast}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          بعدی
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
