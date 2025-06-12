/**
 * External dependencies
 */
import React, { useEffect, useRef, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import '../styles/web/RegistrationForm.scss';

/**
 * Internal dependencies
 */
import ButtonCustomizer from './ButtonCustomiser';
import Elements from './Elements';
import SettingMetaBox from './SettingMetaBox';
import SimpleInput from './SimpleInput';
import MultipleOptions from './MultipleOption';
import TemplateTextArea from './TemplateTextArea';
import Attachment from './Attachment';
import Recaptcha from './Recaptcha';
import Datepicker from './DatePicker';
import TimePicker from './TimePicker';
import TemplateSection from './TemplateSection';
import DisplayButton from './DisplayButton';

// Types
interface Option {
	id: string;
	label: string;
	value: string;
	isdefault?: boolean;
}

interface SelectOption {
	icon: string;
	value: string;
	label: string;
}

// Props interface for AddNewBtn
// interface AddNewBtnProps {
// 	onAddNew?: () => void;
// 	large?: boolean;
// }

// Props interface for DeleteBtn
// interface DeleteBtnProps {
// 	onDelete?: () => void;
// 	hideDelete?: boolean;
// }

// Default values for input options
const DEFAULT_OPTIONS: Option[] = [
	{ id: '1', label: 'Manufacture', value: 'manufacture' },
	{ id: '2', label: 'Trader', value: 'trader' },
	{ id: '3', label: 'Authorized Agent', value: 'authorized_agent' },
];

// Utility functions for default placeholders and labels
const DEFAULT_PLACEHOLDER = ( type: string ): string => `${ type }`;
const DEFAULT_LABEL_SIMPLE = ( type: string ): string => `Enter your ${ type }`;
const DEFAULT_LABEL_SELECT = 'Nature of Business';
const DEFAULT_FORM_TITLE = 'Demo Form';

// Select options list
const selectOptions: SelectOption[] = [
	{
		icon: 'adminlib-t-letter-bold icon-form-textbox',
		value: 'text',
		label: 'Textbox',
	},
	{ icon: 'adminlib-unread icon-form-email', value: 'email', label: 'Email' },
	{
		icon: 'adminlib-text icon-form-textarea',
		value: 'textarea',
		label: 'Textarea',
	},
	{
		icon: 'adminlib-checkbox icon-form-checkboxes',
		value: 'checkboxes',
		label: 'Checkboxes',
	},
	{
		icon: 'adminlib-multi-select icon-form-multi-select',
		value: 'multiselect',
		label: 'Multi Select',
	},
	{ icon: 'adminlib-radio icon-form-radio', value: 'radio', label: 'Radio' },
	{
		icon: 'adminlib-dropdown-checklist icon-form-dropdown',
		value: 'dropdown',
		label: 'Dropdown',
	},
	{
		icon: 'adminlib-captcha-automatic-code icon-form-recaptcha',
		value: 'recaptcha',
		label: 'reCaptcha v3',
	},
	{
		icon: 'adminlib-submission-message icon-form-attachment',
		value: 'attachment',
		label: 'Attachment',
	},
	{
		icon: 'adminlib-form-section icon-form-section',
		value: 'section',
		label: 'Section',
	},
	{
		icon: 'adminlib-calendar icon-form-store-description',
		value: 'datepicker',
		label: 'Date Picker',
	},
	{
		icon: 'adminlib-alarm icon-form-address01',
		value: 'TimePicker',
		label: 'Time Picker',
	},
	{
		icon: 'adminlib-divider icon-form-address01',
		value: 'divider',
		label: 'Divider',
	},
];

// /**
//  * Component that renders an action section for adding new items.
//  *
//  * @param {AddNewBtnProps} props          - The props object.
//  * @param {() => void}     props.onAddNew - Callback function invoked when the add button is clicked.
//  * @param {boolean}        props.large    - If true, renders the large version of the button.
//  */
// export const AddNewBtn: React.FC<AddNewBtnProps> = ({ onAddNew, large }) => {
// 	return (
// 		<>
// 			{large ? (
// 				<div className="addnew">
// 					<div
// 						role="button"
// 						tabIndex={0}
// 						onClick={() => onAddNew?.()}
// 					>
// 						<i className="admin-font adminlib-move"></i>
// 					</div>
// 					<p>{'Click to add next text field'}</p>
// 				</div>
// 			) : (
// 				<div
// 					className="add-new-sections"
// 					role="button"
// 					tabIndex={0}
// 					onClick={() => onAddNew?.()}
// 				>
// 					<div>
// 						<span>
// 							<i className="admin-font adminlib-move"></i>
// 						</span>
// 					</div>
// 				</div>
// 			)}
// 		</>
// 	);
// };

// /**
//  * Component that renders a delete button section.
//  *
//  * @param {DeleteBtnProps} props            - The props object.
//  * @param {() => void}     props.onDelete   - Callback function invoked when the delete button is clicked.
//  * @param {boolean}        props.hideDelete - If true, hides or disables the delete button.
//  */
// export const DeleteBtn: React.FC<DeleteBtnProps> = ({
// 	onDelete,
// 	hideDelete,
// }) => {
// 	return (
// 		<div
// 			className={`delete ${hideDelete ? 'disable' : ''}`}
// 			role="button"
// 			tabIndex={0}
// 			onClick={() => onDelete?.()}
// 		>
// 			<i className="admin-font adminlib-close"></i>
// 		</div>
// 	);
// };

interface FormField {
	id: number;
	type: string;
	label: string;
	required: boolean;
	name: string;
	placeholder?: string;
	options?: Option[];
	sitekey?: string;
}
interface ButtonSetting {}
interface CustomFormProps {
	onChange: ( data: {
		formfieldlist: FormField[];
		butttonsetting: ButtonSetting;
	} ) => void;
	name: string;
	proSettingChange: () => boolean;
	formTitlePlaceholder?: string;
	setting: Record< string, any >;
}
// props value
// 1. formTitlePlaceholder
// 2. formTitleDescription
// 3. formFieldTypes

const CustomFrom: React.FC< CustomFormProps > = ( {
	onChange,
	name,
	proSettingChange,
	setting,
	formTitlePlaceholder,
} ) => {
	////////////// Define state variable here /////////////////
	const formSetting = setting[ name ] || {};

	const settingHasChanged = useRef( false );
	const firstTimeRender = useRef( true );

	// Contain list of selected form fields.
	const [ formFieldList, setFormFieldList ] = useState< FormField[] >( () => {
		// Form field list can't be empty it should contain atlest form title.
		// This action prevent any backend action for empty form field list.

		const inputList = formSetting.formfieldlist || [];

		if ( ! Array.isArray( inputList ) || inputList.length <= 0 ) {
			return [
				{
					id: 1,
					type: 'title',
					label: DEFAULT_FORM_TITLE,
					required: true,
				},
			];
		}

		return inputList;
	} );

	const [ buttonSetting, setButtonSetting ] = useState(
		formSetting.butttonsetting || {}
	);

	// State for hold id of opend input section.
	const [ opendInput, setOpendInput ] = useState< any >( null );

	const [ isInputBoxClick, SetIsInputBoxClick ] = useState( {
		click: false,
	} );

	// State variable for a random maximum id
	const [ randMaxId, setRendMaxId ] = useState< number >( 0 );

	useEffect( () => {
		const closePopup = ( event: MouseEvent ) => {
			if (
				( event.target as HTMLElement ).closest(
					'.meta-menu, .meta-setting-modal, .react-draggable'
				)
			) {
				return;
			}
			SetIsInputBoxClick( { click: false } );
			setOpendInput( null );
		};
		document.body.addEventListener( 'click', closePopup );
		return () => {
			document.body.removeEventListener( 'click', closePopup );
		};
	}, [] );

	// Prepare random maximum id
	useEffect( () => {
		setRendMaxId(
			formFieldList.reduce(
				( maxId, field ) => Math.max( maxId, field.id ),
				0
			) + 1
		);
	}, [ formFieldList ] );

	// Save button setting and formfieldlist setting
	useEffect( () => {
		if ( settingHasChanged.current ) {
			settingHasChanged.current = false;
			onChange( {
				formfieldlist: formFieldList,
				butttonsetting: buttonSetting,
			} );
		}
	}, [ buttonSetting, formFieldList, onChange ] );

	////////////// Define functionality here /////////////////

	const getUniqueName = () => {
		return Date.now().toString( 36 ); // Convert timestamp to base 36
	};

	/**
	 * Function generate a empty form field and return it.
	 * By default it set the type to simple text
	 */

	const getNewFormField = ( type: string = 'text' ): FormField => {
		const newFormField: FormField = {
			id: randMaxId ?? 0, // Ensure randMaxId is a number (or fallback to 0)
			type,
			label: '',
			required: false,
			name: `${ type }-${ getUniqueName() }`,
		};

		if (
			[ 'multiselect', 'radio', 'dropdown', 'checkboxes' ].includes(
				type
			)
		) {
			newFormField.label = DEFAULT_LABEL_SELECT;
			newFormField.options = DEFAULT_OPTIONS;
		} else {
			newFormField.label = DEFAULT_LABEL_SIMPLE( type );
			newFormField.placeholder = DEFAULT_PLACEHOLDER( type );
		}

		// update randMaxId by 1
		setRendMaxId( ( prev ) => ( prev ?? 0 ) + 1 );

		return newFormField;
	};

	/**
	 * Appends a new form field after a particular index.
	 * If the form field list is empty, it appends at the beginning of the list.
	 *
	 * @param {number} index         - The index after which to insert the new form field.
	 * @param {string} [type="text"] - The type of the new form field to create.
	 * @return {FormField | undefined} The newly created form field object, or undefined if blocked.
	 */
	const appendNewFormField = ( index: number, type = 'text' ) => {
		if ( proSettingChange() ) return;
		const newField = getNewFormField( type );

		// Create a new array with the new element inserted
		const newFormFieldList = [
			...formFieldList.slice( 0, index + 1 ),
			newField,
			...formFieldList.slice( index + 1 ),
		];

		// Update the state with the new array
		settingHasChanged.current = true;
		setFormFieldList( newFormFieldList );

		return newField;
	};

	/**
	 * Function that delete a particular form field
	 * @param {*} index
	 */
	const deleteParticularFormField = ( index: number ) => {
		if ( proSettingChange() ) return;

		// Create a new array without the element at the specified index
		const newFormFieldList = formFieldList.filter(
			( _, i ) => i !== index
		);
		// Update the state with the new array
		settingHasChanged.current = true;
		setFormFieldList( newFormFieldList );
	};

	/**
	 * Handles individual form field changes by updating the form field list.
	 *
	 * @param {number} index - The index of the form field to update.
	 * @param {string} key   - The key/property of the form field to update.
	 * @param {*}      value - The new value to assign to the specified key.
	 */
	const handleFormFieldChange = (
		index: number,
		key: string,
		value: any
	) => {
		if ( proSettingChange() ) return;
		// copy the form field before modify
		const newFormFieldList = [ ...formFieldList ];

		// Update the new form field list
		newFormFieldList[ index ] = {
			...newFormFieldList[ index ],
			[ key ]: value,
		};

		// Update the state variable
		settingHasChanged.current = true;
		setFormFieldList( newFormFieldList );
	};

	/**
	 * Function that handle type change for a particular form field
	 * @param {*} index
	 * @param {*} newType
	 */
	const handleFormFieldTypeChange = ( index: number, newType: string ) => {
		if ( proSettingChange() ) return;

		// Get the input which one is selected
		const selectedFormField = formFieldList[ index ];

		// Check if selected type is previously selected type
		if ( selectedFormField.type === newType ) {
			return;
		}

		// Create a empty form field for that position
		const newFormField = getNewFormField( newType );
		newFormField.id = selectedFormField.id;

		// Replace the newly created form field with old one
		const newFormFieldList = [ ...formFieldList ];
		newFormFieldList[ index ] = newFormField;

		settingHasChanged.current = true;
		setFormFieldList( newFormFieldList );
	};

	return (
		// Render Registration form here
		<div className="registration-from-main-wrapper-section">
			{ /* Render element type section */ }
			<Elements
				selectOptions={ selectOptions }
				onClick={ ( type ) => {
					const newInput = appendNewFormField(
						formFieldList.length - 1,
						type
					);
					setOpendInput( newInput );
				} }
			/>

			<div className="registration-form-main-section">
				{ /* Render form title here */ }
				{
					<div className="form-heading">
						<input
							type="text"
							className="basic-input"
							placeholder={ formTitlePlaceholder }
							value={ formFieldList[ 0 ]?.label }
							onChange={ ( event ) => {
								handleFormFieldChange(
									0,
									'label',
									event.target.value
								);
							} }
						/>
						<DisplayButton
							wraperClass={ 'add-new-sections' }
							children={
								<div>
									<span>
										<i className="admin-font adminlib-move"></i>
									</span>
								</div>
							}
							onClick={ () => {
								const newInput = appendNewFormField( 0 );
								setOpendInput( newInput );
							} }
						/>
					</div>
				}

				{ /* Render form fields here */ }
				{
					<ReactSortable
						list={ formFieldList }
						setList={ ( newList ) => {
							if ( firstTimeRender.current ) {
								firstTimeRender.current = false;
								return;
							}
							if ( proSettingChange() ) return;
							settingHasChanged.current = true;
							setFormFieldList( newList );
						} }
						handle=".drag-handle"
					>
						{ formFieldList.length > 0 &&
							formFieldList.map( ( formField, index ) => {
								if ( index === 0 ) {
									return (
										<div
											key={ index }
											style={ { display: 'none' } }
										></div>
									);
								}

								return (
									<main
										key={ index }
										className={ `form-field ${
											opendInput?.id === formField.id
												? 'active'
												: ''
										}` }
									>
										{ /* Render dragable button */ }
										{ opendInput?.id === formField.id && (
											<div className="bth-move drag-handle">
												<i className="admin-font adminlib-move"></i>
											</div>
										) }

										{ /* Render setting section */ }
										{ opendInput?.id === formField.id && (
											<section className="meta-menu">
												<div className="btn-delete">
													<DisplayButton
														onClick={ () => {
															deleteParticularFormField(
																index
															);
															setOpendInput(
																null
															);
														} }
														wraperClass={ `delete` }
														children={
															<i className="admin-font adminlib-close"></i>
														}
													/>
												</div>
												<SettingMetaBox
													formField={ formField }
													opened={ isInputBoxClick }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
													onTypeChange={ (
														newType
													) =>
														handleFormFieldTypeChange(
															index,
															newType
														)
													}
													inputTypeList={
														selectOptions
													}
												/>
											</section>
										) }

										{ /* Render main content */ }
										<section
											className={ `${
												opendInput?.id !== formField.id
													? 'hidden-list'
													: ''
											} form-field-container-wrapper` }
											role="button"
											tabIndex={ 0 }
											onClick={ ( event ) => {
												event.stopPropagation();
												SetIsInputBoxClick( {
													click: true,
												} );
												if (
													opendInput?.id !==
													formField.id
												) {
													setOpendInput( formField );
												}
											} }
										>
											{ /* Render question name here */ }
											{ ( formField.type === 'text' ||
												formField.type === 'email' ||
												formField.type ===
													'number' ) && (
												<SimpleInput
													formField={ formField }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ ( formField.type ===
												'checkboxes' ||
												formField.type ===
													'multiselect' ||
												formField.type === 'radio' ||
												formField.type ===
													'dropdown' ) && (
												<MultipleOptions
													formField={ formField }
													type={ formField.type }
													selected={
														opendInput?.id ===
														formField.id
													}
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ formField.type === 'textarea' && (
												<TemplateTextArea
													formField={ formField }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ formField.type ===
												'attachment' && (
												<Attachment
													formField={ formField }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ formField.type ===
												'recaptcha' && (
												<Recaptcha
													formField={ formField }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ formField.type ===
												'datepicker' && (
												<Datepicker
													formField={ formField }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ formField.type ===
												'TimePicker' && (
												<TimePicker
													formField={ formField }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ formField.type === 'section' && (
												<TemplateSection
													formField={ formField }
													onChange={ ( key, value ) =>
														handleFormFieldChange(
															index,
															key,
															value
														)
													}
												/>
											) }
											{ formField.type === 'divider' && (
												<div className="section-divider-container">
													Section Divider
												</div>
											) }
										</section>
										<DisplayButton
											wraperClass={ 'add-new-sections' }
											children={
												<div>
													<span>
														<i className="admin-font adminlib-move"></i>
													</span>
												</div>
											}
											onClick={ () => {
												const newInput =
													appendNewFormField( index );
												setOpendInput( newInput );
											} }
										/>
									</main>
								);
							} ) }
					</ReactSortable>
				}

				<section className="settings-input-content">
					<ButtonCustomizer
						text={
							( buttonSetting.button_text &&
								buttonSetting.button_text ) ||
							'Submit'
						}
						setting={ buttonSetting }
						onChange={ (
							key,
							value,
							isRestoreDefaults = false
						) => {
							if ( proSettingChange() ) return;
							settingHasChanged.current = true;
							const previousSetting = buttonSetting || {};
							if ( isRestoreDefaults ) {
								setButtonSetting( value );
							} else {
								setButtonSetting( {
									...previousSetting,
									[ key ]: value,
								} );
							}
						} }
					/>
				</section>
				<DisplayButton
					wraperClass="addnew"
					children={
						<div>
							<i className="admin-font adminlib-move"></i>
							<p>{ 'Click to add next text field' }</p>
						</div>
					}
					onClick={ () => {
						const newInput = appendNewFormField(
							formFieldList.length - 1
						);
						setOpendInput( newInput );
					} }
				/>
			</div>
		</div>
	);
};

export default CustomFrom;
