import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./Navbar";
import Footer from "./Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hasan Biyik - Portfolio",
  description:
    "Explore my work in software development, web technologies, and programming languages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <Navbar />
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
