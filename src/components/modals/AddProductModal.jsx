'use client';

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 as Trash2Icon } from "lucide-react";
import { toast } from "react-toastify";
import { setPost, addFile } from "@/services/authService";
import { MoonLoader } from "react-spinners";
import Cookies from "js-cookie";

export default function AddProductModal({ isOpen, onClose, product, onSuccess }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discount: "",
    image: "",
    imagePreview: null,
    imageAlt: "",
    imageTitle: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {

      setErrors({});

      if (product) {
        setFormData({
          title: product.name || "",
          description: product.description || "",
          price: product.price || "",
          discount: product.discount?.replace("%", "") || "",
          image: product.image || "",
          imagePreview: product.image || null,
          imageAlt: product.imageAlt || "",
          imageTitle: product.imageTitle || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          price: "",
          discount: "",
          image: "",
          imagePreview: null,
          imageAlt: "",
          imageTitle: "",
        });
      }
    }
  }, [isOpen, product]);

  const isEditMode = Boolean(product);
  const modalTitle = isEditMode ? "ویرایش محصول" : "افزودن محصول جدید";
  const modalDescription = isEditMode
    ? "اطلاعات محصول را ویرایش و ذخیره کنید"
    : "اطلاعات محصول جدید را وارد کنید";
  const submitButtonText = isEditMode
    ? (isLoading ? "درحال ذخیره..." : "ذخیره تغییرات")
    : (isLoading ? "درحال افزودن..." : "افزودن محصول");

  // تابع اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "وارد کردن نام محصول الزامی است.";
    if (!formData.description.trim()) newErrors.description = "وارد کردن توضیحات محصول الزامی است.";
    if (!formData.price) newErrors.price = "وارد کردن قیمت الزامی است.";
    if (!formData.image) newErrors.image = "انتخاب عکس برای محصول الزامی است.";

    setErrors(newErrors);

    // اگر طول آبجکت خطاها صفر باشد، یعنی فرم معتبر است
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // پاک کردن خطای فیلد هنگام تایپ کردن کاربر
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "price") {
      const numericValue = value.replace(/,/g, "");

      if (!isNaN(numericValue) || numericValue === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // پاک کردن خطای عکس هنگام انتخاب فایل جدید
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }

    try {
      setImageLoading(true);
      const token = Cookies.get("owner-token");
      const response = await addFile(file, token);
      if (response.msg === 0) {
        const url = response.path;
        setFormData((prev) => ({
          ...prev,
          image: url,
          imagePreview: url,
        }));
      }
    } catch (err) {
      console.error(err);
    }
    finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
      imagePreview: null,
      imageAlt: "",
      imageTitle: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    // اجرای اعتبارسنجی قبل از ارسال داده‌ها
    if (!validateForm()) {
      toast.error("لطفاً تمامی فیلدهای اجباری را پر کنید.");
      return;
    }

    setIsLoading(true);
    if (!isEditMode) {
      try {
        const data = await setPost(formData);
        if (data.msg === 0) {
          toast.success('محصول با موفقیت ثبت شد');
          onClose();
          onSuccess();
        } else if (data.msg === 1) {
          toast.error(data.msg_txt || 'خطا در ثبت محصول')
        } else {
          toast.error('خطا در ارسال اطلاعات')
        }
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const data = await setPost(formData, product.id);
        if (data.msg === 0) {
          toast.success('تغییرات با موفقیت ذخیره شد');
          onClose();
          onSuccess();
        }
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dir="rtl"
        className="flex flex-col gap-0 w-full h-[100dvh] max-w-none max-h-none rounded-none border-0 bg-white p-0 shadow-none sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-3xl sm:shadow-xl sm:p-0"
      >
        {/* هدر مودال */}
        <DialogHeader className="shrink-0 p-5 pt-12 sm:p-6 sm:pt-6 border-b border-gray-100 bg-slate-50/50 sm:rounded-t-3xl">
          <DialogTitle className="text-right text-lg font-bold ml-6 sm:ml-0">
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="text-right text-sm sm:text-md mt-1 ml-6 sm:ml-0">
            {modalDescription}
          </DialogDescription>
        </DialogHeader>

        {/* بدنه مودال (اسکرول شونده) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

          {/* نام محصول */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">نام محصول <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="نام محصول را وارد کنید"
              className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-right focus:bg-white focus:ring-2 outline-none transition-all ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"}`}
            />
            {errors.title && <p className="text-xs text-red-500 text-right">{errors.title}</p>}
          </div>

          {/* توضیحات محصول */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">توضیحات محصول <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="توضیحات محصول را وارد کنید"
              rows="4"
              className={`w-full rounded-lg border bg-gray-50 px-4 py-3 focus:bg-white focus:ring-2 outline-none transition-all resize-none ${errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"}`}
            />
            {errors.description && <p className="text-xs text-red-500 text-right">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* قیمت */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">قیمت (تومان) <span className="text-red-500">*</span></label>
              <input
                style={{ direction: "ltr" }}
                type="text"
                name="price"
                value={
                  formData.price
                    ? Number(formData.price).toLocaleString("en-US")
                    : ""
                }
                onChange={handleChange}
                placeholder="مثال: 3,450,000"
                className={`w-full rounded-lg placeholder:text-right border bg-gray-50 px-4 py-3 focus:bg-white focus:ring-2 outline-none transition-all ${errors.price ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"}`}
              />
              {errors.price && <p className="text-xs text-red-500 text-right">{errors.price}</p>}
            </div>

            {/* تخفیف */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">تخفیف (درصد) <span className="text-slate-400">اختیاری</span></label>
              <input
                type="text"
                style={{ direction: "ltr" }}
                inputMode="numeric"
                name="discount"
                placeholder="مثال: 15 یا خالی بگذارید"
                value={formData.discount ? +formData.discount : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value === "") {
                    handleChange({ target: { name: "discount", value: "" } });
                    return;
                  }
                  if (+value > 100) value = "100";
                  handleChange({ target: { name: "discount", value } });
                }}
                min="0"
                max="100"
                className={`w-full rounded-lg border bg-gray-50 px-4 py-3 focus:bg-white focus:ring-2 outline-none transition-all ${errors.discount ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"}`}
              />
            </div>
          </div>

          {/* آپلود عکس */}
          <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">عکس محصول <span className="text-red-500">*</span></label>

              <label
                className={`mt-2 w-full sm:w-2/3 mx-auto flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed px-4 text-center text-sm shadow-sm transition-colors ${errors.image ? "border-red-400 bg-red-50 hover:border-red-500" :
                  formData.imagePreview
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imageLoading ? (
                  <div className="relative h-48 w-full rounded-lg overflow-hidden bg-slate-100 flex flex-col items-center justify-center">
                    <svg
                      className="animate-spin h-8 w-8 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className="text-black text-sm mt-2">در حال بارگذاری...</span>
                  </div>
                ) : formData.imagePreview ? (
                  <div className="relative h-48 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={formData.imagePreview}
                      alt={formData.title || "تصویر محصول"}
                      className="w-full h-full object-contain transition-transform duration-500 p-2"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3 text-white">
                      <span className="block truncate text-sm font-medium text-center">
                        {formData.imagePreview}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`${errors.image ? "text-red-500" : "text-gray-500"} text-center`}>
                    <p className="font-medium">برای انتخاب عکس کلیک کنید</p>
                    <p className="text-xs mt-1">یا عکس را بکشید و اینجا بیندازید</p>
                  </div>
                )}
              </label>

              {errors.image && <p className="text-xs text-red-500 text-center mt-1">{errors.image}</p>}

              {formData.image ? (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mx-auto mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 flex items-center gap-2"
                >
                  <Trash2Icon size={16} />
                  حذف عکس
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* فوتر مودال */}
        <DialogFooter className="shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-start border-t border-gray-100 p-4 sm:p-6 bg-slate-50/50 sm:rounded-b-3xl">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {submitButtonText}
          </Button>

          <DialogClose asChild>
            <Button
              variant="ghost"
              disabled={isLoading}
              className="w-full sm:w-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg font-medium transition-all"
            >
              انصراف
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}