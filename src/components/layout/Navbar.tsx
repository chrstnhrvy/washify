import Logo from "../ui/Logo";
import GoogleButton from "../ui/GoogleButton";

type NavbarProps = {
  onSignIn: () => void;
};

/** Sticky top navigation: logo left, Log in + Get Started right. */
export default function Navbar({ onSignIn }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-bg/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <a href="#top" className="flex items-center" aria-label="Washify home">
          <Logo />
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="min-h-[44px] rounded-xl px-3 text-base font-semibold text-muted transition-colors hover:text-ink"
          >
            Log in
          </button>
          <GoogleButton onClick={onSignIn} label="Get Started" />
        </div>
      </nav>
    </header>
  );
}
