import { clientOnly } from '@solidjs/start';

const ClientOnly = clientOnly(() => import('../components/GameField'));

export default function Index() {
	return <ClientOnly />;
}
