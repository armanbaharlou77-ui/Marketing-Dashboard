"use client";

import React, { useEffect, useState } from "react";
import { BsTelegram, BsWhatsapp, BsInstagram } from "react-icons/bs";
import { Trash2Icon } from "lucide-react";

const emptyPhoneItem = (id) => ({
  id,
  title: "",
  number: "",
});

const emptyLinkItem = (id) => ({
  id,
  title: "",
  url: "",
});

const createDefaultSocials = () => ({
  telegram: "",
  whatsapp: "",
  instagram: "",
  eitaa: "",
  bale: "",
});

const normalizePhoneItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [emptyPhoneItem(1)];
  }

  return items.map((item, index) => ({
    id: item?.id ?? index + 1,
    title: item?.title ?? item?.name ?? item?.label ?? "",
    number: item?.number ?? item?.phone ?? item?.value ?? "",
  }));
};

const normalizeLinkItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [emptyLinkItem(1)];
  }

  return items.map((item, index) => ({
    id: item?.id ?? index + 1,
    title: item?.title ?? item?.name ?? item?.label ?? "",
    url: item?.url ?? item?.link ?? item?.value ?? "",
  }));
};

const normalizeSocials = (items) => {
  const socials = createDefaultSocials();

  if (Array.isArray(items)) {
    items.forEach((item) => {
      const key = item?.id || item?.name || item?.platform;
      if (key && Object.prototype.hasOwnProperty.call(socials, key)) {
        socials[key] =
          item?.value ?? item?.url ?? item?.link ?? item?.handle ?? "";
      }
    });
    return socials;
  }

  if (items && typeof items === "object") {
    return {
      ...socials,
      ...Object.fromEntries(
        Object.entries(items).filter(([key]) =>
          Object.prototype.hasOwnProperty.call(socials, key)
        )
      ),
    };
  }

  return socials;
};

const inputClass =
  "h-12 w-full rounded-xl border border-gray-300 bg-white p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const addButtonClass =
  "my-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 px-3 py-3 text-sm text-blue-600 transition-colors hover:bg-blue-100 md:my-6 md:text-base";

