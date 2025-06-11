/**
 * External dependencies
 */
import React, { ChangeEvent } from 'react';

// Types
export interface MultiNumOption {
	key?: string;
	value: string | number;
	label?: string;
	name?: string;
	type?: string;
}

export interface MultiNumInputProps {
	parentWrapperClass?: string;
	childWrapperClass?: string;
	options: MultiNumOption[];
	value?: { key: string; value: string | number }[];
	inputWrapperClass?: string;
	innerInputWrapperClass?: string;
	inputLabelClass?: string;
	inputClass?: string;
	idPrefix?: string;
	keyName?: string;
	proSetting?: boolean;
	description?: string;
	descClass?: string;
	onChange?: (
		e: ChangeEvent< HTMLInputElement >,
		keyName?: string,
		optionKey?: string,
		index?: number
	) => void;
}

const MultiNumInput: React.FC< MultiNumInputProps > = ( {
	parentWrapperClass,
	childWrapperClass,
	options,
	value = [],
	inputWrapperClass,
	innerInputWrapperClass,
	inputLabelClass,
	inputClass,
	idPrefix = 'multi-num',
	keyName,
	proSetting,
	description,
	descClass,
	onChange,
} ) => {
	return (
		<div className={ parentWrapperClass }>
			<div className={ childWrapperClass }>
				{ options.map( ( option, index ) => {
					const selectedValue =
						value.find( ( val ) => val.key === option.key )
							?.value ?? '';

					return (
						<div key={ option.key } className={ inputWrapperClass }>
							<div className={ innerInputWrapperClass }>
								<div className={ inputLabelClass }>
									{ option.label }
								</div>
								<input
									id={ `${ idPrefix }-${ option.key }` }
									className={ inputClass }
									type={ option.type }
									name={ option.name }
									value={ selectedValue }
									onChange={ ( e ) =>
										onChange?.(
											e,
											keyName,
											option.key,
											index
										)
									}
								/>
								{ proSetting && (
									<span className="admin-pro-tag">pro</span>
								) }
							</div>
						</div>
					);
				} ) }
			</div>
			{ description && (
				<p
					className={ descClass }
					dangerouslySetInnerHTML={ { __html: description } }
				></p>
			) }
		</div>
	);
};

export default MultiNumInput;
