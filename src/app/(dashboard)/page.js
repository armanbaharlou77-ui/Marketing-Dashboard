"use client";

import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";

export default function DashboardPage() {
  const { businesses } = useActiveBusiness();

  const statusConfig = {
    0: {
      text: "در انتظار تایید اولیه",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      card: "border-amber-300 bg-amber-50",
    },
    1: {
      text: "تایید شده",
      badge: "bg-green-100 text-green-700 border-green-200",
      card: "border-green-300 bg-green-50",
    },
    2: {
      text: "رد شده",
      badge: "bg-red-100 text-red-700 border-red-200",
      card: "border-red-300 bg-red-50",
    },
  };

  const getStatus = (statusCode) => {
    return (
      statusConfig[statusCode] || {
        text: "نامشخص",
        badge: "bg-gray-100 text-gray-700 border-gray-200",
        card: "border-gray-300 bg-gray-50",
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl flex justify-between border border-gray-300 bg-slate-100 p-4 md:p-6 shadow-lg">
        <h1 className="w-fit border-b-2 border-blue-400 md:text-xl text-lg  font-bold">
          وضعیت کسب و کارهای شما
        </h1>
      </div>
      {businesses?.map((business) => {
        const status = getStatus(business?.status);

        return (
          <div
            className={`rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 border p-4 sm:p-6 shadow-lg transition-all ${status.card}`}
            key={business?.id || business?.name}
          >
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 leading-tight">
                {business?.name || "کسب و کار انتخاب نشده"}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-500 mt-1 sm:mt-2">
                وضعیت فعلی کسب و کار شما
              </p>
            </div>

            <span
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border font-bold text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto ${status.badge}`}
            >
              {status.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
