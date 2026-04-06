import Link from "next/link";
import { cookies } from "next/headers";

const featureCards = [
  {
    title: "Find Books Faster",
    description:
      "Filter by genre, tag, year, and author to cut through the noise and find your next read.",
  },
  {
    title: "Curate Collections",
    description:
      "Build personal shelves, share lists with friends, and keep your reading world organized.",
  },
  {
    title: "Track Real Progress",
    description:
      "Reviews, ratings, and reading status stay in one place so your recommendations improve over time.",
  },
];

export default async function LandingPage() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("pagepal_session")?.value);

  return (
    <main className="min-h-screen bg-bg text-text">
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--color-primary) 22%, transparent) 0, transparent 45%), radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--color-accent) 24%, transparent) 0, transparent 42%), linear-gradient(160deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 75%, var(--color-surface)) 100%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-16 pt-6 sm:px-8 lg:pb-20 lg:pt-8">
          <header className="flex items-center justify-between">
            <p className="wordmark text-[24px]">PagePal</p>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-primary hover:text-text"
              >
                Sign in
              </Link>
              <Link
                href={hasSession ? "/home" : "/register"}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-primary-hover"
              >
                {hasSession ? "Go to Home" : "Create account"}
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-[0.12em] text-text-muted">
                Social Reading, Rebuilt
              </p>
              <h1 className="serif-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Discover, organize, and share your reading life.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
                PagePal blends recommendations, shelves, reviews, and social discovery
                into one calm place that feels personal on mobile and desktop.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={hasSession ? "/home" : "/register"}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-primary-hover"
                >
                  {hasSession ? "Open my home" : "Start with PagePal"}
                </Link>
                <Link
                  href="/discover"
                  className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-primary"
                >
                  Explore discover page
                </Link>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-5">
              <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                <p className="section-kicker">Live Snapshot</p>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-text-muted">
                      Shelf Momentum
                    </p>
                    <p className="serif-display mt-1 text-xl">12 books this month</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-text-muted">
                      Friend Activity
                    </p>
                    <p className="serif-display mt-1 text-xl">8 fresh reviews today</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-text-muted">
                      Recommendation Pulse
                    </p>
                    <p className="serif-display mt-1 text-xl">Score-ranked picks</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <h2 className="serif-display text-2xl">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-text-muted">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}