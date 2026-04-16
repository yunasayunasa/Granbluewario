/** 全ミニゲームを MinigameRegistry に登録 */

import type { MinigameRegistry } from '../core/MinigameRegistry';
import { tapLuria } from './01_tap_luria/index';
import { avoidAttack } from './02_avoid_attack/index';
import { catchItem } from './03_catch_item/index';
import { feedVyrn } from './04_feed_vyrn/index';
import { chooseElement } from './05_choose_element/index';
import { swipeDirection } from './06_swipe_direction/index';
import { holdCharge } from './07_hold_charge/index';
import { tiltBalance } from './08_tilt_balance/index';
import { findTarget } from './09_find_target/index';
import { orderSequence } from './10_order_sequence/index';

/** 全ミニゲームをレジストリに登録する */
export function registerAllMinigames(registry: MinigameRegistry) {
  registry.register(tapLuria);
  registry.register(avoidAttack);
  registry.register(catchItem);
  registry.register(feedVyrn);
  registry.register(chooseElement);
  registry.register(swipeDirection);
  registry.register(holdCharge);
  registry.register(tiltBalance);
  registry.register(findTarget);
  registry.register(orderSequence);
}
