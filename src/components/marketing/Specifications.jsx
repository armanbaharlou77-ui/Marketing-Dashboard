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

export default function Specifications({ initialSections, onSpecificationsChange }) {
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

  const specifications = sections.map((section) => ({
    title: section.sectionTitle,
    items: section.items.map((item) => ({
      title: item.title,
      value: item.value,
    })),
  }));

  const handleClick = () => {
    console.log(specifications);
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
    <div className="h-fit w-full mt-8 rounded-xl border border-gray-300 bg-slate-100 p-4 shadow-lg md:p-6">
      <h1 className="w-fit border-b-2 border-blue-400 text-lg font-bold md:text-2xl">
        مشخصات
      </h1>
      <p className="my-4 mb-10 text-md text-gray-500 md:text-xl">
        دسته‌بندی های مشخصات را تعریف کنید و برای هر دسته، عنوان و مقدارهای مورد نظر را وارد کنید
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-gray-300 bg-white/70 p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-700">
                بخش {section.id}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveSection(section.id)}
                className="rounded-xl p-1 text-sm text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
              >
                <Trash2Icon />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-md font-medium text-gray-700">
                  عنوان بخش
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="مشخصات فنی"
                  value={section.sectionTitle}
                  onChange={(event) =>
                    handleSectionTitleChange(section.id, event.target.value)
                  }
                />
              </div>

              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 bg-indigo-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-600">
                        مشخصه {item.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(section.id, item.id)}
                        className="rounded-xl p-1 text-sm text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2Icon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-md font-medium text-gray-700">
                          عنوان
                        </label>
                        <input
                          className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <div className="space-y-1">
                        <label className="text-md font-medium text-gray-700">
                          مقدار
                        </label>
                        <input
                          className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddItem(section.id)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 py-3 text-blue-600 transition-colors hover:bg-blue-100"
              >
                <span className="text-xl leading-none">+</span>
                <span>افزودن عنوان و مقدار جدید</span>
              </button>
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSection}
        className="my-6 mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 py-3 text-blue-600 transition-colors hover:bg-blue-100"
      >
        <span className="text-xl leading-none">+</span>
        <span>افزودن بخش مشخصات جدید</span>
      </button>
    </div>
  );
}