export default function ContactInfo({
  initialPhoneItems,
  initialLinkItems,
  initialSocialMedia,
  onContactChange,
}) {
  const [phoneItems, setPhoneItems] = useState(() =>
    normalizePhoneItems(initialPhoneItems)
  );
  const [linkItems, setLinkItems] = useState(() =>
    normalizeLinkItems(initialLinkItems)
  );
  const [socialMedia, setSocialMedia] = useState(() =>
    normalizeSocials(initialSocialMedia)
  );

  const handlePhoneChange = (id, field, value) => {
    setPhoneItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleLinkChange = (id, field, value) => {
    setLinkItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddPhone = () => {
    setPhoneItems((prev) => [...prev, emptyPhoneItem(prev.length + 1)]);
  };

  const handleAddLink = () => {
    setLinkItems((prev) => [...prev, emptyLinkItem(prev.length + 1)]);
  };

  const handleRemovePhone = (id) => {
    setPhoneItems((prev) => {
      const updatedItems = prev.filter((item) => item.id !== id);
      if (updatedItems.length > 0) return updatedItems;
      return [emptyPhoneItem(1)];
    });
  };

  const handleRemoveLink = (id) => {
    setLinkItems((prev) => {
      const updatedItems = prev.filter((item) => item.id !== id);
      if (updatedItems.length > 0) return updatedItems;
      return [emptyLinkItem(1)];
    });
  };

  const handleSocialChange = (field, value) => {
    setSocialMedia((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const socialNetworks = [
    {
      id: "telegram",
      label: "تلگرام",
      icon: <BsTelegram className="h-5 w-5 sm:h-6 sm:w-6" color="#0088cc" />,
    },
    {
      id: "whatsapp",
      label: "واتساپ",
      icon: <BsWhatsapp className="h-5 w-5 sm:h-6 sm:w-6" color="#25D366" />,
    },
    {
      id: "instagram",
      label: "اینستاگرام",
      icon: <BsInstagram className="h-5 w-5 sm:h-6 sm:w-6" color="#E1306C" />,
    },
    {
      id: "eitaa",
      label: "ایتا",
      icon: (
        <img
          className="h-5 w-5 sm:h-6 sm:w-6"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxy5f8Ql9-UCh3yLRJKRx3MNOULqcorae4LA&s"
          alt="ایتا"
        />
      ),
    },
    {
      id: "bale",
      label: "بله",
      icon: (
        <img
          className="h-5 w-5 sm:h-6 sm:w-6"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRehIY4zFEGTMvAc2McYlvBVfVb6HJQnRqrGA&s"
          alt="بله"
        />
      ),
    },
  ];

  useEffect(() => {
    if (typeof onContactChange !== "function") {
      return;
    }

    onContactChange({
      phones: phoneItems.map((item) => ({
        id: item.id,
        title: item.title,
        number: item.number,
      })),
      links: linkItems.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
      })),
      socials: Object.entries(socialMedia).map(([key, value]) => ({
        id: key,
        value,
      })),
    });
  }, [phoneItems, linkItems, socialMedia, onContactChange]);

  return (
    <div className="mt-8 h-fit w-full rounded-xl border border-gray-300 bg-slate-100 p-3 shadow-lg sm:p-4 md:p-6">
      <h1 className="w-fit border-b-2 border-blue-400 text-lg font-bold md:text-2xl">
        اطلاعات تماس
      </h1>
      <p className="my-3 mb-6 text-sm text-gray-500 md:my-4 md:mb-10 md:text-xl">
        شماره تماس، لینک‌ها و شبکه‌های اجتماعی کسب‌وکار را وارد کنید
      </p>

      <div className="space-y-6 md:space-y-8">
        <section className="space-y-3 md:space-y-4">
          <h2 className="text-base font-semibold md:text-xl">شماره‌ها</h2>

          <div className="space-y-3 rounded-2xl border border-gray-300 bg-white/70 p-3 shadow-sm sm:p-4">
            <div className="hidden grid-cols-2 gap-3 md:grid">
              <span className="text-base font-medium text-gray-600">عنوان</span>
              <span className="text-base font-medium text-gray-600">
                شماره تماس
              </span>
            </div>

            <div className="space-y-3">
              {phoneItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-end md:gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <label className="text-sm font-medium text-gray-600 md:hidden">
                      عنوان
                    </label>
                    <input
                      className={inputClass}
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        handlePhoneChange(item.id, "title", event.target.value)
                      }
                    />
                  </div>

                  <div className="flex min-w-0 items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <label className="text-sm font-medium text-gray-600 md:hidden">
                        شماره تماس
                      </label>
                      <input
                        className={inputClass}
                        type="tel"
                        inputMode="tel"
                        dir="ltr"
                        value={item.number}
                        onChange={(event) =>
                          handlePhoneChange(
                            item.id,
                            "number",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(item.id)}
                      aria-label="حذف شماره"
                      className="mb-0.5 shrink-0 rounded-xl p-2 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddPhone}
            className={addButtonClass}
          >
            <span className="text-xl leading-none">+</span>
            <span>افزودن شماره جدید</span>
          </button>
        </section>

        <div className="h-px w-full bg-gray-300 md:my-4 md:h-0.5 md:bg-black/50" />

        <section className="space-y-3 md:space-y-4">
          <h2 className="text-base font-semibold md:text-xl">لینک‌ها</h2>

          <div className="space-y-3 rounded-2xl border border-gray-300 bg-white/70 p-3 shadow-sm sm:p-4">
            <div className="hidden grid-cols-2 gap-3 md:grid">
              <span className="text-base font-medium text-gray-600">عنوان</span>
              <span className="text-base font-medium text-gray-600">
                آدرس لینک
              </span>
            </div>

            <div className="space-y-3">
              {linkItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-2 md:grid-cols-2 md:items-end md:gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <label className="text-sm font-medium text-gray-600 md:hidden">
                      عنوان
                    </label>
                    <input
                      className={inputClass}
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        handleLinkChange(item.id, "title", event.target.value)
                      }
                    />
                  </div>

                  <div className="flex min-w-0 items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <label className="text-sm font-medium text-gray-600 md:hidden">
                        آدرس لینک
                      </label>
                      <input
                        className={inputClass}
                        type="url"
                        inputMode="url"
                        dir="ltr"
                        value={item.url}
                        onChange={(event) =>
                          handleLinkChange(item.id, "url", event.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(item.id)}
                      aria-label="حذف لینک"
                      className="mb-0.5 shrink-0 rounded-xl p-2 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddLink}
            className={addButtonClass}
          >
            <span className="text-xl leading-none">+</span>
            <span>افزودن لینک جدید</span>
          </button>
        </section>

        <div className="h-px w-full bg-gray-300 md:my-4 md:h-0.5 md:bg-black/50" />

        <section className="space-y-4 md:space-y-6">
          <h2 className="text-base font-semibold md:text-xl">
            شبکه‌های اجتماعی
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {socialNetworks.map((network) => (
              <div key={network.id} className="relative mt-2 w-full">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center sm:w-12">
                  {network.icon}
                </div>

                <input
                  id={network.id}
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-3 pr-11 text-left shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:h-14 sm:pl-4 sm:pr-12"
                  type="text"
                  dir="ltr"
                  placeholder="@example"
                  value={socialMedia[network.id]}
                  onChange={(event) =>
                    handleSocialChange(network.id, event.target.value)
                  }
                />

                <label
                  htmlFor={network.id}
                  className="absolute -top-2.5 right-3 bg-slate-100 px-1.5 text-xs font-medium text-gray-600 sm:right-4 sm:px-2 sm:text-sm"
                >
                  {network.label}
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
