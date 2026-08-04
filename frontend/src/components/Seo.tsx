import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string | null;
  type?: "website" | "product";
  keywords?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
}

export function Seo({ title, description, canonicalPath, image, type = "website", keywords, noIndex = false, structuredData }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes("Phú Tài Coffee Works") ? title : `${title} | Phú Tài Coffee Works`;
    const canonicalUrl = new URL(canonicalPath ?? window.location.pathname, window.location.origin).toString();
    const imageUrl = image ? new URL(image, window.location.origin).toString() : undefined;

    document.title = fullTitle;
    document.documentElement.lang = "vi";
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[name="robots"]', { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large" });
    if (keywords) setMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    setMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: type });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: "vi_VN" });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });

    if (imageUrl) {
      setMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
      setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const scriptId = "page-structured-data";
    document.getElementById(scriptId)?.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [canonicalPath, description, image, keywords, noIndex, structuredData, title, type]);

  return null;
}
