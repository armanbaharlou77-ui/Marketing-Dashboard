"use client";

import React from "react";
import { Trash2Icon } from "lucide-react";
import { addFile } from "@/services/authService";
import { useEffect } from "react";
import Cookies from "js-cookie";


const createGalleryItem = () => ({
  id: typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  image: "",
  imagePreview: "",
  uploadedUrl: "",
  title: "",
  alt: "",
});

const extractUploadUrl = (payload) => {
  const visited = new Set();

  const walk = (value) => {
    if (!value || typeof value !== "object") {
      return null;
    }

    if (visited.has(value)) {
      return null;
    }

    visited.add(value);

    const directCandidates = [
      value.file_url,
      value.fileUrl,
      value.fileURL,
      value.url,
      value.path,
      value.file,
    ];

    for (const candidate of directCandidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }

    for (const nestedValue of Object.values(value)) {
      if (typeof nestedValue === "string" && /^https?:\/\//i.test(nestedValue)) {
        return nestedValue;
      }

      if (nestedValue && typeof nestedValue === "object") {
        const nestedUrl = walk(nestedValue);
        if (nestedUrl) {
          return nestedUrl;
        }
      }
    }

    return null;
  };

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return walk(payload);
};

export default function PhotoGallery({ galleryItems = [], onGalleryChange, bannerItem = null, onBannerChange, error, bannerError }) {
  console.log(bannerItem)
  const updateItems = (nextItems) => {
    if (typeof onGalleryChange === "function") onGalleryChange(nextItems);
  };

  const handleAddItem = () => {
    updateItems([...galleryItems, createGalleryItem()]);
  };

  const handleChange = (id, field, value) => {
    updateItems(
      galleryItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const uploadImageFile = async (file, onStart, onSuccess, onFailure) => {
    onStart();
    try {
      const token = Cookies.get("owner-token");
      const response = await addFile(file, token);
      const url = extractUploadUrl(response);
      onSuccess(url);
    } catch (err) {
      console.error(err);
      onFailure();
    }
  };

  const handleImageChange = async (id, event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      input.value = "";
      return;
    }

    const initialItems = galleryItems.map((item) => {
      if (item.id !== id) {
        return item;
      }

      if (item.imagePreview) {
        URL.revokeObjectURL(item.imagePreview);
      }

      return {
        ...item,
        image: file.name,
        imagePreview: URL.createObjectURL(file),
        uploading: true,
        uploadError: undefined,
      };
    });

    updateItems(initialItems);

    try {
      const token = Cookies.get("owner-token");
      const response = await addFile(file, token);
      const url = extractUploadUrl(response);

      const uploadedItems = initialItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          uploadedUrl: url || item.uploadedUrl,
          imagePreview: url || item.imagePreview,
          uploading: false,
        };
      });

      updateItems(uploadedItems);
    } catch (err) {
      console.error(err);
      const failedItems = initialItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          uploading: false,
          uploadError: 'آپلود عکس با مشکل مواجه شد.',
        };
      });

      updateItems(failedItems);
    } finally {
      input.value = "";
    }
  };


  const handleBannerChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) { input.value = ""; return; }

    const currentBanner = bannerItem || createGalleryItem();
    if (currentBanner.imagePreview) URL.revokeObjectURL(currentBanner.imagePreview);

    const initialBanner = {
      ...currentBanner,
      image: file.name,
      imagePreview: URL.createObjectURL(file),
      uploading: true,
      uploadError: undefined,
    };
    if (typeof onBannerChange === "function") onBannerChange(initialBanner);

    await uploadImageFile(
      file,
      () => { },
      (url) => {
        if (typeof onBannerChange === "function") {
          onBannerChange({
            ...initialBanner,
            uploadedUrl: url || initialBanner.uploadedUrl,
            imagePreview: url || initialBanner.imagePreview,
            uploading: false,
          });
        }
      },
      () => {
        if (typeof onBannerChange === "function") {
          onBannerChange({
            ...initialBanner,
            uploading: false,
            uploadError: 'آپلود بنر با مشکل مواجه شد.',
          });
        }
      }
    );
    input.value = "";
  };

  const handleRemoveBanner = () => {
    if (bannerItem?.imagePreview) URL.revokeObjectURL(bannerItem.imagePreview);
    if (typeof onBannerChange === "function") onBannerChange(null);
  };

  const handleRemoveItem = (id) => {
    const currentItem = galleryItems.find((item) => item.id === id);

    if (currentItem?.imagePreview) {
      URL.revokeObjectURL(currentItem.imagePreview);
    }

    const updatedItems = galleryItems.filter((item) => item.id !== id);
    updateItems(updatedItems.length > 0 ? updatedItems : [createGalleryItem()]);
  };


  useEffect(() => {
    if (galleryItems.length === 0 && typeof onGalleryChange === "function") {
      onGalleryChange([createGalleryItem()]);
    }
  }, [galleryItems, onGalleryChange])

  return (
    <div id="photoGallerySection" className="mt-8 h-fit w-full rounded-xl border border-gray-300 bg-slate-100 md:p-6 p-4 shadow-lg">
      <h1 className="w-fit border-b-2 border-blue-400 md:text-2xl text-lg font-bold">
        گالری عکس و بنر
      </h1>
      <p className="my-4 mb-6 md:text-xl text-md text-gray-500">
        تصاویر و بنر کسب و کار را همراه با اطلاعات وارد کنید
      </p>


      <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-bold text-blue-900">
            بنر اصلی (تصویر عریض)
          </span>
          {bannerItem && (
            <button
              type="button"
              onClick={handleRemoveBanner}
              className="rounded-xl p-1 text-sm text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
            >
              <Trash2Icon />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-blue-300 bg-white px-4 text-center text-sm text-gray-500 shadow-sm transition-colors hover:border-blue-400">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
            {bannerItem?.imagePreview ? (
              <div className="relative h-full w-full">
                <img
                  src={bannerItem.uploadedUrl || bannerItem.imagePreview}
                  alt={bannerItem.alt || "Business Banner"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3 text-white">
                  <span className="block truncate text-sm font-medium">{bannerItem.image}</span>
                </div>
              </div>
            ) : (
              "انتخاب بنر اصلی کسب و کار"
            )}
          </label>

          {bannerItem?.uploading && <p className="text-sm text-blue-600 animate-pulse">در حال آپلود بنر...</p>}
          {bannerItem?.uploadError && <p className="text-sm text-red-600">{bannerItem.uploadError}</p>}
          {bannerError ? <p className="text-sm text-red-600">{bannerError}</p> : null}

          {bannerItem && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* <input
                className="h-12 w-full rounded-xl border border-gray-300 p-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="...Title"
                value={bannerItem.title || ""}
                onChange={(e) => onBannerChange({ ...bannerItem, title: e.target.value })}
              />
              <input
                className="h-12 w-full rounded-xl border border-gray-300 p-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="...Alt"
                value={bannerItem.alt || ""}
                onChange={(e) => onBannerChange({ ...bannerItem, alt: e.target.value })}
              /> */}
            </div>
          )}
        </div>
      </div>

      <hr className="my-6 border-gray-300" />


      <h1 className="w-fit border-b-2 border-blue-400 md:text-2xl text-lg font-bold">
        گالری عکس
      </h1>
      <p className="my-4 mb-10 md:text-xl text-md text-gray-500">
        تصاویر کسب و کار را همراه با عنوان و متن جایگزین وارد کنید
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {galleryItems.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-gray-300 bg-white/70 p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                عکس {index + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="rounded-xl p-1 text-sm text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
              >
                <Trash2Icon />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label
                className={`relative flex h-64 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-blue-300 bg-linear-to-br from-sky-50 to-white px-4 text-center text-sm text-gray-500 shadow-sm transition-colors ${item.uploading
                  ? "cursor-wait opacity-90"
                  : "cursor-pointer hover:border-blue-400 hover:bg-sky-50"
                  }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={item.uploading}
                  onChange={(event) => handleImageChange(item.id, event)}
                />

                {item.imagePreview ? (
                  <div className="relative h-full w-full rounded-[calc(1.5rem-2px)] overflow-hidden">
                    <img
                      src={item.uploadedUrl || item.imagePreview}
                      alt={item.alt || item.title || `gallery-${item.id}`}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3 text-white">
                      <span className="block truncate text-sm font-medium">
                        {item.image}
                      </span>
                    </div>

                    {/* لایه لودینگ روی عکس */}
                    {item.uploading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-all duration-300">
                        <svg
                          className="animate-spin h-10 w-10 text-blue-600 mb-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-bold text-blue-800 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                          در حال آپلود عکس...
                        </span>
                      </div>
                    )}
                  </div>
                ) : item.uploading ? (
                  // در حالتی که پیش‌نمایش ساخته نشده اما در حال آپلود است
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600 mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className="text-sm font-bold text-blue-700">در حال آپلود...</span>
                  </div>
                ) : (
                  "انتخاب عکس"
                )}
              </label>

              {item.uploadError && (
                <p className="mt-1 text-sm font-medium text-red-600 text-center">{item.uploadError}</p>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <input
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 p-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="...Title"
                    value={item.title}
                    onChange={(event) =>
                      handleChange(item.id, "title", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <input
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 p-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="...Alt"
                    value={item.alt}
                    onChange={(event) =>
                      handleChange(item.id, "alt", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleAddItem}
        className="mt-6 my-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 py-3 text-blue-600 transition-colors hover:bg-blue-100"
      >
        <span className="text-xl leading-none">+</span>
        <span>افزودن عکس بیشتر</span>
      </button>
    </div>
  );
}