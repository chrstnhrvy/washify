import { lazy, Suspense, useCallback } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./features/landing/LandingPage";

// Chat widget is below the fold and pulls in the n8n client — load it lazily
// so it stays out of the initial bundle.
const ChatWidget = lazy(() => import("./features/faq-chat/ChatWidget"));

export default function App() {
  // Placeholder for Supabase Google OAuth (wired in src/features/auth, phase 2).
  const handleSignIn = useCallback(() => {
    alert("Google sign-in is coming in the next build phase.");
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
