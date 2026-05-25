"use client";
import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Login_Step1() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);

  // بررسی شروع با صفر و دقیقاً ۱۱ رقم
  const iranMobileRegex = /^09\d{9}$/;

  const handleClick = () => {
    router.push("/login/authentication");
  };

  const handlePhoneChange = (event) => {
    let val = event.target.value;

    // ۱. تبدیل اعداد فارسی و عربی به انگلیسی
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    for (let i = 0; i < 10; i++) {
      val = val.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
    }

    // ۲. مدیریت شماره‌هایی که با +98 یا 0098 کپی/پیست می‌شوند
    if (val.startsWith("+98")) val = "0" + val.slice(3);
    if (val.startsWith("0098")) val = "0" + val.slice(4);

    // ۳. حذف هر کاراکتری غیر از عدد
    let nextPhone = val.replace(/\D/g, "");

    // ۴. افزودن هوشمند صفر در صورتی که کاربر با 9 شروع کرده باشد
    if (nextPhone.startsWith("9") && nextPhone.length === 1) {
      nextPhone = "09";
    }

    // ۵. محدود کردن به ۱۱ رقم
    nextPhone = nextPhone.slice(0, 11);

    setPhone(nextPhone);
    setError(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // بررسی دقیق‌تر که حتما با 09 شروع شود و ۱۱ رقم باشد
    if (!iranMobileRegex.test(phone)) {
      setError(true);
      toast.error("شماره همراه نامعتبر است");
      return;
    }

    toast.success("کد تایید با موفقیت ارسال شد");
    handleClick();
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-br from-indigo-300 via-slate-200 to-indigo-200 flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md rounded-4xl border border-white/60 bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            ورود
          </h1>
          <p className="mt-3 text-md text-slate-500 leading-relaxed">
            برای ورود یا ثبت‌نام، لطفاً شماره همراه خود را وارد کنید.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <label
              htmlFor="phone"
              className="block text-md font-semibold text-slate-700"
            >
              شماره همراه
            </label>

            <div
              className={`group relative flex items-center gap-3 rounded-2xl border bg-slate-50/50 px-4 py-3.5 transition-all focus-within:ring-indigo-500/10 hover:border-slate-300 ${error
                ? "border-red-500 bg-red-50/50 focus-within:border-red-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-500/10 animate-shake"
                : "border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4"
                }`}
            >
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                style={{ direction: "ltr" }}
                autoFocus
                maxLength={11}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="09123456789"
                className="w-full bg-transparent h-8 text-left text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal tracking-wide"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer w-max">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 transition-colors focus:ring-indigo-500"
            />
            <span className="select-none">مرا به خاطر بسپار</span>
          </label>

          <button
            type="submit"
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            ادامه
            <FiArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
}