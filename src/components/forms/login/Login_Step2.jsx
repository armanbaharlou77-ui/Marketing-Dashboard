"use client";
import React, { useRef, useState, useEffect } from "react";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { BsArrowRight } from "react-icons/bs";
import { toast } from "react-toastify";
import { setInfo, start } from "@/services/authService";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";

import Cookies from 'js-cookie';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



export default function Login_Step2() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNameFormOpen, setIsNameFormOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameFormError, setNameFormError] = useState("");

  const { activeBusiness, businesses, setActiveBusiness } = useActiveBusiness();

  const inputRefs = useRef([]);


  useEffect(() => {
    const phone = localStorage.getItem("dashboard-phone");
    if (phone) {
      setUserPhone(phone);
    } else {

      toast.error("شماره موبایل یافت نشد. لطفاً مجدداً وارد شوید.");
      router.push("/login");
    }
  }, [router]);

  const handleClick = async () => {
    const code = inputRefs.current.map(ref => ref.value).join('');
    const phone = localStorage.getItem("dashboard-phone");
    const type = localStorage.getItem("dashboard-type");

    if (!phone || code.length < 4) {
      toast.warning("لطفا کد تایید را به صورت کامل وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const data = await start(phone, code, type);
      console.log(data);


      if (+data.msg === 0) {
        // Store token and user info
        Cookies.set("owner-token", data?.token);
        localStorage.setItem("dashboard-user", JSON.stringify(data?.value));

        if (!data?.value?.first_name && !data?.value?.last_name) {
          setIsNameFormOpen(true);
          return;
        }

        // Set activeBusiness from first business in user's businesses
        if (data?.value?.businesses && data.value.businesses.length > 0) {
          const firstBusiness = data.value.businesses[0];
          localStorage.setItem("dashboard-activeBusiness", JSON.stringify(firstBusiness));
          setActiveBusiness(firstBusiness);
          router.push("/");
          toast.success(data.msg_txt || "با موفقیت وارد شدید");
        } else {
          // If user has no businesses, go to registration page
          setIsLogoutModalOpen(true);
        }


      } else if (+data.msg === 1) {
        clearCodeInputs();
        toast.error(data.msg_txt || "کد تایید اشتباه است");
      } else if (+data.msg === 2) {
        toast.warning(data.msg_txt || "تعداد تلاش‌های شما بیش از حد مجاز است.");
      } else {
        toast.error(data.msg_txt || "خطا در ارسال کد تایید.");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const userRegisterHandler = async () => {
    const token = Cookies.get("owner-token");
    const data = await setInfo(
      firstName,
      lastName,
      token
    )
    if (data.msg === 0) {
      setIsNameFormOpen(false);
      setIsLogoutModalOpen(false);
      router.push("/addNewMarketing")
      toast.success(data.msg_txt || "اطلاعات با موفقیت ثبت شد")
    } else if (data.msg === -1) {
      toast.error(data.msg_txt || "خطا در ثبت اطلاعات")
    } else {
      toast.error(data.msg_txt || "خطا در ثبت اطلاعات")
    }
  }

  const clearCodeInputs = () => {
    inputRefs.current.forEach((ref) => {
      if (ref) ref.value = "";
    });
    inputRefs.current[0]?.focus();
  };

  const handleNameFormSubmit = (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setNameFormError("نام و نام خانوادگی الزامی است.");
      toast.warning("لطفا نام و نام خانوادگی را کامل وارد کنید.");
      return;
    }

    setNameFormError("");
    userRegisterHandler();
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]*$/.test(value)) {
      e.target.value = value.replace(/[^0-9]/g, "");
      return;
    }
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    const code = inputRefs.current
      .map((ref) => ref?.value || "")
      .join("");

    if (code.length === 4) {
      handleClick();
    }

  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-br from-indigo-300 via-slate-200 to-indigo-200 flex items-center justify-center px-4 py-8 sm:py-10"
    >
      <div className="w-full max-w-md rounded-3xl sm:rounded-4xl border border-white/60 bg-white/80 backdrop-blur-xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

        <div className="mb-4 sm:mb-6 flex justify-start">
          <button
            type="button"
            onClick={() => router.back()}
            className="group -ml-2 p-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <div className="bg-slate-100 group-hover:bg-slate-200 p-2 rounded-xl sm:rounded-2xl transition-colors">
              <BsArrowRight size={20} className="sm:w-6 sm:h-6 text-gray-700 font-extrabold" />
            </div>
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            تایید شماره
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
            کد ارسال‌شده به <span style={{ direction: 'ltr' }} className="inline-block font-bold text-slate-800 tracking-wide">
              {userPhone || "..."}
            </span> را وارد کنید.
          </p>

          <button
            type="button"
            className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            onClick={() => router.back()}
          >
            <FiEdit2 className="text-xs sm:text-sm" />
            ویرایش شماره
          </button>
        </div>

        <form className="mt-6 sm:mt-8 space-y-6 sm:space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}>

          <div className="space-y-3">
            <label className="block text-sm sm:text-md font-semibold text-slate-700">
              کد تایید
            </label>

            <div style={{ direction: 'ltr' }} className="grid grid-cols-4 gap-2 sm:gap-3 w-full sm:w-5/6 mx-auto user-select-none">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={{ direction: "ltr" }}
                  type="text"
                  inputMode="numeric"
                  autoFocus={index === 0}
                  maxLength={1}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={loading}
                  className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 text-center text-xl sm:text-2xl font-bold text-slate-900 transition-all outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300"
                />
              ))}
            </div>
          </div>



          <button
            type="submit"
            disabled={loading}
            className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 sm:py-4 text-sm font-bold text-white transition-all duration-200 
              ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]'}`}
          >
            {loading ? "در حال بررسی..." : "تایید و ادامه"}
            {!loading && <FiArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" />}
          </button>
        </form>

        <p className="mt-6 sm:mt-8 text-center text-xs font-medium text-slate-400">
          اگر پیامک را دریافت نکردید، کمی بعد دوباره تلاش کنید.
        </p>
      </div>
      {
        isLogoutModalOpen && (
          <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
            <DialogContent className="rounded-3xl flex flex-col sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="mr-6 text-lg font-bold">
                  در حال حاضر کسب و کاری برای شما ثبت نشده است
                </DialogTitle>
              </DialogHeader>


              <div className=" flex items-center justify-between gap-3">
                {/* <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="rounded-xl bg-zinc-100 px-4 py-2 transition hover:bg-zinc-200"
                  >
                    لغو
                  </button> */}
                <p className="text-md leading-7 text-zinc-600">
                  برای ثبت نام کلیک کنید
                </p>

                <button
                  type="button"
                  className="rounded-xl bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
                  onClick={() => {
                    router.push("/addNewMarketing")
                  }}
                >
                  ثبت نام
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      {
        isNameFormOpen && (
          <Dialog open={isNameFormOpen} onOpenChange={setIsNameFormOpen}>
            <DialogContent className="rounded-3xl flex flex-col sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="mr-6 text-lg font-bold">
                  لطفا نام و نام خانوادگی خود را وارد کنید
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleNameFormSubmit}
                className="space-y-4 px-4 pb-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    نام
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (nameFormError) setNameFormError("");
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${nameFormError && !firstName.trim() ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"
                      }`}
                    placeholder="نام"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (nameFormError) setNameFormError("");
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${nameFormError && !lastName.trim() ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"
                      }`}
                    placeholder="نام خانوادگی"
                  />
                </div>

                {nameFormError ? (
                  <p className="text-xs text-red-600">{nameFormError}</p>
                ) : null}

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  ثبت نام
                </button>
              </form>
            </DialogContent>
          </Dialog>
        )
      }
    </div>
  );
}