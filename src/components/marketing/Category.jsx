"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Select from "react-select";
import { getCategoryGraph } from "@/services/authService";
import { Trash2 } from "lucide-react";

const createEmptySelections = (tree) => [
  { level: 0, options: tree, selectedId: null },
];

export default function Category({
  setCategories,
  initialCategoryIds = [],
  validationError,
}) {
  const [categoryTree, setCategoryTree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainRow, setMainRow] = useState({
    selections: [],
    finalId: null,
  });
  const [subRows, setSubRows] = useState([]);

  const prevInitialIdsRef = useRef(null);
  const prevMainFinalIdRef = useRef(null);

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

  const getRowFinalId = (selections) => {
    for (let i = selections.length - 1; i >= 0; i--) {
      if (selections[i].selectedId != null) return selections[i].selectedId;
    }
    return null;
  };

  const buildRowFromId = useCallback(
    (tree, targetId) => {
      if (targetId == null) {
        return {
          selections: createEmptySelections(tree),
          finalId: null,
        };
      }

      const path = findPathToId(tree, targetId);
      if (!path) {
        return {
          selections: createEmptySelections(tree),
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
        selections.push({
          level: path.length,
          options: lastNode.children,
          selectedId: null,
        });
      }

      return { selections, finalId: targetId };
    },
    [findPathToId]
  );

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

  useEffect(() => {
    if (categoryTree.length === 0) return;

    const idsChanged =
      !prevInitialIdsRef.current ||
      prevInitialIdsRef.current.length !== initialCategoryIds.length ||
      prevInitialIdsRef.current.some(
        (id, idx) => id !== initialCategoryIds[idx]
      );

    if (!idsChanged) return;

    prevInitialIdsRef.current = [...initialCategoryIds];

    const [mainId, ...subIds] = initialCategoryIds;
    const nextMain = buildRowFromId(categoryTree, mainId ?? null);
    setMainRow(nextMain);
    prevMainFinalIdRef.current = nextMain.finalId;

    setSubRows(
      subIds.length > 0
        ? subIds.map((id) => buildRowFromId(categoryTree, id))
        : []
    );
  }, [categoryTree, initialCategoryIds, buildRowFromId]);

  // [اصلی, ...فرعی‌ها] بدون تکرار — به ترتیب افزودن
  useEffect(() => {
    if (typeof setCategories !== "function") return;

    const ids = [];
    if (mainRow.finalId != null) {
      ids.push(mainRow.finalId);
    }

    for (const row of subRows) {
      if (
        row.finalId != null &&
        !ids.some((id) => String(id) === String(row.finalId))
      ) {
        ids.push(row.finalId);
      }
    }

    setCategories(ids);
  }, [mainRow, subRows, setCategories]);

  const getUsedFinalIds = (excludeKey) => {
    const used = new Set();

    if (excludeKey !== "main" && mainRow.finalId != null) {
      used.add(String(mainRow.finalId));
    }

    subRows.forEach((row, index) => {
      if (excludeKey !== index && row.finalId != null) {
        used.add(String(row.finalId));
      }
    });

    return used;
  };

  const isOptionDisabled = (option, excludeKey) => {
    const used = getUsedFinalIds(excludeKey);
    if (!used.has(String(option.value))) return false;

    const node = findNodeById(categoryTree, Number(option.value));
    // برگ تکراری قفل؛ والدین برای مسیر به زیردسته آزاد
    return !node?.children?.length;
  };

  const applySelection = (row, levelIndex, selectedOption, tree, excludeKey) => {
    // پاک کردن فیلد (ضربدر)
    if (!selectedOption) {
      const newSelections = row.selections.slice(0, levelIndex + 1).map((sel, index) =>
        index === levelIndex
          ? { ...sel, selectedId: null }
          : sel
      );

      // اگر سطح ۰ پاک شد، گزینه‌ها همان ریشه بماند
      if (levelIndex === 0) {
        newSelections[0] = {
          level: 0,
          options: tree,
          selectedId: null,
        };
      }

      return {
        selections: newSelections,
        finalId: getRowFinalId(newSelections),
      };
    }

    const numId = Number(selectedOption.value);
    if (isOptionDisabled({ value: numId }, excludeKey)) {
      return row;
    }

    const node = findNodeById(tree, numId);
    const newSelections = [...row.selections];

    newSelections[levelIndex] = {
      ...newSelections[levelIndex],
      selectedId: numId,
    };
    newSelections.splice(levelIndex + 1);

    if (node?.children?.length > 0) {
      newSelections.push({
        level: levelIndex + 1,
        options: node.children,
        selectedId: null,
      });
    }

    return {
      selections: newSelections,
      finalId: getRowFinalId(newSelections),
    };
  };

  const handleMainSelect = (levelIndex, selectedOption) => {
    const next = applySelection(
      mainRow,
      levelIndex,
      selectedOption,
      categoryTree,
      "main"
    );
    const mainChanged =
      String(prevMainFinalIdRef.current) !== String(next.finalId);

    prevMainFinalIdRef.current = next.finalId;
    setMainRow(next);

    if (mainChanged) {
      setSubRows([]);
    }
  };

  const handleSubSelect = (rowIndex, levelIndex, selectedOption) => {
    setSubRows((prev) =>
      prev.map((row, index) =>
        index === rowIndex
          ? applySelection(
            row,
            levelIndex,
            selectedOption,
            categoryTree,
            rowIndex
          )
          : row
      )
    );
  };

  const addSubRow = () => {
    setSubRows((prev) => [
      ...prev,
      {
        selections: createEmptySelections(categoryTree),
        finalId: null,
      },
    ]);
  };

  const removeSubRow = (rowIndex) => {
    setSubRows((prev) => prev.filter((_, index) => index !== rowIndex));
  };

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
      boxShadow:
        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
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
      "::-webkit-scrollbar-thumb": {
        background: "#cbd5e1",
        borderRadius: "3px",
      },
      "::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isDisabled
        ? "#f8fafc"
        : state.isSelected
          ? "#4f46e5"
          : state.isFocused
            ? "#f1f5f9"
            : "transparent",
      color: state.isDisabled
        ? "#94a3b8"
        : state.isSelected
          ? "#ffffff"
          : "#334155",
      padding: "10px 12px",
      borderRadius: "0.5rem",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      fontSize: "0.875rem",
      textAlign: "right",
      transition: "background-color 0.15s",
      "&:active": {
        backgroundColor: state.isDisabled ? "#f8fafc" : "#4f46e5",
      },
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
    clearIndicator: (provided) => ({
      ...provided,
      color: "#94a3b8",
      padding: "0 4px",
      cursor: "pointer",
      "&:hover": { color: "#ef4444" },
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? "#4f46e5" : "#9ca3af",
      paddingLeft: "8px",
      paddingRight: "12px",
      transition: "color 0.2s",
      "&:hover": { color: "#6b7280" },
    }),
  };

  const getLevelLabel = (levelIndex) => {
    if (levelIndex === 0) return "دسته اصلی";
    if (levelIndex === 1) return "زیردسته";
    return "زیر زیردسته";
  };

  const renderCascadeSelects = (row, excludeKey, onSelect) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 w-full">
      {row.selections.map((sel, levelIndex) => {
        const options = (sel.options || []).map((opt) => ({
          value: opt.id,
          label: opt.name,
        }));

        const selectedOption =
          sel.selectedId != null
            ? (options.find(
              (opt) => String(opt.value) === String(sel.selectedId)
            ) ?? null)
            : null;

        return (
          <div key={levelIndex} className="flex flex-col gap-1.5">

            <Select
              value={selectedOption}
              onChange={(option) => onSelect(levelIndex, option)}
              options={options}
              isOptionDisabled={(option) =>
                isOptionDisabled(option, excludeKey)
              }
              placeholder={
                levelIndex === 0
                  ? "انتخاب کنید..."
                  : "زیردسته را انتخاب کنید..."
              }
              noOptionsMessage={() => "موردی یافت نشد"}
              isClearable={sel.selectedId != null}
              isSearchable
              styles={customSelectStyles}
              className="text-sm"
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mt-8 h-fit w-full rounded-xl border border-gray-300 bg-slate-100 p-4 shadow-lg md:p-6">
      <div className="mb-6">
        <h1 className="w-fit border-b-2 border-blue-400 text-lg font-bold md:text-2xl">
          دسته‌بندی
        </h1>
        <p className="my-3 text-sm text-gray-500 md:my-4 md:text-xl">
          دسته‌بندی اصلی و در صورت نیاز دسته‌بندی‌های فرعی کسب‌وکار را انتخاب کنید
        </p>
      </div>

      {validationError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{validationError}</p>
        </div>
      ) : null}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
            <p className="text-sm text-gray-500">
              در حال بارگذاری دسته‌بندی‌ها...
            </p>
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
          <div className="relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                ۱
              </span>
              <span className="text-sm font-medium text-gray-700">
                دسته‌بندی اصلی
              </span>
            </div>
            <label className="mr-1 text-xs font-medium text-gray-600">
              دسته اصلی
            </label>
            {mainRow.selections.length > 0
              ? renderCascadeSelects(mainRow, "main", handleMainSelect)
              : null}
          </div>

          <div className="relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                ۲
              </span>
              <span className="text-sm font-medium text-gray-700">
                دسته‌بندی‌های فرعی
              </span>
            </div>

            {subRows.length === 0 ? (
              <p className="text-sm text-gray-500">
                هنوز دسته‌بندی فرعی اضافه نشده است.
              </p>
            ) : (
              <div className="flex flex-col ">
                <label className="mr-1 mb-2 text-xs font-medium text-gray-600">
                  دسته اصلی
                </label>
                {subRows.map((row, rowIndex) => (
                  <div className="flex gap-4 justify-between items-center mb-3" key={rowIndex}>



                    {renderCascadeSelects(row, rowIndex, (levelIndex, option) =>
                      handleSubSelect(rowIndex, levelIndex, option)
                    )}
                    <button
                      type="button"
                      onClick={() => removeSubRow(rowIndex)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      title="حذف این دسته‌بندی فرعی"
                    >
                      <Trash2 size={18} />
                    </button>


                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addSubRow}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              افزودن دسته‌بندی فرعی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
