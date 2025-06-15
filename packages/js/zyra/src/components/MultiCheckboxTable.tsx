/**
 * External dependencies
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';

/**
 * Internal dependencies
 */
import '../styles/web/MultiCheckboxTable.scss';

// Types
interface Option {
	value: string | number;
	label: string;
}

interface SelectedOptionDisplayProps {
	selectedValues: Option[];
	clearSelectedValues: () => void;
	removeSelectedValues: ( value: Option ) => void;
	setPopupOpend: ( isOpen: boolean ) => void;
	popupOpend: boolean;
}

const SelectedOptionDisplay: React.FC< SelectedOptionDisplayProps > = ( {
	selectedValues,
	clearSelectedValues,
	removeSelectedValues,
	setPopupOpend,
	popupOpend,
} ) => {
	// Get the renderable selected value for all selected values
	const renderableSelectedValue = popupOpend
		? selectedValues
		: selectedValues.slice( 0, 1 );

	return (
		<div className="selected-container">
			<div className="selected-items-container">
				{ /* All selected values */ }
				{ renderableSelectedValue.map( ( value ) => (
					<div className="selected-items" key={ value.value }>
						<span>{ value.label }</span>
						<div
							className=""
							role="button"
							tabIndex={ 0 }
							onClick={ () => removeSelectedValues( value ) }
						>
							<i className="admin-font adminlib-close"></i>
						</div>
					</div>
				) ) }
			</div>

			<div className="container-items-controls">
				{ /* Modal open button */ }
				{ ! popupOpend && selectedValues.length > 1 && (
					<div
						className="open-modal items-controls"
						role="button"
						tabIndex={ 0 }
						onClick={ () => setPopupOpend( true ) }
					>
						+{ selectedValues.length - 1 }
					</div>
				) }

				{ /* Clear all selected values */ }
				<div
					className="clear-all-data items-controls"
					role="button"
					tabIndex={ 0 }
					onClick={ clearSelectedValues }
				>
					<i className="admin-font adminlib-close"></i>
				</div>
			</div>
		</div>
	);
};

interface SearchOptionDisplayProps {
	options: Option[];
	filter: string;
	setFilter: ( value: string ) => void;
	insertSelectedValues: ( option: Option ) => void;
	searchStarted: boolean;
}

const SearchOptionDisplay: React.FC< SearchOptionDisplayProps > = ( {
	options,
	filter,
	setFilter,
	insertSelectedValues,
	searchStarted,
} ) => {
	const [ modalOpen, setModalOpen ] = useState< boolean >( false );

	useEffect( () => {
		const setModalClose = () => {
			setModalOpen( false );
		};

		document.addEventListener( 'click', setModalClose );

		return () => {
			document.removeEventListener( 'click', setModalClose );
		};
	}, [] );

	return (
		<>
			<div className="selected-input">
				{ /* Search section */ }
				<input
					className="basic-input"
					placeholder="Select..."
					value={ filter }
					onChange={ ( event ) => {
						setModalOpen( true );
						setFilter( event.target.value );
					} }
					onClick={ ( e ) => {
						e.stopPropagation();
						setModalOpen( true );
					} }
				/>

				<span>
					<i className="admin-font adminlib-keyboard-arrow-down"></i>
				</span>
			</div>

			{ modalOpen && (
				<div className="option-container">
					{ ! searchStarted ? (
						options.map( ( option ) => (
							<div
								key={ option.value } // Added a unique key for React list rendering
								className="options-item"
								role="button"
								tabIndex={ 0 }
								onClick={ () => {
									insertSelectedValues( option );
									setModalOpen( false );
								} }
							>
								{ option.label }
							</div>
						) )
					) : (
						<div>Searching</div>
					) }
				</div>
			) }
		</>
	);
};

interface Option {
	value: string | number;
	label: string;
}

interface SelectProps {
	values?: Option[];
	onChange: ( selected: Option[] ) => void;
	option: Option[];
	asyncGetOptions?: ( filter: string ) => Promise< Option[] >;
	asyncFetch?: boolean;
	isMulti?: boolean;
}

