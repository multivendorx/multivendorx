/**
 * External dependencies
 */
import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import ReactDragListView from 'react-drag-listview';

/**
 * Internal dependencies
 */
import SubTabSection from './SubTabSection';
import ButtonCustomizer from './ButtonCustomiser';
import '../styles/web/CatalogCustomizer.scss';

// Types
export interface CatalogCustomizerProps {
	onChange: ( key: string, value: any ) => void;
	proSetting?: boolean;
	setting: Record< string, any >;
	SampleProduct: string;
	proUrl: string;
}

// Define the type for a menu item
type MenuItem = {
	name: string;
	id: string;
	icon: string;
};

// Define the type for a draggable item
type DraggableItem = {
	id: string;
	content?: ( () => ReactNode ) | string;
	defaultPosition: number;
	dragable: boolean;
};

// Define the type for a button item
type ButtonItem = {
	id: string;
};

const CatalogCustomizer: React.FC< CatalogCustomizerProps > = ( {
	onChange,
	proSetting,
	setting,
	SampleProduct,
	proUrl,
} ) => {
	const [ localSetting, _setLocalSetting ] = useState( setting );

	const setSetting = ( key: string, value: any ) => {
		_setLocalSetting( { ...localSetting, [ key ]: value } );
		onChange( key, value );
	};

	const shopPagePossitionSetting = useMemo( () => {
		return localSetting.shop_page_possition_setting || [];
	}, [ localSetting ] );
	const buttonPossitionSetting = useMemo( () => {
		return localSetting.shop_page_button_position_setting || [];
	}, [ localSetting ] );

	const menu: MenuItem[] = [
		{ name: 'Enquiry', id: 'enquiry', icon: 'adminlib-inquiry' },
		{ name: 'Quote', id: 'quote', icon: 'adminlib-price-quote-icon' },
		{ name: 'Catalog', id: 'catalog', icon: 'adminlib-catalog' },
	];

	const [ currentTab, setCurrentTab ] = useState< MenuItem >( menu[ 0 ] );

	const PriceSectionContent = () => {
		const [ hideProductPrice, setHideProductPrice ] = useState< boolean >(
			setting.hide_product_price
		);

		return (
			<div className="price-section toggle-visibility">
				<div
					role="button"
					tabIndex={ 0 }
					onClick={ () => {
						setHideProductPrice( ! hideProductPrice );
						setSetting( 'hide_product_price', ! hideProductPrice );
					} }
					className="button-visibility"
				>
					<i className="admin-font adminlib-support"></i>
				</div>
				<p
					className="product-price"
					style={ {
						opacity: hideProductPrice ? '0.3' : '1',
					} }
				>
					<span className="strikethrough">$20.00</span> $18.00
				</p>
			</div>
		);
	};

	const ProductDescriptionContent = () => {
		const [ hideProductDesc, setHideProductDesc ] = useState< boolean >(
			setting.hide_product_desc
		);
		return (
			<div className="description-section toggle-visibility">
				<div
					role="button"
					tabIndex={ 0 }
					onClick={ () => {
						setHideProductDesc( ! hideProductDesc );
						setSetting( 'hide_product_desc', ! hideProductDesc );
					} }
					className="button-visibility"
				>
					<i className="admin-font adminlib-support"></i>
				</div>
				<p
					className="product-description"
					style={ { opacity: hideProductDesc ? '0.3' : '1' } }
				>
					Pellentesque habitant morbi tristique senectus et netus et
					malesuada fames ac turpis egestas.
				</p>
			</div>
		);
	};

	// Create draggable items state with type annotations
	const [ dragableItems, setDragableItems ] = useState< DraggableItem[] >( [
		{
			id: 'price_section',
			content: PriceSectionContent,
			defaultPosition: 0,
			dragable: false,
		},
		{
			id: 'product_description',
			content: ProductDescriptionContent,
			defaultPosition: 1,
			dragable: false,
		},
		{
			id: 'additional_input',
			defaultPosition: 2,
			dragable: !! proSetting, // Converts truthy/falsy to boolean
		},
		{
			id: 'add_to_cart',
			content: () => (
				<section className="catalog-add-to-cart-section">
					<div className="catalog-add-to-cart-quantity">1</div>
					<div className="admin-btn btn-purple catalog-add-to-cart-btn">
						Add to cart
					</div>
				</section>
			),
			defaultPosition: 3,
			dragable: false,
		},
		{
			id: 'sku_category',
			content: () => (
				<div className="product-sku-category">
					<p>
						SKU: <span>WOO-ALBUM</span>
					</p>
					<p>
						Category: <span>Music</span>
					</p>
				</div>
			),
			defaultPosition: 4,
			dragable: false,
		},
		{
			id: 'custom_button',
			content: 'buttonDND',
			defaultPosition: 5,
			dragable: !! proSetting,
		},
	] );

	// Create button items state with type annotations
	const [ buttonItems, setButtonItems ] = useState< ButtonItem[] >( [
		{ id: 'enquiry_button' },
		{ id: 'quote_button' },
	] );

	/**
	 * Get the index of a list item by its id.
	 *
	 * @template T - The type of items in the list.
	 * @param {T[]}    list - An array of objects that must have an 'id' property.
	 * @param {string} id   - The id to search for.
	 * @return {number} The index of the found item, or -1 if not found.
	 */
	const getIndex = < T extends { id: string } >(
		list: T[],
		id: string
	): number => {
		let foundItemIndex = -1;

		list.forEach( ( item, index ) => {
			if ( item.id === id ) {
				foundItemIndex = index;
			}
		} );

		return foundItemIndex;
	};

	/**
	 * Reorders elements in an array.
	 *
	 * @param list       - The array to reorder.
	 * @param startIndex - The index of the item to move.
	 * @param endIndex   - The index where the item should be moved.
	 *
	 * @return A new array with the reordered elements.
	 */
	const reorder = < T extends unknown >(
		list: T[],
		startIndex: number,
		endIndex: number
	): T[] => {
		if ( startIndex === endIndex ) return list; // No need to reorder if indices are the same

		const result = [ ...list ]; // Creates a shallow copy of the array
		const [ removed ] = result.splice( startIndex, 1 );

		if ( removed !== undefined ) {
			result.splice( endIndex, 0, removed );
		}

		return result;
	};

	// Check in catalogx for infinite loop
	const initialItems = useMemo(
		() => {
			return [ ...dragableItems ]; // replace with real source
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);
	/**
	 * Updates draggable items based on the previously set sequence.
	 */
	useEffect( () => {
		if ( ! shopPagePossitionSetting ) return;

		const positionSetting: Record< string, string > =
			shopPagePossitionSetting || {};
		let items = [ ...initialItems ];

		// Convert position settings into an array of tuples
		const positionEntries = Object.entries( positionSetting );

		// Check if all items are being moved to the same position
		let samePosition = true;
		let positionToMove: string | null = null;

		positionEntries.forEach( ( [ , /* unused */ moveAfter ] ) => {
			if ( positionToMove !== null && positionToMove !== moveAfter ) {
				samePosition = false;
			}
			positionToMove = moveAfter;
		} );

		// Reorder items based on position settings
		positionEntries.forEach( ( [ willMove, moveAfter ] ) => {
			const startIndex = getIndex( items, willMove );
			let endIndex = getIndex( items, moveAfter ) + 1;

			if ( samePosition && positionToMove !== null ) {
				endIndex = items.length; // Move to last position if all are at the same position
			}

			items = reorder( items, startIndex, endIndex );
		} );

		// Handle elements that were moved to the same position
		if ( samePosition && positionToMove !== null ) {
			const movedElements = items.splice( items.length - 2, 2 );

			// Find the correct index where the moved elements should be inserted
			const movedIndex = getIndex( items, positionEntries[ 0 ][ 1 ] ) + 1;

			// Create a new sequence of items
			items = [
				...items.slice( 0, movedIndex ),
				...movedElements,
				...items.slice( movedIndex ),
			];
		}

		setDragableItems( items );
	}, [ shopPagePossitionSetting, initialItems ] );

	/**
	 * Sets button draggable items to their previously saved sequence.
	 */
	useEffect( () => {
		setButtonItems( ( prevButtonItems ) => {
			return [ ...prevButtonItems ].sort(
				( a, b ) =>
					buttonPossitionSetting.indexOf( a.id ) -
					buttonPossitionSetting.indexOf( b.id )
			);
		} );
	}, [ buttonPossitionSetting ] );

	/**
	 * Function after drag end. Updates settings and reorders items.
	 *
	 * @param startIndex - The starting index of the dragged item.
	 * @param endIndex   - The ending index where the item is dropped.
	 */
	const onDragEnd = ( startIndex: number, endIndex: number ): void => {
		if ( endIndex === undefined || endIndex === null || endIndex === 0 ) {
			return;
		}

		const newItems = reorder( dragableItems, startIndex, endIndex );

		// Define the type for shopPageBuildersPosition
		const shopPageBuildersPosition: Record< string, string > = {};
		let positionAfter = '';

		newItems.forEach( ( item ) => {
			if ( item.dragable ) {
				shopPageBuildersPosition[ item.id ] = positionAfter;
			} else {
				positionAfter = item.id;
			}
		} );

		setSetting( 'shop_page_possition_setting', shopPageBuildersPosition );
		setDragableItems( newItems );
	};

	/**
	 * Handles button drag end event and updates settings.
	 * @param startIndex - The starting index of the dragged button.
	 * @param endIndex   - The ending index where the button is dropped.
	 */
	const onButtonDragEnd = ( startIndex: number, endIndex: number ): void => {
		if ( endIndex === undefined || endIndex === null || endIndex === 0 ) {
			return;
		}

		const newItems = reorder( buttonItems, startIndex, endIndex );

		// Calculate position for draggable items.
		const position: string[] = newItems.map( ( item ) => item.id );

		setSetting( 'shop_page_button_position_setting', position );
		setButtonItems( newItems );
	};

	const renderContent = ( item: DraggableItem ) => {
		if ( item.content === 'buttonDND' ) {
			return (
				<div className="button-wrapper">
					<ReactDragListView
						nodeSelector=".shop-page-button-draggable"
						lineClassName="dragLine"
						handleSelector={
							proSetting ? '.shop-page-button-draggable' : 'none'
						}
						onDragEnd={ proSetting ? onButtonDragEnd : () => {} }
					>
						{ buttonItems.map( ( btn ) => (
							<div
								key={ btn.id }
								className="shop-page-button-draggable"
							>
								{ btn.id === 'enquiry_button' && (
									<div
										onClick={ () =>
											handleSubMenuChange( menu[ 0 ] )
										}
										className={ `button-main-container toggle-visibility ${
											currentTab.id === 'enquiry'
												? ''
												: 'disable'
										} enquiry-btn` }
									>
										<ButtonCustomizer
											className="ignore-drag"
											text={
												localSetting?.enquiry_button
													?.button_text || 'Enquiry'
											}
											setting={
												localSetting?.enquiry_button
											}
											onChange={ (
												key,
												value,
												isRestoreDefaults = false
											) => {
												setSetting(
													'enquiry_button',
													isRestoreDefaults
														? value
														: {
																...localSetting.enquiry_button,
																[ key ]: value,
														  }
												);
											} }
										/>
									</div>
								) }

								{ btn.id === 'cart_button' && (
									<ButtonCustomizer
										text="Add to cart"
										setting={ localSetting?.cart_button }
										onChange={ (
											key,
											value,
											isRestoreDefaults = false
										) => {
											setSetting(
												'cart_button',
												isRestoreDefaults
													? value
													: {
															...localSetting.cart_button,
															[ key ]: value,
													  }
											);
										} }
									/>
								) }

								{ btn.id === 'quote_button' && (
									<div
										onClick={ () =>
											handleSubMenuChange( menu[ 1 ] )
										}
										className={ `button-main-container toggle-visibility ${
											currentTab.id === 'quote'
												? ''
												: 'disable'
										}` }
									>
										<ButtonCustomizer
											text={
												localSetting?.quote_button
													?.button_text ||
												'Add to quote'
											}
											setting={
												localSetting?.quote_button
											}
											onChange={ (
												key,
												value,
												isRestoreDefaults = false
											) => {
												setSetting(
													'quote_button',
													isRestoreDefaults
														? value
														: {
																...localSetting.quote_button,
																[ key ]: value,
														  }
												);
											} }
										/>
									</div>
								) }
							</div>
						) ) }
					</ReactDragListView>
				</div>
			);
		}

		if ( item.id === 'additional_input' ) {
			return (
				<div
					onClick={ () => handleSubMenuChange( menu[ 2 ] ) }
					className={ `additional-input toggle-visibility ${
						currentTab.id === 'catalog' ? '' : 'disable'
					}` }
				>
					<input
						placeholder="Additional input (optional)"
						className="basic-input"
						type="text"
						value={ localSetting?.additional_input || '' }
						onChange={ ( e ) =>
							setSetting( 'additional_input', e.target.value )
						}
					/>
				</div>
			);
		}

		if ( typeof item.content === 'function' ) {
			return React.createElement( item.content, {
				currentTab,
				setCurrentTab,
			} );
		}

		return null;
	};

	/**
	 * Handles submenu change when a new tab is selected.
	 *
	 * @param {{ id: string, name: string, icon: string }} newTab      - The new tab object.
	 * @param {string}                                     newTab.id   - The ID of the new tab.
	 * @param {string}                                     newTab.name - The name of the new tab.
	 * @param {string}                                     newTab.icon - The icon class name of the new tab.
	 */
	const handleSubMenuChange = ( newTab: {
		id: string;
		name: string;
		icon: string;
	} ): void => {
		if ( currentTab.id === newTab.id ) return;

		setCurrentTab( { ...newTab } );

		const mainWrapper = document.getElementById(
			'catelog-customizer-main-wrapper'
		);
		if ( ! mainWrapper ) return;

		window.scrollTo( 0, 0 );

		mainWrapper.classList.add( newTab.id );
		mainWrapper.classList.add( 'change-tab' );

		setTimeout( () => {
			mainWrapper.classList.remove( 'change-tab' );

			setTimeout( () => {
				mainWrapper.classList.remove( newTab.id );
			}, 300 );
		}, 500 );
	};

	return (
		<>
			{ /* Render upper tab sections */ }
			<SubTabSection
				menuitem={ menu }
				currentTab={ currentTab }
				setCurrentTab={ setCurrentTab }
				setting={ localSetting }
			/>

			{ /* Render shop page sections */ }
			<main id="catelog-customizer-main-wrapper">
				<section className="catelog-customizer">
					<div className="product-img">
						<img src={ SampleProduct } alt="Sample Product" />
					</div>
					<div className="product-data">
						<h1>Sample Product</h1>
						<div className="drag-drop-component">
							{ /* Render default shop pages drag and drop */ }
							<ReactDragListView
								nodeSelector=".shop-page-draggable"
								handleSelector=".should-move"
								lineClassName="dragLine"
								ignoreSelector=".ignore-drag"
								onDragEnd={ onDragEnd }
							>
								{ dragableItems.map( ( item, index ) => (
									<div
										key={ index }
										className={ `${
											item.dragable ? 'should-move' : ''
										} shop-page-draggable` }
									>
										{ renderContent( item ) }
									</div>
								) ) }
							</ReactDragListView>
						</div>
						{ ! proSetting && (
							<article className="pro-banner">
								<p>Upgrade to pro for endless customization</p>
								<a
									href={ proUrl }
									className="admin-btn btn-purple"
									target="_blank"
									rel="noopener noreferrer"
								>
									Upgrade now
								</a>
							</article>
						) }
					</div>
				</section>
				<section className="single-product-page-description">
					<ul>
						<li className="active">
							Description{ ' ' }
							<span>
								<i className="admin-font adminlib-keyboard-arrow-down"></i>
							</span>
						</li>
						<li>Additional Information</li>
						<li>Review</li>
					</ul>
					<div className="description">
						<h2>Description</h2>
						<p>
							Pellentesque habitant morbi tristique senectus et
							netus et malesuada fames ac turpis egestas.
							Vestibulum tortor quam, feugiat vitae, ultricies
							eget, tempor sit amet, ante. Donec eu libero sit
							amet quam egestas semper. Aenean ultricies mi vitae
							est. Mauris placerat eleifend leo.
						</p>
					</div>
				</section>
			</main>
		</>
	);
};

export default CatalogCustomizer;
