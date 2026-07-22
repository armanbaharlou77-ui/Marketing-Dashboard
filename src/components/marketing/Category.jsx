"use client";

import React, { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { getCategoryGraph } from "@/services/authService";
import { Trash2 } from "lucide-react";

export default function Category({ setCategories, initialCategoryIds = [] }) {
    const [categoryTree, setCategoryTree] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([{ selections: [], finalId: null }]);

    // ─── ردیابی آخرین initialCategoryIds برای جلوگیری از بازسازی غیرضروری ──
    const prevInitialIdsRef = React.useRef(null);

    // ─── پیدا کردن node با id در درخت ───────────────────────────────────────
    const findNodeById = useCallback((tree, id) => {
        for (const node of tree) {
            if (node.id === id) return node;
            if (node.children?.length) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }, []);

    // ─── پیدا کردن مسیر کامل از ریشه تا id ─────────────────────────────────
    const findPathToId = useCallback((tree, targetId, path = []) => {
        for (const node of tree) {
            const currentPath = [...path, node];
            if (node.id === targetId) return currentPath;
            if (node.children?.length) {
                const found = findPathToId(node.children, targetId, currentPath);
                if (found) return found;
            }
        }
        return null;
    }, []);

    // ─── محاسبه finalId یک ردیف: آخرین selectedId ───────────────────────────
    // اهمیتی نداره آخرین دسته زیردسته داشته باشه یا نه
    const getRowFinalId = (selections) => {
        for (let i = selections.length - 1; i >= 0; i--) {
            if (selections[i].selectedId != null) return selections[i].selectedId;
        }
        return null;
    };

    // ─── تبدیل initialCategoryIds به ردیف‌های cascade ──────────────────────
    const buildRowsFromTree = useCallback((tree, ids) => {
        if (!ids || ids.length === 0) {
            return [{ selections: [{ level: 0, options: tree, selectedId: null }], finalId: null }];
        }
        return ids.map((targetId) => {
            const path = findPathToId(tree, targetId);
            if (!path) {
                return {
                    selections: [{ level: 0, options: tree, selectedId: null }],
                    finalId: null,
                };
            }
            const selections = path.map((node, index) => ({
                level: index,
                options: index === 0 ? tree : path[index - 1].children,
                selectedId: node.id,
            }));
            const lastNode = path[path.length - 1];
            if (lastNode.children?.length > 0) {
                selections.push({ level: path.length, options: lastNode.children, selectedId: null });
            }
            return { selections, finalId: targetId };
        });
    }, [findPathToId]);

    // ─── دریافت درخت از سرور ────────────────────────────────────────────────
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await getCategoryGraph();
                if (res?.categories) {
                    setCategoryTree(res.categories);
                }
            } catch (err) {
                console.error("خطا در دریافت دسته‌بندی‌ها:", err);
                setError("خطا در بارگذاری دسته‌بندی‌ها");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // ─── بازسازی ردیف‌ها وقتی درخت یا initialCategoryIds تغییر می‌کنه ──────────
    useEffect(() => {
        if (categoryTree.length === 0) return;

        // مقایسه محتوای آرایه به جای reference
        const idsChanged =
            !prevInitialIdsRef.current ||
            prevInitialIdsRef.current.length !== initialCategoryIds.length ||
            prevInitialIdsRef.current.some((id, idx) => id !== initialCategoryIds[idx]);

        if (idsChanged) {
            prevInitialIdsRef.current = [...initialCategoryIds];
            setRows(buildRowsFromTree(categoryTree, initialCategoryIds));
        }
    }, [categoryTree, initialCategoryIds, buildRowsFromTree]);

    // ─── sync با parent — هر بار rows تغییر کرد ─────────────────────────────
    useEffect(() => {
        if (typeof setCategories !== "function") return;
        const finalIds = rows
            .map((r) => r.finalId)
            .filter((id) => id !== null && id !== undefined);
        setCategories(finalIds);
    }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── انتخاب یک گزینه ────────────────────────────────────────────────────
    const handleSelect = (rowIndex, levelIndex, selectedOption) => {
        if (!selectedOption) return;

        const numId = Number(selectedOption.value);
        const node = findNodeById(categoryTree, numId);

        setRows((prevRows) => {
            const newRows = [...prevRows];
            const row = { ...newRows[rowIndex] };
            const newSelections = [...row.selections];

            // آپدیت select انتخاب‌شده
            newSelections[levelIndex] = {
                ...newSelections[levelIndex],
                selectedId: numId,
            };

            // حذف selectهای بعدی (cascade reset)
            newSelections.splice(levelIndex + 1);

            // اگر زیردسته دارد → select جدید اضافه کن
            if (node?.children?.length > 0) {
                newSelections.push({
                    level: levelIndex + 1,
                    options: node.children,
                    selectedId: null,
                });
            }

            // finalId = آخرین selectedId در این ردیف (صرف‌نظر از داشتن زیردسته)
            row.selections = newSelections;
            row.finalId = getRowFinalId(newSelections);
            newRows[rowIndex] = row;

            return newRows;
        });
    };

    // ─── افزودن ردیف جدید ───────────────────────────────────────────────────
    const addRow = () => {
        setRows((prev) => [
            ...prev,
            {
                selections: [{ level: 0, options: categoryTree, selectedId: null }],
                finalId: null,
            },
        ]);
    };

    // ─── حذف ردیف ───────────────────────────────────────────────────────────
    const removeRow = (rowIndex) => {
        setRows((prev) => prev.filter((_, i) => i !== rowIndex));
    };

    // ─── استایل‌های react-select ─────────────────────────────────────────────
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: "44px",
            borderRadius: "0.75rem",
            borderWidth: "1px",
            borderColor: state.isFocused ? "#4f46e5" : "#d1d5db",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            boxShadow: state.isFocused
                ? "0 0 0 3px rgba(79, 70, 229, 0.1)"
                : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": { borderColor: state.isFocused ? "#4f46e5" : "#9ca3af" },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
            overflow: "hidden",
            zIndex: 50,
        }),
        menuList: (provided) => ({
            ...provided,
            padding: "4px",
            maxHeight: "220px",
            "::-webkit-scrollbar": { width: "6px" },
            "::-webkit-scrollbar-track": { background: "#f1f5f9" },
            "::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "3px" },
            "::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#4f46e5"
                : state.isFocused ? "#f1f5f9" : "transparent",
            color: state.isSelected ? "#ffffff" : "#334155",
            padding: "10px 12px",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            textAlign: "right",
            transition: "background-color 0.15s",
            "&:active": { backgroundColor: "#4f46e5" },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#1e293b",
            fontSize: "0.875rem",
            marginRight: "4px",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
            fontSize: "0.875rem",
            marginRight: "4px",
        }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "#4f46e5" : "#9ca3af",
            paddingLeft: "12px",
            paddingRight: "12px",
            transition: "color 0.2s",
            "&:hover": { color: "#6b7280" },
        }),
    };

    console.log(initialCategoryIds);


    return (
        <div className="h-fit w-full mt-8 rounded-xl border border-gray-300 bg-slate-100 p-4 shadow-lg md:p-6">
            <div className="mb-6">
                <h1 className="w-fit border-b-2 border-blue-400 text-lg font-bold md:text-2xl">
                    دسته‌بندی
                </h1>
                <p className="my-3 text-sm text-gray-500 md:my-4 md:text-xl">
                    دسته‌بندی کسب و کار خود را انتخاب کنید
                </p>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
                        <p className="text-sm text-gray-500">در حال بارگذاری دسته‌بندی‌ها...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {!isLoading && !error && (
                <div className="flex flex-col gap-4">
                    {rows.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm transition-all hover:shadow-md"
                        >
                            {/* هدر ردیف */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                        {rowIndex + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                        انتخاب دسته‌بندی اصلی
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* نشانگر انتخاب نهایی */}
                                    {/* {row.finalId && (
                                        <span className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            انتخاب شد
                                        </span>
                                    )} */}

                                    {/* دکمه حذف — همیشه نشون داده می‌شه */}
                                    <button
                                        type="button"
                                        onClick={() => removeRow(rowIndex)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
                                        title="حذف این دسته‌بندی"
                                    >
                                        {/* <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg> */}
                                        <Trash2 size={22} />
                                    </button>
                                </div>
                            </div>

                            {/* selectهای این ردیف */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {row.selections.map((sel, levelIndex) => {
                                    const options = sel.options.map((opt) => ({
                                        value: opt.id,
                                        label: opt.name,
                                    }));

                                    const selectedOption =
                                        sel.selectedId != null
                                            ? (options.find((opt) => opt.value === sel.selectedId) ?? null)
                                            : null;

                                    return (
                                        <div key={levelIndex} className="flex flex-col gap-1.5">
                                            {/* <label className="mr-1 text-xs font-medium text-gray-600">
                                                {levelIndex === 0
                                                    ? "دسته اصلی"
                                                    : levelIndex === 1
                                                        ? "زیردسته"
                                                        : `سطح ${levelIndex + 1}`}
                                            </label> */}
                                            <label className="mr-1 text-xs font-medium text-gray-600">
                                                {levelIndex === 0
                                                    ? "دسته اصلی"
                                                    : levelIndex === 1
                                                        ? "زیردسته"
                                                        : `زیر زیر دسته`}
                                            </label>
                                            <Select
                                                value={selectedOption}
                                                onChange={(option) => handleSelect(rowIndex, levelIndex, option)}
                                                options={options}
                                                placeholder={levelIndex === 0 ? "انتخاب کنید..." : "زیردسته را انتخاب کنید..."}
                                                noOptionsMessage={() => "موردی یافت نشد"}
                                                isClearable={false}
                                                isSearchable={true}
                                                styles={customSelectStyles}
                                                className="text-sm"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* دکمه افزودن دسته‌بندی جدید */}
                    <button
                        type="button"
                        onClick={addRow}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        افزودن دسته‌بندی جدید
                    </button>
                </div>
            )}
        </div>
    );
}
