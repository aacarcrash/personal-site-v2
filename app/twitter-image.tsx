// Reuse the Open Graph contact-sheet card as the Twitter/X image so link
// previews match. The opengraph-image convention only emits og:image tags,
// so twitter:image needs its own file.
export { default, alt, size, contentType } from "./opengraph-image";
