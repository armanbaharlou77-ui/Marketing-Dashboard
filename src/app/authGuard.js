"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const hasCompletedProfile = () => {
  try {
    const user = JSON.parse(localStorage.getItem("dashboard-user") || "null");
    return Boolean(user?.first_name || user?.last_name);
  } catch {
    return false;
  }
};

const clearAuthSession = () => {
  Cookies.remove("owner-token", { path: "/" });
  localStorage.clear();
};

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("owner-token");
    const isLoginRoute = pathname.includes("login");

    if (!token && !isLoginRoute) {
      router.push("/login");
      return;
    }

    if (token && isLoginRoute) {
      // Incomplete registration (OTP done, name not set): allow auth page,
      // but clear session if user returns to phone entry.
      if (!hasCompletedProfile()) {
        if (pathname.includes("authentication")) {
          return;
        }

        clearAuthSession();
        return;
      }

      router.push("/");
    }
  }, [pathname, router]);

  return children;
}
