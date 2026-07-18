"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GrShop } from "react-icons/gr";
import { useRouter } from "next/navigation";
import BusinessSelector from "@/components/ui/BusinessSelector";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  Bell,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBusiness } from "@/services/authService";

const menuItems = [
  { title: "داشبورد", icon: LayoutDashboard, href: "/dashboard" },
  { title: "ویرایش کسب و کار", icon: Package, href: "/dashboard/marketing" },
  { title: "محصولات", icon: GrShop, href: "/dashboard/products" },
  { title: "تنظیمات", icon: Settings, href: "/dashboard/settings" },
];

// const pickValue = (source, keys) => {
//   for (const key of keys) {
//     const value = source?.[key];
//     if (value !== undefined && value !== null && value !== "") {
//       return value;
//     }
//   }

//   return "";
// };

export default function Sidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { activeBusiness, businesses, setActiveBusiness } = useActiveBusiness();

  const [userInfo, setUserInfo] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("dashboard-user");

    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  const getBusinessInfo = async () => {
    try {
      const data = await getBusiness(userInfo?.owner_id);
      if (data.msg === 0) {
        const firstBusiness = data.businesses[0];
        localStorage.setItem(
          "dashboard-activeBusiness",
          JSON.stringify(firstBusiness),
        );
        setActiveBusiness(firstBusiness);
        setBusinessInfo(data);
      }
    } catch (error) {
      console.error("Error fetching business info:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("dashboard-user");
    if (!storedUser) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const storedUser = localStorage.getItem("dashboard-user");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }

    getBusinessInfo();
  }, []);

  const logOut = () => {
    Cookies.remove("owner-token", { path: "/" });
    localStorage.clear();
    router.push("/login");
  };
  // console.log(userInfo);
  // console.log(businessInfo?.owner_first_name);
  // console.log(businessInfo?.businesses[0]);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.02)] md:hidden">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-sidebar"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 hover:ring-indigo-200 active:scale-90"
          >
            {isMobileMenuOpen ? (
              <X
                size={22}
                className="transition-transform duration-300 group-active:rotate-90"
              />
            ) : (
              <Menu
                size={22}
                className="transition-transform duration-300 group-active:scale-90"
              />
            )}
          </button>
          <div className="flex flex-col justify-center">
            <h1 className="truncate text-lg font-black tracking-tight text-slate-800">
              پنل مدیریت
            </h1>
            <span className="text-[11px] font-bold text-indigo-500/80">
              {businessInfo?.owner_first_name} {businessInfo?.owner_last_name}
            </span>
          </div>
        </div>

        {/* <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button> */}
      </div>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        id="mobile-sidebar"
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(84vw,22rem)] flex-col border-l border-slate-200 bg-linear-to-b from-white via-slate-50 to-slate-100 text-right shadow-[-20px_0_60px_rgba(15,23,42,0.16)] transition-transform duration-300 ease-out md:sticky md:top-0 md:h-screen md:w-80 md:translate-x-0 md:border-l md:bg-slate-100 md:shadow-[0_24px_60px_rgba(15,23,42,0.10)] ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:hidden">
          <div className="mb-4 rounded-[1.75rem] bg-slate-400 p-4 text-white shadow-lg shadow-indigo-500/20 md:mb-8 md:px-4 md:py-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className=" text-lg font-black md:text-xl">پنل مدیریت</h2>
              </div>

              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-white/60 md:text-sm">
                {businessInfo?.businesses[0].owner_first_name}{" "}
                {businessInfo?.businesses[0].owner_last_name}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="بستن منو"
            onClick={closeMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 pb-4 pt-3 md:px-5 md:py-6">
          <div>
            <div className="mb-4 md:block hidden rounded-[1.75rem] bg-slate-400 p-4 text-white shadow-lg shadow-indigo-500/20 md:mb-8 md:px-4 md:py-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className=" text-lg font-black md:text-xl">پنل مدیریت</h2>
                </div>

                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-white/60 md:text-sm">
                  {businessInfo?.businesses[0].owner_first_name}{" "}
                  {businessInfo?.businesses[0].owner_last_name}
                </span>
              </div>
            </div>

            <BusinessSelector />
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`group flex items-center justify-between rounded-[1.25rem] border px-3.5 py-3 transition-all duration-200 md:px-4 md:py-3.5 ${
                      isActive
                        ? "border-indigo-300 bg-linear-to-r from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-500/20"
                        : "border-slate-200 bg-white/90 text-slate-800 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <span className="text-sm font-bold md:text-base">
                      {item.title}
                    </span>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 group-hover:bg-slate-50 group-hover:text-indigo-700"
                      }`}
                    >
                      <Icon
                        size={18}
                        className="transition group-hover:scale-110"
                      />
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white/95 p-1 shadow-sm hover:bg-red-50 hover:border-red-50 transition">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[1.15rem] px-3 py-2 text-red-600 "
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <span className="font-bold">خروج</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-200 ">
                <LogOut size={19} />
              </span>
            </button>
          </div>
        </div>
      </aside>

      {isLogoutModalOpen && (
        <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
          <DialogContent className="rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="mr-6 text-lg font-bold">
                خروج از حساب کاربری
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm leading-7 text-zinc-600">
              آیا از خروج از پنل مدیریت مطمئن هستید؟
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-xl bg-zinc-100 px-4 py-2 transition hover:bg-zinc-200"
              >
                لغو
              </button>

              <button
                type="button"
                className="rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                onClick={logOut}
              >
                خروج
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
