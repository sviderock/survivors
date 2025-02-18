import { stageTimer } from '~/state';
import { msToTime } from '~/utils';

export default function StageTimer() {
	const formattedTime = () => msToTime(stageTimer());

	return <span class="absolute left-1/2 top-6 -translate-x-1/2 text-4xl">{formattedTime()}</span>;
}
