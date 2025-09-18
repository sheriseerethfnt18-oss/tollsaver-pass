import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
};

export default Layout;