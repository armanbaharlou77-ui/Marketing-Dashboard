"use client";

import React, { useEffect, useState } from "react";
import { Trash2Icon } from "lucide-react";

const createSpecificationItem = (id) => ({
  id,
  title: "",
  value: "",
});

const createSpecificationSection = (id) => ({
  id,
  sectionTitle: "",
  items: [createSpecificationItem(1)],
});

const normalizeSpecificationSections = (sections) => {
  if (!Array.isArray(sections) || sections.length === 0) {
    return [createSpecificationSection(1)];
  }

  return sections.map((section, sectionIndex) => ({
    id: section?.id ?? sectionIndex + 1,
    sectionTitle: section?.sectionTitle ?? section?.title ?? "",
    items:
      Array.isArray(section?.items) && section.items.length > 0
        ? section.items.map((item, itemIndex) => ({
            id: item?.id ?? itemIndex + 1,
            title: item?.title ?? item?.name ?? "",
            value: item?.value ?? item?.description ?? "",
          }))
        : [createSpecificationItem(1)],
  }));
};

const inputClass =
  "h-12 w-full rounded-xl border border-gray-300 bg-white p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function Specifications({
  initialSections,
  onSpecificationsChange,
  error,
}) {
  const [sections, setSections] = useState(() =>
    normalizeSpecificationSections(initialSections)
  );

  const handleSectionTitleChange = (sectionId, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, sectionTitle: value }
          : section
      )
    );
  };

  const handleItemChange = (sectionId, itemId, field, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : section
      )
    );
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      createSpecificationSection(prev.length + 1),
    ]);
  };

  const handleRemoveSection = (sectionId) => {
    setSections((prev) => {
      const updatedSections = prev.filter((section) => section.id !== sectionId);

      if (updatedSections.length > 0) {
        return updatedSections;
      }

      return [createSpecificationSection(1)];
    });
  };

  const handleAddItem = (sectionId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: [
                ...section.items,
                createSpecificationItem(section.items.length + 1),
              ],
            }
          : section
      )
    );
  };

  const handleRemoveItem = (sectionId, itemId) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        const updatedItems = section.items.filter((item) => item.id !== itemId);

        return {
          ...section,
          items:
            updatedItems.length > 0
              ? updatedItems
              : [createSpecificationItem(1)],
        };
      })
    );
  };

  useEffect(() => {
    if (typeof onSpecificationsChange !== "function") {
      return;
    }

    onSpecificationsChange(
      sections.map((section) => ({
        id: section.id,
        sectionTitle: section.sectionTitle,
        items: section.items.map((item) => ({
          id: item.id,
          title: item.title,
          value: item.value,
        })),
      }))
    );
  }, [sections, onSpecificationsChange]);

  return (
    <div className="mt-8 h-fit w-full rounded-xl border border-gray-300 bg-slate-100 p-3 shadow-lg sm:p-4 md:p-6">
      <h1 className="w-fit border-b-2 border-blue-400 text-lg font-bold md:text-2xl">
        مشخصات
      </h1>
      <p className="my-3 mb-6 text-sm text-gray-500 md:my-4 md:mb-10 md:text-xl">
        دسته‌بندی‌های مشخصات را تعریف کنید و برای هر دسته، عنوان و مقدارهای مورد
        نظر را وارد کنید
      </p>

      {error ? (
        <p className="mb-4 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <div className="space-y-4 md:space-y-6">
        {sections.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-gray-300 bg-white/70 p-3 shadow-sm sm:p-4"
          >
            <div className="space-y-3 md:space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-base font-medium text-gray-700 md:text-lg">
                    عنوان بخش
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    aria-label="حذف بخش"
                    className="shrink-0 rounded-xl p-2 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2Icon className="h-5 w-5" />
                  </button>
                </div>
                <input
                  className={inputClass}
                  type="text"
                  placeholder="مشخصات فنی"
                  value={section.sectionTitle}
                  onChange={(event) =>
                    handleSectionTitleChange(section.id, event.target.value)
                  }
                />
              </div>

              <div className="mt-3 h-px w-full bg-blue-200 md:mt-5 md:h-0.5 md:bg-blue-300" />

              <div className="space-y-3">
                <div className="mt-4 hidden grid-cols-2 gap-3 md:mt-6 md:grid">
                  <span className="text-base font-medium text-gray-600">
                    عنوان مشخصه
                  </span>
                  <span className="text-base font-medium text-gray-600">
                    مقدار
                  </span>
                </div>

                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto] md:items-center md:gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <label className="text-sm font-medium text-gray-600 md:hidden">
                        عنوان مشخصه
                      </label>
                      <input
                        className={inputClass}
                        type="text"
                        value={item.title}
                        onChange={(event) =>
                          handleItemChange(
                            section.id,
                            item.id,
                            "title",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="flex min-w-0 items-end gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <label className="text-sm font-medium text-gray-600 md:hidden">
                          مقدار
                        </label>
                        <input
                          className={inputClass}
                          type="text"
                          value={item.value}
                          onChange={(event) =>
                            handleItemChange(
                              section.id,
                              item.id,
                              "value",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(section.id, item.id)}
                        aria-label="حذف مشخصه"
                        className="mb-0.5 shrink-0 rounded-xl p-2 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600 md:mb-0"
                      >
                        <Trash2Icon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddItem(section.id)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 px-3 py-3 text-sm text-blue-600 transition-colors hover:bg-blue-100 md:text-base"
              >
                <span className="text-xl leading-none">+</span>
                <span>افزودن مشخصه جدید</span>
              </button>
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSection}
        className="my-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 px-3 py-3 text-sm text-blue-600 transition-colors hover:bg-blue-100 md:my-6 md:text-base"
      >
        <span className="text-xl leading-none">+</span>
        <span>افزودن بخش مشخصات جدید</span>
      </button>
    </div>
  );
}
