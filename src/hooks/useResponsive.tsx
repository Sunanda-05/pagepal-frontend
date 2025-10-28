import { useEffect, useState, useMemo } from "react";

const useWindowWidth = () => {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

const useIsMobile = () => {
  const width = useWindowWidth();
  return useMemo(() => width < 768, [width]);
};

const useIsTablet = () => {
  const width = useWindowWidth();
  return useMemo(() => width >= 768 && width < 1024, [width]);
};

const useIsDesktop = () => {
  const width = useWindowWidth();
  return useMemo(() => width >= 1024, [width]);
};

export { useWindowWidth, useIsMobile, useIsTablet, useIsDesktop };
