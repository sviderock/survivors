import { For, type ParentProps, Show, createEffect, createMemo, onMount } from "solid-js";
import { produce, unwrap } from "solid-js/store";
import { DEBUG, TILE_SIZE } from "~/constants";
import { gameState, setGameState, worldRect } from "~/state";
import { getNewPos, getRect } from "~/utils";

export function getTileInfoKey(row: number, col: number) {
  return `${row}-${col}`;
}

export default function Terrain(props: ParentProps) {
  let worldRef!: HTMLDivElement;

  function getGridSize() {
    let { offsetWidth, offsetHeight } = worldRef;
    let rows = 0;
    let columns = 0;

    while (offsetWidth) {
      columns++;
      offsetWidth = offsetWidth - TILE_SIZE <= 0 ? 0 : offsetWidth - TILE_SIZE;
    }
    while (offsetHeight) {
      rows++;
      offsetHeight = offsetHeight - TILE_SIZE <= 0 ? 0 : offsetHeight - TILE_SIZE;
    }

    return { rows, columns };
  }

  function buildTiles(gridSize: {
    rows: number;
    columns: number;
  }): Pick<GameState, "terrainRect" | "tileInfo"> {
    const terrainRect = getRect(worldRef!);
    const tileInfo: GameState["tileInfo"] = {};

    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.columns; col++) {
        const key = getTileInfoKey(row, col);
        tileInfo[key] = getNewPos({
          x: col * TILE_SIZE + terrainRect.x,
          y: row * TILE_SIZE + terrainRect.y,
          width: TILE_SIZE,
          height: TILE_SIZE,
        });
      }
    }
    return { tileInfo, terrainRect };
  }

  onMount(() => {
    const { tileInfo, terrainRect } = buildTiles(getGridSize());
    setGameState(
      produce((state) => {
        state.terrainRect = terrainRect;
        state.tileInfo = tileInfo;
      })
    );
  });

  return (
    <div
      ref={worldRef}
      class="h-world w-world bg-forest [image-rendering:pixelated]"
      style={{
        transform: `translate3d(calc(-50% + ${worldRect.x}px), calc(-50% + ${worldRect.y}px), 0)`,
      }}
    >
      <Show when={DEBUG}>
        <TileGrid />
      </Show>
      {props.children}
    </div>
  );
}

function TileGrid() {
  const occupiedTiles = createMemo(() => Object.keys(gameState.occupiedTile));
  const projectedTiles = createMemo(() => Object.keys(gameState.projectedTile));

  return (
    <div class="absolute bottom-0 left-1/2 right-0 top-1/2">
      <For each={occupiedTiles()}>
        {(key) => (
          <span
            class="absolute flex h-tile w-tile items-end border border-red-800 bg-red-500 text-sm"
            style={{
              top: `${gameState.tileInfo[key]!.top}px`,
              left: `${gameState.tileInfo[key]!.left}px`,
            }}
          >
            {key}
          </span>
        )}
      </For>

      <For each={projectedTiles()}>
        {(key) => (
          <span
            class="absolute flex h-tile w-tile items-end border border-red-500/80 bg-red-500/50 text-sm"
            style={{
              top: `${gameState.tileInfo[key]!.top}px`,
              left: `${gameState.tileInfo[key]!.left}px`,
            }}
          >
            {key}
          </span>
        )}
      </For>
    </div>
  );
}
