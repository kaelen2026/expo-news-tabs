"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";

export function SessionIndicator() {
  const router = useRouter();
  const { data, isPending } = useSession();

  if (isPending) {
    return <span className="text-xs opacity-50">…</span>;
  }

  if (!data?.user) {
    return (
      <div className="flex gap-3 text-sm">
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
        <Link href="/sign-up" className="underline">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <span className="opacity-70">Signed in as {data.user.email}</span>
      <div className="flex items-center gap-3">
        <Link href="/favorites" className="underline">
          Favorites
        </Link>
        <Link href="/preferences" className="underline">
          Preferences
        </Link>
        <button
          type="button"
          className="underline"
          onClick={async () => {
            await authClient.signOut();
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
