"use client";

import { useEffect, useState } from "react";

/** False on the server and on the client's first paint — avoids hydration mismatches. */
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
