import { For, onMount, type ParentProps } from 'solid-js';
import { produce } from 'solid-js/store';
import { TILE_SIZE } from '~/constants';
import { gameState, setGameState, worldRect } from '~/state';
import { getNewPos, getRect } from '~/utils';

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
	}): Pick<GameState, 'occupiedMatrix' | 'terrainRect' | 'tileInfo'> {
		const terrainRect = getRect(worldRef!);
		const occupiedMatrix: GameState['occupiedMatrix'] = [];
		const tileInfo: GameState['tileInfo'] = {};

		for (let row = 0; row < gridSize.rows; row++) {
			occupiedMatrix[row] = [];
			for (let col = 0; col < gridSize.columns; col++) {
				occupiedMatrix[row]![col] = 0;
				tileInfo[getTileInfoKey(row, col)] = getNewPos({
					x: col * TILE_SIZE + terrainRect.x,
					y: row * TILE_SIZE + terrainRect.y,
					width: TILE_SIZE,
					height: TILE_SIZE,
				});
			}
		}
		return { occupiedMatrix, tileInfo, terrainRect };
	}

	onMount(() => {
		const { occupiedMatrix, tileInfo, terrainRect } = buildTiles(getGridSize());
		setGameState(
			produce((state) => {
				state.occupiedMatrix = occupiedMatrix;
				state.terrainRect = terrainRect;
				state.tileInfo = tileInfo;
			}),
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
			<TileGrid />
			{props.children}
		</div>
	);
}

function TileGrid() {
	return (
		<div class="absolute bottom-0 left-1/2 right-0 top-1/2">
			<For each={gameState.occupiedMatrix}>
				{(tileY, idxY) => (
					<For each={tileY}>
						{(tileX, idxX) => {
							if (!tileX) return null;
							return (
								<span
									class="absolute flex h-tile w-tile items-end border border-red-500 text-sm"
									style={{
										top: `${gameState.tileInfo[getTileInfoKey(idxY(), idxX())]!.top}px`,
										left: `${gameState.tileInfo[getTileInfoKey(idxY(), idxX())]!.left}px`,
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
