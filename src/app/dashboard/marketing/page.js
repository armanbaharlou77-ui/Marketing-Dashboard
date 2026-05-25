import React from "react";
import BaseInfo from "@/components/marketing/BaseInfo";
import ContactInfo from "@/components/marketing/ContactInfo";
import Specifications from "@/components/marketing/Specifications";
import PhotoGallery from "@/components/marketing/PhotoGallery";
import WorkingTime from "@/components/marketing/WorkingTime";

export default function page() {
  return (
    <div className="text-black max-w-[900px] mx-auto ">
      <BaseInfo />
      <PhotoGallery />
      <Specifications />
      <ContactInfo />
      <WorkingTime />

      <div className="flex items-center justify-end">
        <button className="bg-indigo-600 shadow-xl text-gray-100 py-3 px-12 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mb-20 mt-6">
          ثبت نهایی
        </button>
      </div>
    </div>
  );
}
