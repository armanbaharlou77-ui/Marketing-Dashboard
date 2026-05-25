"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GrShop } from "react-icons/gr";
import { useRouter } from "next/navigation";
import BusinessSelector from "@/components/ui/BusinessSelector";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const menuItems = [
  { title: "داشبورد", icon: LayoutDashboard, href: "/dashboard" },
  { title: "ویرایش کسب و کار", icon: Package, href: "/dashboard/marketing" },
  { title: "محصولات", icon: GrShop, href: "/dashboard/products" },
  { title: "تنظیمات", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
      <div className="sticky top-0 z-30 flex gap-4 items-center  border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          aria-label={isMobileMenuOpen ? "بستن منو" : "باز کردن منو"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-sidebar"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-[0.98]"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-black text-slate-900">
            پنل مدیریت
          </h1>
        </div>
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
        <div className="flex  justify-between border-b border-slate-200 px-4 py-4 md:hidden">
          <div className="mb-4 rounded-[1.75rem] bg-slate-400 p-4 text-white shadow-lg shadow-indigo-500/20 md:mb-8 md:px-4 md:py-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className=" text-lg font-black md:text-xl">پنل مدیریت</h2>
              </div>

              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-white/60 md:text-sm">
                آرمان بهارلو
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
                  آرمان بهارلو
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
                onClick={() => router.push("/login")}
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
