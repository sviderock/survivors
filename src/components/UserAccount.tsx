import { Match, onMount, Switch } from 'solid-js';
import { appkitModal } from '~/appkit';
import { Avatar } from '~/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { LoadingSpinner } from '~/icons/LoadingSpinner';
import RiUserFacesAccountCircleLine from '~/icons/RiUserFacesAccountCircleLine';
import { connectedUser, setConnectedUser } from '~/state';

export default function UserAccount() {
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

				<Match when={connectedUser.status === 'connected'}>
					<Avatar
						class="size-14 cursor-pointer items-center justify-center bg-green-500 p-2 text-4xl text-green-100"
						onClick={() => {
							appkitModal.open();
						}}
					>
						<RiUserFacesAccountCircleLine />
					</Avatar>
				</Match>
			</Switch>
		</div>
	);
}
