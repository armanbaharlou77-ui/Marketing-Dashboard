"use client";

import React, { useState } from "react";
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

export default function Specifications() {
    const [sections, setSections] = useState([createSpecificationSection(1)]);

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
        setSections((prev) => [...prev, createSpecificationSection(prev.length + 1)]);
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
                    items: updatedItems.length > 0 ? updatedItems : [createSpecificationItem(1)],
                };
            })
        );
    };

    return (
        <div className="w-full h-fit border rounded-xl border-gray-300 bg-slate-100 shadow-lg md:p-6 p-4 mt-8">
            <h1 className="md:text-2xl text-lg font-bold border-b-2 border-blue-400 w-fit">مشخصات</h1>
            <p className="md:text-xl text-md text-gray-500 my-4 mb-10">
                دسته بندی های مشخصات را تعریف کنید و برای هر دسته، عنوان و مقدارهای مورد نظر را وارد کنید
            </p>

            <div className="space-y-6">
                {sections.map((section) => (
                    <section
                        key={section.id}
                        className="border border-gray-300 rounded-2xl bg-white/70 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <span className="text-sm font-medium text-gray-700">
                                بخش {section.id}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveSection(section.id)}
                                className="text-sm text-red-500 hover:text-red-600 transition-colors hover:bg-red-100 p-1 rounded-xl"
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
                                    className="w-full h-12 mt-2 border-gray-300 bg-white shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    placeholder=" مشخصات فنی"
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
                                        className="border border-gray-200 rounded-2xl bg-indigo-50 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-4">
                                            <span className="text-sm font-medium text-gray-600">
                                                مشخصه {item.id}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(section.id, item.id)}
                                                className="text-sm text-red-500 hover:text-red-600 transition-colors hover:bg-red-100 p-1 rounded-xl"
                                            >
                                                <Trash2Icon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-md font-medium text-gray-700">
                                                    عنوان
                                                </label>
                                                <input
                                                    className="w-full h-12 mt-2 border-gray-300 bg-white shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    type="text"
                                                    placeholder=""
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
                                                    className="w-full h-12 mt-2 border-gray-300 bg-white shadow-sm border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    type="text"
                                                    placeholder=""
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
                                className="w-full border-2 border-dashed border-blue-300 text-blue-600 rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
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
                className="w-full border-2 my-6 border-dashed border-blue-300 text-blue-600 rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors mt-6"
            >
                <span className="text-xl leading-none">+</span>
                <span>افزودن بخش مشخصات جدید</span>
            </button>
        </div>
    );
}
