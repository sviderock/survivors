export const PLAYER_SPRITE_SIZE = { w: 192, h: 192 };
export const PLAYER_HITBOX_SIZE = { w: 80, h: 80 };
export const PLAYER_SPEED = 6;
export const PLAYER_SERVER_SPEED = 30;
export const PLAYER_BASE_HEALTH = 100;
export const PLAYER_BASE_DAMAGE = 3;
export const PLAYER_BASE_COOLDOWN = 1_000;
export const PLAYER_SHOOTING_ANIMATION_DURATION_MS = 300;
export const PLAYER_MAGNET_DIAMETER = 80;
export const PLAYER_NAME = "Slava";

export const ARROW_SPEED = 20;
export const ARROW_SPRITE_SIZE = { w: 64, h: 64 };
export const ARROW_ACTUAL_SPRITE_SIZE = { w: 63, h: 14 };
export const ARROW_HITBOX_SIZE = { w: 14, h: 14 };
export const ARROW_DISTANCE = 800;
export const ARROW_DAMAGE = 3;

export const ENEMY_SPRITE_SIZE = { w: 192, h: 192 };
export const ENEMY_HITBOX_SIZE = { w: 50, h: 50 };
export const ENEMY_SPEED = 2;
export const ENEMY_ATTACK_COOLDOWN = 2_000;
export const ENEMY_BASE_HEALTH = 1;
export const ENEMY_COLLISION_OFFSET = 10;
export const ENEMY_SPAWN_INTERVAL_MS = 10;
export const ENEMY_LIMIT = 100;
export const ENEMY_DIED_HIDE_MODEL_DURATION_MS = 800;

export const BLOOD_SPRITE_SIZE = { w: 110, h: 93 };
export const BLOOD_ANIMATION_DURATION_MS = 400;

export const GEM_HITBOX_SIZE = { w: 16, h: 24 };
export const GEM_LIMIT = 1;
export const GEM_FLYING_SPEED = 6;

export const SKULL_SPRITE_SIZE = { w: 128, h: 128 };
export const SKULL_APPEAR_DURATIONS_MS = 400;
export const SKULL_GONE_DURATIONS_MS = 400;
export const SKULL_DESTROY_DELAY_MS = 3_000;

export const XP_LVL_2 = 5;
export const XP_LVL_3_TO_20 = 10;
export const XP_LVL_21_TO_40 = 13;
export const XP_LVL_41_AND_UP = 16;

export const GAME_BASE_COINS_REWARD = 100;
export const GAME_TIME_IN_MINUTES = 0.5;
export const GAME_TERRAIN_TILE_SIZE = 32;
export const GAME_WORLD_SIZE = 10_000;
export const GAME_WORLD_HALFSIZE = GAME_WORLD_SIZE / 2;
export const TILE_SIZE = 50;

export const HEALTH_COLOR_FULL = "rgb(124,207,0)";
export const HEALTH_COLOR_HALF = "rgb(240,177,0)";
export const HEALTH_COLOR_NONE = "rgb(193,0,7)";

export const ABRUPTLY_STOPPPED_GAME_LS_KEY = "abruptly_stopped_game";
export const DIAGONAL_SPEED = +(Math.SQRT2 / 2).toPrecision(1);
export const SUPPORTED_PROTOCOLS = ["celo"] as const;

export const DEBUG_MECHANICS = true;
export const SPAWN_ENEMIES = true;
export const SPAWN_GEMS = true;
export const SPAWN_TERRAIN = true;

export const ENEMY_COLLISIONS = true;
export const ARROW_COLLISIONS = true;
export const GEMS_COLLISIONS = true;

export const DEBUG = true;
export const RAPID_MODE = false;

export const GAME_UPDATE_RATE_PER_SECOND = 10;
export const GAME_UPDATE_INTERVAL = 1000 / GAME_UPDATE_RATE_PER_SECOND;
