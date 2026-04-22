import { useEffect, useState } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import {
	BasicInputUI,
	ButtonInputUI,
	Column,
	Container,
	FormGroup,
	FormGroupWrapper,
	getApiLink
} from "zyra";

const ShipStation = () => {
	const [credential, setCredential] = useState(null);

	const storeId = appLocalizer.store_id;
	const apiBase = `ship-stations/${storeId}`;

	const fetchCredential = () => {
		axios
			.get(getApiLink(appLocalizer, apiBase), {
				headers: { "X-WP-Nonce": appLocalizer.nonce },
			})
			.then((res) => {
				setCredential(res.data);
			})
			.catch(() => {
				setCredential(null);
			});
	};

	useEffect(() => {
		if (storeId) {
			fetchCredential();
		}
	}, [storeId]);

	const handleAddCredential = () => {
		axios
			.post(
				getApiLink(appLocalizer, "ship-stations"),
				{ id: storeId },
				{ headers: { "X-WP-Nonce": appLocalizer.nonce } }
			)
			.then((res) => {
				setCredential(res.data);
			});
	};

	const handleRevokeCredential = () => {
		axios
			.delete(getApiLink(appLocalizer, apiBase), {
				headers: { "X-WP-Nonce": appLocalizer.nonce },
			})
			.then(() => {
				setCredential(null);
			});
	};

	const hasCredential = credential && credential.key_id;

	return (
		<Container>
			<Column>
				<FormGroupWrapper>
					<ButtonInputUI
						buttons={[
							hasCredential
								? {
										icon: "trash",
										text: "Revoke Credential",
										color: "red",
										onClick: handleRevokeCredential,
								  }
								: {
										icon: "plus",
										text: "Add Credential",
										color: "purple",
										onClick: handleAddCredential,
								  },
						]}
					/>

					{hasCredential && (
						<>
							<FormGroup label={__('Consumer Key', 'multivendorx')}>
								<BasicInputUI
									value={credential.consumer_key || ''}
									readOnly={true}
								/>
							</FormGroup>

							<FormGroup label={__('Consumer Secret', 'multivendorx')}>
								<BasicInputUI
									value={credential.consumer_secret || ''}
									readOnly={true}
								/>
							</FormGroup>

							<FormGroup label={__('Auth Key', 'multivendorx')}>
								<BasicInputUI
									value={credential.multivendorx_auth_key || ''}
									readOnly={true}
								/>
							</FormGroup>
						</>
					)}
				</FormGroupWrapper>
			</Column>
		</Container>
	);
};

export default ShipStation;