const Select: React.FC< SelectProps > = ( {
	values = [],
	onChange,
	option = [],
	asyncGetOptions,
	asyncFetch = false,
} ) => {
	// State to store selected values
	const [ selectedValues, setSelectedValues ] =
		useState< Option[] >( values );

	// State to store options
	const [ options, setOptions ] = useState< Option[] >( option );

	// State for modal open/close
	const [ popupOpened, setPopupOpened ] = useState< boolean >( false );

	// State to track search
	const [ searchStarted, setSearchStarted ] = useState< boolean >( false );

	// State for filtering options
	const [ filter, setFilter ] = useState< string >( '' );

	// Ref to track setting changes
	const settingChanged = useRef< boolean >( false );

	// Fetch options (sync or async)
	const getOptions = useCallback( async (): Promise< Option[] > => {
		let allOptions = option;

		if ( asyncFetch && asyncGetOptions ) {
			setSearchStarted( true );
			allOptions = await asyncGetOptions( filter );
			setSearchStarted( false );
		}

		return allOptions.filter(
			( opt ) =>
				! selectedValues.some( ( sel ) => sel.value === opt.value )
		);
	}, [
		asyncFetch,
		asyncGetOptions,
		filter,
		option,
		selectedValues,
		setSearchStarted,
	] );

	/**
	 * Inserts a selected value into the list of selected values.
	 *
	 * @param {Option} value - The value to insert.
	 */
	const insertSelectedValues = ( value: Option ) => {
		settingChanged.current = true;
		setSelectedValues( ( prev ) => [ ...prev, value ] );
	};

	/**
	 * Remove a selected value.
	 *
	 * @param {Option} value - The value to remove from the selected values list.
	 */
	const removeSelectedValues = ( value: Option ) => {
		settingChanged.current = true;
		setSelectedValues( ( prev ) =>
			prev.filter( ( prevValue ) => prevValue.value !== value.value )
		);
	};

	/**
	 * Clear all selected values.
	 */
	const clearSelectedValues = () => {
		settingChanged.current = true;
		setSelectedValues( [] );
	};

	/**
	 * Get filtered options based on the current filter.
	 *
	 * @return {Promise<Option[]>} A promise that resolves to the filtered options list.
	 */
	const getFilteredOptionValue = useCallback( async (): Promise<
		Option[]
	> => {
		const allOptions = await getOptions();
		return asyncFetch || ! filter
			? allOptions
			: allOptions.filter(
					( opt ) =>
						opt.value.toString().includes( filter ) ||
						opt.label.includes( filter )
			  );
	}, [ asyncFetch, filter, getOptions ] );

	// Trigger onChange event when selected values change
	useEffect( () => {
		if ( settingChanged.current ) {
			settingChanged.current = false;
			onChange( selectedValues );
		}
	}, [ selectedValues, onChange ] );

	// Update options when dependencies change
	useEffect( () => {
		getFilteredOptionValue().then( setOptions );
	}, [ filter, option, selectedValues, getFilteredOptionValue ] );

	// Modal.setAppElement( "#admin-main-wrapper" );

	return (
		<main className="grid-table-main-container" id="modal-support">
			<section className="main-container">
				{ /* Display selected values */ }
				{ ! popupOpened && (
					<>
						<SelectedOptionDisplay
							popupOpend={ popupOpened }
							setPopupOpend={ setPopupOpened }
							selectedValues={ selectedValues }
							clearSelectedValues={ clearSelectedValues }
							removeSelectedValues={ removeSelectedValues }
						/>
						<SearchOptionDisplay
							options={ options }
							filter={ filter }
							setFilter={ setFilter }
							insertSelectedValues={ insertSelectedValues }
							searchStarted={ searchStarted }
						/>
					</>
				) }

				{ /* Modal for selection */ }
				{ popupOpened && (
					<Modal
						isOpen={ popupOpened }
						onRequestClose={ () => setPopupOpened( false ) }
						contentLabel="Select Modal"
						className="exclusion-modal"
					>
						<div
							className="modal-close-btn"
							onClick={ () => setPopupOpened( false ) }
						>
							<i className="admin-font adminlib-cross"></i>
						</div>
						<SelectedOptionDisplay
							popupOpend={ popupOpened }
							setPopupOpend={ setPopupOpened }
							selectedValues={ selectedValues }
							clearSelectedValues={ clearSelectedValues }
							removeSelectedValues={ removeSelectedValues }
						/>
						<SearchOptionDisplay
							options={ options }
							filter={ filter }
							setFilter={ setFilter }
							insertSelectedValues={ insertSelectedValues }
							searchStarted={ searchStarted }
						/>
					</Modal>
				) }
			</section>
		</main>
	);
};

interface Column {
	key: string;
	label: string;
	moduleEnabled?: string;
}

interface Row {
	key: string;
	label: string;
	options?: { value: string | number; label: string }[];
}

interface MultiCheckboxTableProps {
	rows: Row[];
	columns: Column[];
	description?: string;
	onChange: ( key: string, value: any ) => void;
	setting: Record< string, any >;
	proSetting?: boolean;
	modules: string[];
	moduleChange: ( module: string ) => void;
}

const MultiCheckboxTable: React.FC< MultiCheckboxTableProps > = ( {
	rows,
	columns,
	onChange,
	setting,
	proSetting,
	modules,
	moduleChange,
} ) => {
	return (
		<>
			{ proSetting && <span className="admin-pro-tag">pro</span> }
			<table className="grid-table">
				<thead>
					<tr>
						<th></th>
						{ columns.map( ( column ) => (
							<th key={ column.key }>{ column.label }</th>
						) ) }
					</tr>
				</thead>
				<tbody>
					{ rows.map( ( row ) => (
						<tr key={ row.key }>
							<td>{ row.label }</td>
							{ columns.map( ( column ) => {
								const key = `${ column.key }_${ row.key }`;
								const value = setting[ key ] || [];

								return (
									<td
										id="grid-table-cell"
										className="grid-table-cell-class"
										key={ `${ column.key }_${ row.key }` }
									>
										{ row.options ? (
											<Select
												values={ value }
												onChange={ ( newValue ) =>
													onChange( key, newValue )
												}
												option={ row.options }
												isMulti
											/>
										) : (
											<input
												placeholder="select"
												type="checkbox"
												checked={
													Array.isArray(
														setting[ column.key ]
													) &&
													setting[
														column.key
													].includes( row.key )
												}
												onChange={ ( e ) => {
													if (
														column.moduleEnabled &&
														! modules.includes(
															column.moduleEnabled
														)
													) {
														moduleChange(
															column.moduleEnabled
														);
														return;
													}

													const selectedKeys =
														Array.isArray(
															setting[
																column.key
															]
														)
															? setting[
																	column.key
															  ]
															: [];
													const updatedSelection = e
														.target.checked
														? [
																...selectedKeys,
																row.key,
														  ] // Add key
														: selectedKeys.filter(
																(
																	keyVal: any
																) =>
																	keyVal !==
																	row.key
														  ); // Remove key

													onChange(
														column.key,
														updatedSelection
													);
												} }
											/>
										) }
									</td>
								);
							} ) }
						</tr>
					) ) }
				</tbody>
			</table>
		</>
	);
};

export default MultiCheckboxTable;
