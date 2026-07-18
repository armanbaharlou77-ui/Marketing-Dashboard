"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { getBusiness } from "@/services/authService";

const ACTIVE_BUSINESS_STORAGE_KEY = "dashboard-activeBusiness";
const SYNC_AFTER_BACK_STORAGE_KEY = "dashboard-syncActiveBusinessAfterBack";

const ActiveBusinessContext = createContext(null);
const listeners = new Set();
let storageListenerAttached = false;
let storageHandler = null;
let popstateHandler = null;
let pageShowHandler = null;
let focusHandler = null;
let visibilityChangeHandler = null;

const readJson = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getUserBusinesses = (userInfo) => {
  if (Array.isArray(userInfo?.businesses)) {
    return userInfo.businesses;
  }

  if (Array.isArray(userInfo?.business)) {
    return userInfo.business;
  }

  return [];
};

const getSnapshot = () => {
  if (typeof window === "undefined") {
    return JSON.stringify({
      user: null,
      activeBusiness: null,
    });
  }

  return JSON.stringify({
    user: localStorage.getItem("dashboard-user"),
    activeBusiness: localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY),
  });
};

const clearPendingBackSync = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (sessionStorage.getItem(SYNC_AFTER_BACK_STORAGE_KEY)) {
    sessionStorage.removeItem(SYNC_AFTER_BACK_STORAGE_KEY);
    emitChange();
  }
};

const getServerSnapshot = () =>
  JSON.stringify({
    user: null,
    activeBusiness: null,
  });

const deriveData = (snapshot) => {
  const parsedSnapshot = readJson(snapshot) || {};
  const userInfo = readJson(parsedSnapshot.user);
  const storedBusiness = readJson(parsedSnapshot.activeBusiness);
  const businesses = getUserBusinesses(userInfo);

  if (storedBusiness?.id != null) {
    const matchedBusiness = businesses.find(
      (business) => String(business?.id) === String(storedBusiness.id)
    );

    return {
      activeBusiness: matchedBusiness || storedBusiness,
      businesses,
      userInfo,
    };
  }

  return {
    activeBusiness: businesses[0] || null,
    businesses,
    userInfo,
  };
};

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const ensureStorageListener = () => {
  if (typeof window === "undefined" || storageListenerAttached) {
    return;
  }

  const syncFromStorage = () => {
    clearPendingBackSync();
    emitChange();
  };

  storageHandler = (event) => {
    if (
      event.key === ACTIVE_BUSINESS_STORAGE_KEY ||
      event.key === "user" ||
      event.key === null
    ) {
      syncFromStorage();
    }
  };

  popstateHandler = syncFromStorage;
  pageShowHandler = syncFromStorage;
  focusHandler = syncFromStorage;
  visibilityChangeHandler = () => {
    if (document.visibilityState === "visible") {
      syncFromStorage();
    }
  };

  window.addEventListener("storage", storageHandler);
  window.addEventListener("popstate", popstateHandler);
  window.addEventListener("pageshow", pageShowHandler);
  window.addEventListener("focus", focusHandler);
  document.addEventListener("visibilitychange", visibilityChangeHandler);
  storageListenerAttached = true;
};

const teardownStorageListener = () => {
  if (typeof window === "undefined" || !storageListenerAttached) {
    return;
  }

  if (storageHandler) {
    window.removeEventListener("storage", storageHandler);
  }

  if (popstateHandler) {
    window.removeEventListener("popstate", popstateHandler);
  }

  if (pageShowHandler) {
    window.removeEventListener("pageshow", pageShowHandler);
  }

  if (focusHandler) {
    window.removeEventListener("focus", focusHandler);
  }

  if (visibilityChangeHandler) {
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
  }

  storageListenerAttached = false;
  storageHandler = null;
  popstateHandler = null;
  pageShowHandler = null;
  focusHandler = null;
  visibilityChangeHandler = null;
};

const subscribe = (listener) => {
  listeners.add(listener);
  ensureStorageListener();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      teardownStorageListener();
    }
  };
};

export function ActiveBusinessProvider({ children }) {
  const pathname = usePathname();
  const [apiBusinesses, setApiBusinesses] = useState([]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { activeBusiness: storedActiveBusiness, businesses: localBusinesses, userInfo } = useMemo(
    () => deriveData(snapshot),
    [snapshot]
  );

  const businesses = apiBusinesses.length ? apiBusinesses : localBusinesses;
  const activeBusiness = useMemo(() => {
    if (storedActiveBusiness?.id != null) {
      const matchedBusiness = businesses.find(
        (business) => String(business?.id) === String(storedActiveBusiness.id)
      );

      return matchedBusiness || storedActiveBusiness;
    }

    return businesses[0] || null;
  }, [storedActiveBusiness, businesses]);

  useEffect(() => {
    const loadBusinesses = async () => {
      if (!userInfo?.owner_id) {
        setApiBusinesses([]);
        return;
      }

      try {
        const response = await getBusiness(userInfo.owner_id);
        const items = Array.isArray(response?.businesses)
          ? response.businesses
          : [];

        setApiBusinesses(items);
      } catch {
        setApiBusinesses([]);
      }
    };

    loadBusinesses();
  }, [userInfo?.owner_id]);

  useEffect(() => {
    clearPendingBackSync();
    emitChange();
  }, [pathname]);

  const setActiveBusiness = (business) => {
    if (typeof window === "undefined") {
      return;
    }

    if (business) {
      localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, JSON.stringify(business));

      // ✅ راهکار اصلی: آپدیت کردن استیت سروری برای اعمال آنی و بدون رفرش در سراسر پروژه
      setApiBusinesses((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) return [business];
        return prev.map((item) =>
          String(item?.id) === String(business.id) ? business : item
        );
      });

    } else {
      localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
    }

    emitChange();
  };

  const value = useMemo(
    () => ({
      activeBusiness,
      businesses,
      userInfo,
      setActiveBusiness,
      setApiBusinesses, // 👈 این خط را اضافه کنید تا در کل پروژه در دسترس باشد
    }),
    [activeBusiness, businesses, userInfo]
  );

  return (
    <ActiveBusinessContext.Provider value={value}>
      {children}
    </ActiveBusinessContext.Provider>
  );
}

export function useActiveBusiness() {
  const context = useContext(ActiveBusinessContext);

  if (!context) {
    throw new Error("useActiveBusiness must be used within ActiveBusinessProvider");
  }

  return context;
}
