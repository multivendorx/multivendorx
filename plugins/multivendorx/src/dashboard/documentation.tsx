/* global appLocalizer */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getApiLink } from '@zyra/core';

import { ButtonInput } from '@zyra/inputs';
import { AdminHeaderSearch } from '@zyra/admin';
import {
	CardComponent,
	ComponentStatusComponent,
	PopupComponent,
	ListComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { __ } from '@wordpress/i18n';
import { truncateText } from '@/services/commonFunction';

type DocumentItem = {
	id: number;
	title: string;
	content?: string;
	description?: string;
	icon?: string;
	date?: string;
	status?: string;
};

const Documentation: React.FC = () => {
	const [data, setData] = useState<DocumentItem[]>([]);
	const [popupOpen, setPopupOpen] = useState(false);
	const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(
		null
	);
	const [searchText, setSearchText] = useState('');

	function requestData() {
		setData([]);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'knowledgebase'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				status: 'publish',
			},
		})
			.then((response) => {
				const apiData = response.data || [];
				setData(apiData);
			})
			.catch(() => {
				setData([]);
			});
	}

	useEffect(() => {
		requestData();
	}, []);

	const handleReadMore = (doc: DocumentItem) => {
		setActiveDocument(doc);
		setPopupOpen(true);
	};

	//Filter logic — works for API data
	const filteredDocuments = data.filter((doc) => {
		const title = doc.title?.toLowerCase() || '';
		const content = doc.content?.toLowerCase() || '';
		return (
			title.includes(searchText.toLowerCase()) ||
			content.includes(searchText.toLowerCase())
		);
	});
	const handlePrint = (doc: DocumentItem) => {
		const printWindow = window.open('', '_blank', 'width=800,height=600');
		if (printWindow) {
			printWindow.document.write(`
                <html>
                    <head>
                        <title>${doc.title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 1.25rem; }
                            h2 { color: #333; }
                            p { line-height: 1.5; }
                        </style>
                    </head>
                    <body>
                        <h2>${doc.title}</h2>
                        <p>${doc.content}</p>
                    </body>
                </html>
            `);
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
		}
	};

	return (
		<>
			<NavigatorHeaderComponent
				headerTitle={__('Documentation', 'multivendorx')}
				headerDescription={__(
					'Admin-shared guides and documentation for managing your store can be accessed.',
					'multivendorx'
				)}
			/>

			<CardComponent>
				<AdminHeaderSearch
					// variant="mini-search"
					search={{ placeholder: 'Search .....' }}
					onQueryUpdate={(e) => {
						setSearchText(e.searchValue);
					}}
				/>
				{filteredDocuments.length === 0 && (
					<ComponentStatusComponent
						title={__('No documents found.', 'multivendorx')}
					/>
				)}
				<ListComponent
					className="mini-card documentation"
					border
					items={filteredDocuments.map((doc) => ({
						title: truncateText(doc.title || '', 4),
						icon: 'icon adminfont-contact-form blue',
						desc: (
							<>
								{truncateText(doc.content || '', 10)}
								<a
									className="read-more"
									onClick={() => handleReadMore(doc)}
								>
									{__('Read more', 'multivendorx')}
								</a>
							</>
						),
					}))}
				/>
			</CardComponent>

			{activeDocument && (
				<PopupComponent
					open={popupOpen}
					onClose={() => setPopupOpen(false)}
					width='90%'
					height='90%'
					header={{
						icon: 'contact-form',
						title: activeDocument.title,
					}}
					footer={
						<ButtonInput
							buttons={[
								{
									icon: 'close',
									text: __('Close', 'multivendorx'),
									color: 'red',
									onClick: () => setPopupOpen(false),
								},
								{
									icon: 'import',
									text: __('Print', 'multivendorx'),
									color: 'purple',
									onClick: () => handlePrint(activeDocument),
								},
							]}
						/>
					}
				>
					<div className="document-popup-wrapper">
						<div className="heading">{activeDocument.title}</div>
						<div
							className="des"
							dangerouslySetInnerHTML={{
								__html: activeDocument.content || '',
							}}
						/>
					</div>
				</PopupComponent>
			)}
		</>
	);
};

export default Documentation;
