import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";

type LandingPageProps = {
  onSignIn: () => void;
};

/** Public marketing page (the route shown to signed-out visitors). */
export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <main>
      <Hero onSignIn={onSignIn} />
      <Features />
      <HowItWorks />
    </main>
  );
}
