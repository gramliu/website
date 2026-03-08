import type { Group } from "three";
import type { KeyboardState } from "../../../adapters/input/keyboard";
import type { GameState } from "../../../game/game";
import type { CommonProps } from "../../common/types";

export interface PlayerProps extends CommonProps {
  animate?: boolean;
  playerRef?: React.RefObject<Group>;
  gameStateRef: React.MutableRefObject<GameState>;
  interactiveMode?: boolean;
  keyControlsRef: React.MutableRefObject<KeyboardState>;
}

export interface PlayerHelperProps {
  leftArmRef: React.RefObject<Group>;
  rightArmRef: React.RefObject<Group>;
  leftLegRef: React.RefObject<Group>;
  rightLegRef: React.RefObject<Group>;
  playerRef: React.RefObject<Group>;
}

export interface PlayerMotionHelperProps extends PlayerHelperProps {
  gameStateRef: React.MutableRefObject<GameState>;
  interactiveMode?: boolean;
  isMovingRef: React.MutableRefObject<boolean>;
  keyControlsRef: React.MutableRefObject<KeyboardState>;
}
