/**
 * External dependencies
 */
import { LinkProps } from 'react-router-dom';
import { useState, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import AdminFooter, { SupportLink } from './AdminFooter';
import '../styles/web/Tabs.scss';

// Types
type TabContent = {
	id: string;
	name: string;
	desc?: string;
	icon?: string;
	link?: string;
	proDependent?: boolean;
};

type TabData = {
	type: 'file' | 'folder';
	content: TabContent | TabData[];
};
type TabsProps = {
	tabData: TabData[];
	currentTab: string;
	getForm: ( currentTab: string ) => ReactNode;
	prepareUrl: ( tabId: string ) => string;
	HeaderSection?: () => JSX.Element;
	BannerSection?: () => JSX.Element;
	horizontally?: boolean;
	appLocalizer: any;
	brandImg: string;
	smallbrandImg: string;
	supprot: SupportLink[];
	Link: React.ElementType< LinkProps >;
};

const Tabs: React.FC< TabsProps > = ( {
	tabData,
	currentTab,
	getForm,
	prepareUrl,
	HeaderSection,
	BannerSection,
	horizontally,
	appLocalizer,
	brandImg,
	smallbrandImg,
	supprot,
	Link,
} ) => {
	const [ menuCol, setMenuCol ] = useState( false );
	const [ openedSubtab, setOpenedSubtab ] = useState( '' );

	const showTabSection: React.FC< TabContent > = ( tab ) => {
		return tab.link ? (
			<a href={ tab.link }>
				<div>
					{ tab.icon && (
						<i className={ `admin-font ${ tab.icon }` }></i>
					) }
				</div>
				<div>
					<p className="menu-name">{ menuCol ? null : tab.name }</p>
					<p className="menu-desc">{ menuCol ? null : tab.desc }</p>
				</div>
			</a>
		) : (
			<Link
				className={ currentTab === tab.id ? 'active-current-tab' : '' }
				to={ prepareUrl( tab.id ) }
			>
				<div>
					{ tab.icon && (
						<i className={ ` admin-font ${ tab.icon } ` }></i>
					) }
					{ menuCol
						? null
						: ! appLocalizer.khali_dabba &&
						  tab.proDependent && (
								<span className="admin-pro-tag">Pro</span>
						  ) }
				</div>
				<div>
					<p className="menu-name">{ menuCol ? null : tab.name }</p>
					<p className="menu-desc">{ menuCol ? null : tab.desc }</p>
				</div>
			</Link>
		);
	};

	const showHideMenu: React.FC< TabContent > = ( tab ) => {
		let dropdownClass = 'tab-menu-dropdown-icon';

		if ( menuCol ) {
			dropdownClass = '';
		} else if ( openedSubtab === tab.id ) {
			dropdownClass += ' active';
		}
		return (
			<Link
				className={ currentTab === tab.id ? 'active-current-tab' : '' }
				onClick={ ( e ) => {
					e.preventDefault();
					if ( openedSubtab === tab.id ) {
						setOpenedSubtab( '' );
					} else {
						setOpenedSubtab( tab.id );
					}
				} }
				to={ '#' }
			>
				<div>
					{ tab.icon && (
						<i className={ ` admin-font ${ tab.icon } ` }></i>
					) }
				</div>
				<div className="drop-down-section">
					<div>
						<p className="menu-name">
							{ menuCol ? null : tab.name }
						</p>
						<p className="menu-desc">
							{ menuCol ? null : tab.desc }
						</p>
					</div>
					{ menuCol ? null : (
						<p className={ dropdownClass }>
							<i className="admin-font adminlib-keyboard-arrow-down"></i>
						</p>
					) }
				</div>
			</Link>
		);
	};

	// Get the description of the current tab.
	const getTabDescription: React.FC< TabData[] > = ( tabDataVal ) => {
		return tabDataVal?.map( ( { content, type } ) => {
			if ( type === 'file' ) {
				return (
					( content as TabContent ).id === currentTab &&
					( content as TabContent ).id !== 'support' && (
						<div className="tab-description-header">
							<div className="child">
								<p>
									<i
										className={ `admin-font ${
											( content as TabContent ).icon
										}` }
									></i>
								</p>
								<div>
									<div className="tab-name">
										{ ( content as TabContent ).name }
									</div>
									<div className="tab-desc">
										{ ( content as TabContent ).desc }
									</div>
								</div>
							</div>
						</div>
					)
				);
			} else if ( type === 'folder' ) {
				// Get tab description from child by recursion
				return getTabDescription( content as TabData[] );
			}
			return null;
		} );
	};

	const handleMenuShow = () => {
		setMenuCol( ! menuCol );
	};

	return (
		<>
			<div className={ ` general-wrapper ` }>
				{ HeaderSection && <HeaderSection /> }

				{ BannerSection && <BannerSection /> }
				<div
					className={ `middle-container-wrapper ${
						horizontally ? 'horizontal-tabs' : 'vertical-tabs'
					}` }
				>
					<div
						className={ `${
							menuCol ? 'show-menu' : ''
						} middle-child-container` }
					>
						<div
							id="current-tab-lists"
							className="current-tab-lists"
						>
							<div className="brand">
								<img
									className="logo"
									src={ menuCol ? smallbrandImg : brandImg }
									alt="Logo"
								/>
								<img
									className="logo-small"
									src={ smallbrandImg }
									alt="Logo"
								/>
							</div>
							<div className="current-tab-lists-container">
								{ tabData?.map( ( { type, content } ) => {
									if ( type !== 'folder' ) {
										return showTabSection(
											content as TabContent
										);
									}

									// Tab has child tabs
									return (
										<div
											className="tab-wrapper"
											key={ `${ type }-${ content }` }
										>
											{ showHideMenu(
												( content as TabData[] )[ 0 ]
													.content as TabContent
											) }
											{
												<div
													className={ `subtab-wrapper ${
														menuCol ? 'show' : ''
													} ${
														openedSubtab ===
														(
															(
																content as TabData[]
															 )[ 0 ]
																.content as TabContent
														 ).id
															? 'active'
															: ''
													}` }
												>
													{ ( content as TabData[] )
														.slice( 1 )
														?.map(
															// eslint-disable-next-line @typescript-eslint/no-shadow
															( { content } ) =>
																showTabSection(
																	content as TabContent
																)
														) }
												</div>
											}
										</div>
									);
								} ) }
								<div
									role="button"
									tabIndex={ 0 }
									className="admin-btn menu-coll-btn"
									onClick={ handleMenuShow }
								>
									<span>
										<i className="admin-font adminlib-arrow-left"></i>
									</span>
									{ menuCol ? null : 'Collapse' }
								</div>
							</div>
						</div>
						<div className="tab-content">
							{ /* Render name and description of the current tab */ }
							{ getTabDescription( tabData ) }
							{ /* Render the form from parent component for better control */ }
							{ getForm( currentTab ) }
						</div>
					</div>
				</div>

				<AdminFooter supportLink={ supprot } />
			</div>
		</>
	);
};

export default Tabs;
