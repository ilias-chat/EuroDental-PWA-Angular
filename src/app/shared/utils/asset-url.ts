import { environment } from '../../../environments/environment';

/**
 * Resolve API/storage paths to the public asset host (laravel-eurodental).
 */
export function resolveStorageUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) {
    return null;
  }

  let url = path.trim();
  const assetBase = environment.assetBaseUrl.replace(/\/$/, '');

  // Fix URLs cached from laravel-mobile APP_URL (port 8001)
  if (/^https?:\/\/(127\.0\.0\.1|localhost):8001\b/.test(url)) {
    url = url.replace(/^https?:\/\/[^/]+/, assetBase);
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/storage/')) {
    return assetBase + url;
  }

  if (url.startsWith('storage/')) {
    return `${assetBase}/${url}`;
  }

  return `${assetBase}/storage/${url.replace(/^\//, '')}`;
}

export function avatarFallbackUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0058bd&color=ffffff`;
}

export function resolveAvatarUrl(name: string, image: string | null | undefined): string {
  return resolveStorageUrl(image) ?? avatarFallbackUrl(name);
}
