import GoogleButton from "../../components/ui/GoogleButton";
import AppMockup from "./AppMockup";

type HeroProps = {
  onSignIn: () => void;
};

export default function Hero({ onSignIn }: HeroProps) {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24"
    >
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-dark">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          Multi-shop laundry SaaS
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          Run your laundry shop,
          <span className="text-primary"> the smart way.</span>
        </h1>
        <p className="mt-5 max-w-prose text-lg text-muted">
          Track every order, text customers the moment their laundry is done,
          and watch your sales add up — all from one clean dashboard. Sign in
          with Google and your shop is ready in seconds.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <GoogleButton onClick={onSignIn} label="Get Started with Google" />
          <a
            href="#how-it-works"
            className="inline-flex min-h-[44px] items-center rounded-xl px-4 text-base font-semibold text-ink transition-colors hover:text-primary-dark"
          >
            See how it works →
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">
          Free to run · no credit card · your data stays yours.
        </p>
      </div>
      <AppMockup />
    </section>
  );
}
