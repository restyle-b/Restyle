"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/config";

function detectAppLink(): string {
  if (typeof navigator === "undefined") return siteConfig.booking.appStore;
  return /android/i.test(navigator.userAgent) ? siteConfig.booking.googlePlay : siteConfig.booking.appStore;
}

export function BookingLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [href, setHref] = useState<string>(siteConfig.booking.appStore);

  useEffect(() => {
    setHref(detectAppLink());
  }, []);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
