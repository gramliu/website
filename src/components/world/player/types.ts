import { Group } from "three";
import { World } from "../world";
import { CommonProps } from "../../common/types";
import { KeyState } from "../keycontrols";

export interface PlayerProps extends CommonProps {
  animate?: boolean;
  playerRef?: React.RefObject<Group>;
  world: World;
  interactiveMode?: boolean;
  keyControlsRef: React.MutableRefObject<KeyState>;
}

export interface PlayerHelperProps {
  leftArmRef: React.RefObject<Group>;
  rightArmRef: React.RefObject<Group>;
  leftLegRef: React.RefObject<Group>;
  rightLegRef: React.RefObject<Group>;
  playerRef: React.RefObject<Group>;
}

export interface PlayerMotionHelperProps extends PlayerHelperProps {
  world: World;
  interactiveMode?: boolean;
  isMovingRef: React.MutableRefObject<boolean>;
  keyControlsRef: React.MutableRefObject<KeyState>;
}

