import Hero from "./Hero";
import Features from "./Features";
import AutomationSpotlight from "./AutomationSpotlight";
import AssistantSpotlight from "./AssistantSpotlight";
import HowItWorks from "./HowItWorks";
import Faq from "./Faq";
import FinalCta from "./FinalCta";

type LandingPageProps = {
  onSignIn: () => void;
};

/** Public marketing page (the route shown to signed-out visitors). */
export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <main>
      <Hero onSignIn={onSignIn} />
      <Features />
      <AutomationSpotlight />
      <AssistantSpotlight />
      <HowItWorks />
      <Faq />
      <FinalCta onSignIn={onSignIn} />
    </main>
  );
}
