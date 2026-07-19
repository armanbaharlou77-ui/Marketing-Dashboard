"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  // const token = Cookies.get("owner-token");
  console.log(pathname);
  console.log(pathname !== "/login/");
  console.log(pathname === "/login/");
  // console.log(!token);

  useEffect(() => {
    const token = Cookies.get("owner-token");
    if (!token && !pathname.includes("login")) {
      //login/authentication/
      // کاربر را بلافاصله به صفحه لاگین هدایت کن
      return router.push("/login");
    }
    // ۳. اگر توکن داشت و می‌خواست دوباره به صفحه لاگین برود، او را به داشبورد یا صفحه اصلی بفرست
    if (token && pathname.includes("login")) {
      return router.push("/");
    }
  }, [pathname, router]);

  // Step1 و Step2 از همان فریم اول نشان داده شوند — نه بعد از useEffect
  return children;
}
