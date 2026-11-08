import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Leaves of Kentucky — Artisan Copper Jewelry",
  description: "Handcrafted copper jewelry made from real leaves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
