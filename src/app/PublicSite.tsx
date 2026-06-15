import { lazy, Suspense, useCallback } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LandingPage from "../features/landing/LandingPage";
import { signInWithGoogle } from "../features/auth/actions";

// Below the fold and pulls in the n8n client — load it lazily.
const ChatWidget = lazy(() => import("../features/faq-chat/ChatWidget"));

/** The public marketing site (route "/"). */
export default function PublicSite() {
  const handleSignIn = useCallback(() => {
    void signInWithGoogle();
  }, []);

  return (
    <>
      <a
        href="#features"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar onSignIn={handleSignIn} />
      <LandingPage onSignIn={handleSignIn} />
      <Footer />
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </>
  );
}
