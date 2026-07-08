"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiFacebook, FiLink, FiShare2, FiTwitter } from "react-icons/fi";

type ShareLinksProps = {
  title: string;
  url: string;
};

function ShareLinks({ title, url }: ShareLinksProps) {
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
      await navigator.share({ title, url });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div
      role="group"
      aria-label={`Share ${title}`}
      className="flex items-center gap-3 flex-wrap"
    >
      {canShare && (
        <Button
          variant="outline"
          size="icon-lg"
          onClick={handleNativeShare}
          aria-label="Share this product"
        >
          <FiShare2 aria-hidden="true" />
        </Button>
      )}

      <Button variant="outline" size="icon-lg" asChild>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook (opens in new tab)"
        >
          <FiFacebook aria-hidden="true" />
        </a>
      </Button>

      <Button variant="outline" size="icon-lg" asChild>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X / Twitter (opens in new tab)"
        >
          <FiTwitter aria-hidden="true" />
        </a>
      </Button>

      <Button variant="outline" size="icon-lg" asChild>
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp (opens in new tab)"
        >
          <FaWhatsapp aria-hidden="true" />
        </a>
      </Button>

      <Button
        variant="outline"
        size="icon-lg"
        onClick={handleCopy}
        aria-label={copied ? "Link copied!" : "Copy link"}
        aria-pressed={copied}
      >
        <FiLink aria-hidden="true" />
      </Button>

      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {copied ? "Link copied to clipboard" : ""}
      </span>

      {copied && (
        <span aria-hidden="true" className="text-sm text-green-600">
          Copied!
        </span>
      )}
    </div>
  );
}

export default ShareLinks;
