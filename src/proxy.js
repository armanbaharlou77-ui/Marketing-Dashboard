import { NextResponse } from "next/server";

export function proxy(request) {
  // ۱. گرفتن توکن از کوکی‌ها (نکته مهم: به جای localStorage باید از cookie استفاده کنید)
  const token = request.cookies.get("owner-token")?.value;

  const { pathname } = request.nextUrl;

  // ۲. اگر توکن وجود نداشت و کاربر می‌خواست به صفحات محافظت شده برود
  if (!token && pathname !== "/dashboard/login") {
    // کاربر را بلافاصله به صفحه لاگین هدایت کن
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  // ۳. اگر توکن داشت و می‌خواست دوباره به صفحه لاگین برود، او را به داشبورد یا صفحه اصلی بفرست
  if (token && pathname === "/dashboard/login") {
    return NextResponse.redirect(new URL("/dashboard/dashboard", request.url));
  }

  // در غیر این صورت اجازه بده روت عوض بشه و صفحه باز بشه
  return NextResponse.next();
}

// ۴. مشخص کردن روت‌هایی که این میدل‌ویر باید روی آن‌ها اجرا شود
export const config = {
  matcher: [
    /*
     * روت‌هایی که می‌خواهید محافظت شوند را اینجا بنویسید.
     * مثال: داشبورد، پروفایل و صفحات مدیریت
     */
    "/dashboard/dashboard/:path*",
    "/dashboard/profile/:path*",
    "/dashboard/login", // برای بررسی اینکه اگر لاگین بود دکمه لاگین کار نکنه
  ],
};
