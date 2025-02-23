import { Users, type User } from '@/schema';
import { action, useAction } from '@solidjs/router';
import { eq } from 'drizzle-orm';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';
import { type Hex } from 'viem';
import { appkitModal } from '~/appkit';
import { LoadingSpinner } from '~/components/icons/LoadingSpinner';
import RiUserFacesAccountCircleLine from '~/components/icons/RiUserFacesAccountCircleLine';
import { Avatar } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { db } from '~/db';
import * as divvi from '~/lib/blockchain/divvi';
import { appkitAccountStatus, currentUser } from '~/lib/currentUser';

const updateUserAction = action(async (data: Partial<Omit<User, 'id'>>) => {
	'use server';
	const userId = getRequestEvent()?.locals.session?.userId;
	if (!userId) {
		throw new Error('somehow there is no active user');
	}

	const [user] = await db.update(Users).set(data).where(eq(Users.id, userId)).returning();
	return user!;
}, 'update-divvi-status');

export default function UserAccount() {
	return (
		<Suspense>
			<div class="absolute left-4 top-4 z-50">
				<Switch>
					<Match when={appkitAccountStatus() === 'disconnected'}>
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
						when={
							appkitAccountStatus() === 'connecting' || appkitAccountStatus() === 'reconnecting'
						}
					>
						<Avatar class="size-14 items-center justify-center bg-black p-2 text-4xl text-white">
							<LoadingSpinner />
						</Avatar>
					</Match>

					<Match when={appkitAccountStatus() === 'connected'}>
						<ConnectedUser />
					</Match>
				</Switch>
			</div>
		</Suspense>
	);
}

function ConnectedUser() {
	const { user } = currentUser();
	const updateUser = useAction(updateUserAction);

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
				await updateUser({ divviRegistration: { status: 'was_already_registered' } });
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
			await updateUser({
				divviRegistration: { status: 'transaction_submitted', hash: registerTxHash },
			});
			user.refetch();
			return;
		}

		// at this point we are only waiting for the registration to complete
		const receipt = await divvi.checkIfRegistrationConfirmed(
			user.data.divviRegistration.hash as Hex,
		);
		if (receipt) {
			await updateUser({ divviRegistration: { status: 'registered', receipt } });
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
