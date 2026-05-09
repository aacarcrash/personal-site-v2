// Thin shim: source of truth is content/featured.json. Validated at
// module load via Zod. Same exports as before so callers don't change.

import featuredJson from "../content/featured.json";
import { FeaturedSchema } from "./types";

const featured = FeaturedSchema.parse(featuredJson);

export const featuredSlugs: string[] = featured.slugs;
export const featuredColumns = featured.columns;
