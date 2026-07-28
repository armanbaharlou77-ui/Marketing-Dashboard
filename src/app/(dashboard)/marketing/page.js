"use client";

import React, { useMemo, useState, useEffect } from "react";
import BaseInfo from "@/components/marketing/BaseInfo";
import ContactInfo from "@/components/marketing/ContactInfo";
import Specifications from "@/components/marketing/Specifications";
import PhotoGallery from "@/components/marketing/PhotoGallery";
import Category from "@/components/marketing/Category";
import SectionTabs from "@/components/ui/SectionTabs";
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
  englishName: business?.english_name || business?.englishName || "",
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
          description: item?.description ?? "",
        }))
      : [],
  }));
};

const getBusinessPosition = (business) => {
  const lat = business?.lat;
  const lng = business?.lng;

  if (
    lat === null ||
    lat === undefined ||
    lat === "" ||
    lng === null ||
    lng === undefined ||
    lng === ""
  ) {
    return null;
  }

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
    return null;
  }

  return { lat: parsedLat, lng: parsedLng };
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

const buildUpdatedBusiness = (previousBusiness, payload, response) => {
  const fromResponse = extractBusinessFromResponse(response, null);

  return {
    ...previousBusiness,
    ...(fromResponse || {}),
    id: fromResponse?.id ?? previousBusiness?.id ?? payload.businessId,
    owner_id:
      fromResponse?.owner_id ?? previousBusiness?.owner_id ?? payload.ownerId,
    name:
      fromResponse?.name ||
      fromResponse?.title ||
      payload.businessTitle ||
      previousBusiness?.name ||
      "",
    title:
      fromResponse?.title ||
      fromResponse?.name ||
      payload.businessTitle ||
      previousBusiness?.title ||
      "",
    english_name:
      fromResponse?.english_name ||
      fromResponse?.englishName ||
      payload.englishName ||
      previousBusiness?.english_name ||
      previousBusiness?.englishName ||
      "",
    description:
      fromResponse?.description ||
      payload.shortDescription ||
      previousBusiness?.description ||
      "",
    address:
      fromResponse?.address ??
      payload.address ??
      previousBusiness?.address ??
      "",
    city: fromResponse?.city || payload.city || previousBusiness?.city || "",
    about:
      fromResponse?.about ?? payload.about ?? previousBusiness?.about ?? "",
    lat: fromResponse?.lat ?? payload.lat ?? previousBusiness?.lat ?? null,
    lng: fromResponse?.lng ?? payload.lng ?? previousBusiness?.lng ?? null,
    imgs: fromResponse?.imgs || payload.imgs || previousBusiness?.imgs || [],
    links:
      fromResponse?.links || payload.links || previousBusiness?.links || [],
    socials:
      fromResponse?.socials ||
      payload.socials ||
      previousBusiness?.socials ||
      [],
    phones:
      fromResponse?.phones || payload.phones || previousBusiness?.phones || [],
    specs:
      fromResponse?.specs || payload.specs || previousBusiness?.specs || [],
    banner:
      fromResponse?.banner ??
      payload.banner ??
      previousBusiness?.banner ??
      null,
    category_ids:
      fromResponse?.category_ids ||
      payload.category_ids ||
      previousBusiness?.category_ids ||
      [],
    status: fromResponse?.status ?? previousBusiness?.status ?? null,
  };
};

