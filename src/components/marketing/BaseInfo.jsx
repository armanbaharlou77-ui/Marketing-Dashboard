"use client";

import React, { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Select from "react-select";
import { getCities } from "@/services/authService";

const LocationPicker = dynamic(
  () => import("../LocationPicker"),
  { ssr: false }
)

export default function BaseInfo({
  businessTitle = "",
  shortDescription = "",
  about = "",
  address = "",
  city = "",       // نام شهر (string) - برای نمایش/ویرایش
  position = null, // ۱. اضافه شدن به Props
  setPosition,     // ۲. اضافه شدن به Props
  errors = {},
  onInfoChange,
}) {
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await getCities();
        const rawList = Array.isArray(response?.cities) ? response.cities : [];
        setCities(rawList);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // تبدیل لیست شهرها به فرمت react-select (مقدار ارسالی همان نام شهر - string)
  const cityOptions = useMemo(
    () => cities.map((item) => ({ value: item.name, label: item.name })),
    [cities],
  );

  const currentCityOption =
    cityOptions.find((option) => option.value === city) || null;

  const baseInputClass =
    "mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white/70 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const safeChange = (info) => {
    if (typeof onInfoChange === "function") {
      onInfoChange(info);
    }
  };

  const errorClass = (field) =>
    `${baseInputClass} ${errors[field] ? "border-red-300 ring-1 ring-red-400" : ""}`;



  const customSelectStyles = {
    // استایل کادر اصلی اینپوت (هماهنگ با h-12 w-full rounded-xl border border-gray-300)
    control: (provided, state) => ({
      ...provided,
      height: "48px", // معادل h-12
      minHeight: "48px",
      borderRadius: "0.75rem", // معادل rounded-xl
      borderWidth: "1px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", // فوکوس blue-500، عادی border-gray-300
      backgroundColor: "#ffffff",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.25)" : "none", // حالت فوکوس ریبون
      direction: "rtl",
      maxWidth: '50%',
      cursor: "pointer",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af", // hover:border-gray-400
      },
    }),

    // استایل منوی بازشو (لیست شهرها)
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.75rem", // rounded-xl
      border: "1px solid #e5e7eb", // border-gray-200
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)", // shadow-lg
      backgroundColor: "#ffffff",
      maxWidth: '50%',
      overflow: "hidden",
      zIndex: 50,
    }),

    // استایل لیست داخلی منو
    menuList: (provided) => ({
      ...provided,
      padding: "4px",
    }),

    // استایل تک‌تک گزینه‌ها (شهرها)
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#4f46e5" // اگر انتخاب شده بود فعال با رنگ ایندیگو کامپوننت مادر (indigo-600)
        : state.isFocused
          ? "#f1f5f9" // در حالت هاور (slate-100)
          : "transparent",
      color: state.isSelected ? "#ffffff" : "#334155", // متن slate-700
      padding: "10px 12px",
      borderRadius: "0.5rem", // rounded-lg برای گزینه‌های داخلی
      cursor: "pointer",
      fontSize: "0.875rem", // text-sm
      textAlign: "right",
      transition: "background-color 0.15s",
      "&:active": {
        backgroundColor: "#4f46e5",
      },
    }),

    // استایل متنی که کاربر انتخاب کرده است
    singleValue: (provided) => ({
      ...provided,
      color: "#1e293b", // text-slate-800
      fontSize: "0.875rem", // text-sm
      marginRight: "4px",
    }),

    // استایل متن کم‌رنگ پیش‌فرض (Placeholder)
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af", // text-gray-400
      fontSize: "0.875rem", // text-sm
      marginRight: "4px",
    }),

    // حذف خط جداکننده پیش‌فرض بین آیکون و متن
    indicatorSeparator: () => ({
      display: "none",
    }),

    // استایل آیکون فلش رو به پایین
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? "#3b82f6" : "#9ca3af",
      paddingLeft: "12px",
      "&:hover": {
        color: "#6b7280", // text-gray-500
      },
    }),
  };

  return (
    <div className="h-fit w-full rounded-xl border border-gray-300 bg-slate-100 p-4 shadow-lg md:p-6">
      <h1 className="w-fit border-b-2 border-blue-400 text-lg font-bold md:text-2xl">
        اطلاعات پایه
      </h1>
      <p className="my-3 mb-6 text-sm text-gray-500 md:my-4 md:mb-10 md:text-xl">
        اطلاعات کسب و کار خود را وارد کنید
      </p>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">


        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 md:text-md">
            عنوان کسب و کار
          </label>
          <input
            id="businessTitle"
            name="businessTitle"
            value={businessTitle}
            onChange={(e) => safeChange({ businessTitle: e.target.value })}
            className={errorClass("businessTitle")}
            type="text"
            placeholder="فروشگاه عطر یاس"
          />
          {errors.businessTitle && (
            <p className="mt-1 text-sm text-red-600">{errors.businessTitle}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 md:text-md">
            توضیح کوتاه
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            value={shortDescription}
            onChange={(e) => safeChange({ shortDescription: e.target.value })}
            className={errorClass("shortDescription")}
            type="text"
            placeholder="عرضه انواع عطر و ادکلن"
          />
          {errors.shortDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
          )}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-700 md:text-md">
            درباره کسب و کار
          </label>
          <textarea
            id="about"
            name="about"
            value={about}
            onChange={(e) => safeChange({ about: e.target.value })}
            className={`mt-2 h-34 w-full resize-none rounded-xl border border-gray-300 bg-white/70 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.about ? "border-red-400 ring-1 ring-red-400" : ""
              }`}
            placeholder="فروشگاه ما با بیش از 10 سال سابقه در زمینه عطر و ادکلن فعالیت می‌کند."
          />
          {errors.about && (
            <p className="mt-1 text-sm text-red-600">{errors.about}</p>
          )}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-700 md:text-md">
            آدرس
          </label>
          <textarea
            id="address"
            name="address"
            value={address}
            onChange={(e) => safeChange({ address: e.target.value })}
            className={`mt-2 h-28 w-full resize-none rounded-xl border border-gray-300 bg-white/70 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? "border-red-400 ring-1 ring-red-400" : ""
              }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}



          <label className="mb-3 mt-4 block text-sm font-medium text-gray-700 md:text-md">
            شهر
          </label>
          <Select
            options={cityOptions}
            instanceId="business-city-select"
            value={currentCityOption}
            onChange={(option) => safeChange({ city: option ? option.value : "" })}
            isLoading={isLoadingCities}
            placeholder="شهر را انتخاب کنید"
            loadingMessage={() => "در حال بارگذاری شهرها..."}
            noOptionsMessage={() => "شهری یافت نشد"}
            isClearable={true}
            isSearchable={true}
            styles={customSelectStyles}
            dir="rtl"
            maxMenuHeight={220}
            className={`text-sm  ${errors.city ? "rounded-xl ring-1 ring-red-400" : ""} z-500`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}

          <label className="mb-3 mt-4 block text-sm font-medium">
            انتخاب لوکیشن روی نقشه
          </label>



          <LocationPicker position={position} setPosition={setPosition} />
        </div>
      </div>
    </div>
  );
}
