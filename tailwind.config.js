import {
  ARROW_HITBOX_SIZE,
  ARROW_MODEL_SIZE,
  ARROW_SIZE,
  BLOOD_ANIMATION_DURATION_MS,
  BLOOD_SIZE,
  ENEMY_DIED_HIDE_MODEL_DURATION_MS,
  ENEMY_SIZE,
  GAME_WORLD_SIZE,
  GEM_SIZE,
  PLAYER_SPRITE_SIZE,
  SHOOTING_ANIMATION_DURATION_MS,
  SKULL_APPEAR_DURATIONS_MS,
  SKULL_GONE_DURATIONS_MS,
  SKULL_SIZE,
  TILE_SIZE,
} from './src/constants';

const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      width: {
        'enemy-hitbox': '50px',
        'player-hitbox': '80px',
        'arrow-model': `${ARROW_MODEL_SIZE.w}px`,
        'arrow-hitbox': `${ARROW_HITBOX_SIZE.w}px`,
        enemy: `calc(${ENEMY_SIZE}px)`,
        player: `${PLAYER_SPRITE_SIZE}px`,
        arrow: `calc(${ARROW_SIZE}px)`,
        blood: `calc(${BLOOD_SIZE.w}px / 6)`,
        skull: `calc(${SKULL_SIZE}px)`,
        gem: `${GEM_SIZE.w}px`,
        world: `${GAME_WORLD_SIZE}px`,
        tile: `${TILE_SIZE}px`,
      },
      height: {
        'enemy-hitbox': '50px',
        'player-hitbox': '80px',
        'arrow-model': `${ARROW_MODEL_SIZE.h}px`,
        'arrow-hitbox': `${ARROW_HITBOX_SIZE.h}px`,
        enemy: `calc(${ENEMY_SIZE}px)`,
        player: `${PLAYER_SPRITE_SIZE}px`,
        arrow: `calc(${ARROW_SIZE}px)`,
        blood: `calc(${BLOOD_SIZE.h}px / 6)`,
        skull: `calc(${SKULL_SIZE}px)`,
        gem: `${GEM_SIZE.h}px`,
        world: `${GAME_WORLD_SIZE}px`,
        tile: `${TILE_SIZE}px`,
      },
      willChange: {
        bp: 'background-position',
      },
      fontFamily: {
        sans: ['Poppins', ...fontFamily.sans],
      },
      backgroundImage: {
        forest: `url('/game-assets/Terrain/Ground/Tiles/tile011.png')`,
        enemy: `url('/game-assets/Factions/Goblins/Troops/Torch/Red/Torch_Red.png')`,
        player: `url('/game-assets/Factions/Knights/Troops/Archer/Blue/Archer_Blue.png')`,
        arrow: `url('/game-assets/Factions/Knights/Troops/Archer/Arrow/Arrow.png')`,
        blood: `url('/game-assets/Effects/Blood.png')`,
        skull: `url('/game-assets/Factions/Knights/Troops/Dead/Dead.png')`,
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--kb-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--kb-accordion-content-height)' },
          to: { height: 0 },
        },
        'content-show': {
          from: { opacity: 0, transform: 'scale(0.96)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        'content-hide': {
          from: { opacity: 1, transform: 'scale(1)' },
          to: { opacity: 0, transform: 'scale(0.96)' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0.6' },
        },

        // player idle
        'move-sprite-sheet-idle': {
          '0%': {
            backgroundPosition: '0 0',
          },
          '100%': {
            backgroundPosition: `-${PLAYER_SPRITE_SIZE * 6}px 0`,
          },
        },

        // player run
        'move-sprite-sheet-run': {
          '0%': {
            backgroundPosition: `0 calc(-${PLAYER_SPRITE_SIZE}px)`,
          },
          '100%': {
            backgroundPosition: `calc(-${PLAYER_SPRITE_SIZE * 6}px) calc(-${PLAYER_SPRITE_SIZE}px)`,
          },
        },

        // player shoot
        'move-sprite-sheet-shoot-north': {
          '0%': {
            backgroundPosition: `0 calc(-${PLAYER_SPRITE_SIZE * 2}px)`,
          },
          '100%': {
            backgroundPosition: `calc(-${PLAYER_SPRITE_SIZE * 8}px) calc(-${PLAYER_SPRITE_SIZE * 2}px)`,
          },
        },
        'move-sprite-sheet-shoot-north-east': {
          '0%': {
            backgroundPosition: `0 calc(-${PLAYER_SPRITE_SIZE * 3}px)`,
          },
          '100%': {
            backgroundPosition: `calc(-${PLAYER_SPRITE_SIZE * 8}px) calc(-${PLAYER_SPRITE_SIZE * 3}px)`,
          },
        },
        'move-sprite-sheet-shoot-east': {
          '0%': {
            backgroundPosition: `0 calc(-${PLAYER_SPRITE_SIZE * 4}px)`,
          },
          '100%': {
            backgroundPosition: `calc(-${PLAYER_SPRITE_SIZE * 8}px) calc(-${PLAYER_SPRITE_SIZE * 4}px)`,
          },
        },
        'move-sprite-sheet-shoot-south-east': {
          '0%': {
            backgroundPosition: `0 calc(-${PLAYER_SPRITE_SIZE * 5}px)`,
          },
          '100%': {
            backgroundPosition: `calc(-${PLAYER_SPRITE_SIZE * 8}px) calc(-${PLAYER_SPRITE_SIZE * 5}px)`,
          },
        },
        'move-sprite-sheet-shoot-south': {
          '0%': {
            backgroundPosition: `0 calc(-${PLAYER_SPRITE_SIZE * 6}px)`,
          },
          '100%': {
            backgroundPosition: `calc(-${PLAYER_SPRITE_SIZE * 8}px) calc(-${PLAYER_SPRITE_SIZE * 6}px)`,
          },
        },
        'move-sprite-sheet-shoot-south-west': {
          '0%': {
            top: `calc(-${PLAYER_SPRITE_SIZE * 5}px)`,
            transform: 'translate3d(-100%, 0, 0) scaleX(-1)',
          },
          '100%': {
            top: `calc(-${PLAYER_SPRITE_SIZE * 5}px)`,
            transform: 'translate3d(0, 0, 0) scaleX(-1)',
          },
        },
        'move-sprite-sheet-shoot-west': {
          '0%': {
            top: `calc(-${PLAYER_SPRITE_SIZE * 4}px)`,
            transform: 'translate3d(-100%, 0, 0) scaleX(-1)',
          },
          '100%': {
            top: `calc(-${PLAYER_SPRITE_SIZE * 4}px)`,
            transform: 'translate3d(0, 0, 0) scaleX(-1)',
          },
        },
        'move-sprite-sheet-shoot-north-west': {
          '0%': {
            top: `calc(-${PLAYER_SPRITE_SIZE * 3}px)`,
            transform: 'translate3d(-100%, 0, 0) scaleX(-1)',
          },
          '100%': {
            top: `calc(-${PLAYER_SPRITE_SIZE * 3}px)`,
            transform: 'translate3d(0, 0, 0) scaleX(-1)',
          },
        },

        // enemy idle
        'move-sprite-sheet-enemy-idle': {
          '0%': {
            backgroundPosition: `0 0`,
          },
          '100%': {
            backgroundPosition: `calc(-${ENEMY_SIZE}px * 7) 0`,
          },
        },

        // enemy run
        'move-sprite-sheet-enemy-run': {
          '0%': {
            backgroundPosition: `0 calc(-${ENEMY_SIZE}px)`,
          },
          '100%': {
            backgroundPosition: `calc(-${ENEMY_SIZE}px * 6) calc(-${ENEMY_SIZE}px)`,
          },
        },
        'hide-model': {
          '0%': {
            opacity: 1,
            scale: 1,
            rotate: 0,
          },
          '100%': {
            opacity: 0,
            scale: 0,
            rotate: '360deg',
          },
        },

        // enemy attack
        'move-move-sprite-sheet-enemy-attack-east': {},

        // blood spill
        'blood-spill': {
          '0%': {
            backgroundPosition: `0 calc(-${BLOOD_SIZE.h}px * 5)`,
          },
          '100%': {
            backgroundPosition: `calc(-${BLOOD_SIZE.w}px * 8) calc(-${BLOOD_SIZE.h}px * 5)`,
          },
        },

        // skull
        'skull-appear': {
          '0%': {
            backgroundPosition: `${SKULL_SIZE}px ${SKULL_SIZE}px`,
          },
          '100%': {
            backgroundPosition: `calc(${SKULL_SIZE}px + -128px * 6) ${SKULL_SIZE}px`,
          },
        },
        'skull-gone': {
          '0%': {
            opacity: 1,
            backgroundPosition: `${SKULL_SIZE}px calc(${SKULL_SIZE}px + 128px)`,
          },
          '100%': {
            opacity: 0.5,
            backgroundPosition: `calc(${SKULL_SIZE}px + -128px * 6) calc(${SKULL_SIZE}px + 128px)`,
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'content-show': 'content-show 0.2s ease-out',
        'content-hide': 'content-hide 0.2s ease-out',
        'caret-blink': 'caret-blink .5s ease-out infinite',

        // player animations
        'move-sprite-sheet-idle': 'move-sprite-sheet-idle .5s steps(6) infinite',
        'move-sprite-sheet-run': `move-sprite-sheet-run .3s steps(6) infinite`,
        'move-sprite-sheet-shoot-north': `move-sprite-sheet-shoot-north ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'move-sprite-sheet-shoot-north-east': `move-sprite-sheet-shoot-north-east ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'move-sprite-sheet-shoot-east': `move-sprite-sheet-shoot-east ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'move-sprite-sheet-shoot-south-east': `move-sprite-sheet-shoot-south-east ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'move-sprite-sheet-shoot-south': `move-sprite-sheet-shoot-south ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'move-sprite-sheet-shoot-south-west': `move-sprite-sheet-shoot-south-west ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'move-sprite-sheet-shoot-west': `move-sprite-sheet-shoot-west ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'move-sprite-sheet-shoot-north-west': `move-sprite-sheet-shoot-north-west ${SHOOTING_ANIMATION_DURATION_MS}ms steps(8)`,
        'hide-model': `hide-model ${ENEMY_DIED_HIDE_MODEL_DURATION_MS}ms forwards`,

        // enemy animations
        'move-sprite-sheet-enemy-idle': 'move-sprite-sheet-enemy-idle .5s steps(7) infinite',
        'move-sprite-sheet-enemy-run': `move-sprite-sheet-enemy-run .3s steps(6) infinite`,

        // blood spill
        'blood-spill': `blood-spill ${BLOOD_ANIMATION_DURATION_MS}ms steps(8)`,

        // skull
        'skull-appear': `skull-appear ${SKULL_APPEAR_DURATIONS_MS}ms steps(6) forwards`,
        'skull-gone': `skull-gone ${SKULL_GONE_DURATIONS_MS}ms steps(6) forwards`,
      },
    },
  },
};
