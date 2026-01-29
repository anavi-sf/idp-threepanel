"use client";

import { useState } from "react";
import "./globals.css";
import {
  Cloud,
  Search,
  HelpCircle,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isBuilderPage = pathname?.startsWith("/builder");

  // If we're on the builder page, render without the main layout
  if (isBuilderPage) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          {/* Main Header */}
          <header className="h-12 bg-[#0176D3] text-white flex items-center px-4 justify-between fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-3">
              <Cloud className="w-6 h-6" />
              <span className="font-semibold text-sm">Setup</span>
            </div>
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                <input
                  type="text"
                  placeholder="Search Setup..."
                  className="w-full bg-white/20 border border-white/30 rounded pl-10 pr-4 py-1.5 text-sm placeholder:text-white/70 focus:outline-none focus:bg-white/30"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <HelpCircle className="w-5 h-5 cursor-pointer hover:opacity-80" />
              <Settings className="w-5 h-5 cursor-pointer hover:opacity-80" />
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            </div>
          </header>

          {/* Sub Header - Tabs */}
          <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 fixed top-12 left-0 right-0 z-40">
            <button className="px-4 py-2 text-sm font-medium text-[#0176D3] border-b-2 border-[#0176D3]">
              Home
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
              Object Manager
            </button>
          </div>

          <div className="flex pt-[88px]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="ml-[250px] flex-1 bg-[#F3F3F3] min-h-[calc(100vh-88px)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "feature-settings": true,
    "health-cloud": true,
  });

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-[250px] bg-white border-r border-gray-200 fixed left-0 top-[88px] bottom-0 overflow-y-auto">
      <div className="p-3">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Intelligent Document Proce"
            className="w-full border border-gray-300 rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#0176D3]"
            defaultValue="Intelligent Document Proce"
          />
        </div>

        {/* Tree View */}
        <div className="text-sm">
          {/* Feature Settings */}
          <div
            className="flex items-center gap-1 py-1.5 px-2 cursor-pointer hover:bg-gray-50 rounded"
            onClick={() => toggleItem("feature-settings")}
          >
            {expandedItems["feature-settings"] ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-gray-700">Feature Settings</span>
          </div>

          {expandedItems["feature-settings"] && (
            <div className="ml-4">
              {/* Health Cloud */}
              <div
                className="flex items-center gap-1 py-1.5 px-2 cursor-pointer hover:bg-gray-50 rounded"
                onClick={() => toggleItem("health-cloud")}
              >
                {expandedItems["health-cloud"] ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-gray-700">Health Cloud</span>
              </div>

              {expandedItems["health-cloud"] && (
                <div className="ml-4">
                  <Link href="/">
                    <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-[#e8f4fd] text-[#0176D3] font-medium cursor-pointer">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">
                        Intelligent Document Processing
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom text */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Didn&apos;t find what you&apos;re looking for?</p>
          <p className="text-[#0176D3] cursor-pointer hover:underline mt-1">
            Try using Global Search.
          </p>
        </div>
      </div>
    </aside>
  );
}
