"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BaseInfo from "@/components/marketing/BaseInfo";
import ContactInfo from "@/components/marketing/ContactInfo";
import PhotoGallery from "@/components/marketing/PhotoGallery";
import Specifications from "@/components/marketing/Specifications";
import Category from "@/components/marketing/Category";
import { getBusiness, setBusiness, setBaseInfoApi } from "@/services/authService";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";
import { toast } from "react-toastify";

const getBusinessPosition = (biz) => {
  if (biz?.lat && biz?.lng) {
    return { lat: Number(biz.lat), lng: Number(biz.lng) };
  }
  return null;
};

export default function AddBusinessModal({
  open,
  onOpenChange,
  onSuccess,
  business,
}) {
  const scrollContainerRef = useRef(null);

  const { setActiveBusiness, userInfo, setApiBusinesses } = useActiveBusiness();

  const [baseInfo, setBaseInfo] = useState({
    businessTitle: "",
    englishName: "",
    shortDescription: "",
    about: "",
    address: "",
    city: "",
  });


  const [position, setPosition] = useState(null);


  const [contactData, setContactData] = useState({
    phones: [],
    links: [],
    socials: [],
  });
  const [errors, setErrors] = useState({});
  const [specificationsData, setSpecificationsData] = useState([]);
  const [galleryItems, setGalleryItems] = useState([
    {
      id: 1,
      image: "",
      imagePreview: "",
      uploadedUrl: "",
      title: "",
      alt: "",
    },
  ]);

  const [bannerItem, setBannerItem] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])


  // --- Mapping helpers to populate form when editing an existing business ---
  const createEmptyGalleryItem = (id) => ({
    id,
    image: "",
    imagePreview: "",
    uploadedUrl: "",
    title: "",
    alt: "",
  });

  const mapBusinessToBaseInfo = (biz) => ({
    businessTitle: biz?.name || biz?.title || biz?.business_name || "",
    englishName: biz?.english_name || biz?.englishName || "",
    shortDescription:
      biz?.description || biz?.shortDescription || biz?.short_description || "",
    about: biz?.about || biz?.long_description || biz?.details || "",
    address: biz?.address || biz?.location || "",
    city: biz?.city || "",
  });

  const getBusinessImages = (biz) => {
    const images = biz?.imgs || biz?.images || biz?.gallery;
    if (!Array.isArray(images)) return [createEmptyGalleryItem(1)];

    const mapped = images
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            id: index + 1,
            image: item.split("/").pop() || `gallery-${index + 1}`,
            imagePreview: item,
            uploadedUrl: item,
            title: "",
            alt: "",
          };
        }
        const url = item?.url || item?.uploadedUrl || item?.file_url || "";
        return {
          id: item?.id ?? index + 1,
          image:
            item?.image ||
            (url && url.split("/").pop()) ||
            `gallery-${index + 1}`,
          imagePreview: url,
          uploadedUrl: url,
          title: item?.title || "",
          alt: item?.alt || "",
        };
      })
      .filter(Boolean);

    return mapped.length > 0 ? mapped : [createEmptyGalleryItem(1)];
  };

  const getBusinessPhones = (biz) => {
    const phones = biz?.phones;
    if (!Array.isArray(phones)) return [];
    return phones.map((item, index) => ({
      id: item?.id ?? index + 1,
      title: item?.title || item?.name || "",
      number: item?.number || item?.phone || "",
    }));
  };

  const getBusinessSocials = (biz) => {
    const defaultSocials = {
      telegram: "",
      whatsapp: "",
      instagram: "",
      eitaa: "",
      bale: "",
    };
    const socials = biz?.socials;

    if (Array.isArray(socials)) {
      socials.forEach((item) => {
        if (item?.value && typeof item.value === "object" && item.value.id) {
          const actualId = item.value.id;
          const actualValue = item.value.value || "";
          if (actualId in defaultSocials)
            defaultSocials[actualId] = actualValue;
        } else if (item?.id && item.id in defaultSocials) {
          defaultSocials[item.id] = item.value || "";
        }
      });
      return defaultSocials;
    }

    if (socials && typeof socials === "object") {
      return {
        ...defaultSocials,
        ...Object.fromEntries(
          Object.entries(socials).filter(([key]) => key in defaultSocials),
        ),
      };
    }

    return defaultSocials;
  };

  const getBusinessSpecifications = (biz) => {
    const specs = biz?.specs || biz?.specifications;
    if (!Array.isArray(specs)) return [];
    return specs.map((section, sectionIndex) => ({
      id: section?.id ?? sectionIndex + 1,
      sectionTitle: section?.sectionTitle || section?.title || "",
      items: Array.isArray(section?.items)
        ? section.items.map((item, itemIndex) => ({
          id: item?.id ?? itemIndex + 1,
          title: item?.title || "",
          value: item?.value ?? "",
        }))
        : [],
    }));
  };

  const getBusinessCategories = (biz) => {
    // سرور ممکنه category_ids یا categories برگردونه
    const cats = biz?.category_ids || biz?.categories || biz?.cats;
    if (Array.isArray(cats)) {
      // اگر آرایه از اعداد است
      if (cats.every((item) => typeof item === "number")) {
        return cats;
      }
      // اگر آرایه از آبجکت‌ها است که id دارند
      return cats.map((item) => item?.id).filter((id) => id != null);
    }
    return [];
  };

  const fieldScrollMap = {
    businessTitle: "businessTitle",
    shortDescription: "shortDescription",
    about: "about",
    address: "address",
    gallery: "photoGallerySection",
  };

  const scrollToErrorField = (field) => {
    const elementId = fieldScrollMap[field];
    if (!elementId) return;

    const element = document.getElementById(elementId);
    if (element) {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        scrollContainer.scrollTo({
          top:
            scrollContainer.scrollTop +
            elementRect.top -
            containerRect.top -
            24,
          behavior: "smooth",
        });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (typeof element.focus === "function") {
        element.focus({ preventScroll: true });
      }
    }
  };

  const getStoredUser = () => {
    const storedUser = localStorage.getItem("dashboard-user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  const syncBusinessesAfterCreate = async () => {
    const currentUser = userInfo || getStoredUser();
    const ownerId = currentUser?.owner_id;

    if (!ownerId) return;

    const previousBusinesses = Array.isArray(currentUser?.businesses)
      ? currentUser.businesses
      : Array.isArray(currentUser?.business)
        ? currentUser.business
        : [];

    const previousIds = new Set(
      previousBusinesses
        .map((business) => business?.id)
        .filter((id) => id !== undefined && id !== null)
        .map(String),
    );

    const businessResponse = await getBusiness(ownerId);
    const businesses = Array.isArray(businessResponse?.businesses)
      ? businessResponse.businesses
      : [];

    if (businessResponse?.msg !== 0 || businesses.length === 0) return;

    const createdBusiness =
      businesses.find(
        (business) =>
          business?.id != null && !previousIds.has(String(business.id)),
      ) ||
      businesses.find(
        (business) =>
          business?.name === baseInfo.businessTitle &&
          business?.address === baseInfo.address,
      ) ||
      businesses[businesses.length - 1];

    const nextUser = {
      ...currentUser,
      business: createdBusiness,
      businesses,
    };

    localStorage.setItem("dashboard-user", JSON.stringify(nextUser));

    if (typeof setApiBusinesses === "function") {
      setApiBusinesses(businesses);
    }

    setActiveBusiness(createdBusiness);
  };

  const clearFieldErrors = (fields) => {
    setErrors((prev) => {
      const nextErrors = { ...prev };
      fields.forEach((field) => delete nextErrors[field]);
      return nextErrors;
    });
  };

  // Populate form when `business` prop is provided (edit mode), or reset on add mode
  useEffect(() => {
    if (business) {
      setBaseInfo((prev) => ({ ...prev, ...mapBusinessToBaseInfo(business) }));
      setGalleryItems(getBusinessImages(business));
      setSpecificationsData(getBusinessSpecifications(business));
      setPosition(getBusinessPosition(business));
      setContactData({
        phones: getBusinessPhones(business),
        links: Array.isArray(business?.links) ? business.links : [],
        socials: getBusinessSocials(business),
      });
      setSelectedCategories(getBusinessCategories(business));
      setErrors({});
    } else {
      // opening in add-new mode: clear
      setBaseInfo({
        businessTitle: "",
        englishName: "",
        shortDescription: "",
        about: "",
        address: "",
        city: "",
      });
      setContactData({ phones: [], links: [], socials: [] });
      setPosition(null)
      setBannerItem(null);
      setSpecificationsData([]);
      setGalleryItems([createEmptyGalleryItem(1)]);
      setErrors({});
      setSelectedCategories([]);
    }
  }, [business, open]);

  const isEditMode = Boolean(business);
  const currentOwnerId = userInfo?.owner_id || getStoredUser()?.owner_id;

  const handleSubmit = async () => {
    const nextErrors = {};

    if (!isEditMode && !currentOwnerId) {
      nextErrors.ownerId = "شناسه کاربر یافت نشد. لطفا دوباره وارد شوید.";
    }

    if (!baseInfo.businessTitle.trim())
      nextErrors.businessTitle = "عنوان کسب و کار الزامی است.";
    if (!baseInfo.englishName.trim())
      nextErrors.englishName = "نام انگلیسی کسب و کار الزامی است.";
    if (!baseInfo.shortDescription.trim())
      nextErrors.shortDescription = "توضیح کوتاه الزامی است.";
    if (!baseInfo.about.trim())
      nextErrors.about = "درباره کسب و کار الزامی است.";
    if (!baseInfo.address.trim()) nextErrors.address = "آدرس الزامی است.";

    const hasSelectedImage = galleryItems.some(
      (item) => item.image || item.imagePreview || item.uploadedUrl,
    );

    // if (!hasSelectedImage) nextErrors.gallery = "حداقل یک عکس باید انتخاب شود.";

    const pendingUpload = galleryItems.some(
      (item) => item.image && !item.uploadedUrl && item.uploading,
    );

    // if (pendingUpload)
    //   nextErrors.gallery = "لطفا صبر کنید تا آپلود عکس‌ها کامل شود.";

    // const uploadedImgs = galleryItems
    //   .filter((item) => item.uploadedUrl)
    //   .map((item) => ({
    //     url: item.uploadedUrl,
    //     title: item.title || "",
    //     alt: item.alt || "",
    //   }));

    // if (hasSelectedImage && !pendingUpload && uploadedImgs.length === 0) {
    //   nextErrors.gallery = "حداقل یک عکس آپلود شده باید وجود داشته باشد.";
    // }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstErrorField = Object.keys(nextErrors)[0];
      toast.error(nextErrors[firstErrorField]);
      setTimeout(() => scrollToErrorField(firstErrorField), 100);
      return;
    }

    if (isEditMode) {
      try {
        const payload = {
          businessId: business?.id ?? 0,
          ownerId: business?.owner_id,
          businessTitle: baseInfo.businessTitle,
          englishName: baseInfo.englishName,
          shortDescription: baseInfo.shortDescription,
          address: baseInfo.address,
          city: baseInfo.city,
          about: baseInfo.about,
          lat: position ? position.lat : null,
          lng: position ? position.lng : null,
          // imgs: uploadedImgs,
          // links: contactData.links || [],
          // socials: contactData.socials || [],
          // phones: contactData.phones || [],
          // specs: specificationsData || [],
          // banner: bannerItem?.imagePreview || null,
          // category_ids: selectedCategories || []
        };

        const response = await setBaseInfo(payload);

        if (response?.msg === 0) {
          if (isEditMode) {
            await syncBusinessesAfterCreate();
          }
          toast.success(
            response.msg_txt || "تغییرات با موفقیت ذخیره شد."
          );
          onOpenChange(false);
          if (typeof onSuccess === "function") {
            onSuccess();
          }
          return;
        }

        toast.error(
          response?.msg_txt || "ثبت تغییرات با مشکل مواجه شد."
        );
      } catch (error) {
        console.error(error);
        toast.error("ثبت کسب و کار با مشکل مواجه شد.");
      }
    } else {
      try {
        const payload = {
          businessId: 0,
          ownerId: currentOwnerId,
          businessTitle: baseInfo.businessTitle,
          englishName: baseInfo.englishName,
          shortDescription: baseInfo.shortDescription,
          address: baseInfo.address,
          city: baseInfo.city,
          about: baseInfo.about,
          lat: position ? position.lat : null,
          lng: position ? position.lng : null,
          // imgs: uploadedImgs,
          // links: contactData.links || [],
          // socials: contactData.socials || [],
          // phones: contactData.phones || [],
          // specs: specificationsData || [],
          // banner: bannerItem?.imagePreview || null,
          // category_ids: selectedCategories || []
        };

        const response = await setBaseInfoApi(payload);

        if (response?.msg === 0) {
          await syncBusinessesAfterCreate();
          toast.success(
            response.msg_txt || "کسب و کار با موفقیت ثبت شد."
          );
          onOpenChange(false);
          if (typeof onSuccess === "function") {
            onSuccess();
          }
          return;
        }

        toast.error(
          response?.msg_txt || "ثبت کسب و کار با مشکل مواجه شد."
        );
      } catch (error) {
        console.error(error);
        toast.error("ثبت کسب و کار با مشکل مواجه شد.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-0 w-full h-[100dvh] max-w-none max-h-none rounded-none border-0 bg-linear-to-b from-white via-slate-50 to-slate-100 p-0 pt-14 md:pt-12 sm:pt-0 overflow-hidden shadow-none sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:w-[90vw] sm:max-w-[90vw] md:w-[60vw] md:max-w-[70vw] lg:max-w-[900px] sm:rounded-[1.5rem] sm:shadow-[0_30px_120px_rgba(15,23,42,0.22)]"
      >
        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:py-6 custom-scrollbar"
        >
          <DialogHeader className="mb-6 sm:mb-8 rounded-[1.25rem] sm:rounded-[1.75rem] bg-slate-600 px-4 sm:px-5 py-4 sm:py-5 text-center sm:text-right text-white shadow-lg shadow-slate-900/10">
            <DialogTitle className="md:text-lg text-base font-black">
              {isEditMode ? "ویرایش کسب و کار" : "افزودن کسب و کار جدید"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-5">
            <BaseInfo
              showNameFields={false}
              businessTitle={baseInfo.businessTitle}
              englishName={baseInfo.englishName}
              shortDescription={baseInfo.shortDescription}
              about={baseInfo.about}
              address={baseInfo.address}
              city={baseInfo.city}
              position={position}
              setPosition={setPosition}
              errors={errors}
              onInfoChange={(info) => {
                clearFieldErrors(Object.keys(info));
                setBaseInfo((prev) => ({
                  ...prev,
                  ...info,
                }));
              }}
            />
            {/* <Category
              key={business?.id ?? "new"}
              setCategories={setSelectedCategories}
              initialCategoryIds={isEditMode ? getBusinessCategories(business) : []}
            />
            <PhotoGallery
              galleryItems={galleryItems}
              onGalleryChange={(items) => {
                clearFieldErrors(["gallery"]);
                setGalleryItems(items);
              }}
              bannerItem={bannerItem}
              onBannerChange={setBannerItem}
              error={errors.gallery}
            />
            <Specifications
              initialSections={specificationsData}
              onSpecificationsChange={setSpecificationsData}
            />
            <ContactInfo
              initialPhoneItems={contactData.phones}
              initialLinkItems={contactData.links}
              initialSocialMedia={contactData.socials}
              onContactChange={setContactData}
            /> */}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 sm:py-4">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-[0.98] sm:w-auto sm:min-w-28 sm:py-2.5"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-[0.98] sm:w-auto sm:min-w-36 sm:py-2.5"
            >
              {isEditMode ? "ذخیره تغییرات" : "ثبت کسب و کار"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}