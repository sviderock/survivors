import { clientOnly } from '@solidjs/start';

const ClientOnlyGame = clientOnly(() => import('../components/Game'));

export default function Index() {
	return <ClientOnlyGame />;
}
