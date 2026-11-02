/**
 * Utilitaire pour formater une source_url (Facebook, YouTube, etc.) en URL intégrable dans un iframe.
 */
export interface EmbedInfo {
  url: string;
  type: "facebook" | "youtube" | "generic";
}

export function getEmbedUrl(sourceUrl?: string | null): EmbedInfo | null {
  if (!sourceUrl || !sourceUrl.trim()) return null;
  const trimmed = sourceUrl.trim();

  // Facebook (vidéos, reels, posts)
  if (/facebook\.com|fb\.watch/i.test(trimmed)) {
    if (/\/videos\/|video\.php|\/watch|\/reel\//i.test(trimmed)) {
      return {
        url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          trimmed
        )}&show_text=false&width=auto`,
        type: "facebook",
      };
    }
    return {
      url: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
        trimmed
      )}&show_text=true&width=auto`,
      type: "facebook",
    };
  }

  // YouTube
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      url: `https://www.youtube.com/embed/${ytMatch[1]}`,
      type: "youtube",
    };
  }

  // URL Web générique
  return {
    url: trimmed,
    type: "generic",
  };
}

