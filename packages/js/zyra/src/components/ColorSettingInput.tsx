import React, { ChangeEvent, useState, useEffect } from 'react';
import "../styles/web/ColorSettingInput.scss";

interface CustomColors {
    themeColor: string;
    heading: string,
    bodyText: string,
    buttonText: string;
    buttonBg: string;
    buttonHoverText: string;
    buttonHoverBg: string;
    // buttonHoverBorder: string;
}

interface PaletteOption {
    key?: string;
    value?: string;
    label?: string;
    colors?: Partial<CustomColors>;
    image?: string;
}

interface ColorSettingProps {
    wrapperClass?: string;
    inputClass?: string;
    descClass?: string;
    description?: string;
    predefinedOptions: PaletteOption[];
    value?: { selectedPalette: string; colors: Partial<CustomColors> }; // object from DB
    onChange?: (e: { target: { name: string; value: any } }) => void;
    idPrefix?: string;
    showPreview?: boolean;
}

const ColorSettingInput: React.FC<ColorSettingProps> = (props) => {
    // Initialize selectedPalette from DB value or default to first option
    const initialPalette = props.value?.selectedPalette || (props.predefinedOptions[0]?.value ?? '');
    const initialColors = props.value?.colors || {};

    const [mode, setMode] = useState<'predefined' | 'custom'>(initialPalette === 'custom' ? 'custom' : 'predefined');
    const [selectedPalette, setSelectedPalette] = useState(initialPalette);
    const [selectedColors, setSelectedColors] = useState<Partial<CustomColors>>(initialColors);
    const [customColors, setCustomColors] = useState<CustomColors>({
        themeColor: '#5007aa',
        heading: '#000',
        bodyText: 'red',
        buttonText: '#ffffff',
        buttonBg: '#007cba',
        buttonHoverText: '#ffffff',
        buttonHoverBg: '#005f8d',
        ...initialColors,
    });

    useEffect(() => {
        if (selectedPalette !== 'custom') {
            const selectedOption = props.predefinedOptions.find(opt => opt.value === selectedPalette);
            setSelectedColors(selectedOption?.colors || {});
        }
    }, [selectedPalette, props.predefinedOptions]);

    const handlePaletteChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedPalette(value);

        const option = props.predefinedOptions.find(opt => opt.value === value);
        const colors = option?.colors || {};

        setSelectedColors(colors);

        props.onChange?.({
            target: {
                name: 'vendor_color_settings',
                value: {
                    selectedPalette: value,
                    colors,
                }
            }
        });
    };

    const handleCustomChange = (field: keyof CustomColors, value: string) => {
        const updated = { ...customColors, [field]: value };
        setCustomColors(updated);
        setSelectedColors(updated);
        setSelectedPalette('custom');

        props.onChange?.({
            target: {
                name: 'vendor_color_settings',
                value: {
                    selectedPalette: 'custom',
                    colors: updated,
                }
            }
        });
    };

    return (
        <>
            <div className={props.wrapperClass}>
                {/* Toggle Mode */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setMode('predefined')}
                        className="admin-btn btn-purple"
                    >
                        Pre-defined Palette
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('custom')}
                        className="admin-btn btn-purple"
                    >
                        Custom Palette
                    </button>
                </div>
            </div>

            <div className="color-setting">

                <div className="color-palette-wrapper">
                    <div className="predefined">
                        {/* Predefined Palettes */}
                        {mode === 'predefined' && props.predefinedOptions.map(option => {
                            
                            const checked = selectedPalette === option.value;
                            return (
                                <div key={option.key} className="palette">
                                    <input
                                        className={props.inputClass}
                                        id={`${props.idPrefix}-${option.key}`}
                                        type="radio"
                                        name="vendor_color_scheme_picker"
                                        checked={checked}
                                        value={option.value}
                                        onChange={handlePaletteChange}
                                    />
                                    <label
                                        htmlFor={`${props.idPrefix}-${option.key}`}
                                    >   
                                        {option.colors && (
                                        <div className="color">
                                            {option.colors && Object.values(option.colors).map((c, i) => (
                                                <div key={i} style={{ backgroundColor: c }}></div>
                                            ))}
                                        </div>
                                        )}
                                        {option.image && (
                                        <div className="color">
                                            <img src={option.image} alt="" />
                                        </div>
                                        )}

                                        <span >{option.label}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                    <div className="custom">
                        {/* Custom Palette */}
                        {mode === 'custom' && (
                            <div className="palette">
                                {Object.entries(customColors).map(([key, val]) => (
                                    <div className="color-wrapper" key={key}>                                        
                                        <input
                                            type="color"
                                            value={val}
                                            onChange={(e) => handleCustomChange(key as keyof CustomColors, e.target.value)}
                                        />
                                        <label >
                                            <div>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                                            <span>{val}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                    </div>
                </div>
                
                {/* Live Preview */}
                {props.showPreview &&  (
                    <div className="preview-wrapper">
                        {/* Sidebar */}
                        <div className="tabs-wrapper">
                            <div className="logo-wrapper">
                                <img src="https://multivendorx.com/wp-content/uploads/2025/06/multivendorx-logo-180x40.png" alt="" />
                                <i className="adminlib-menu"></i>
                            </div>
                            <ul className="dashboard-tabs">
                                <li className="tab-name active">
                                    <a className="tab" style={{color: selectedColors.themeColor}}>
                                        <i className="adminlib-cart"></i>
                                        Dashboard
                                    </a>
                                </li>

                                <li className="tab-name ">
                                    <a className="tab" >
                                        <i className="adminlib-cart"></i>
                                        Products
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <ul className="subtabs">
                                    <li >
                                        <a >All Products</a>
                                    </li>
                                    <li>
                                        <a >Add Product</a>
                                    </li>
                                </ul>
                                <li className="tab-name ">
                                    <a href="#" className="tab" >
                                        <i className="adminlib-cart"></i>
                                        Orders                            </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <ul className="subtabs">
                                    <li className="">
                                        <a href="#">
                                            All Orders</a>
                                    </li>
                                </ul>
                                <li className="tab-name ">
                                    <a className="tab" >
                                        <i className=""></i>
                                        Coupons
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <ul className="subtabs">
                                    <li className="">
                                        <a >All Coupons</a>
                                    </li>
                                    <li className="">
                                        <a >Add Coupons</a>
                                    </li>
                                </ul>
                            </ul>
                        </div>

                        {/* Content Area */}
                        <div className="tab-wrapper">
                            <div className="top-navbar">
                                <div className="navbar-leftside">
                                </div>
                                <div className="navbar-rightside">
                                    <ul className="navbar-right">
                                        <li>
                                            <div className="adminlib-icon adminlib-vendor-form-add"></div>
                                        </li>
                                        <li>
                                            <div className="adminlib-icon adminlib-alarm"></div>
                                        </li>
                                        <li>
                                            <div className="adminlib-icon adminlib-crop-free"></div>
                                        </li>
                                        <li>
                                            <div className="adminlib-icon adminlib-contact-form"></div>
                                        </li>


                                        <li className="dropdown login-user">
                                            <a href="" className="dropdown-toggle">
                                                <div className="avatar-wrapper" style={{backgroundColor: selectedColors.themeColor}}>
                                                    <i className="adminlib-person"></i>
                                                </div>
                                            </a>
                                        </li>

                                    </ul>
                                </div>

                            </div>
                            
                        </div>
                        {/* <div style={{ flex: 1, padding: '20px', backgroundColor: '#f9f9f9' }}>
                            <h4 style={{ marginBottom: '10px' }}>Dashboard</h4>
                            <button
                                style={{
                                    backgroundColor: selectedColors.buttonBg,
                                    color: selectedColors.buttonText,
                                    // border: `1px solid ${selectedColors.buttonBorder}`,
                                    padding: '8px 14px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Button
                            </button>
                        </div> */}
                    </div>
                )}
            </div>

            {props.description && (
                <p className={props.descClass} dangerouslySetInnerHTML={{ __html: props.description }}></p>
            )}
        </>
    );
};

export default ColorSettingInput;
