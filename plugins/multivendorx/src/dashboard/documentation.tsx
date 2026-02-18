import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { AdminButtonUI, Card, getApiLink, ComponentStatusView, PopupUI, ItemList, HeaderSearch } from 'zyra';
import { __ } from '@wordpress/i18n';

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
			url: getApiLink(appLocalizer, 'knowledge'),
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

	const truncateText = (text: string, wordCount: number) => {
		const words = text.split(' ');
		if (words.length <= wordCount) {
			return text;
		}
		return words.slice(0, wordCount).join(' ') + '...';
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
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Documentation', 'multivendorx')}
					</div>
					<div className="des">
						{__('Everything you need to know about store operations', 'multivendorx')}
					</div>
				</div>
			</div>

			<Card>
				<div className="buttons-wrapper">
					<div className="search-field">
						<div className="search-section">
							<BasicInputUI
								type="text"
								placeholder={__(
									'Search documents...',
									'multivendorx'
								)}
								value={searchText}
								onChange={(value) => setSearchText(value)}
							/>
							<i className="adminfont-search"></i>
						</div>
					</div>
				</div>
				<HeaderSearch
					variant="mini-search"
					search={{ placeholder: 'Search .....' }}
					onQueryUpdate={(e) => {
						setSearchQuery(e.searchValue);
						if ('searchAction' in e) {
							setSelectedFilter(e.searchAction);
						}
					}}
				/>
				{filteredDocuments.length === 0 && (
					<ComponentStatusView title={__('No documents found.', 'multivendorx')} />
				)}
				{filteredDocuments.map((doc) => (
					<>
						<ItemList
							className="mini-card"
							border
							items={[
								{
									title: truncateText(doc.title || '', 4),
									icon: 'icon adminfont-contact-form blue',
									desc: <>
										{truncateText(doc.content || '', 10)}
										<a
											className="read-more"
											onClick={() =>
												handleReadMore(doc)
											}
										>
											{__('Read more', 'multivendorx')}
										</a>
									</>,
									tags: (
										<>
											<div className="tag">
												<span className="admin-badge yellow">
													{__('Products', 'multivendorx')}
												</span>
											</div>
										</>
									)
								}]}
						/>
					</>
				))}
			</Card>

			{activeDocument && (
				<PopupUI
					open={popupOpen}
					onClose={() => setPopupOpen(false)}
					width={31.25}
					header={{
						icon: 'contact-form',
						title: activeDocument.title,
					}}
					footer={
						<AdminButtonUI
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
						<p className="des">{activeDocument.content}</p>
					</div>
				</PopupUI>
			)}
		</>
	);
};

export default Documentation;