const persistEditedBusiness = (business, userInfo, setActiveBusiness) => {
  if (!business) return;

  localStorage.setItem("dashboard-activeBusiness", JSON.stringify(business));
  setActiveBusiness(business);

  const user = userInfo || readUser();
  if (!user) return;

  const businessId = business?.id;
  let nextBusinesses;

  if (!Array.isArray(user.businesses)) {
    nextBusinesses = [business];
  } else if (businessId == null) {
    nextBusinesses = [...user.businesses, business];
  } else {
    const exists = user.businesses.some(
      (item) => String(item?.id) === String(businessId),
    );
    nextBusinesses = exists
      ? user.businesses.map((item) =>
          String(item?.id) === String(businessId) ? business : item,
        )
      : [...user.businesses, business];
  }

  localStorage.setItem(
    "dashboard-user",
    JSON.stringify({
      ...user,
      business,
      businesses: nextBusinesses,
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
  const [activeTab, setActiveTab] = useState("base");
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(0);

  const editorTabs = [
    { id: "base", label: "اطلاعات پایه" },
    { id: "gallery", label: "گالری تصاویر" },
    { id: "category", label: "دسته‌بندی" },
    { id: "specs", label: "مشخصات" },
    { id: "contact", label: "راه‌های ارتباطی" },
  ];

  const getUnlockedStorageKey = (businessId) =>
    `dashboard-marketing-unlocked:${businessId ?? "unknown"}`;

  const readUnlockedIndex = (businessId) => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = sessionStorage.getItem(getUnlockedStorageKey(businessId));
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.min(parsed, editorTabs.length - 1);
      }
    } catch {
      // ignore
    }
    return 0;
  };

  const persistUnlockedIndex = (businessId, index) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        getUnlockedStorageKey(businessId),
        String(Math.max(0, index)),
      );
    } catch {
      // ignore
    }
  };

  const unlockUpTo = (index) => {
    setMaxUnlockedIndex((prev) => {
      const next = Math.max(prev, index);
      persistUnlockedIndex(business?.id, next);
      return next;
    });
  };

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

  useEffect(() => {
    const unlocked = readUnlockedIndex(business?.id);
    setMaxUnlockedIndex(unlocked);
    setActiveTab("base");
    setErrors({});
  }, [business?.id]);

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

  const businessStatus = business?.status;
  const isEditBlocked = businessStatus === 2;

  const activeTabIndex = editorTabs.findIndex((tab) => tab.id === activeTab);
  const isLastTab =
    activeTabIndex === editorTabs.length - 1 || activeTabIndex < 0;

  const failValidation = (nextErrors, tab) => {
    setErrors(nextErrors);
    if (tab) setActiveTab(tab);
    toast.error(Object.values(nextErrors)[0]);
    return false;
  };

  const isTabFilled = (tabId) => {
    if (tabId === "base") {
      return Boolean(
        baseInfo.businessTitle?.trim() &&
          baseInfo.shortDescription?.trim() &&
          baseInfo.about?.trim() &&
          baseInfo.address?.trim() &&
          baseInfo.city?.trim(),
      );
    }

    if (tabId === "gallery") {
      const hasSelectedImage = galleryItems.some(
        (item) => item.image || item.imagePreview || item.uploadedUrl,
      );
      const pendingUpload = galleryItems.some(
        (item) => item.image && !item.uploadedUrl && item.uploading,
      );
      const uploadedImgs = galleryItems.filter((item) => item.uploadedUrl);
      const hasBanner = Boolean(
        bannerItem?.uploadedUrl || bannerItem?.imagePreview,
      );
      const bannerPending = Boolean(
        bannerItem?.image && !bannerItem?.uploadedUrl && bannerItem?.uploading,
      );

      return (
        hasSelectedImage &&
        !pendingUpload &&
        uploadedImgs.length > 0 &&
        hasBanner &&
        !bannerPending
      );
    }

    if (tabId === "category") {
      return (selectedCategories || []).some((id) => id != null && id !== "");
    }

    if (tabId === "specs") {
      const specs = Array.isArray(specificationsData) ? specificationsData : [];
      if (specs.length === 0) return false;
      for (const section of specs) {
        if (!section?.sectionTitle?.trim()) return false;
        const items = Array.isArray(section?.items) ? section.items : [];
        if (items.length === 0) return false;
        for (const item of items) {
          if (!item?.title?.trim()) return false;
        }
      }
      return true;
    }

    // contact اختیاری است؛ اگر به این تب رسیده باشیم پر محسوب می‌شود
    if (tabId === "contact") return true;

    return false;
  };

  const getFilledThroughIndex = () => {
    let filledThrough = -1;
    for (let i = 0; i < editorTabs.length; i++) {
      if (!isTabFilled(editorTabs[i].id)) break;
      filledThrough = i;
    }
    return filledThrough;
  };

  const filledThroughIndex = getFilledThroughIndex();
  const filledUnlockIndex =
    filledThroughIndex < 0
      ? 0
      : Math.min(filledThroughIndex + 1, editorTabs.length - 1);
  const effectiveMaxUnlocked = Math.max(
    maxUnlockedIndex,
    filledUnlockIndex,
    Math.max(filledThroughIndex, 0),
  );

  useEffect(() => {
    if (effectiveMaxUnlocked > maxUnlockedIndex) {
      unlockUpTo(effectiveMaxUnlocked);
    }
  }, [effectiveMaxUnlocked, maxUnlockedIndex, business?.id]);

  const validateTab = (tabId) => {
    if (tabId === "base") {
      const nextErrors = {};
      if (!baseInfo.businessTitle?.trim()) {
        nextErrors.businessTitle = "عنوان کسب و کار الزامی است.";
      }
      if (!baseInfo.shortDescription?.trim()) {
        nextErrors.shortDescription = "توضیح کوتاه الزامی است.";
      }
      if (!baseInfo.about?.trim()) {
        nextErrors.about = "درباره کسب و کار الزامی است.";
      }
      if (!baseInfo.address?.trim()) {
        nextErrors.address = "آدرس الزامی است.";
      }
      if (!baseInfo.city?.trim()) {
        nextErrors.city = "انتخاب شهر الزامی است.";
      }
      if (Object.keys(nextErrors).length > 0) {
        return failValidation(nextErrors, "base");
      }
      return true;
    }

    if (tabId === "gallery") {
      const hasSelectedImage = galleryItems.some(
        (item) => item.image || item.imagePreview || item.uploadedUrl,
      );
      const pendingUpload = galleryItems.some(
        (item) => item.image && !item.uploadedUrl && item.uploading,
      );
      const uploadedImgs = galleryItems.filter((item) => item.uploadedUrl);
      const hasBanner = Boolean(
        bannerItem?.uploadedUrl || bannerItem?.imagePreview,
      );
      const bannerPending = Boolean(
        bannerItem?.image && !bannerItem?.uploadedUrl && bannerItem?.uploading,
      );

      if (!hasSelectedImage) {
        return failValidation(
          { gallery: "حداقل یک عکس باید انتخاب شود." },
          "gallery",
        );
      }
      if (pendingUpload) {
        return failValidation(
          { gallery: "لطفا صبر کنید تا آپلود عکس‌ها کامل شود." },
          "gallery",
        );
      }
      if (uploadedImgs.length === 0) {
        return failValidation(
          { gallery: "حداقل یک عکس آپلود شده باید وجود داشته باشد." },
          "gallery",
        );
      }
      if (!hasBanner) {
        return failValidation({ banner: "انتخاب بنر الزامی است." }, "gallery");
      }
      if (bannerPending) {
        return failValidation(
          { banner: "لطفا صبر کنید تا آپلود بنر کامل شود." },
          "gallery",
        );
      }
      return true;
    }

    if (tabId === "category") {
      const selectedCategoryIds = (selectedCategories || []).filter(
        (id) => id != null && id !== "",
      );
      if (selectedCategoryIds.length === 0) {
        return failValidation(
          { category: "حداقل یک دسته‌بندی باید انتخاب شود." },
          "category",
        );
      }
      return true;
    }

    if (tabId === "specs") {
      const specs = Array.isArray(specificationsData) ? specificationsData : [];
      for (const section of specs) {
        if (!section?.sectionTitle?.trim()) {
          return failValidation(
            { specs: "عنوان هر بخش مشخصات الزامی است." },
            "specs",
          );
        }
        const items = Array.isArray(section?.items) ? section.items : [];
        for (const item of items) {
          if (!item?.title?.trim()) {
            return failValidation(
              { specs: "عنوان هر مشخصه الزامی است." },
              "specs",
            );
          }
        }
      }
      return true;
    }

    // contact: بدون validation
    return true;
  };

  const handleNext = () => {
    if (!validateTab(activeTab)) return;

    const nextTab = editorTabs[activeTabIndex + 1];
    if (nextTab) {
      unlockUpTo(activeTabIndex + 1);
      setErrors({});
      setActiveTab(nextTab.id);
    }
  };

  const handlePrev = () => {
    const prevTab = editorTabs[activeTabIndex - 1];
    if (prevTab) {
      setErrors({});
      setActiveTab(prevTab.id);
    }
  };

  const handleTabChange = (tabId) => {
    const targetIndex = editorTabs.findIndex((tab) => tab.id === tabId);
    if (targetIndex < 0 || targetIndex === activeTabIndex) return;

    // تب‌های قبلی / آنلاک‌شده (شامل تب‌های پرشده): آزاد
    if (targetIndex <= effectiveMaxUnlocked) {
      setErrors({});
      setActiveTab(tabId);
      return;
    }

    // برای پرش جلو: همه تب‌های قبل از هدف باید validate باشند
    for (let i = 0; i < targetIndex; i++) {
      if (!validateTab(editorTabs[i].id)) return;
    }

    unlockUpTo(targetIndex);
    setErrors({});
    setActiveTab(tabId);
  };

  const handleSubmit = async () => {
    if (!business) {
      toast.error("ابتدا یک کسب‌وکار انتخاب کنید.");
      return;
    }

    if (isEditBlocked) {
      toast.error("امکان ویرایش این کسب‌وکار وجود ندارد.");
      return;
    }

    // قبل از ثبت نهایی، همه تب‌های دارای validation را چک کن
    for (const tab of editorTabs) {
      if (tab.id === "contact") continue;
      if (!validateTab(tab.id)) return;
    }

    const businessId = business?.id ?? 0;
    const uploadedImgs = galleryItems
      .filter((item) => item.uploadedUrl)
      .map((item) => ({
        url: item.uploadedUrl,
        title: item.title || "",
        alt: item.alt || "",
      }));
    const selectedCategoryIds = (selectedCategories || []).filter(
      (id) => id != null && id !== "",
    );

    const payload = {
      businessId,
      ownerId: business?.owner_id,
      businessTitle: baseInfo.businessTitle,
      englishName: baseInfo.englishName,
      shortDescription: baseInfo.shortDescription,
      address: baseInfo.address,
      city: baseInfo.city,
      about: baseInfo.about,
      lat: position ? position.lat : null,
      lng: position ? position.lng : null,
      imgs: uploadedImgs,
      links: contactData.links || [],
      socials: Object.entries(contactData.socials || {}).map(([key, val]) => ({
        id: key,
        value: val,
      })),
      phones: contactData.phones || [],
      specs: specificationsData || [],
      banner: bannerItem?.uploadedUrl || bannerItem?.imagePreview || null,
      category_ids: selectedCategoryIds,
    };

    setIsSaving(true);
    try {
      const response = await setBusiness(payload);

      if (response?.msg === 0) {
        const updatedBusiness = buildUpdatedBusiness(
          business,
          payload,
          response,
        );
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

  if (isEditBlocked) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-8 text-center shadow-sm">
        <p className="text-base font-bold text-amber-800 md:text-lg">
          امکان ویرایش این کسب‌وکار وجود ندارد
        </p>
        <p className="mt-2 text-sm text-amber-700/80">
          وضعیت فعلی کسب‌وکار اجازه ویرایش اطلاعات را نمی‌دهد.
        </p>
      </div>
    );
  }

  return (
    <>
      <SectionTabs
        tabs={editorTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        maxUnlockedIndex={effectiveMaxUnlocked}
      />

      <div className={activeTab !== "base" ? "hidden" : ""}>
        <BaseInfo
          {...baseInfo}
          position={position}
          setPosition={setPosition}
          onInfoChange={handleInfoChange}
          errors={errors}
        />
      </div>

      <div className={activeTab !== "gallery" ? "hidden" : ""}>
        <PhotoGallery
          galleryItems={galleryItems}
          onGalleryChange={handleGalleryChange}
          bannerItem={bannerItem}
          onBannerChange={setBannerItem}
          error={errors.gallery}
          bannerError={errors.banner}
        />
      </div>
      <div className={activeTab !== "category" ? "hidden" : ""}>
        <Category
          key={business?.id ?? "new"}
          setCategories={setSelectedCategories}
          initialCategoryIds={getBusinessCategories(business)}
          validationError={errors.category}
        />
      </div>
      <div className={activeTab !== "specs" ? "hidden" : ""}>
        <Specifications
          initialSections={specificationsData}
          onSpecificationsChange={setSpecificationsData}
          error={errors.specs}
        />
      </div>
      <div className={activeTab !== "contact" ? "hidden" : ""}>
        <ContactInfo
          initialPhoneItems={contactData.phones}
          initialLinkItems={contactData.links}
          initialSocialMedia={contactData.socials}
          onContactChange={setContactData}
        />
      </div>

      <div className="h-20" aria-hidden />

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 md:left-4 xl:left-30 sm:bottom-10 sm:justify-end sm:px-6 lg:px-8">
        <div className="pointer-events-auto flex w-full max-w-[900px] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {activeTabIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSaving}
              className="w-full rounded-2xl bg-amber-400 px-10 py-3.5 text-sm font-bold tracking-wide text-white shadow-sm ring-1  transition duration-200 hover:bg-amber-500 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[150px]"
            >
              قبلی
            </button>
          ) : null}

          <button
            type="button"
            onClick={isLastTab ? handleSubmit : handleNext}
            disabled={isSaving}
            className="w-full rounded-2xl bg-indigo-600 px-10 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_8px_30px_rgba(79,70,229,0.28)] transition duration-200 hover:bg-indigo-700 hover:shadow-[0_10px_36px_rgba(79,70,229,0.38)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto sm:min-w-[150px]"
          >
            {isSaving ? "در حال ذخیره..." : isLastTab ? "ثبت نهایی" : "بعدی"}
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
