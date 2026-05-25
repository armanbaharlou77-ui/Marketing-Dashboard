"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Trash2Icon } from "lucide-react";

const createGalleryItem = (id) => ({
  id,
  image: "",
  imagePreview: "",
  title: "",
  alt: "",
});

export default function PhotoGallery() {
  const [galleryItems, setGalleryItems] = useState([createGalleryItem(1)]);

  const handleAddItem = () => {
    setGalleryItems((prev) => [...prev, createGalleryItem(prev.length + 1)]);
  };

  const handleChange = (id, field, value) => {
    setGalleryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleImageChange = (id, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setGalleryItems((prev) =>
      prev.map((item) => {
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
        };
      })
    );
  };

  const handleRemoveItem = (id) => {
    setGalleryItems((prev) => {
      const currentItem = prev.find((item) => item.id === id);

      if (currentItem?.imagePreview) {
        URL.revokeObjectURL(currentItem.imagePreview);
      }

      const updatedItems = prev.filter((item) => item.id !== id);

      if (updatedItems.length > 0) {
        return updatedItems;
      }

      return [createGalleryItem(1)];
    });
  };

  return (
    <div className="mt-8 h-fit w-full rounded-xl border border-gray-300 bg-slate-100 md:p-6 p-4 shadow-lg">
      <h1 className="w-fit border-b-2 border-blue-400 md:text-2xl text-lg font-bold">
        گالری عکس
      </h1>
      <p className="my-4 mb-10 md:text-xl text-md text-gray-500">
        تصاویر کسب و کار را همراه با عنوان و متن جایگزین وارد کنید
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-gray-300 bg-white/70 p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                عکس {item.id}
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
              <label className="flex min-h-52 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-blue-300 bg-linear-to-br from-sky-50 to-white px-4 text-center text-sm text-gray-500 shadow-sm transition-colors hover:border-blue-400 hover:bg-sky-50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleImageChange(item.id, event)}
                />
                {item.imagePreview ? (
                  <div className="relative h-full min-h-52 w-full rounded-[calc(1.5rem-2px)]">
                    <Image
                      src={item.imagePreview}
                      alt={item.alt || item.title || `gallery-${item.id}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3 text-white">
                      <span className="block truncate text-sm font-medium">
                        {item.image}
                      </span>
                    </div>
                  </div>
                ) : (
                  "انتخاب عکس"
                )}
              </label>

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
