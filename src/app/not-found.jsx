'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowRight, FileSearch } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4" dir="rtl">
            <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">

                {/* یک افکت نور در پس‌زمینه کارت (اختیاری برای زیبایی بیشتر) */}
                <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>

                {/* آیکون */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 ring-8 ring-indigo-50/50">
                    <FileSearch size={40} strokeWidth={1.5} />
                </div>

                {/* عنوان خطا */}
                <h1 className="mb-2 text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-400">
                    404
                </h1>

                <h2 className="mb-4 text-2xl font-bold text-slate-800">
                    صفحه مورد نظر پیدا نشد!
                </h2>

                <p className="mb-8 text-sm leading-7 text-slate-500">
                    متاسفیم، اما آدرسی که به دنبال آن هستید وجود ندارد، حذف شده یا نام آن تغییر کرده است. لطفاً آدرس را بررسی کنید یا به مسیرهای زیر بروید.
                </p>

                {/* دکمه‌ها */}
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">


                    <Link
                        href="/"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 sm:w-auto"
                    >
                        <Home size={18} />
                        <span>پیشخوان مدیریت</span>
                    </Link>
                </div>
            </div>

            {/* کپی‌رایت یا متن پایین صفحه */}
            <div className="mt-8 text-sm text-slate-400">
                &copy; {new Date().getFullYear()} پنل مدیریت. تمامی حقوق محفوظ است.
            </div>
        </div>
    );
}