import GoogleButton from "../../components/ui/GoogleButton";
import Reveal from "../../components/ui/Reveal";

type FinalCtaProps = {
  onSignIn: () => void;
};

export default function FinalCta({ onSignIn }: FinalCtaProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <Reveal>
        <div className="rounded-3xl bg-primary px-6 py-14 text-center shadow-card sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to run your shop the smart way?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Sign in with Google and your workspace is ready in seconds. Free to
            run, and yours to keep.
          </p>
          <div className="mt-8 flex justify-center">
            <GoogleButton
              onClick={onSignIn}
              variant="ghost"
              label="Get Started with Google"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
