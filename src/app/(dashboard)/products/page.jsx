'use client';

import React, { useCallback, useEffect, useState } from "react";
import AddProductModal from "@/components/modals/AddProductModal";
import { getFeed, setPost } from "@/services/authService";
import PostCard from "@/components/cards/PostCard";
import Pagination from "@/components/ui/Pagination";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Power, Loader2 } from "lucide-react";

const PER_PAGE = 28;

export default function Page() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusConfirmationProduct, setStatusConfirmationProduct] = useState(null);
  const [togglingProductId, setTogglingProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLastPage, setIsLastPage] = useState(1);
  const { activeBusiness } = useActiveBusiness();
  const activeBusinessId = activeBusiness?.id;

  const fetchFeed = useCallback(async (pageNumber = 1) => {
    if (!activeBusinessId) return;

    setIsLoading(true);
    try {
      const feedData = await getFeed({
        business_id: activeBusinessId,
        page_number: pageNumber,
        per_page: PER_PAGE,
      });
      setProducts(feedData.posts || []);
      setCount(feedData.count ?? 0);
      setIsLastPage(feedData.is_last_page ?? 1);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching feed:", error);
      setProducts([]);
      setCount(0);
      setIsLastPage(1);
      toast.error("خطا در دریافت محصولات");
    } finally {
      setIsLoading(false);
    }
  }, [activeBusinessId]);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handlePageChange = (nextPage) => {
    fetchFeed(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = () => {
    fetchFeed(1);
  };

  const handleRequestToggleStatus = (product) => {
    setStatusConfirmationProduct(product);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusConfirmationProduct) return;
    const target = statusConfirmationProduct;
    const nextStatus = Number(target.status) === 1 ? 0 : 1;

    setTogglingProductId(target.id);
    try {
      const data = await setPost(
        {
          title: target.name || "",
          description: target.description || "",
          image: target.image || "",
          price: target.price || "",
          discount: target.discount?.toString?.().replace("%", "") || target.discount || "",
          status: nextStatus,
        },
        target.id
      );

      if (data.msg === 0) {
        toast.success(nextStatus === 1 ? "محصول فعال شد" : "محصول غیرفعال شد");
        setStatusConfirmationProduct(null);
        await fetchFeed(1);
      } else if (data.msg === 1) {
        toast.error(data.msg_txt || "خطا در تغییر وضعیت محصول");
      } else {
        toast.error("خطا در ارسال اطلاعات");
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("خطا در تغییر وضعیت محصول");
    } finally {
      setTogglingProductId(null);
    }
  };

  useEffect(() => {
    if (!activeBusinessId) return;
    fetchFeed(1);
  }, [activeBusinessId, fetchFeed]);

  return (
    <>
      {
        !activeBusiness ? (
          <div className="text-black">
            ابتدا یک کسب‌وکار انتخاب کنید
          </div>
        ) : activeBusiness.status === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-8 text-center shadow-sm">
            <p className="text-base font-bold text-amber-800 md:text-lg">
              امکان افزودن یا ویرایش محصولات امکان پذیر نمیباشد
            </p>
            <p className="mt-2 text-sm text-amber-700/80">
              وضعیت فعلی کسب‌وکار اجازه ویرایش محصولات را نمی‌دهد.
            </p>
          </div>
        ) : activeBusiness.status === 2 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-8 text-center shadow-sm">
            <p className="text-base font-bold text-amber-800 md:text-lg">
              امکان افزودن یا ویرایش محصولات امکان پذیر نمیباشد
            </p>
            <p className="mt-2 text-sm text-amber-700/80">
              وضعیت فعلی کسب‌وکار اجازه ویرایش محصولات را نمی‌دهد.
            </p>
          </div>
        ) : (
          <div className="space-y-8 text-black">
            <div className="rounded-xl flex justify-between border border-gray-300 bg-slate-100 p-4 md:p-6 shadow-lg">
              <h1 className="w-fit border-b-2 border-blue-400 md:text-2xl text-lg  font-bold">
                لیست محصولات
              </h1 >
              <button className="rounded-lg bg-blue-500 px-4 py-2 text-md font-medium text-white hover:bg-blue-600 transition-all"
                onClick={handleAddProduct}>
                افزودن محصول
              </button>
            </div >

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
              {products?.map((product) => (
                <PostCard
                  key={product.id}
                  product={product}
                  handleEditClick={handleEditClick}
                  handleToggleStatus={handleRequestToggleStatus}
                  isToggling={togglingProductId === product.id}
                />
              ))}
            </div>

            <Pagination
              page={page}
              perPage={PER_PAGE}
              count={count}
              isLastPage={isLastPage}
              onPageChange={handlePageChange}
              disabled={isLoading}
            />

            <AddProductModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedProduct(null);
              }}
              product={selectedProduct}
              onSuccess={handleSuccess}
            />

            {statusConfirmationProduct && (
              <Dialog
                open={Boolean(statusConfirmationProduct)}
                onOpenChange={(open) => {
                  if (!open && !togglingProductId) {
                    setStatusConfirmationProduct(null);
                  }
                }}
              >
                <DialogContent className="rounded-3xl sm:max-w-md p-6 bg-white text-slate-800 shadow-2xl border border-slate-200">
                  <DialogHeader className="gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${Number(statusConfirmationProduct.status) === 1
                          ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                          : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                          }`}
                      >
                        <Power className="h-5 w-5" />
                      </span>
                      <DialogTitle className="text-right text-lg font-bold text-slate-800">
                        {Number(statusConfirmationProduct.status) === 1
                          ? "آیا از غیرفعال کردن مطمئن هستید؟"
                          : "آیا از فعال کردن مطمئن هستید؟"}
                      </DialogTitle>
                    </div>
                  </DialogHeader>



                  <div className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={Boolean(togglingProductId)}
                      onClick={() => setStatusConfirmationProduct(null)}
                      className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      انصراف
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(togglingProductId)}
                      onClick={handleConfirmToggleStatus}
                      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${Number(statusConfirmationProduct.status) === 1
                        ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                        : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
                        }`}
                    >
                      {togglingProductId === statusConfirmationProduct.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>در حال تغییر وضعیت...</span>
                        </>
                      ) : Number(statusConfirmationProduct.status) === 1 ? (
                        "بله"
                      ) : (
                        "بله"
                      )}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div >
        )
      }

    </>

  );
}
