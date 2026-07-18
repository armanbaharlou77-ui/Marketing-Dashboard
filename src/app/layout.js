import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ActiveBusinessProvider } from "@/components/providers/ActiveBusinessProvider";

export const metadata = {
  title: "Kasb o kar Dashboard",
  description: "kasb o kar manoshahr",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <ActiveBusinessProvider>
        <body className="min-h-full flex flex-col">
          {children}
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={true}
            rtl={true}
            pauseOnFocusLoss={true}
            draggable={true}
            pauseOnHover={true}
            limit={3}
            className="w-full max-w-[90vw] sm:max-w-sm mx-auto p-0"
            toastClassName="relative text-right flex p-1 min-h-10 rounded-2xl sm:mt-2 mt-5  overflow-hidden cursor-pointer mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            bodyClassName="text-sm font-semibold text-right flex items-center justify-start w-full p-2 m-0"
          />
        </body>
      </ActiveBusinessProvider>
    </html>
  );
}
