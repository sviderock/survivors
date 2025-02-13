import Bullet from '~/components/Bullet';
import Enemies from '~/components/Enemies';
import { worldPos } from '~/state';

export default function GameField() {
	return (
		<div
			class="bg-size absolute h-[10000px] w-[10000px] bg-forest bg-[100px_100px]"
			style={{
				transform: `translate3d(${worldPos().x}px, ${worldPos().y}px, 0)`,
			}}
		>
			<Enemies />
			<Bullet />
		</div>
	);
}
