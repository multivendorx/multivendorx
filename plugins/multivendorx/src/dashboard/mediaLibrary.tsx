import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Analytics, Column, Container, NavigatorHeader } from 'zyra';

const MediaLibrary = () => {
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
	const overviewData = [
		{
			icon: 'submission-message',
			number: '1',
			text: __('Total Files', 'multivendorx'),
			iconClass: 'primary',
		},
		{
			icon: 'image',
			number: '0',
			text: __('Images', 'multivendorx'),
			iconClass: 'green',
		},
		{
			icon: 'save',
			number: '1',
			text: __('Videos', 'multivendorx'),
			iconClass: 'orange',
		},
		{
			icon: 'document',
			number: '1',
			text: __('Documents', 'multivendorx'),
			iconClass: 'yellow',
		},
	];
	return (
		<>
			<NavigatorHeader
				headerTitle={__('Media Library', 'multivendorx')}
				headerDescription={__(
					"Manage your store's media assetsManage your rental inventory items",
					'multivendorx'
				)}
				buttons={[
					{
						label: __('Upload Media', 'multivendorx'),
						icon: 'export',
					},
				]}
			/>
			<Container general>
				<Column>
					<Analytics data={overviewData} />
				</Column>
				<Column>
					<div className="choice-toggle-wrapper view-toggle">
						<div className="tabs-wrapper">
							{(['list', 'grid'] as const).map((mode) => (
								<div
									key={mode}
									role="button"
									tabIndex={0}
									onClick={() => setViewMode(mode)}
									onKeyDown={(e) =>
										e.key === 'Enter' && setViewMode(mode)
									}
									className="toggle-option"
								>
									<input
										className="choice-toggle-form-input"
										type="radio"
										id={`${mode}-view`}
										name="view-mode"
										value={mode}
										checked={viewMode === mode}
										readOnly
									/>
									<label htmlFor={`${mode}-view`}>
										<i
											className={
												mode === 'list'
													? 'adminfont-editor-list-ul'
													: 'adminfont-module'
											}
										></i>
									</label>
								</div>
							))}
						</div>
					</div>
					{viewMode === 'grid' && (
						<div className="media-library-grid">
							{[
								{
									name: 'Product Photo 1',
									size: '2.4 MB',
									category: 'Products',
									type: 'image',
									src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
								},
								{
									name: 'Store Banner',
									size: '3.1 MB',
									category: 'Marketing',
									type: 'image',
									src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
								},
								{
									name: 'Product Video',
									size: '15.2 MB',
									category: 'Products',
									type: 'video',
								},
								{
									name: 'Logo Vector',
									size: '0.8 MB',
									category: 'Branding',
									type: 'file',
								},
								{
									name: 'Product Photo 1',
									size: '2.4 MB',
									category: 'Products',
									type: 'image',
									src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
								},
								{
									name: 'Store Banner',
									size: '3.1 MB',
									category: 'Marketing',
									type: 'image',
									src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
								},
								{
									name: 'Product Video',
									size: '15.2 MB',
									category: 'Products',
									type: 'video',
								},
								{
									name: 'Logo Vector',
									size: '0.8 MB',
									category: 'Branding',
									type: 'file',
								},
							].map((item, index) => (
								<div
									key={index}
									className={`media-item media-${item.type}`}
								>
									{item.type === 'image' && (
										<div
											className="media-preview"
											style={{
												backgroundImage: `url(${item.src})`,
											}}
										/>
									)}

									{item.type === 'video' && (
										<div className="media-icon">
											<i className="adminfont-image"></i>
										</div>
									)}

									{item.type === 'file' && (
										<div className="media-icon">
											<i className="adminfont-document"></i>
										</div>
									)}

									<div className="media-info">
										<div className="title">{item.name}</div>
										<div className="media-meta">
											<span>{item.size}</span>
											<span>{item.category}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</Column>
			</Container>
		</>
	);
};

export default MediaLibrary;
