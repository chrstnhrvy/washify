import GoogleButton from "../../components/ui/GoogleButton";
import AppMockup from "./AppMockup";
import { useInView } from "../../hooks/useInView";

type HeroProps = {
  onSignIn: () => void;
};

export default function Hero({ onSignIn }: HeroProps) {
  const { ref, inView } = useInView<HTMLElement>(0);
  const show = inView ? "reveal-in" : "";

  return (
    <section
      id="top"
      ref={ref}
      className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24"
    >
      <div>
        <span
          className={`reveal ${show} inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-dark`}
          style={{ transitionDelay: "0ms" }}
        >
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          Built for local laundry shops
        </span>
        <h1
          className={`reveal ${show} mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl`}
          style={{ transitionDelay: "80ms" }}
        >
          Run your laundry shop,
          <span className="text-primary"> the smart way.</span>
        </h1>
        <p
          className={`reveal ${show} mt-5 max-w-prose text-lg text-muted`}
          style={{ transitionDelay: "160ms" }}
        >
          Track every order, text customers the moment their laundry is done,
          and watch your sales add up, all from one clean dashboard. Sign in
          with Google and your shop is ready in seconds.
        </p>
        <div
          className={`reveal ${show} mt-8 flex flex-wrap items-center gap-3`}
          style={{ transitionDelay: "240ms" }}
        >
          <GoogleButton onClick={onSignIn} label="Get Started with Google" />
          <a
            href="#how-it-works"
            className="inline-flex min-h-[44px] items-center rounded-xl px-4 text-base font-semibold text-ink transition-colors hover:text-primary-dark"
          >
            See how it works →
          </a>
        </div>
        <p
          className={`reveal ${show} mt-4 text-sm text-muted`}
          style={{ transitionDelay: "320ms" }}
        >
          Free to run on free tiers. Your data stays yours.
        </p>
      </div>

      <div className={`reveal ${show}`} style={{ transitionDelay: "200ms" }}>
        <AppMockup />
      </div>
    </section>
  );
}
