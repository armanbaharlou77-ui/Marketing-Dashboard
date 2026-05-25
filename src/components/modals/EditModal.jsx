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

export default function EditModal({ isOpen, onClose, product, onSave }) {
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

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          title: product.title || "",
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

  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(product);
  const modalTitle = isEditMode ? "ویرایش محصول" : "افزودن محصول جدید";
  const modalDescription = isEditMode
    ? "اطلاعات محصول را ویرایش و ذخیره کنید"
    : "اطلاعات محصول جدید را وارد کنید";
  const submitButtonText = isEditMode
    ? (isLoading ? "درحال ذخیره..." : "ذخیره تغییرات")
    : (isLoading ? "درحال افزودن..." : "افزودن محصول");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file.name,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
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
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const submitData = {
        ...(isEditMode && product && { id: product.id }),
        title: formData.title,
        description: formData.description,
        price: formData.price,
        discount: formData.discount ? `${formData.discount}%` : "",
        image: formData.imagePreview || formData.image,
        imageAlt: formData.imageAlt,
        imageTitle: formData.imageTitle,
      };

      onSave(submitData);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* عرض را در موبایل 95vw و در دسکتاپ به max-w-3xl محدود کردیم و پدینگ موبایل را کمی کاهش دادیم */}
      <DialogContent className="w-[95vw] sm:h-[90vh] h-[80vh] sm:max-w-3xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-right text-lg font-bold  mr-8">{modalTitle}</DialogTitle>
          <DialogDescription className="text-right text-sm sm:text-md mr-8">
            {modalDescription}
          </DialogDescription>
        </DialogHeader>

        {/* بخش فرم با اسکرول ریسپانسیو */}
        <div className="space-y-6 py-2 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto px-1 sm:px-2">

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">نام محصول</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="نام محصول را وارد کنید"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">توضیحات محصول</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="توضیحات محصول را وارد کنید"
              rows="4"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
            />
          </div>

          {/* گرید ۱ ستونه در موبایل و ۲ ستونه در دسکتاپ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">قیمت (تومان)</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="مثال: 3,450,000"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">تخفیف (درصد)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="مثال: 15"
                min="0"
                max="100"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">عکس محصول</label>
              {/* عرض باکس عکس در موبایل 100% و در دسکتاپ 2/3 */}
              <label
                className={`mt-2 w-full sm:w-2/3 mx-auto flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed px-4 text-center text-sm shadow-sm transition-colors ${formData.imagePreview
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
                {formData.imagePreview ? (
                  <div className="relative max-h-48 w-full rounded-lg overflow-hidden">
                    <img
                      src={formData.imagePreview}
                      alt={formData.title || "تصویر محصول"}
                      className="object-cover transition-transform duration-500 hover:scale-105 mx-auto h-full"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3 text-white">
                      <span className="block truncate text-sm font-medium text-center">
                        {formData.image}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center">
                    <p className="font-medium">برای انتخاب عکس کلیک کنید</p>
                    <p className="text-xs mt-1">یا عکس را بکشید و اینجا بیندازید</p>
                  </div>
                )}
              </label>

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

            {/* گرید ۱ ستونه در موبایل و ۲ ستونه در دسکتاپ */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">عنوان عکس (Title)</label>
                <input
                  type="text"
                  name="imageTitle"
                  value={formData.imageTitle}
                  onChange={handleChange}
                  placeholder="مثال: هدفون سونی مدل WH"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">متن جایگزین عکس (Alt)</label>
                <input
                  type="text"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleChange}
                  placeholder="مثال: هدفون بی‌سیم مشکی"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-right focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                />
              </div>
            </div> */}
          </div>
        </div>

        {/* دکمه‌ها در موبایل کل عرض را پر می‌کنند و زیر هم قرار می‌گیرند */}
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-start border-t border-gray-100 pt-4 mt-2">
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.title}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {submitButtonText}
          </Button>

          <DialogClose asChild>
            <Button
              variant="ghost"
              disabled={isLoading}
              className="w-full sm:w-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-6 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium transition-all"
            >
              انصراف
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}