/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';

import {
	FormGroupComponent,
	FormGroupWrapperComponent,
	NoticeManager,
} from '@zyra/components';
import { TextInput, ButtonInput } from '@zyra/inputs';
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

	const loadAppPasswords = () => {
		axios
			.get(coreApiUrl('/users/me/application-passwords'), coreHeaders())
			.then((response) => setAppPasswords(response.data))
			.catch(() => setAppPasswords([]));
	};

	useEffect(() => {
		loadAppPasswords();
	}, []);

	const createConnection = () => {
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
			})
			.catch(() => {
				NoticeManager.add({
					title: __('Error', 'multivendorx'),
					message: __(
						'Could not create a connection credential.',
						'multivendorx'
					),
					type: 'error',
					position: 'float',
				});
			})
			.finally(() => setLoading(false));
	};

	const revokeConnection = (uuid: string) => {
		axios
			.delete(
				coreApiUrl(`/users/me/application-passwords/${uuid}`),
				coreHeaders()
			)
			.then(() => {
				loadAppPasswords();
				NoticeManager.add({
					title: __('Revoked', 'multivendorx'),
					message: __(
						'The MCP connection has been revoked.',
						'multivendorx'
					),
					type: 'success',
					position: 'float',
				});
			})
			.catch(() => {
				NoticeManager.add({
					title: __('Error', 'multivendorx'),
					message: __(
						'Could not revoke this connection.',
						'multivendorx'
					),
					type: 'error',
					position: 'float',
				});
			});
	};

	const copyToClipboard = (value: string) => {
		navigator.clipboard?.writeText(value);
		NoticeManager.add({
			title: __('Copied', 'multivendorx'),
			message: __('Copied to clipboard.', 'multivendorx'),
			type: 'success',
			position: 'float',
		});
	};

	return (
		<>
			<FormGroupWrapperComponent>
				<FormGroupComponent label={__('Site URL', 'multivendorx')}>
					<TextInput
						value={window.location.origin}
						onChange={() => {}}
						disabled
					/>
				</FormGroupComponent>

				<FormGroupComponent label={__('Username', 'multivendorx')}>
					<TextInput
						value={getCurrentUsername()}
						onChange={() => {}}
						disabled
					/>
				</FormGroupComponent>

				{generatedPassword && (
					<>
						<FormGroupComponent
							label={__(
								'Application Password (copy now — it will not be shown again)',
								'multivendorx'
							)}
						>
							<TextInput
								value={generatedPassword}
								onChange={() => {}}
								disabled
							/>
						</FormGroupComponent>

						<ButtonInput
							position="right"
							buttons={[
								{
									icon: 'copy',
									text: __('Copy Password', 'multivendorx'),
									onClick: () =>
										copyToClipboard(generatedPassword),
								},
							]}
						/>
					</>
				)}

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

				{appPasswords.length > 0 && (
					<p className="mcp-connection-hint">
						{__(
							'You already have an active connection below. Generating a new one does not revoke the old one — revoke credentials you no longer use.',
							'multivendorx'
						)}
					</p>
				)}

				{appPasswords.length > 0 && (
					<table className="mcp-connection-list widefat">
						<thead>
							<tr>
								<th>{__('Name', 'multivendorx')}</th>
								<th>{__('Created', 'multivendorx')}</th>
								<th>{__('Last used', 'multivendorx')}</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{appPasswords.map((appPassword: AppPassword) => (
								<tr key={appPassword.uuid}>
									<td>{appPassword.name}</td>
									<td>{formatDate(appPassword.created)}</td>
									<td>
										{appPassword.last_used
											? formatDate(appPassword.last_used)
											: __('Never', 'multivendorx')}
									</td>
									<td>
										<ButtonInput
											position="right"
											buttons={[
												{
													icon: 'trash',
													text: __(
														'Revoke',
														'multivendorx'
													),
													onClick: () =>
														revokeConnection(
															appPassword.uuid
														),
												},
											]}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</FormGroupWrapperComponent>
		</>
	);
};

export default MCPConnection;
