import Cookies from "js-cookie";
import { toast } from "react-toastify";

export function clearAuthSession() {
  Cookies.remove("owner-token", { path: "/" });

  if (typeof window === "undefined") return;

  localStorage.clear();
  sessionStorage.clear();
}

let isHandlingExpiry = false;

export function handleTokenExpired(message) {
  if (typeof window === "undefined") return;
  if (isHandlingExpiry) return;

  isHandlingExpiry = true;
  clearAuthSession();
  toast.error(message || "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");

  setTimeout(() => {
    window.location.replace("/login");
  }, 1200);
}
