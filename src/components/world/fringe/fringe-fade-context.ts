import { createContext } from "react";

/**
 * When true, world block materials apply the camera-distance LOD fade so
 * far-away blocks dissolve into the fringe wireframes/tiles. Enabled only
 * for worlds that render the fringe.
 */
export const FringeFadeContext = createContext(false);
