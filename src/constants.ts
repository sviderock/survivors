export const PLAYER_SPEED = 3;
export const PLAYER_SIZE = 32;
export const PLAYER_BASE_HEALTH = 100;
export const PLAYER_BASE_DAMAGE = 3;
export const PLAYER_BASE_COOLDOWN = 1_000;

export const ARROW_SPEED = 15;
export const ARROW_SIZE = 32;
export const ARROW_DISTANCE = 800;
export const ARROW_DAMAGE = 3;
export const ARROW_MAGIC_OFFSET_X = 20;
export const ARROW_MAGIC_OFFSET_Y = 40;

export const ENEMY_SPEED = 1;
export const ENEMY_SIZE = 32;
export const ENEMY_ATTACK_COOLDOWN = 2000;
export const ENEMY_BASE_HEALTH = 1;
export const ENEMY_COLLISION_OFFSET = 10;
export const ENEMY_SPAWN_INTERVAL_MS = 10;
export const ENEMY_LIMIT = 100;
export const ENEMY_DIED_HIDE_MODEL_DURATION_SS = 0.8;

export const BLOOD_SIZE = { w: 110, h: 93 };
export const BLOOD_ANIMATION_DURATION_SS = 0.4;

export const GEM_SIZE = { w: 16, h: 24 };

export const SKULL_SIZE = 32;
export const SKULL_APPEAR_DURATIONS_SS = 0.4;
export const SKULL_GONE_DURATIONS_SS = 0.4;

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
export const SHOOTING_ANIMATION_DURATION_SS = 0.2;

export const DEBUG_MECHANICS = true;
export const SPAWN_ENEMIES = true;
export const SPAWN_GEMS = false;

export const ENEMY_COLLISIONS = true;
export const ARROW_COLLISIONS = true;
export const GEMS_COLLISIONS = true;

export const DEBUG = false;
export const RAPID_MODE = true;
