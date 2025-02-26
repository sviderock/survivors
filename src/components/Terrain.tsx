import { For, onMount, type ParentProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import { GAME_WORLD_SIZE, TILE_SIZE } from '~/constants';
import { worldRect } from '~/state';
import { getInitialRect, getNewPos, getRect } from '~/utils';

type TilesOccupiedMatrix = number[][];
type TileInfo = { [tileXY: string]: Rect };

export const [tiles, setTiles] = createStore({
	rect: getInitialRect({
		x: -GAME_WORLD_SIZE / 2,
		y: -GAME_WORLD_SIZE / 2,
		width: GAME_WORLD_SIZE,
		height: GAME_WORLD_SIZE,
	}),
	occupiedMatrix: [] as TilesOccupiedMatrix,
	info: {} as TileInfo,
});

function getTileInfoKey(y: number, x: number) {
	return `${y}-${x}`;
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

	function buildTiles(gridSize: { rows: number; columns: number }): typeof tiles {
		const occupiedMatrix: number[][] = [];
		const info: TileInfo = {};
		const rect = getRect(worldRef!);

		for (let y = 0; y < gridSize.rows; y++) {
			occupiedMatrix[y] = [];
			for (let x = 0; x < gridSize.columns; x++) {
				occupiedMatrix[y]![x] = 0;
				info[getTileInfoKey(x, y)] = getNewPos({
					x: x * TILE_SIZE + rect.x,
					y: y * TILE_SIZE + rect.y,
					width: TILE_SIZE,
					height: TILE_SIZE,
				});
			}
		}
		return { occupiedMatrix, info, rect };
	}

	onMount(() => {
		const tiles = buildTiles(getGridSize());
		setTiles(tiles);
	});

	return (
		<div
			ref={worldRef}
			class="h-world w-world bg-forest [image-rendering:pixelated]"
			style={{
				transform: `translate3d(calc(-50% + ${worldRect.x}px), calc(-50% + ${worldRect.y}px), 0)`,
			}}
		>
			<TileGrid />
			{props.children}
		</div>
	);
}

function TileGrid() {
	return (
		<div class="absolute bottom-0 left-1/2 right-0 top-1/2">
			<For each={tiles.occupiedMatrix}>
				{(tileY, idxY) => (
					<For each={tileY}>
						{(tileX, idxX) => {
							if (!tileX) return null;
							return (
								<span
									class="h-tile w-tile absolute border border-red-500 text-sm"
									style={{
										top: `${tiles.info[getTileInfoKey(idxY(), idxX())]!.top}px`,
										left: `${tiles.info[getTileInfoKey(idxY(), idxX())]!.left}px`,
										'background-color': tileX ? 'red' : 'unset',
									}}
								>
									{idxY()}, {idxX()}
								</span>
							);
						}}
					</For>
				)}
			</For>
		</div>
	);
}
