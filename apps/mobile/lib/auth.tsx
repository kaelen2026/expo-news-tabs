import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const TOKEN_KEY = "expo-news-tabs.session_token";

type MobileUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
};

type AuthState = {
  token: string | null;
  user: MobileUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { email: string; password: string; name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (debuggerHost) return `http://${debuggerHost}:3001`;
  return "http://localhost:3001";
}

// Read the bearer token synchronously from SecureStore between renders so the
// tRPC link can attach the Authorization header. We mirror the value in a
// module-level variable so non-React callers can access it.
let currentToken: string | null = null;
export function getCurrentAuthToken() {
  return currentToken;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const apiUrl = useMemo(() => resolveApiUrl(), []);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistToken = useCallback(async (nextToken: string | null) => {
    currentToken = nextToken;
    setTokenState(nextToken);
    if (nextToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  }, []);

  const fetchSession = useCallback(
    async (rawToken: string | null) => {
      if (!rawToken) {
        setUser(null);
        return;
      }
      const res = await fetch(`${apiUrl}/auth/get-session`, {
        headers: { Authorization: `Bearer ${rawToken}` },
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json().catch(() => null);
      const u = data?.user as MobileUser | undefined;
      setUser(u ?? null);
    },
    [apiUrl],
  );

  // On mount: rehydrate token from SecureStore + revalidate against the API.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (cancelled) return;
        currentToken = stored;
        setTokenState(stored);
        await fetchSession(stored);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchSession]);

  const handleResponse = useCallback(
    async (res: Response, fallback: string) => {
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message ?? body?.error?.message ?? body?.error ?? res.statusText ?? fallback;
        throw new Error(String(message));
      }
      // better-auth's bearer plugin returns the session token via this header.
      const nextToken = res.headers.get("set-auth-token") ?? res.headers.get("Set-Auth-Token");
      if (!nextToken) {
        throw new Error("Auth response did not include a session token");
      }
      await persistToken(nextToken);
      await fetchSession(nextToken);
    },
    [fetchSession, persistToken],
  );

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch(`${apiUrl}/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      await handleResponse(res, "Sign in failed");
    },
    [apiUrl, handleResponse],
  );

  const signUp = useCallback(
    async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const res = await fetch(`${apiUrl}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      await handleResponse(res, "Sign up failed");
    },
    [apiUrl, handleResponse],
  );

  const signOut = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${apiUrl}/auth/sign-out`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      await persistToken(null);
      setUser(null);
    }
  }, [apiUrl, persistToken, token]);

  const refresh = useCallback(() => fetchSession(token), [fetchSession, token]);

  const value: AuthContextValue = {
    token,
    user,
    isLoading,
    isAuthenticated: Boolean(user && token),
    signIn,
    signUp,
    signOut,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
