"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/config";

function detectAppLink(appStoreUrl: string, googlePlayUrl: string): string {
  if (typeof navigator === "undefined") return appStoreUrl;
  return /android/i.test(navigator.userAgent) ? googlePlayUrl : appStoreUrl;
}

export function BookingLink({
  className,
  children,
  onClick,
  appStoreUrl = siteConfig.booking.appStore,
  googlePlayUrl = siteConfig.booking.googlePlay,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  appStoreUrl?: string;
  googlePlayUrl?: string;
}) {
  const [href, setHref] = useState<string>(appStoreUrl);

  useEffect(() => {
    setHref(detectAppLink(appStoreUrl, googlePlayUrl));
  }, [appStoreUrl, googlePlayUrl]);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  );
}
