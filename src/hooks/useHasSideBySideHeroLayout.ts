import { HERO_WORLD_SIDE_BY_SIDE_MEDIA_QUERY } from "../config/breakpoints";
import { useMediaQuery } from "./useMediaQuery";

export function useHasSideBySideHeroLayout(): boolean {
  return useMediaQuery(HERO_WORLD_SIDE_BY_SIDE_MEDIA_QUERY);
}
