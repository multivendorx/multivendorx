import React from 'react';
import { __ } from '@wordpress/i18n';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';

interface TablePageProps {
	headerIcon: string;
	headerTitle: string;
	headerDescription: string;
	/** e.g. Reports' "Generate report" button — rendered on the error-state card too, matching Reports.tsx's existing behavior. */
	headerAction?: React.ReactNode;
	error: string | null;
	onRetry: () => void;
	/** Defaults to headerTitle — only needed when the error card should say something more specific. */
	errorTitle?: string;
	children: React.ReactNode;
}

/**
 * The NavigatorHeaderComponent + ContainerComponent/ColumnComponent +
 * error/retry-card shell every table page (Automation, Activity, AI
 * Assistant, Reports, FindingsTable) was hand-rolling near-identically —
 * extracted once here so a table page only ever needs to render its own
 * `<TableCard>` as `children`.
 */
const TablePage: React.FC<TablePageProps> = ({
	headerIcon,
	headerTitle,
	headerDescription,
	headerAction,
	error,
	onRetry,
	errorTitle,
	children,
}) => {
	const pageHeader = (
		<NavigatorHeaderComponent
			headerIcon={headerIcon}
			headerTitle={headerTitle}
			headerDescription={headerDescription}
		/>
	);

	if (error) {
		return (
			<>
				{pageHeader}
				<ContainerComponent general>
					<ColumnComponent>
						<CardComponent title={headerTitle} action={headerAction}>
							<ModuleGuardComponent
								icon="warning"
								title={
									errorTitle ||
									__('Could not load this data', 'vulopilot')
								}
								desc={error}
								buttonText={__('Retry', 'vulopilot')}
								onButtonClick={onRetry}
							/>
						</CardComponent>
					</ColumnComponent>
				</ContainerComponent>
			</>
		);
	}

	return (
		<>
			{pageHeader}
			<ContainerComponent general>
				<ColumnComponent>{children}</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default TablePage;
