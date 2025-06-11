/**
 * External dependencies
 */
import React, { ChangeEvent, MouseEvent } from 'react';

// Types
export interface Option {
	key?: string;
	value: string;
	label?: string;
	img1?: string;
	img2?: string;
	name?: string;
	proSetting?: boolean;
	hints?: string;
}

export interface MultiCheckBoxProps {
	wrapperClass?: string;
	selectDeselect?: boolean;
	selectDeselectClass?: string;
	selectDeselectValue?: string;
	onMultiSelectDeselectChange?: (
		e: MouseEvent< HTMLButtonElement >
	) => void;
	options: Option[];
	value?: string[];
	inputWrapperClass?: string;
	rightContent?: boolean;
	rightContentClass?: string;
	inputInnerWrapperClass?: string;
	tour?: string;
	inputClass?: string;
	idPrefix?: string;
	type?: 'checkbox' | 'radio' | 'checkbox-custom-img';
	onChange?: ( e: ChangeEvent< HTMLInputElement > | string[] ) => void;
	proChanged?: () => void;
	proSetting?: boolean;
	hintOuterClass?: string;
	description?: string;
	descClass?: string;
	hintInnerClass?: string;
	khali_dabba: boolean;
}

const MultiCheckBox: React.FC< MultiCheckBoxProps > = ( props ) => {
	const handleCheckboxChange = (
		directionValue: string,
		isChecked: boolean
	) => {
		let updatedValue = [ ...( props.value as string[] ) ];
		updatedValue = updatedValue.filter(
			( element ) => element !== directionValue
		);

		if ( isChecked ) {
			updatedValue.push( directionValue );
		}

		if ( props.onChange ) {
			props.onChange( updatedValue );
		}
	};

	return (
		<div className={ props.wrapperClass }>
			{ props.selectDeselect && (
				<button
					className={ props.selectDeselectClass }
					onClick={ ( e ) => {
						e.preventDefault();
						props.onMultiSelectDeselectChange?.( e );
					} }
				>
					{ props.selectDeselectValue }
				</button>
			) }
			<div className="wrapper">
				{ props.options.map( ( option ) => {
					const checked =
						props.value?.includes( option.value ) ?? false;

					return (
						<div
							key={ option.key }
							className={ props.inputWrapperClass }
						>
							{ props.rightContent && (
								<p
									className={ props.rightContentClass }
									dangerouslySetInnerHTML={ {
										__html: option.label ?? '',
									} }
								></p>
							) }
							<div
								className={ props.inputInnerWrapperClass }
								data-tour={ props.tour }
							>
								<input
									className={ props.inputClass }
									id={ `${ props.idPrefix }-${ option.key }` }
									type={
										props.type?.split( '-' )[ 0 ] ||
										'checkbox'
									}
									name={ option.name || 'basic-input' }
									value={ option.value }
									checked={ checked }
									onChange={ ( e ) => {
										if (
											props.type === 'checkbox-custom-img'
										) {
											handleCheckboxChange(
												option.value,
												e.target.checked
											);
										} else if (
											option.proSetting &&
											! props.khali_dabba
										) {
											props.proChanged?.();
										} else {
											props.onChange?.( e );
										}
									} }
								/>
								{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
								{ props.type === 'checkbox-custom-img' ? (
									<>
										<div
											className="sync-meta-wrapper"
											key={ `${ option.key }-img-wrp` }
										>
											<img src={ option.img1 } alt="" />
											<i className="admin-font adminlib-arrow-right"></i>
											<img src={ option.img2 } alt="" />
										</div>
										<p className="sync-label">
											{ option.label }
										</p>
									</>
								) : (
									// eslint-disable-next-line jsx-a11y/label-has-associated-control
									<label
										htmlFor={ `${ props.idPrefix }-${ option.key }` }
									></label>
								) }
							</div>
							{ props.proSetting && (
								<span className="admin-pro-tag">pro</span>
							) }
							{ ! props.rightContent && (
								<p
									className={ props.rightContentClass }
									dangerouslySetInnerHTML={ {
										__html: option.label ?? '',
									} }
								></p>
							) }
							{ option.proSetting && ! props.khali_dabba && (
								<span className="admin-pro-tag">pro</span>
							) }
							{ option.hints && (
								<span
									className={ props.hintOuterClass }
									dangerouslySetInnerHTML={ {
										__html: option.hints,
									} }
								></span>
							) }
						</div>
					);
				} ) }
			</div>
			{ props.description && (
				<p
					className={ props.descClass }
					dangerouslySetInnerHTML={ { __html: props.description } }
				></p>
			) }
		</div>
	);
};

export default MultiCheckBox;
