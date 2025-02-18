import type { UserType } from '@/schema';
import { createQuery } from '@tanstack/solid-query';
import { Match, Switch } from 'solid-js';
import { appkitModal } from '~/appkit';
import { Avatar } from '~/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { LoadingSpinner } from '~/icons/LoadingSpinner';
import RiUserFacesAccountCircleLine from '~/icons/RiUserFacesAccountCircleLine';
import { connectedUser } from '~/state';
import { encodeJson } from '~/utils';

export default function UserAccount() {
	const userAddresses = () => connectedUser.allAccounts.map((acc) => acc.address);

	return (
		<div class="absolute left-4 top-4 z-50">
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
					<ConnectedUser />
				</Match>
			</Switch>
		</div>
	);
}

export function useUser() {
	const userAddresses = () => connectedUser.allAccounts.map((acc) => acc.address);
	return createQuery(() => ({
		queryKey: ['currentUser', userAddresses()],
		queryFn: async () => {
			const resp = await fetch('/api/users/', {
				method: 'POST',
				body: encodeJson({ addresses: userAddresses() }),
			});
			return (await resp.json()) as UserType;
		},
		enabled: !!connectedUser.address?.length,
	}));
}

function ConnectedUser() {
	return (
		<div class="flex flex-col gap-2">
			<Avatar
				class="size-14 cursor-pointer items-center justify-center bg-green-500 p-2 text-4xl text-green-100"
				onClick={() => {
					appkitModal.open();
				}}
			>
				<RiUserFacesAccountCircleLine />
			</Avatar>
		</div>
	);
}
