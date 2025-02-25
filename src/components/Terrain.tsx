import { onMount, type ParentProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import { worldRect } from '~/state';
import { getNewPos } from '~/utils';

type TilesOccupiedMatrix = number[][];
type TileInfo = { [tileXY: string]: Rect };

const TILE_SIZE = 60;

const [tiles, setTiles] = createStore({
	occupiedMatrix: [] as TilesOccupiedMatrix,
	info: {} as TileInfo,
});

function getTileInfoKey(x: number, y: number) {
	return `${x}-${y}`;
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
		for (let y = 0; y < gridSize.rows; y++) {
			occupiedMatrix[y] = [];
			for (let x = 0; x < gridSize.columns; x++) {
				occupiedMatrix[y]![x] = 0;
				info[getTileInfoKey(x, y)] = getNewPos({
					x: x * TILE_SIZE,
					y: y * TILE_SIZE,
					width: x * TILE_SIZE + TILE_SIZE,
					height: y * TILE_SIZE + TILE_SIZE,
				});
			}
		}
		return { occupiedMatrix, info };
	}

	onMount(() => {
		const tiles = buildTiles(getGridSize());
		setTiles(tiles);
	});

	return (
		<div
			ref={worldRef}
			class="w-world h-world bg-forest [image-rendering:pixelated]"
			style={{
				transform: `translate3d(calc(-50% + ${worldRect().x}px), calc(-50% + ${worldRect().y}px), 0)`,
			}}
		>
			<TileGrid />
			{props.children}
		</div>
	);
}

function TileGrid() {
	return (
		<div class="absolute bottom-0 left-0 right-0 top-0" style={{ '--tile-size': `${TILE_SIZE}px` }}>
			{/* <For each={tiles.occupiedMatrix}>
				{(tileY, idxY) => (
					<For each={tileY}>
						{(tileX, idxX) => (
							<span
								class="absolute h-[--tile-size] w-[--tile-size] border border-red-500"
								style={{
									top: `${tiles.info[getTileInfoKey(idxX(), idxY())]!.top}px`,
									left: `${tiles.info[getTileInfoKey(idxX(), idxY())]!.left}px`,
								}}
							/>
						)}
					</For>
				)}
			</For> */}
		</div>
	);
}
