"use client";

import React, { useMemo, useState, useEffect } from "react";
import BaseInfo from "@/components/marketing/BaseInfo";
import ContactInfo from "@/components/marketing/ContactInfo";
import Specifications from "@/components/marketing/Specifications";
import PhotoGallery from "@/components/marketing/PhotoGallery";
import Category from "@/components/marketing/Category";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";
import { setBusiness } from "@/services/authService";
import { toast } from "react-toastify";

// ۱. نگاشت فیلدهای اصلی بر اساس آبجکت سرور
const mapBusinessToBaseInfo = (business) => ({
  firstName:
    business?.first_name ||
    business?.firstName ||
    business?.owner_first_name ||
    "",
  lastName:
    business?.last_name ||
    business?.lastName ||
    business?.owner_last_name ||
    "",
  businessTitle:
    business?.name || business?.title || business?.business_name || "",
  shortDescription:
    business?.description ||
    business?.shortDescription ||
    business?.short_description ||
    "",
  about:
    business?.about || business?.long_description || business?.details || "",
  address: business?.address || business?.location || "",
  city: business?.city || "",
});

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

// تبدیل بنر با پشتیبانی از هر دو حالت String و Object (تطبیق با دیتای سرور)
const getBusinessBanner = (business) => {
  const banner = business?.banner;
  if (!banner) return null;

  if (typeof banner === "string") {
    return {
      id: "banner",
      image: banner.split("/").pop() || "banner",
      imagePreview: banner,
      uploadedUrl: banner,
      title: "",
      alt: "",
    };
  }

  const url = banner?.url || banner?.uploadedUrl || banner?.file_url || "";
  if (!url) return null;

  return {
    id: banner?.id ?? "banner",
    image: banner?.image || url.split("/").pop() || "banner",
    imagePreview: url,
    uploadedUrl: url,
    title: banner?.title || "",
    alt: banner?.alt || "",
  };
};

// ۲. تبدیل تصاویر با پشتیبانی از هر دو حالت String و Object (تطبیق با دیتای سرور)
const getBusinessImages = (business) => {
  const images = business?.imgs;
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
        image: item?.image || url.split("/").pop() || `gallery-${index + 1}`,
        imagePreview: url,
        uploadedUrl: url,
        title: item?.title || "",
        alt: item?.alt || "",
      };
    })
    .filter(Boolean);

  return mapped.length > 0 ? mapped : [createEmptyGalleryItem(1)];
};

// ۳. مپ کردن تلفن‌ها بر اساس کلید number موجود در دیتای شما
const getBusinessPhones = (business) => {
  const phones = business?.phones;
  if (!Array.isArray(phones)) return [];
  return phones.map((item, index) => ({
    id: item?.id ?? index + 1,
    title: item?.title || item?.name || "",
    number: item?.number || item?.phone || "",
  }));
};

