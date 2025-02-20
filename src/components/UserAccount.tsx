import { createMutation, createQuery } from '@tanstack/solid-query';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { type Hex } from 'viem';
import { appkitModal } from '~/appkit';
import * as divvi from '~/blockchain/divvi';
import { useAppkitAccount } from '~/components/Game';
import { Avatar } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { LoadingSpinner } from '~/icons/LoadingSpinner';
import RiUserFacesAccountCircleLine from '~/icons/RiUserFacesAccountCircleLine';
import type { PatchUsersBody, PostUsers } from '~/routes/api/users';
import { encodeJson } from '~/utils';

export default function UserAccount() {
	const appkitAccount = useAppkitAccount();
	const userAddresses = () => appkitAccount.allAccounts.map((acc) => acc.address);

	return (
		<Suspense>
			<div class="absolute left-4 top-4 z-50">
				<Switch>
					<Match when={appkitAccount.status === 'disconnected'}>
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
						when={appkitAccount.status === 'connecting' || appkitAccount.status === 'reconnecting'}
					>
						<Avatar class="size-14 items-center justify-center bg-black p-2 text-4xl text-white">
							<LoadingSpinner />
						</Avatar>
					</Match>

					<Match when={appkitAccount.status === 'connected' && !!userAddresses().length}>
						<ConnectedUser />
					</Match>
				</Switch>
			</div>
		</Suspense>
	);
}

export function useCurrentUser() {
	const appkitAccount = useAppkitAccount();
	const userAddresses = () => {
		return appkitAccount.allAccounts.map((acc) => acc.address);
	};

	const data = createQuery(() => ({
		queryKey: ['currentUser', userAddresses()],
		queryFn: async () => {
			const resp = await fetch('/api/users/', {
				method: 'POST',
				body: encodeJson({ addresses: userAddresses() }),
			});
			return (await resp.json()) as PostUsers;
		},
		enabled: !!userAddresses().length,
		// refetchInterval: 10_000,
	}));
	return data;
}

export function useLogout() {
	return createMutation(() => ({
		mutationKey: ['logout'],
		mutationFn: () => fetch('/api/users/logout', { method: 'POST' }),
	}));
}

function ConnectedUser() {
	const user = useCurrentUser();

	async function syncWithDivvi() {
		if (!user.data) return;
		if (user.data.divviRegistration.status === 'was_already_registered') return;
		if (user.data.divviRegistration.status === 'registered') return;

		// if we haven't checked this user yet
		if (user.data.divviRegistration.status === 'unchecked') {
			const unregisteredProtocols = await divvi.getUnrigesteredProtocols(
				user.data.addresses[0]!.address,
			);

			// it was unchecked but it is already registered so just update the user
			if (unregisteredProtocols.length === 0) {
				await fetch('/api/users', {
					method: 'PATCH',
					body: encodeJson<PatchUsersBody>({
						divviRegistration: { status: 'was_already_registered' },
					}),
				});
				user.refetch();
				return;
			}

			// try to register user
			const registerTxHash = await divvi.sendRegistrationTransaction();
			if (!registerTxHash) {
				console.error("couldn't register tx");
				return;
			}

			// if transaction sent successfully then update the user
			await fetch('/api/users', {
				method: 'PATCH',
				body: encodeJson<PatchUsersBody>({
					divviRegistration: { status: 'transaction_submitted', hash: registerTxHash },
				}),
			});
			user.refetch();
			return;
		}

		// at this point we are only waiting for the registration to complete
		const receipt = await divvi.checkIfRegistrationConfirmed(
			user.data.divviRegistration.hash as Hex,
		);
		if (receipt) {
			await fetch('/api/users', {
				method: 'PATCH',
				body: encodeJson<PatchUsersBody>({ divviRegistration: { status: 'registered', receipt } }),
			});
			user.refetch();
		}
	}

	return (
		<div class="flex items-center gap-2">
			<Avatar
				class="size-14 cursor-pointer items-center justify-center bg-green-500 p-2 text-4xl text-green-100"
				onClick={() => {
					appkitModal.open();
				}}
			>
				<RiUserFacesAccountCircleLine />
			</Avatar>

			<Show when={user.data}>
				<Button variant="secondary" onClick={() => syncWithDivvi()}>
					{user.data!.divviRegistration.status}
				</Button>
			</Show>
		</div>
	);
}
