// @refresh reload
import { StartServer, createHandler } from '@solidjs/start/server';
import {
  ARROW_ACTUAL_SPRITE_SIZE,
  ARROW_HITBOX_SIZE,
  ARROW_SPRITE_SIZE,
  BLOOD_ANIMATION_DURATION_MS,
  BLOOD_SPRITE_SIZE,
  ENEMY_DIED_HIDE_MODEL_DURATION_MS,
  ENEMY_HITBOX_SIZE,
  ENEMY_SPRITE_SIZE,
  GAME_WORLD_SIZE,
  GEM_HITBOX_SIZE,
  PLAYER_HITBOX_SIZE,
  PLAYER_SHOOTING_ANIMATION_DURATION_MS,
  PLAYER_SPRITE_SIZE,
  SKULL_APPEAR_DURATIONS_MS,
  SKULL_GONE_DURATIONS_MS,
  SKULL_SPRITE_SIZE,
  TILE_SIZE,
} from '~/constants';

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html
        lang="en"
        style={{
          '--world-size': `${GAME_WORLD_SIZE}px`,
          '--tile-size': `${TILE_SIZE}px`,

          '--player-shooting-duration': `${PLAYER_SHOOTING_ANIMATION_DURATION_MS}ms`,
          '--player-sprite-width': `${PLAYER_SPRITE_SIZE.w}px`,
          '--player-sprite-height': `${PLAYER_SPRITE_SIZE.h}px`,
          '--player-hitbox-width': `${PLAYER_HITBOX_SIZE.w}px`,
          '--player-hitbox-height': `${PLAYER_HITBOX_SIZE.h}px`,

          '--enemy-sprite-width': `${ENEMY_SPRITE_SIZE.w}px`,
          '--enemy-sprite-height': `${ENEMY_SPRITE_SIZE.h}px`,
          '--enemy-hitbox-width': `${ENEMY_HITBOX_SIZE.w}px`,
          '--enemy-hitbox-height': `${ENEMY_HITBOX_SIZE.h}px`,
          '--enemy-die-duration': `${ENEMY_DIED_HIDE_MODEL_DURATION_MS}ms`,

          '--blood-spill-duration': `${BLOOD_ANIMATION_DURATION_MS}ms`,
          '--blood-sprite-width': `${BLOOD_SPRITE_SIZE.w}px`,
          '--blood-sprite-height': `${BLOOD_SPRITE_SIZE.h}px`,

          '--skull-appear-duration': `${SKULL_APPEAR_DURATIONS_MS}ms`,
          '--skull-gone-duration': `${SKULL_GONE_DURATIONS_MS}ms`,
          '--skull-sprite-width': `${SKULL_SPRITE_SIZE.w}px`,
          '--skull-sprite-height': `${SKULL_SPRITE_SIZE.h}px`,

          '--arrow-sprite-width': `${ARROW_SPRITE_SIZE.w}px`,
          '--arrow-sprite-height': `${ARROW_SPRITE_SIZE.h}px`,
          '--arrow-actual-sprite-width': `${ARROW_ACTUAL_SPRITE_SIZE.w}px`,
          '--arrow-actual-sprite-height': `${ARROW_ACTUAL_SPRITE_SIZE.h}px`,
          '--arrow-hitbox-width': `${ARROW_HITBOX_SIZE.w}px`,
          '--arrow-hitbox-height': `${ARROW_HITBOX_SIZE.h}px`,

          '--gem-hitbox-width': `${GEM_HITBOX_SIZE.w}px`,
          '--gem-hitbox-height': `${GEM_HITBOX_SIZE.h}px`,
        }}
      >
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
