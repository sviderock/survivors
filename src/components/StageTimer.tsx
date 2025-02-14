import { stageTimer } from '~/state';
import { msToTime } from '~/utils';

export default function StageTimer() {
	const formattedTime = () => msToTime(stageTimer());

	return <span class="">{formattedTime()}</span>;
}
