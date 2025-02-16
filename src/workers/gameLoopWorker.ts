import { expose } from 'comlink';

const worker = {
	updateEnemyPositions: () => {},
};

export type GameLoopWorker = typeof worker;

expose(worker);
