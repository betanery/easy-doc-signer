import { useState, useEffect } from "react";
import { TOKEN_KEY } from "@/lib/trpc";

export function useToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
  }, []);

  return token;
}
