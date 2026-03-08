import type { Group } from "three";
import type { PlayerState } from "../../game/entities/player";

export function syncPlayerGroup(group: Group, player: PlayerState): void {
  group.position.set(player.position.x, player.position.y, player.position.z);
  group.rotation.set(0, player.facing, 0);
}
