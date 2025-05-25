import { For, type ParentProps, Show, createMemo, onMount } from "solid-js";
import { DEBUG, SPAWN_TERRAIN, TILE_SIZE } from "~/constants";
import { gameState, setGameState, worldRect } from "~/state";
import { cn, getNewPos, getRect } from "~/utils";

export function getTileInfoKey(row: number, col: number) {
  return `${row}-${col}`;
}

export default function Terrain(props: ParentProps) {
  let worldRef!: HTMLDivElement;

  onMount(() => {
    setGameState("terrainRect", getRect(worldRef!));
  });

  return (
    <div
      ref={worldRef}
      class={cn(
        "h-(--world-size) w-(--world-size)",
        SPAWN_TERRAIN && "bg-(image:--forest-sprite) [image-rendering:pixelated]"
      )}
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
  const occupiedTiles = createMemo(() => Object.keys(gameState.occupiedTile).map(getTileInfo));
  const projectedTiles = createMemo(() => Object.keys(gameState.projectedTile).map(getTileInfo));

  function getTileInfo(key: string) {
    const [row, col] = key.split("-");
    const rect = getNewPos({
      x: +col! * TILE_SIZE + gameState.terrainRect.x,
      y: +row! * TILE_SIZE + gameState.terrainRect.y,
      width: TILE_SIZE,
      height: TILE_SIZE,
    });

    return { rect, key };
  }

  return (
    <div class="absolute top-1/2 right-0 bottom-0 left-1/2">
      <For each={occupiedTiles()}>
        {(tile) => (
          <span
            class="absolute flex h-(--tile-size) w-(--tile-size) items-end border border-red-800 bg-red-500 text-sm"
            style={{ top: `${tile.rect.top}px`, left: `${tile.rect.left}px` }}
          >
            {tile.key}
          </span>
        )}
      </For>

      <For each={projectedTiles()}>
        {(tile) => (
          <span
            class="absolute flex h-(--tile-size) w-(--tile-size) items-end border border-red-500/80 bg-red-500/50 text-sm"
            style={{ top: `${tile.rect.top}px`, left: `${tile.rect.left}px` }}
          >
            {tile.key}
          </span>
        )}
      </For>
    </div>
  );
}
