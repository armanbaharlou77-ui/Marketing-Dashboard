"use client";
import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { sendCode } from "@/services/authService";
import MoonLoader from "react-spinners/MoonLoader";

export default function Login_Step1() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);

  const iranMobileRegex = /^09\d{9}$/;

  const handlePhoneChange = (event) => {
    let val = event.target.value;

    const persianNumbers = [
      /۰/g,
      /۱/g,
      /۲/g,
      /۳/g,
      /۴/g,
      /۵/g,
      /۶/g,
      /۷/g,
      /۸/g,
      /۹/g,
    ];
    const arabicNumbers = [
      /٠/g,
      /١/g,
      /٢/g,
      /٣/g,
      /٤/g,
      /٥/g,
      /٦/g,
      /٧/g,
      /٨/g,
      /٩/g,
    ];
    for (let i = 0; i < 10; i++) {
      val = val.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
    }

    if (val.startsWith("+98")) val = "0" + val.slice(3);
    if (val.startsWith("0098")) val = "0" + val.slice(4);

    let nextPhone = val.replace(/\D/g, "");

    if (nextPhone.startsWith("9") && nextPhone.length === 1) {
      nextPhone = "09";
    }

    nextPhone = nextPhone.slice(0, 11);

    setPhone(nextPhone);
    setError(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await sendCode(phone, "owner");

      if (+data.msg === 0) {
        // 0 => success
        localStorage.setItem("dashboard-phone", phone);
        localStorage.setItem("dashboard-type", "owner");
        router.push("/login/authentication");
        toast.success(data.msg_text || "کد تایید با موفقیت ارسال شد.");
      } else if (+data.msg === 1) {
        // 1 =>  not registered
        toast.info(
          data.msg_txt ||
          "شما هنوز ثبت‌نام نکرده‌اید. لطفاً ابتدا ثبت‌نام کنید.",
        );
        // router.push("/addNewMarketing");
      } else if (+data.msg === 2) {
        // 2 => pending verification
        toast.warning(
          data.msg_txt ||
          "تعداد تلاش‌های شما برای دریافت کد تایید بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید.",
        );
        // router.push("/login/PendingVerification");
      } else {
        toast.error(
          data.msg_txt || "خطا در ارسال کد تایید. لطفاً دوباره تلاش کنید.",
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!iranMobileRegex.test(phone)) {
      setError(true);
      return;
    }
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-300 via-slate-200 to-indigo-200 flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-md rounded-3xl sm:rounded-4xl border border-white/60 bg-white/80 backdrop-blur-xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            به پنل ادمین خوش آمدید
          </h1>

          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
            برای ورود یا ثبت‌نام، لطفاً شماره همراه خود را وارد کنید.
          </p>
        </div>

        <form
          className="space-y-5 sm:space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-2.5">
            <label
              htmlFor="phone"
              className="block text-sm sm:text-md font-semibold text-slate-700"
            >
              شماره همراه
            </label>

            <div
              className={`group relative flex items-center gap-3 rounded-2xl border bg-slate-50/50 px-4 py-3 sm:py-3.5 transition-all focus-within:ring-indigo-500/10 hover:border-slate-300 ${error
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
                className="w-full bg-transparent h-8 text-left text-base sm:text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal tracking-widest"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-1">
                لطفاً یک شماره همراه معتبر وارد کنید.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`"group mt-9 flex w-full items-center justify-center gap-2 rounded-2xl 
              bg-indigo-600 px-4 py-3.5 sm:py-4 text-sm font-bold text-white transition-all duration-200
               hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] " ${loading ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {loading ? (
              <>
                در حال بارگذاری ... <MoonLoader size={22} color="white" />
              </>
            ) : (
              <>
                ادامه
                <FiArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
