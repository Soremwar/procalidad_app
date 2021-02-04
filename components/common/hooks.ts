import { useEffect, useRef } from "react";

export function useMountReference() {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => (mounted.current = false);
  });

  return mounted;
}
