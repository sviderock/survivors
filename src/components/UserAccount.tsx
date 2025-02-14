import { createQuery, QueryClient } from '@tanstack/solid-query';
import { createEffect, ErrorBoundary, Match, onMount, Suspense, Switch } from 'solid-js';
import { getUser } from '~/api/users';
import { appkitModal } from '~/appkit';
import { Avatar } from '~/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { LoadingSpinner } from '~/icons/LoadingSpinner';
import RiUserFacesAccountCircleLine from '~/icons/RiUserFacesAccountCircleLine';
import { connectedUser, setConnectedUser } from '~/state';

export default function UserAccount() {
	const userAddresses = () => connectedUser.allAccounts.map((acc) => acc.address);

	onMount(() => {
		appkitModal.subscribeAccount(setConnectedUser);
	});

	return (
		<div class="absolute left-4 top-4">
			<Switch>
				<Match when={connectedUser.status === 'disconnected'}>
					<Tooltip>
						<TooltipTrigger>
							<Avatar
								class="size-14 cursor-pointer items-center justify-center bg-black p-2 text-4xl text-white"
								onClick={() => {
									appkitModal.open();
								}}
							>
								<RiUserFacesAccountCircleLine />
							</Avatar>
						</TooltipTrigger>
						<TooltipContent>Connect your account</TooltipContent>
					</Tooltip>
				</Match>

				<Match
					when={connectedUser.status === 'connecting' || connectedUser.status === 'reconnecting'}
				>
					<Avatar class="size-14 items-center justify-center bg-black p-2 text-4xl text-white">
						<LoadingSpinner />
					</Avatar>
				</Match>

				<Match when={connectedUser.status === 'connected' && !!userAddresses().length}>
					<ConnectedUser addresses={userAddresses()} />
				</Match>
			</Switch>
		</div>
	);
}

async function getUserByAddresses(addresses: string[]) {
	'use server';
	const data = await getUser(addresses);
	return data;
}

function ConnectedUser(props: { addresses: string[] }) {
	const user = createQuery(() => ({
		queryKey: ['currentUser', props.addresses],
		queryFn: () => getUserByAddresses(props.addresses),
		enabled: !!props.addresses.length,
	}));

	return (
		<Avatar
			class="size-14 cursor-pointer items-center justify-center bg-green-500 p-2 text-4xl text-green-100"
			onClick={() => {
				appkitModal.open();
			}}
		>
			<RiUserFacesAccountCircleLine />
		</Avatar>
	);
}
