"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("dashboard-user") || "null");
  } catch {
    return null;
  }
};

const hasCompletedProfile = () => {
  const user = readUser();
  return Boolean(user?.first_name || user?.last_name);
};

const hasBusiness = () => {
  const user = readUser();

  if (Array.isArray(user?.businesses) && user.businesses.length > 0) {
    return true;
  }

  if (Array.isArray(user?.business) && user.business.length > 0) {
    return true;
  }

  if (
    user?.business &&
    typeof user.business === "object" &&
    !Array.isArray(user.business) &&
    user.business.id != null
  ) {
    return true;
  }

  try {
    const activeBusiness = JSON.parse(
      localStorage.getItem("dashboard-activeBusiness") || "null",
    );
    return Boolean(activeBusiness?.id);
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
    const isOnboardingRoute = pathname.includes("addNewMarketing");

    if (!token) {
      if (!isLoginRoute) {
        router.replace("/login");
      }
      return;
    }

    const profileDone = hasCompletedProfile();
    const businessExists = hasBusiness();

    // OTP done but name not set: allow authentication only
    if (!profileDone) {
      if (pathname.includes("authentication")) {
        return;
      }

      if (isLoginRoute) {
        clearAuthSession();
        return;
      }

      clearAuthSession();
      router.replace("/login");
      return;
    }

    // Has token + name, but no business: never enter dashboard
    if (!businessExists) {
      if (isOnboardingRoute) {
        return;
      }

      // Browser back from Step3 to login → clear session and go to Step1
      if (isLoginRoute) {
        clearAuthSession();
        if (!pathname.endsWith("/login") && pathname !== "/login/") {
          router.replace("/login");
        }
        return;
      }

      router.replace("/addNewMarketing");
      return;
    }

    // Fully registered: keep away from login/onboarding
    if (isLoginRoute || isOnboardingRoute) {
      router.replace("/");
    }
  }, [pathname, router]);

  return children;
}
