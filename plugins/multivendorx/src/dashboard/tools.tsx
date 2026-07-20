import React from 'react';
import { __ } from '@wordpress/i18n';

import { ButtonInputUI } from '@zyra/inputs';
import { Card, NavigatorHeader } from '@zyra/components';

const Tools: React.FC = () => {
	return (
		<>
			<NavigatorHeader
				headerTitle={__('Tools', 'multivendorx')}
				headerDescription={__(
					'Use these tools if your store dashboard is showing outdated or incorrect information.',
					'multivendorx'
				)}
			/>

			<Card
				title={__('Refresh store dashboard data', 'multivendorx')}
				desc={__(
					'Your dashboard stores temporary data (transients) to load faster. If your dashboard shows outdated information or recent changes are not visible, clearing the transients will refresh the data and display the latest updates.',
					'multivendorx'
				)}
			>
				<ButtonInputUI
					position="left"
					buttons={[
						{
							icon: 'delete',
							text: __('Clear Transients', 'multivendorx'),
							color: 'red',
							// onClick: (e) => {
							//     handleDownloadLog?.(e);
							// },
						},
					]}
				/>
			</Card>
		</>
	);
};

export default Tools;
