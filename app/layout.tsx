import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "BLVΞ Command Center",
  description: "BLVΞ Routing + Attribution Engine",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body
        className="bg-[#0B0E11] text-white antialiased min-h-screen flex"
        style={{
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* This flex wrapper allows admin layout to control centering */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
