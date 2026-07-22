'use client';

import React from "react";


import { useState } from "react";
import AddProductModal from "@/components/modals/AddProductModal";
import { useEffect } from "react";
import { getFeed } from "@/services/authService";
import PostCard from "@/components/cards/PostCard";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";

export default function Page() {
  const [products, setProducts] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { activeBusiness } = useActiveBusiness();
  const activeBusinessId = activeBusiness?.id;

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData) => {
    if (selectedProduct) {
      // حالت ویرایش
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productData.id ? productData : p
        )
      );
    } else {
      // حالت افزودن
      const newProduct = {
        id: Date.now(),
        ...productData,
      };
      setProducts((prevProducts) => [newProduct, ...prevProducts]);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };


  const fetchFeed = async () => {
    try {
      const feedData = await getFeed(activeBusinessId);
      setProducts(feedData.posts || []);
      console.log("Fetched feed data:", feedData);
    } catch (error) {
      console.error("Error fetching feed:", error);
    }
  };


  useEffect(() => {
    let ignore = false;

    getFeed(activeBusinessId)
      .then((feedData) => {
        if (!ignore) {
          setProducts(feedData.posts || []);
          console.log("Fetched feed data:", feedData);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Error fetching feed:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeBusinessId]);

  console.log(activeBusiness);


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
              <h1 className="w-fit border-b-2 border-blue-400 md:text-2xl text-lg  font-bold">
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
                />
              ))}
            </div>

            <AddProductModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedProduct(null);
              }}
              product={selectedProduct}
              onSuccess={fetchFeed}
            />
          </div >
        )
      }

    </>

  );
}
