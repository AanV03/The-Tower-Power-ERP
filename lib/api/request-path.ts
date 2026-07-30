const PUBLIC_FILE = /\.(.*)$/;

export function isPublicStaticAssetPath(pathname: string) {
  return !pathname.startsWith("/api") && PUBLIC_FILE.test(pathname);
}
