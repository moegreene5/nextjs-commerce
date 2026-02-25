"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiFacebook, FiLink, FiShare2, FiTwitter } from "react-icons/fi";

type ShareLinksProps = {
  title: string;
  url: string;
};

export function ShareLinks({ title, url }: ShareLinksProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy failed");
    }
  };

  const handleNativeShare = async () => {
    if (!canShare) return;

    try {
      await navigator.share({
        title,
        url,
      });
    } catch (err) {
      console.error("Share cancelled or failed");
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {canShare && (
        <Button variant="outline" size="icon-lg" onClick={handleNativeShare}>
          <FiShare2 />
        </Button>
      )}

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon-lg">
          <FiFacebook />
        </Button>
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon-lg">
          <FiTwitter />
        </Button>
      </a>

      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon-lg">
          <FaWhatsapp />
        </Button>
      </a>

      <Button variant="outline" size="icon-lg" onClick={handleCopy}>
        <FiLink />
      </Button>

      {copied && <span className="text-sm text-green-600">Copied!</span>}
    </div>
  );
}
