"use client";

import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const { activeBusiness } = useActiveBusiness();
  console.log(activeBusiness);

  const statusConfig = {
    0: {
      text: "در انتظار تایید اولیه ",
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

  const status = statusConfig[activeBusiness?.status] || {
    text: "نامشخص",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    card: "border-gray-300 bg-gray-50",
  };

  return (
    <div
      className={`rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 border p-4 sm:p-6 shadow-lg ${status.card}`}
    >
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-zinc-900 leading-tight">
          {activeBusiness?.name || "کسب و کار انتخاب نشده"}
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
}
