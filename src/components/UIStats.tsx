import FPSCounter from '~/components/FPSCounter';
import MemoryUsage from '~/components/Memory';
import { PingClientOnly } from '~/components/Ping';

export default function UIStats() {
	return (
		<div class="absolute right-4 top-2 flex w-[300px] flex-col items-end justify-between rounded-md border-2 bg-white p-2 px-4">
			<MemoryUsage />
			<div class="flex gap-2">
				<PingClientOnly />
				<FPSCounter />
			</div>
		</div>
	);
}
