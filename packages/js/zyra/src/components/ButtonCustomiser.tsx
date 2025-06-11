/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/ButtonCustomizer.scss';

// Types
interface ButtonCustomizerProps {
	onChange: (key: string, value: any, isRestoreDefaults?: boolean) => void;
	setting?: Record<string, any>;
	className?: string;
	text: string;
	proSetting?: any;
}

interface CustomizerProps {
	onChange: (key: string, value: any, isRestoreDefaults?: boolean) => void;
	setting: Record<string, any>;
	setHoverOn: (hover: boolean) => void;
}

const Customizer: React.FC<CustomizerProps> = ({
	onChange,
	setting,
	setHoverOn,
}) => {
	const [select, setSelect] = useState<string>('');
	const [buttonLink, setButtonLink] = useState<string>(
		setting.button_link || ''
	);

	useEffect(() => {
		setButtonLink(setting.button_link || '');
	}, [setting.button_link]);

	return (
		<>
			{/* Heading section */}
			<div className="btn-customizer-menu">
				{[
					{
						title: 'Change Colors',
						iconClass: 'color-img',
						type: 'color',
					},
					{
						title: 'Border Style',
						iconClass: 'adminlib-crop-free',
						type: 'border',
					},
					{
						title: 'Text Style',
						iconClass: 'adminlib-text-fields',
						type: 'font',
					},
					{
						title: 'Change Size',
						iconClass: 'adminlib-resize',
						type: 'size',
					},
					{
						title: 'Add Url',
						iconClass: 'adminlib-link',
						type: 'link',
					},
					{
						title: 'Settings',
						iconClass: 'adminlib-setting',
						type: 'setting',
					},
				].map(({ title, iconClass, type }) => (
					<div
						key={type}
						title={title}
						role="button"
						tabIndex={0}
						className="btn-customizer-menu-items"
						onClick={() => setSelect(type)}
					>
						<i className={`admin-font ${iconClass}`}></i>
					</div>
				))}
			</div>

			{select && (
				<div className="customizer-setting-wrapper">
					{/* Wrapper close button */}
					<button
						onClick={() => setSelect('')}
						className="wrapper-close"
					>
						<i className="admin-font adminlib-cross"></i>
					</button>

					{/* Render selected setting */}
					{select === 'color' && (
						<div className="section-wrapper color">
							{
								['simple', 'hover'].map(className=>{
									return(
										<div
											className={className}
											onMouseEnter={className==='hover'?() => setHoverOn(true):()=>{}}
											onMouseLeave={className==='hover'?() => setHoverOn(false):()=>{}}
										>
											{
												[
													{
														label: 'Background Color',
														key: 'button_background_color',
														type: 'color',
														class : 'simple'
													},
													{
														label: 'Font Color',
														key: 'button_text_color',
														type: 'text',
														class : 'simple'
													},
													{
														label: 'Background Color On Hover',
														key: 'button_background_color_onhover',
														type: 'color',
														class : 'hover'
													},
													{
														label: 'Font Color On Hover',
														key: 'button_text_color_onhover',
														type: 'text',
														class : 'hover'
													},
												].map(item=>{
													return(
														className===item.class
														? (<div key={item.key} className="section">
																<span className="label">{item.label}</span>
																<div className="property-section">
																	<input
																		type={item.type}
																		value={
																			setting[item.key] || '#000000'
																		}
																		onChange={(e) =>
																			onChange(
																				item.key,
																				e.target.value
																			)
																		}
																	/>
																</div>
															</div>
														)
														:null
													);
												})
											}
											
										</div>
									);
								})
							}
						</div>
					)}
					{select === "border" && (
					<div className="section-wrapper border">
						<div className="simple">
							<div className="section">
								<span className="lable">
									Border Color
								</span>
								<div className="property-section">
									<input
										type="color"
										value={setting.button_border_color ? setting.button_border_color : '#000000'}
										onChange={(e) => onChange("button_border_color", e.target.value)}
									/>
									<input
										onChange={(e) => onChange("button_border_color", e.target.value)}
										type="text"
										value={setting.button_border_color ? setting.button_border_color : '#000000'}
									/>
								</div>
							</div>
							<div className="section section-row">
								<span className="lable">
									Border Size
								</span>
								<div className="property-section">
								{/* <div class="PB-range-slider-div"> */}
								<input
									className="PB-range-slider"
									type="number"
									value={setting.button_border_size ? setting.button_border_size : 0}
									onChange={(e) => onChange("button_border_size", e.target.value)}
								/>
								<p>px</p>
								{/* <p class="PB-range-slidervalue">{setting.button_border_size ? setting.button_border_size : 0}px</p> */}
								{/* </div> */}
							</div>
						</div>
						<div className="section section-row">
							<span className="lable">
								Border Radious
							</span>
							<div className="property-section">
								{/* <div class="PB-range-slider-div"> */}
								<input
									className="PB-range-slider"
									type="number"
									value={setting.button_border_radious ? setting.button_border_radious : 0}
									onChange={(e) => onChange("button_border_radious", e.target.value)}
								/>
								<p>px</p>
								{/* <p class="PB-range-slidervalue">{setting.button_border_radious ? setting.button_border_radious : 0}px</p>
								</div> */}
							</div>
						</div>
						</div>
						<div className="section-wrapper hover">
							<div className="section">
								<span className="lable">
								Border Color On Hover
								</span>
								<div className="property-section">
								<input
									type="color"
									value={setting.button_border_color_onhover ? setting.button_border_color_onhover : '#000000'}
									onChange={(e) => onChange("button_border_color_onhover", e.target.value)}
								/>
								<input
									type="text"
									value={setting.button_border_color_onhover ? setting.button_border_color_onhover : '#000000'}
									onChange={(e) => onChange("button_border_color_onhover", e.target.value)}
								/>
								</div>
							</div>
						</div>
					</div>
					)}
					{select === "font" && (
					<div className="section-wrapper font">
						<div className="simple">
						<div className="section">
							<span className="lable">
							Button text
							</span>
							<div className="property-section">
							<div className="PB-range-slider-div">
								<input
								className="PB-range-slider"
								type="text"
								value={setting.button_text}
								onChange={(e) => onChange("button_text", e.target.value)}
								/>
							</div>
							</div>
						</div>
						<div className="section section-row">
							<span className="lable">
							Font Size
							</span>
							<div className="property-section">
							{/* <div class="PB-range-slider-div"> */}
							<input
								className="PB-range-slider"
								type="number"
								value={setting.button_font_size ? setting.button_font_size : 12}
								onChange={(e) => onChange("button_font_size", e.target.value)}
							/>
							<p>px</p>
							{/* <p class="PB-range-slidervalue">{setting.button_font_size ? setting.button_font_size : 12}px</p> */}
							{/* </div> */}
							</div>
						</div>
						<div className="section section-row">
							<span className="lable">
							Font Width
							</span>
							<div className="property-section">
							{/* <div class="PB-range-slider-div"> */}
							<input
								className="PB-range-slider"
								min={100}
								max={900}
								step={100}
								type="number"
								value={setting.button_font_width ? setting.button_font_width : 400}
								onChange={(e) => onChange("button_font_width", e.target.value)}
							/>
							<p>px</p>
							{/* <p class="PB-range-slidervalue">{setting.button_font_width ? setting.button_font_width : 400}</p> */}
							{/* </div> */}
							</div>
						</div>
						</div>
					</div>
					)}
					{select === "size" && (
					<div className="section-wrapper size">
						<div className="simple">
						<div className="section section-row">
							<span className="lable">
							Padding
							</span>
							<div className="property-section">
							{/* <div class="PB-range-slider-div"> */}
							<input
								className="PB-range-slider"
								type="number"
								value={setting.button_padding ? setting.button_padding : 0}
								onChange={(e) => onChange("button_padding", e.target.value)}
							/>
							<p>px</p>
							{/* <p class="PB-range-slidervalue">{setting.button_padding ? setting.button_padding : 0}px</p>
							</div> */}
							</div>
						</div>
						<div className="section section-row">
							<span className="lable">
							Margin
							</span>
							<div className="property-section">
							{/* <div class="PB-range-slider-div"> */}
							<input
								className="PB-range-slider"
								type="number"
								value={setting.button_margin ? setting.button_margin : 0}
								onChange={(e) => onChange("button_margin", e.target.value)}
							/>
							<p>px</p>
							{/* <p class="PB-range-slidervalue">{setting.button_margin ? setting.button_margin : 0}px</p>
							</div> */}
							</div>
						</div>
						</div>
					</div>
					)}

					{select === 'link' && (
						<div className="section-wrapper link">
							<div className="simple">
								<div className="link-box">
									<input
										className="link-input"
										type="text"
										value={buttonLink}
										onChange={(e) =>
											setButtonLink(e.target.value)
										}
										placeholder="Paste your URL/link"
									/>
									<button
										onClick={(e) => {
											e.preventDefault();
											onChange('button_link', buttonLink);
										}}
									>
										<i className="admin-font adminlib-send"></i>
									</button>
								</div>
							</div>
							<p>
								<span>*</span> Keep it blank for default button
								behavior
							</p>
						</div>
					)}

					{select === 'setting' && (
						<div className="section-wrapper settings">
							<div className="section">
								<span className="label">
									{'System settings'}
								</span>
								<div className="property-section">
									<button
										onClick={(e) => {
											e.preventDefault();
											onChange('', {}, true);
										}}
									>
										Restore default
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
};

const ButtonCustomizer: React.FC<ButtonCustomizerProps> = ({
	onChange,
	setting = {},
	className,
	text,
}) => {
	const [hoverOn, setHoverOn] = useState(false);
	const [buttonHoverOn, setButtonHoverOn] = useState(false);
	const buttonRef = useRef<HTMLDivElement | null>(null);

	// Set button styles based on hover state
	const style: React.CSSProperties = {
		border: '1px solid transparent',
		backgroundColor: buttonHoverOn
			? setting.button_background_color_onhover
			: setting.button_background_color,
		color: buttonHoverOn
			? setting.button_text_color_onhover
			: setting.button_text_color,
		borderColor: buttonHoverOn
			? setting.button_border_color_onhover
			: setting.button_border_color,
		borderRadius: setting.button_border_radious
			? `${setting.button_border_radious}px`
			: '0px',
		borderWidth: setting.button_border_size
			? `${setting.button_border_size}px`
			: '0px',
		fontSize: setting.button_font_size,
		fontWeight: setting.button_font_width,
		padding: setting.button_padding ? `${setting.button_padding}px` : '0px',
		margin: setting.button_margin ? `${setting.button_margin}px` : '0px',
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (!buttonRef.current?.contains(event.target as Node)) {
				setHoverOn(false);
			}
		};

		document.body.addEventListener('click', handleClickOutside);
		return () => {
			document.body.removeEventListener('click', handleClickOutside);
		};
	}, []);

	return (
		<div
			ref={buttonRef}
			className={`${className ? `${className} ` : ''}btn-wrapper`}
		>
			<button
				onClick={(e) => {
					e.preventDefault();
					setHoverOn(!hoverOn);
				}}
				className={`btn-preview ${hoverOn ? 'active' : ''}`}
				style={style}
				onMouseEnter={() => setButtonHoverOn(true)}
				onMouseLeave={() => setButtonHoverOn(false)}
			>
				{text}
			</button>

			{hoverOn && (
				<div className="btn-customizer">
					<Customizer
						onChange={onChange}
						setHoverOn={setButtonHoverOn}
						setting={setting}
					/>
				</div>
			)}
		</div>
	);
};

export default ButtonCustomizer;
