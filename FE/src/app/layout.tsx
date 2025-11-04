import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EV Share - Chia sẻ xe điện, Chia sẻ tương lai",
  description: "Nền tảng kết nối những người yêu thích xe điện, tạo nhóm đồng sở hữu và chia sẻ trải nghiệm xanh, bền vững",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
