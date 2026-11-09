/* global appLocalizer */
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import {
	ClipboardComponent,
	FormGroupComponent,
	FormGroupWrapperComponent,
	NoticeComponent,
	NoticeManager,
} from '@zyra/components';
import { TextInput, ButtonInput } from '@zyra/inputs';
import { TableCard } from '@zyra/table';
import { __ } from '@wordpress/i18n';

import { formatDate } from '../../services/commonFunction';

interface AppPassword {
	uuid: string;
	name: string;
	created: string;
	last_used: string | null;
}

const coreApiUrl = (path: string) => `${appLocalizer.apiUrl}/wp/v2${path}`;
const coreHeaders = () => ({ headers: { 'X-WP-Nonce': appLocalizer.nonce } });
const noop = () => {};

const notify = (
	type: 'success' | 'error' | 'info',
	title: string,
	message: string
) => NoticeManager.add({ title, message, type, position: 'float' });

// appLocalizer.current_user is a serialized WP_User - the login name lives
// under `.data`, not at the top level the TS type declares.
const getCurrentUsername = () => {
	const currentUser = appLocalizer.current_user as unknown as {
		data?: { user_login?: string };
		user_login?: string;
		display_name?: string;
	};

	return (
		currentUser?.data?.user_login ||
		currentUser?.user_login ||
		currentUser?.display_name ||
		''
	);
};

const MCPConnection = () => {
	const [appPasswords, setAppPasswords] = useState<AppPassword[]>([]);
	const [generatedPassword, setGeneratedPassword] = useState<string | null>(
		null
	);
	const [loading, setLoading] = useState(false);

	const loadAppPasswords = useCallback(() => {
		axios
			.get(coreApiUrl('/users/me/application-passwords'), coreHeaders())
			.then((response) => setAppPasswords(response.data))
			.catch(() => setAppPasswords([]));
	}, []);

	useEffect(() => {
		loadAppPasswords();
	}, [loadAppPasswords]);

	const createConnection = useCallback(() => {
		setLoading(true);
		setGeneratedPassword(null);

		axios
			.post(
				coreApiUrl('/users/me/application-passwords'),
				{ name: 'MultiVendorX MCP' },
				coreHeaders()
			)
			.then((response) => {
				setGeneratedPassword(response.data.password);
				loadAppPasswords();
				notify(
					'success',
					__('Success', 'multivendorx'),
					__(
						'MCP connection generated successfully.',
						'multivendorx'
					)
				);
			})
			.catch(() => {
				notify(
					'error',
					__('Error', 'multivendorx'),
					__(
						'Could not create a connection credential.',
						'multivendorx'
					)
				);
			})
			.finally(() => setLoading(false));
	}, [loadAppPasswords]);

	const revokeConnection = useCallback((uuid: string) => {
		axios
			.delete(
				coreApiUrl(`/users/me/application-passwords/${uuid}`),
				coreHeaders()
			)
			.then(() => {
				loadAppPasswords();
				notify(
					'success',
					__('Revoked', 'multivendorx'),
					__(
						'The MCP connection has been revoked.',
						'multivendorx'
					)
				);
			})
			.catch(() => {
				notify(
					'error',
					__('Error', 'multivendorx'),
					__('Could not revoke this connection.', 'multivendorx')
				);
			});
	}, [loadAppPasswords]);

	const tableHeaders = useMemo(
		() => ({
			name: {
				label: __('Name', 'multivendorx'),
			},
			created: {
				label: __('Created', 'multivendorx'),
				render: (row: AppPassword) => formatDate(row.created),
			},
			last_used: {
				label: __('Last used', 'multivendorx'),
				render: (row: AppPassword) =>
					row.last_used
						? formatDate(row.last_used)
						: __('Never', 'multivendorx'),
			},
			actions: {
				label: '',
				render: (row: AppPassword) => (
					<ButtonInput
						position="right"
						buttons={[
							{
								icon: 'trash',
								text: __('Revoke', 'multivendorx'),
								onClick: () => revokeConnection(row.uuid),
							},
						]}
					/>
				),
			},
		}),
		[revokeConnection]
	);

	return (
		<>
			<FormGroupWrapperComponent>
				<FormGroupComponent label={__('Site URL', 'multivendorx')}>
					<TextInput
						value={window.location.origin}
						onChange={noop}
						disabled
					/>
				</FormGroupComponent>

				<FormGroupComponent label={__('Username', 'multivendorx')}>
					<TextInput
						value={getCurrentUsername()}
						onChange={noop}
						disabled
					/>
				</FormGroupComponent>

				{generatedPassword && (
					<FormGroupComponent
						label={__(
							'Application Password (copy now — it will not be shown again)',
							'multivendorx'
						)}
					>
						<ClipboardComponent
							text={generatedPassword}
							copyButtonLabel={__(
								'Copy Password',
								'multivendorx'
							)}
							copiedLabel={__('Copied!', 'multivendorx')}
						/>
					</FormGroupComponent>
				)}
				<FormGroupComponent>
					<ButtonInput
						position="left"
						buttons={[
							{
								icon: 'plus',
								text:
									appPasswords.length > 0
										? __(
											'Generate New MCP Connection',
											'multivendorx'
										)
										: __(
											'Generate MCP Connection',
											'multivendorx'
										),
								onClick: createConnection,
								disabled: loading,
							},
						]}
					/>
				</FormGroupComponent>
				<FormGroupComponent>
					{appPasswords.length > 0 && (
						<NoticeComponent
							type="info"
							displayPosition="inline-notice"
							message={__(
								'You already have an active connection below. Generating a new one does not revoke the old one — revoke credentials you no longer use.',
								'multivendorx'
							)}
						/>
					)}
				</FormGroupComponent>
				{appPasswords.length > 0 && (
					<TableCard
						showMenu={false}
						headers={tableHeaders}
						hideHeader={false}
						rows={appPasswords}
						totalRows={appPasswords.length}
					/>
				)}
			</FormGroupWrapperComponent>
		</>
	);
};

export default MCPConnection;
