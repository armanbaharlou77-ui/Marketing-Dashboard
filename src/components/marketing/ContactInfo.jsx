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
        socials[key] = item?.value ?? item?.url ?? item?.link ?? item?.handle ?? "";
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
      icon: <BsTelegram className="h-6 w-6" color="#0088cc" />,
    },
    {
      id: "whatsapp",
      label: "واتساپ",
      icon: <BsWhatsapp className="h-6 w-6" color="#25D366" />,
    },
    {
      id: "instagram",
      label: "اینستاگرام",
      icon: <BsInstagram className="h-6 w-6" color="#E1306C" />,
    },
    {
      id: "eitaa",
      label: "ایتا",
      icon: (
        <img
          className="h-6 w-6"
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
          className="h-6 w-6"
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
    <div className="mt-8 h-fit w-full rounded-xl border border-gray-300 bg-slate-100 md:p-6 p-4 shadow-lg">
      <h1 className="w-fit border-b-2 border-blue-400 text-lg font-bold md:text-2xl">
        اطلاعات تماس
      </h1>
      <p className="my-4 mb-10 text-md text-gray-500 md:text-xl">
        شماره تماس، لینک ها و شبکه های اجتماعی کسب و کار را وارد کنید
      </p>

      <div className="space-y-8">

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold md:text-xl">شماره ها</h2>
          </div>

          <div className="space-y-4">
            {phoneItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-300 bg-white/70 p-4 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    شماره {item.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhone(item.id)}
                    className="rounded-xl p-1 text-sm text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2Icon />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-md font-medium text-gray-700">
                      عنوان
                    </label>
                    <input
                      className="mt-2 h-12 w-full rounded-xl border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        handlePhoneChange(item.id, "title", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-md font-medium text-gray-700">
                      شماره تماس
                    </label>
                    <input
                      className="mt-2 h-12 w-full rounded-xl border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      style={{ direction: "ltr" }}
                      value={item.number}
                      onChange={(event) =>
                        handlePhoneChange(item.id, "number", event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPhone}
            className="my-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 py-3 text-blue-600 transition-colors hover:bg-blue-100"
          >
            <span className="text-xl leading-none">+</span>
            <span>افزودن شماره جدید</span>
          </button>
        </section>

        <div className="my-12 h-0.5 w-full bg-black/50" />


        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold md:text-xl">لینک ها</h2>
          </div>

          <div className="space-y-4">
            {linkItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-300 bg-white/70 p-4 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    لینک {item.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(item.id)}
                    className="rounded-xl p-1 text-sm text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2Icon />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-md font-medium text-gray-700">
                      عنوان
                    </label>
                    <input
                      className="mt-2 h-12 w-full rounded-xl border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={item.title}
                      onChange={(event) =>
                        handleLinkChange(item.id, "title", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-md font-medium text-gray-700">
                      آدرس لینک
                    </label>
                    <input
                      className="mt-2 h-12 w-full rounded-xl border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      style={{ direction: "ltr" }}
                      value={item.url}
                      onChange={(event) =>
                        handleLinkChange(item.id, "url", event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddLink}
            className="my-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 py-3 text-blue-600 transition-colors hover:bg-blue-100"
          >
            <span className="text-xl leading-none">+</span>
            <span>افزودن لینک جدید</span>
          </button>
        </section>

        <div className="my-12 h-0.5 w-full bg-black/50" />

        <section className="space-y-6">
          <h2 className="text-lg font-semibold md:text-xl">
            شبکه های اجتماعی
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {socialNetworks.map((network) => (
              <div key={network.id} className="relative mt-2 w-full">

                <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center">
                  {network.icon}
                </div>


                <input
                  id={network.id}
                  className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-4 pr-12 pt-1 text-left shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  type="text"
                  style={{ direction: "ltr" }}
                  placeholder={`@example`}
                  value={socialMedia[network.id]}
                  onChange={(event) =>
                    handleSocialChange(network.id, event.target.value)
                  }
                />


                <label
                  htmlFor={network.id}
                  className="absolute -top-3 right-4 bg-white px-2 text-sm font-medium text-gray-600"
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
