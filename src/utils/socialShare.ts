/**
 * Social Sharing Utility using Web Share API with Multi-Platform Fallbacks
 */

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
  imageUrl?: string;
}

/**
 * Checks if the Web Share API is available in the current browser/device environment
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Triggers the browser's native Web Share dialog if supported,
 * otherwise falls back to copying the text/link to clipboard.
 */
export async function executeWebShare(payload: SharePayload): Promise<{
  success: boolean;
  method: 'native' | 'clipboard' | 'cancelled';
  message: string;
}> {
  const shareUrl = payload.url || (typeof window !== 'undefined' ? window.location.href : 'https://aarambh.heritage.in');
  const shareText = `${payload.text}\n\n${shareUrl}`;

  // 1. Try native Web Share API
  if (isWebShareSupported()) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: shareUrl,
      });
      return {
        success: true,
        method: 'native',
        message: 'Shared successfully via device dialog!',
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          method: 'cancelled',
          message: 'Share cancelled by user.',
        };
      }
      // If error was not an intentional user cancel, fall through to clipboard
      console.warn('Native share failed, falling back to clipboard:', err);
    }
  }

  // 2. Clipboard fallback
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      return {
        success: true,
        method: 'clipboard',
        message: 'Share link & message copied to clipboard!',
      };
    }
  } catch (clipErr) {
    console.warn('Clipboard write failed:', clipErr);
  }

  return {
    success: false,
    method: 'clipboard',
    message: 'Could not automatically share. Please copy the link manually.',
  };
}

/**
 * Generate platform-specific direct share URLs
 */
export function getSocialShareLinks(payload: SharePayload) {
  const shareUrl = payload.url || (typeof window !== 'undefined' ? window.location.href : 'https://aarambh.heritage.in');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(payload.text);
  const encodedTitle = encodeURIComponent(payload.title);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=Aarambh,IncredibleIndia,HeritageBharat`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}
