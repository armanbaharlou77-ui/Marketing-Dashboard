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
import { getBusiness, getOwner, setBusiness } from "@/services/authService";
import { useActiveBusiness } from "@/components/providers/ActiveBusinessProvider";
import Select from "react-select";
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
  const [users, setUsers] = useState();
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
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
    selectedUserId: "userSelectSection", // اضافه شدن آیدی بخش انتخاب کاربر برای اسکرول
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
    const storedUser = localStorage.getItem("admin-user");
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

    localStorage.setItem("admin-user", JSON.stringify(nextUser));

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
      setSelectedUserId(null);
      setSelectedCategories([]);// ریست کردن انتخاب کاربر
    }
  }, [business, open]);

  const isEditMode = Boolean(business);

  const handleSubmit = async () => {
    const nextErrors = {};

    // اعتبارسنجی انتخاب کاربر فقط در حالت ایجاد کسب و کار جدید
    if (!isEditMode && !selectedUserId) {
      nextErrors.selectedUserId = "انتخاب کاربر برای ثبت کسب و کار الزامی است.";
    }

    if (!baseInfo.businessTitle.trim())
      nextErrors.businessTitle = "عنوان کسب و کار الزامی است.";
    if (!baseInfo.shortDescription.trim())
      nextErrors.shortDescription = "توضیح کوتاه الزامی است.";
    if (!baseInfo.about.trim())
      nextErrors.about = "درباره کسب و کار الزامی است.";
    if (!baseInfo.address.trim()) nextErrors.address = "آدرس الزامی است.";

    const hasSelectedImage = galleryItems.some(
      (item) => item.image || item.imagePreview || item.uploadedUrl,
    );

    if (!hasSelectedImage) nextErrors.gallery = "حداقل یک عکس باید انتخاب شود.";

    const pendingUpload = galleryItems.some(
      (item) => item.image && !item.uploadedUrl && item.uploading,
    );

    if (pendingUpload)
      nextErrors.gallery = "لطفا صبر کنید تا آپلود عکس‌ها کامل شود.";

    const uploadedImgs = galleryItems
      .filter((item) => item.uploadedUrl)
      .map((item) => ({
        url: item.uploadedUrl,
        title: item.title || "",
        alt: item.alt || "",
      }));

    if (hasSelectedImage && !pendingUpload && uploadedImgs.length === 0) {
      nextErrors.gallery = "حداقل یک عکس آپلود شده باید وجود داشته باشد.";
    }

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
          shortDescription: baseInfo.shortDescription,
          address: baseInfo.address,
          city: baseInfo.city,
          about: baseInfo.about,
          lat: position ? position.lat : null,
          lng: position ? position.lng : null,
          imgs: uploadedImgs,
          links: contactData.links || [],
          socials: contactData.socials || [],
          phones: contactData.phones || [],
          specs: specificationsData || [],
          banner: bannerItem?.imagePreview || null,
          category_ids: selectedCategories || []
        };

        const response = await setBusiness(payload);

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
          ownerId: selectedUserId,
          businessTitle: baseInfo.businessTitle,
          shortDescription: baseInfo.shortDescription,
          address: baseInfo.address,
          city: baseInfo.city,
          about: baseInfo.about,
          lat: position ? position.lat : null,
          lng: position ? position.lng : null,
          imgs: uploadedImgs,
          links: contactData.links || [],
          socials: contactData.socials || [],
          phones: contactData.phones || [],
          specs: specificationsData || [],
          banner: bannerItem?.imagePreview || null,
          category_ids: selectedCategories || []
        };

        const response = await setBusiness(payload);

        if (response?.msg === 0) {
          if (!isEditMode) {
            await syncBusinessesAfterCreate();
          }
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

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await getOwner();
      setUsers(usersData.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (open && !isEditMode) {
      fetchUsers();
    }
  }, [open, isEditMode]);

  // تبدیل لیست کاربران به فرمت استاندارد react-select
  const userOptions = Array.isArray(users)
    ? users.map((user) => {
      const fullName =
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        "نامشخص";
      return {
        value: user?.owner_id,
        label: `${fullName} (${user?.mobile || "بدون شماره"})`,
      };
    })
    : [];

  // پیدا کردن کاربر انتخاب شده فعلی برای نمایش در سلکت
  const currentUserOption =
    userOptions.find((option) => option.value === selectedUserId) || null;

  console.log(business);
  console.log(position);
  console.log(bannerItem);



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-0 w-full h-[100dvh] max-w-none max-h-none rounded-none border-0 bg-linear-to-b from-white via-slate-50 to-slate-100 p-0 pt-14 md:pt-12 sm:pt-0 overflow-hidden shadow-none sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:w-[90vw] sm:max-w-[90vw] md:w-[60vw] md:max-w-[70vw] lg:max-w-[1200px] sm:rounded-[1.5rem] sm:shadow-[0_30px_120px_rgba(15,23,42,0.22)]"
      >
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:py-6 custom-scrollbar"
        >
          {/* هدر مودال - مارجین بالا (mt) در موبایل حذف شده تا دقیقاً زیر منطقه امن قرار بگیرد */}
          <DialogHeader className="mb-6 sm:mb-8 rounded-[1.25rem] sm:rounded-[1.75rem] bg-slate-600 px-4 sm:px-5 py-4 sm:py-5 text-center sm:text-right text-white shadow-lg shadow-slate-900/10">
            <DialogTitle className="md:text-lg text-base font-black">
              {isEditMode ? "ویرایش کسب و کار" : "افزودن کسب و کار جدید"}
            </DialogTitle>
          </DialogHeader>

          {!isEditMode && (
            <div
              id="userSelectSection"
              className={`mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition-all ${errors.selectedUserId ? "border-red-300 ring-1 ring-red-100" : "border-slate-100 ring-1 ring-slate-900/5"
                }`}
            >
              <label className="block mb-2 sm:mb-3 text-base sm:text-base font-bold text-slate-700">
                انتخاب کاربر <span className="text-red-500">*</span>
              </label>

              <Select
                options={userOptions}
                value={currentUserOption}
                onChange={(option) => {
                  setSelectedUserId(option ? option.value : null);
                  // به محض انتخاب، ارور پاک شود
                  clearFieldErrors(['selectedUserId']);
                }}
                isLoading={isLoadingUsers}
                placeholder="-- یک کاربر را انتخاب کنید --"
                loadingMessage={() => "در حال بارگذاری کاربران..."}
                noOptionsMessage={() => "کاربری یافت نشد"}
                isClearable={true}
                isSearchable={true}
                dir="rtl"
                maxMenuHeight={220}
                className="text-sm"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: "#f8fafc",
                    borderColor: state.isFocused ? "#4f46e5" : errors.selectedUserId ? "#fca5a5" : "#e2e8f0",
                    borderRadius: "0.75rem",
                    padding: "1px 2px",
                    boxShadow: state.isFocused
                      ? "0 0 0 3px rgba(79, 70, 229, 0.1)"
                      : "none",
                    cursor: "pointer",
                    minHeight: "42px",
                    "&:hover": {
                      borderColor: state.isFocused ? "#4f46e5" : errors.selectedUserId ? "#ef4444" : "#cbd5e1",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #f1f5f9",
                    zIndex: 50,
                  }),
                  menuList: (base) => ({
                    ...base,
                    "::-webkit-scrollbar": { width: "5px" },
                    "::-webkit-scrollbar-track": { background: "#f1f5f9" },
                    "::-webkit-scrollbar-thumb": {
                      background: "#cbd5e1",
                      borderRadius: "4px",
                    },
                    "::-webkit-scrollbar-thumb:hover": {
                      background: "#94a3b8",
                    },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#4f46e5"
                      : state.isFocused
                        ? "#f1f5f9"
                        : "transparent",
                    color: state.isSelected ? "#ffffff" : "#334155",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    padding: "10px 14px",
                    "&:active": {
                      backgroundColor: "#4f46e5",
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#334155",
                    fontSize: "0.875rem",
                  }),
                }}
              />
              {/* نمایش ارور زیر فیلد در صورت عدم انتخاب */}
              {errors.selectedUserId && (
                <p className="text-[11px] sm:text-xs text-red-500 text-right mt-2 font-medium">
                  {errors.selectedUserId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4 sm:space-y-5">
            <BaseInfo
              showNameFields={false}
              businessTitle={baseInfo.businessTitle}
              shortDescription={baseInfo.shortDescription}
              about={baseInfo.about}
              address={baseInfo.address}
              city={baseInfo.city}
              position={position}        // <--- پاس دادن موقعیت فعلی
              setPosition={setPosition}  // <--- پاس دادن تابع تغییر موقعیت
              errors={errors}
              onInfoChange={(info) => {
                clearFieldErrors(Object.keys(info));
                setBaseInfo((prev) => ({
                  ...prev,
                  ...info,
                }));
              }}
            />
            <Category
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
              bannerItem={bannerItem}       // پاس دادن بنر
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
            />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 pb-6 sm:pb-0 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl bg-white px-5 py-4 sm:py-2.5 text-base sm:text-base font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:w-auto"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-xl bg-indigo-600 px-5 py-4 sm:py-2.5 text-base sm:text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 sm:w-auto"
            >
              {isEditMode ? "ذخیره تغییرات" : "ثبت کسب و کار"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}