// ۴. ساختاردهی به شبکه‌های اجتماعی
const getBusinessSocials = (business) => {
  const defaultSocials = {
    telegram: "",
    whatsapp: "",
    instagram: "",
    eitaa: "",
    bale: "",
  };
  const socials = business?.socials;

  if (Array.isArray(socials)) {
    socials.forEach((item) => {
      // بررسی می‌کنیم که آیا ساختار تو در تو است (طبق جیسون شما)
      if (item?.value && typeof item.value === "object" && item.value.id) {
        const actualId = item.value.id; // مثلا "telegram"
        const actualValue = item.value.value || ""; // مثلا "@viko"

        if (actualId in defaultSocials) {
          defaultSocials[actualId] = actualValue;
        }
      }
      // در صورتی که سرور دیتای مسطح فرستاد (پشتیبان)
      else if (item?.id && item.id in defaultSocials) {
        defaultSocials[item.id] = item.value || "";
      }
    });
    return defaultSocials;
  }

  // اگر به صورت آبجکت کلید-مقدار ساده بود
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

// ۵. تطبیق ویژگی‌ها با کلید sectionTitle ارسالی از سرور
const getBusinessSpecifications = (business) => {
  const specs = business?.specs;
  if (!Array.isArray(specs)) return [];

  return specs.map((section, sectionIndex) => ({
    id: section?.id ?? sectionIndex + 1,
    sectionTitle: section?.sectionTitle || section?.title || "", // اضافه شدن تگ مطابقت با سرور
    items: Array.isArray(section?.items)
      ? section.items.map((item, itemIndex) => ({
          id: item?.id ?? itemIndex + 1,
          title: item?.title || "",
          value: item?.value ?? "",
        }))
      : [],
  }));
};

const getBusinessPosition = (business) => {
  if (business?.lat && business?.lng) {
    return { lat: Number(business.lat), lng: Number(business.lng) };
  }
  return null;
};

const readUser = () => {
  const storedUser = localStorage.getItem("dashboard-user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

const extractBusinessFromResponse = (response, fallbackBusiness) => {
  const candidate =
    response?.business ||
    response?.value ||
    response?.data ||
    response?.result ||
    response?.item;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? candidate
    : fallbackBusiness;
};

const persistEditedBusiness = (business, userInfo, setActiveBusiness) => {
  if (!business) return;

  localStorage.setItem("dashboard-activeBusiness", JSON.stringify(business));
  setActiveBusiness(business);

  const user = userInfo || readUser();
  if (!user) return;

  const businessId = business?.id;
  const nextBusinesses = Array.isArray(user.businesses)
    ? businessId != null
      ? [
          ...user.businesses.filter(
            (item) => String(item?.id) !== String(businessId),
          ),
          business,
        ]
      : [...user.businesses, business]
    : undefined;

  localStorage.setItem(
    "dashboard-user",
    JSON.stringify({
      ...user,
      business,
      businesses: nextBusinesses ?? user.businesses,
    }),
  );
};

const createEmptyGalleryItem = (id) => ({
  id,
  image: "",
  imagePreview: "",
  uploadedUrl: "",
  title: "",
  alt: "",
});

function BusinessEditor({ business, userInfo, setActiveBusiness }) {
  const [baseInfo, setBaseInfo] = useState(() =>
    mapBusinessToBaseInfo(business),
  );
  const [galleryItems, setGalleryItems] = useState(() =>
    getBusinessImages(business),
  );
  const [contactData, setContactData] = useState(() => ({
    phones: getBusinessPhones(business),
    links: Array.isArray(business?.links) ? business.links : [],
    socials: getBusinessSocials(business),
  }));
  const [specificationsData, setSpecificationsData] = useState(() =>
    getBusinessSpecifications(business),
  );

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [position, setPosition] = useState(() => getBusinessPosition(business));
  const [bannerItem, setBannerItem] = useState(() =>
    getBusinessBanner(business),
  );

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // سینک کردن آنی فیلدها بدون نیاز به رفرش پس از دریافت پاسخ جدید سرور
  // همگام‌سازی فیلدها هنگام تعویض کسب‌وکار یا ثبت نهایی
  useEffect(() => {
    if (business) {
      // ۱. بروزرسانی اطلاعات پایه
      setBaseInfo(mapBusinessToBaseInfo(business));

      // ۲. بروزرسانی گالری تصاویر
      setGalleryItems(getBusinessImages(business));

      // ۳. بروزرسانی مشخصات و ویژگی‌ها
      setSpecificationsData(getBusinessSpecifications(business));

      setPosition(getBusinessPosition(business));

      // ۵. بروزرسانی بنر
      setBannerItem(getBusinessBanner(business));

      setSelectedCategories(getBusinessCategories(business));

      // ۴. بروزرسانی راه‌های ارتباطی (به همراه کلون کردن آبجکت سوشال‌ها برای فعال شدن رندر کلاینت)
      const freshSocials = getBusinessSocials(business);
      setContactData({
        phones: getBusinessPhones(business),
        links: Array.isArray(business?.links) ? business.links : [],
        socials: { ...freshSocials }, // با این کار ری‌آکت متوجه تغییر ساختار آبجکت می‌شود
      });
    }
  }, [business]);

  const handleInfoChange = (info = {}) => {
    setBaseInfo((prev) => ({ ...prev, ...info }));
  };

  const handleGalleryChange = (items) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next.gallery;
      return next;
    });
    setGalleryItems(items);
  };

  const handleSubmit = async () => {
    if (!business) {
      toast.error("ابتدا یک کسب‌وکار انتخاب کنید.");
      return;
    }

    const hasSelectedImage = galleryItems.some(
      (item) => item.image || item.imagePreview || item.uploadedUrl,
    );

    const pendingUpload = galleryItems.some(
      (item) => item.image && !item.uploadedUrl && item.uploading,
    );

    const uploadedImgs = galleryItems
      .filter((item) => item.uploadedUrl)
      .map((item) => ({
        url: item.uploadedUrl,
        title: item.title || "",
        alt: item.alt || "",
      }));

    if (!hasSelectedImage) {
      const galleryError = "حداقل یک عکس باید انتخاب شود.";
      setErrors((prev) => ({ ...prev, gallery: galleryError }));
      toast.error(galleryError);
      return;
    }

    if (pendingUpload) {
      const galleryError = "لطفا صبر کنید تا آپلود عکس‌ها کامل شود.";
      setErrors((prev) => ({ ...prev, gallery: galleryError }));
      toast.error(galleryError);
      return;
    }

    if (hasSelectedImage && uploadedImgs.length === 0) {
      const galleryError = "حداقل یک عکس آپلود شده باید وجود داشته باشد.";
      setErrors((prev) => ({ ...prev, gallery: galleryError }));
      toast.error(galleryError);
      return;
    }

    const businessId = business?.id ?? 0;

    const payload = {
      businessId,
      ownerId: business?.owner_id,
      businessTitle: baseInfo.businessTitle,
      shortDescription: baseInfo.shortDescription,
      address: baseInfo.address,
      city: baseInfo.city,
      about: baseInfo.about,
      lat: position ? position.lat : null, // ارسال lat
      lng: position ? position.lng : null, // ارسال lng
      imgs: uploadedImgs,
      links: contactData.links || [],
      // تبدیل آبجکت سوشال کلاینت به آرایه مورد انتظار سرور شما
      socials: Object.entries(contactData.socials || {}).map(([key, val]) => ({
        id: key,
        value: val,
      })),
      phones: contactData.phones || [],
      specs: specificationsData || [],
      banner: bannerItem?.uploadedUrl || bannerItem?.imagePreview || null,
      category_ids: selectedCategories || [],
    };

    setIsSaving(true);
    try {
      const response = await setBusiness(payload);

      if (response?.msg === 0) {
        const updatedBusiness = extractBusinessFromResponse(response, payload);
        persistEditedBusiness(updatedBusiness, userInfo, setActiveBusiness);
        toast.success(response.msg_txt || "تغییرات با موفقیت ذخیره شد.");
      } else {
        toast.error(response?.msg_txt || "ثبت تغییرات ناموفق بود.");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ذخیره تغییرات");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <BaseInfo
        {...baseInfo}
        position={position}
        setPosition={setPosition}
        onInfoChange={handleInfoChange}
      />
      <PhotoGallery
        galleryItems={galleryItems}
        onGalleryChange={handleGalleryChange}
        bannerItem={bannerItem}
        onBannerChange={setBannerItem}
        error={errors.gallery}
      />
      <Category
        key={business?.id ?? "new"}
        setCategories={setSelectedCategories}
        initialCategoryIds={getBusinessCategories(business)}
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
      />

      {/* فضای خالی تا آخرین فیلدها زیر دکمه ثابت نمانند */}
      <div className="h-20" aria-hidden />

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 md:right-80 sm:bottom-6 sm:justify-end sm:px-6 lg:px-8">
        <div className="pointer-events-auto w-full max-w-[900px] sm:flex sm:justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full rounded-2xl bg-indigo-600 px-10 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_8px_30px_rgba(79,70,229,0.28)] transition duration-200 hover:bg-indigo-700 hover:shadow-[0_10px_36px_rgba(79,70,229,0.38)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto sm:min-w-[168px]"
          >
            {isSaving ? "در حال ذخیره..." : "ثبت نهایی"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function MarketingPage() {
  const { activeBusiness, userInfo, setActiveBusiness } = useActiveBusiness();
  const editorKey = activeBusiness?.id ?? "empty";

  const title = useMemo(
    () =>
      activeBusiness?.name || activeBusiness?.title || "کسب‌وکار انتخاب نشده",
    [activeBusiness],
  );

  return (
    <div className="mx-auto max-w-[900px] text-black">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">ویرایش کسب و کار</p>
        <h1 className="mt-1 text-xl font-black text-slate-800">{title}</h1>
      </div>

      <BusinessEditor
        key={editorKey}
        business={activeBusiness}
        userInfo={userInfo}
        setActiveBusiness={setActiveBusiness}
      />
    </div>
  );
}
