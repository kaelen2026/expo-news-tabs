"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AsyncState } from "../async-state";
import { trpc } from "../trpc-provider";

const THEMES = ["system", "light", "dark"] as const;
const FONT_SIZES = ["sm", "md", "lg"] as const;
const CATEGORIES = ["", "Local", "Science", "Business", "Culture", "Sports", "Tech"];

export default function PreferencesPage() {
  const session = useSession();
  const isAuthenticated = Boolean(session.data?.user);

  const query = trpc.preferences.get.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const update = trpc.preferences.update.useMutation({
    onSuccess: () => utils.preferences.get.invalidate(),
  });

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Preferences</h1>
        <p className="mt-4 opacity-70">
          You need to{" "}
          <Link href="/sign-in" className="underline">
            sign in
          </Link>{" "}
          to manage preferences.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Preferences</h1>
      <p className="mt-2 text-sm opacity-60">Synced across web and mobile.</p>

      <div className="mt-6">
        <AsyncState
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={query.error?.message}
          isEmpty={false}
          loadingLabel="Loading preferences…"
          onRetry={() => query.refetch()}
        >
          <div className="space-y-6">
            <fieldset>
              <legend className="text-sm font-medium opacity-80">Theme</legend>
              <div className="mt-2 flex gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    disabled={update.isPending}
                    onClick={() => update.mutate({ theme })}
                    className={`rounded-full border px-3 py-1 text-sm capitalize ${
                      query.data?.theme === theme
                        ? "border-black/40 bg-black/5 dark:border-white/40 dark:bg-white/10"
                        : "border-black/15 dark:border-white/15"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium opacity-80">Default category</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const value = cat === "" ? null : cat;
                  const active = (query.data?.defaultCategory ?? null) === value;
                  return (
                    <button
                      key={cat || "all"}
                      type="button"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ defaultCategory: value })}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        active
                          ? "border-black/40 bg-black/5 dark:border-white/40 dark:bg-white/10"
                          : "border-black/15 dark:border-white/15"
                      }`}
                    >
                      {cat || "All"}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium opacity-80">Font size</legend>
              <div className="mt-2 flex gap-2">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    disabled={update.isPending}
                    onClick={() => update.mutate({ fontSize: size })}
                    className={`rounded-full border px-3 py-1 text-sm uppercase ${
                      query.data?.fontSize === size
                        ? "border-black/40 bg-black/5 dark:border-white/40 dark:bg-white/10"
                        : "border-black/15 dark:border-white/15"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>

            {update.error && <p className="text-sm text-red-600">{update.error.message}</p>}
          </div>
        </AsyncState>
      </div>
    </main>
  );
}
