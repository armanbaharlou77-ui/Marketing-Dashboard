import Sidebar from "@/components/navs/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-linear-to-bl from-slate-100 via-white to-indigo-50 md:flex">
      <Sidebar />
      <main className="mx-auto w-full max-w-300 flex-1 px-4 py-5 sm:px-6 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
