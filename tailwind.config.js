/* eslint-disable no-undef */

import {
  BLOOD_SIZE,
  BULLET_SIZE,
  ENEMY_SIZE,
  GAME_WORLD_SIZE,
  GEM_SIZE,
  PLAYER_SIZE,
  SHOOTING_ANIMATION_DURATION_SS,
  TILE_SIZE,
} from "./src/constants";

/* eslint-disable @typescript-eslint/no-require-imports */
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["variant", [".dark &", '[data-kb-theme="dark"] &']],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      width: {
        "enemy-hitbox": "50px",
        "player-hitbox": "80px",
        "bullet-hitbox": "64px",
        enemy: `calc(${ENEMY_SIZE}px * var(--pixel-size))`,
        player: `calc(${PLAYER_SIZE}px * var(--pixel-size))`,
        bullet: `calc(${BULLET_SIZE}px * var(--pixel-size))`,
        blood: BLOOD_SIZE.w,
        gem: GEM_SIZE.w,
        world: GAME_WORLD_SIZE,
        tile: TILE_SIZE,
      },
      height: {
        "enemy-hitbox": "50px",
        "player-hitbox": "80px",
        "bullet-hitbox": "20px",
        enemy: `calc(${ENEMY_SIZE}px * var(--pixel-size))`,
        player: `calc(${PLAYER_SIZE}px * var(--pixel-size))`,
        bullet: `calc(${BULLET_SIZE}px * var(--pixel-size))`,
        blood: BLOOD_SIZE.h,
        gem: GEM_SIZE.h,
        world: GAME_WORLD_SIZE,
        tile: TILE_SIZE,
      },
      willChange: {
        bp: "background-position",
      },
      fontFamily: {
        sans: ["Poppins", ...fontFamily.sans],
      },
      backgroundImage: {
        forest: `url('/game-assets/Terrain/Ground/Tiles/tile011.png')`,
        enemy: `url('/game-assets/Factions/Goblins/Troops/Torch/Red/Torch_Red.png')`,
        player: `url('/game-assets/Factions/Knights/Troops/Archer/Blue/Archer_Blue.png')`,
        bullet: `url('/game-assets/Factions/Knights/Troops/Archer/Arrow/Arrow.png')`,
        blood: `url('/game-assets/Effects/Blood.png')`,
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--kb-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--kb-accordion-content-height)" },
          to: { height: 0 },
        },
        "content-show": {
          from: { opacity: 0, transform: "scale(0.96)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        "content-hide": {
          from: { opacity: 1, transform: "scale(1)" },
          to: { opacity: 0, transform: "scale(0.96)" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0.6" },
        },

        // player idle
        "move-sprite-sheet-idle": {
          "0%": {
            backgroundPosition: `0 0`,
          },
          "100%": {
            backgroundPosition: `calc(-${PLAYER_SIZE * 6}px * var(--pixel-size)) 0`,
          },
        },

        // player run
        "move-sprite-sheet-run": {
          "0%": {
            backgroundPosition: `0 calc(-${PLAYER_SIZE}px * var(--pixel-size))`,
          },
          "100%": {
            backgroundPosition: `calc(-${PLAYER_SIZE * 6}px * var(--pixel-size)) calc(-${PLAYER_SIZE}px * var(--pixel-size))`,
          },
        },

        // player shoot
        "move-sprite-sheet-shoot-north": {
          "0%": {
            backgroundPosition: `0 calc(-${PLAYER_SIZE * 2}px * var(--pixel-size))`,
          },
          "100%": {
            backgroundPosition: `calc(-${PLAYER_SIZE * 8}px * var(--pixel-size)) calc(-${PLAYER_SIZE * 2}px * var(--pixel-size))`,
          },
        },
        "move-sprite-sheet-shoot-north-east": {
          "0%": {
            backgroundPosition: `0 calc(-${PLAYER_SIZE * 3}px * var(--pixel-size))`,
          },
          "100%": {
            backgroundPosition: `calc(-${PLAYER_SIZE * 8}px * var(--pixel-size)) calc(-${PLAYER_SIZE * 3}px * var(--pixel-size))`,
          },
        },
        "move-sprite-sheet-shoot-east": {
          "0%": {
            backgroundPosition: `0 calc(-${PLAYER_SIZE * 4}px * var(--pixel-size))`,
          },
          "100%": {
            backgroundPosition: `calc(-${PLAYER_SIZE * 8}px * var(--pixel-size)) calc(-${PLAYER_SIZE * 4}px * var(--pixel-size))`,
          },
        },
        "move-sprite-sheet-shoot-south-east": {
          "0%": {
            backgroundPosition: `0 calc(-${PLAYER_SIZE * 5}px * var(--pixel-size))`,
          },
          "100%": {
            backgroundPosition: `calc(-${PLAYER_SIZE * 8}px * var(--pixel-size)) calc(-${PLAYER_SIZE * 5}px * var(--pixel-size))`,
          },
        },
        "move-sprite-sheet-shoot-south": {
          "0%": {
            backgroundPosition: `0 calc(-${PLAYER_SIZE * 6}px * var(--pixel-size))`,
          },
          "100%": {
            backgroundPosition: `calc(-${PLAYER_SIZE * 8}px * var(--pixel-size)) calc(-${PLAYER_SIZE * 6}px * var(--pixel-size))`,
          },
        },
        "move-sprite-sheet-shoot-south-west": {
          "0%": {
            top: `calc(-${PLAYER_SIZE * 5}px * var(--pixel-size))`,
            transform: "translate3d(-100%, 0, 0) scaleX(-1)",
          },
          "100%": {
            top: `calc(-${PLAYER_SIZE * 5}px * var(--pixel-size))`,
            transform: "translate3d(0, 0, 0) scaleX(-1)",
          },
        },
        "move-sprite-sheet-shoot-west": {
          "0%": {
            top: `calc(-${PLAYER_SIZE * 4}px * var(--pixel-size))`,
            transform: "translate3d(-100%, 0, 0) scaleX(-1)",
          },
          "100%": {
            top: `calc(-${PLAYER_SIZE * 4}px * var(--pixel-size))`,
            transform: "translate3d(0, 0, 0) scaleX(-1)",
          },
        },
        "move-sprite-sheet-shoot-north-west": {
          "0%": {
            top: `calc(-${PLAYER_SIZE * 3}px * var(--pixel-size))`,
            transform: "translate3d(-100%, 0, 0) scaleX(-1)",
          },
          "100%": {
            top: `calc(-${PLAYER_SIZE * 3}px * var(--pixel-size))`,
            transform: "translate3d(0, 0, 0) scaleX(-1)",
          },
        },

        // enemy idle
        "move-sprite-sheet-enemy-idle": {
          "0%": {
            backgroundPosition: `0 0`,
          },
          "100%": {
            backgroundPosition: `calc(-${ENEMY_SIZE}px * var(--pixel-size) * 7) 0`,
          },
        },

        // enemy run
        "move-sprite-sheet-enemy-run": {
          "0%": {
            backgroundPosition: `0 calc(-${ENEMY_SIZE}px * var(--pixel-size))`,
          },
          "100%": {
            backgroundPosition: `calc(-${ENEMY_SIZE}px * var(--pixel-size) * 6) calc(-${ENEMY_SIZE}px * var(--pixel-size))`,
          },
        },

        // blood spill
        "blood-spill": {
          "0%": {
            backgroundPosition: `0 calc(-${BLOOD_SIZE.h}px * 2)`,
          },
          "100%": {
            backgroundPosition: `calc(-${BLOOD_SIZE.w}px * 7) calc(-${BLOOD_SIZE.h}px * 2)`,
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "content-show": "content-show 0.2s ease-out",
        "content-hide": "content-hide 0.2s ease-out",
        "caret-blink": "caret-blink .5s ease-out infinite",

        // player animations
        "move-sprite-sheet-idle": "move-sprite-sheet-idle .5s steps(6) infinite",
        "move-sprite-sheet-run": `move-sprite-sheet-run .3s steps(6) infinite`,
        "move-sprite-sheet-shoot-north": `move-sprite-sheet-shoot-north ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,
        "move-sprite-sheet-shoot-north-east": `move-sprite-sheet-shoot-north-east ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,
        "move-sprite-sheet-shoot-east": `move-sprite-sheet-shoot-east ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,
        "move-sprite-sheet-shoot-south-east": `move-sprite-sheet-shoot-south-east ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,
        "move-sprite-sheet-shoot-south": `move-sprite-sheet-shoot-south ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,
        "move-sprite-sheet-shoot-south-west": `move-sprite-sheet-shoot-south-west ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,
        "move-sprite-sheet-shoot-west": `move-sprite-sheet-shoot-west ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,
        "move-sprite-sheet-shoot-north-west": `move-sprite-sheet-shoot-north-west ${SHOOTING_ANIMATION_DURATION_SS}s steps(8)`,

        // enemy animations
        "move-sprite-sheet-enemy-idle": "move-sprite-sheet-enemy-idle .5s steps(7) infinite",
        "move-sprite-sheet-enemy-run": `move-sprite-sheet-enemy-run .3s steps(6) infinite`,

        // blood spill
        "blood-spill": "blood-spill .5s steps(7)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
