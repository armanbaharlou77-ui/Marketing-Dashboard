"use client";
import React, { useRef } from "react";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { BsArrowRight } from "react-icons/bs";
import { toast } from "react-toastify";

export default function Login_Step2() {
  const router = useRouter();

  // آرایه‌ای برای نگهداری رفرنسِ اینپوت‌ها
  const inputRefs = useRef([]);

  const handleClick = () => {
    router.push("/login/addNewMarketing");
  };

  // هندل کردن تغییرات و رفتن به اینپوت بعدی
  const handleChange = (e, index) => {
    const value = e.target.value;

    // فقط اجازه ورود اعداد را می‌دهیم
    if (!/^[0-9]*$/.test(value)) {
      e.target.value = value.replace(/[^0-9]/g, "");
      return;
    }

    // اگر مقداری وارد شد و اینپوت آخر نبودیم، برو به اینپوت بعدی
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  // هندل کردن دکمه Backspace برای برگشتن به اینپوت قبلی
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-br from-indigo-300 via-slate-200 to-indigo-200 flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md rounded-4xl border border-white/60 bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <div className="hover:bg-slate-200 p-2 rounded-lg transition-colors">
            <BsArrowRight size={24} className="inline-block text-gray-700 font-extrabold" />
          </div>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            تایید شماره
          </h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            کد ارسال‌شده به <span style={{ direction: 'ltr' }} className="inline-block font-bold text-slate-800">+98 912 345 6789</span> را وارد کنید.
          </p>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            onClick={() => router.back()}
          >
            <FiEdit2 className="text-sm" />
            ویرایش شماره
          </button>
        </div>

        <form className="mt-8 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              کد تایید
            </label>
            <div style={{ direction: 'ltr' }} className="grid grid-cols-4 gap-2 sm:gap-3 w-5/6 mx-auto">
              {/* آرایه را از 0 تا 5 تغییر دادیم تا با ایندکس‌ها راحت‌تر کار کنیم */}
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  autoFocus={index === 0} // فقط اولین اینپوت سمت چپ در حالت لود فوکوس می‌شود
                  maxLength={1}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="h-12 sm:h-14  rounded-xl border border-slate-200 bg-slate-50/50 text-center text-lg font-bold text-slate-900 transition-all outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">
              ارسال مجدد تا <span dir="ltr" className="inline-block w-10 text-center">01:24</span>
            </span>
            <button
              type="button"
              className="font-bold text-slate-400 cursor-not-allowed transition-colors hover:text-slate-500"
            >
              ارسال مجدد
            </button>
          </div>

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
            onClick={() => toast.success('با موفقیت وارد شدید')}
          >
            تایید و ادامه
            <FiArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          اگر پیامک را دریافت نکردید، کمی بعد دوباره تلاش کنید.
        </p>
      </div>
    </div>
  );
}
