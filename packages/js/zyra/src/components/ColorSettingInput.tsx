import React, { ChangeEvent, useState, useEffect } from 'react';
import '../styles/web/ColorSettingInput.scss';
import ToggleSetting from './ToggleSetting';

interface CustomColors {
    // themeColor: string;
    // heading: string,
    // bodyText: string,
    // buttonText: string;
    // buttonBg: string;
    // buttonHoverText: string;
    // buttonHoverBg: string;
    // buttonHoverBorder: string;
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorSupport: string;
}

interface PaletteOption {
    key?: string;
    value?: string;
    label?: string;
    colors?: Partial<CustomColors>;
    image?: string;
}

interface ImagePaletteOption {
    key?: string;
    value?: string;
    label?: string;
    img?: string;
}

interface ColorSettingProps {
    wrapperClass?: string;
    inputClass?: string;
    descClass?: string;
    description?: string;
    predefinedOptions: PaletteOption[];
    images: ImagePaletteOption[];
    value?: { selectedPalette: string; colors: Partial<CustomColors> }; // object from DB
    onChange?: (e: { target: { name: string; value: unknown } }) => void;
    idPrefix?: string;
    showPreview?: boolean;
}

const ColorSettingInput: React.FC<ColorSettingProps> = (props) => {
    // Initialize selectedPalette from DB value or default to first option
    const initialPalette =
        props.value?.selectedPalette ||
        (props.predefinedOptions[0]?.value ?? '');
    const initialColors = props.value?.colors || {};

    const [mode, setMode] = useState<'predefined' | 'custom'>(
        initialPalette === 'custom' ? 'custom' : 'predefined'
    );
    const [selectedPalette, setSelectedPalette] = useState(initialPalette);
    const [selectedColors, setSelectedColors] =
        useState<Partial<CustomColors>>(initialColors);
    const [customColors, setCustomColors] = useState<CustomColors>({
        colorPrimary: '#FF5959',
        colorSecondary: '#FADD3A',
        colorAccent: '#49BEB6',
        colorSupport: '#075F63',
        ...initialColors,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(
        props.images?.[0]?.img || null
    );

    useEffect(() => {
        if (selectedPalette !== 'custom') {
            const selectedOption = props.predefinedOptions.find(
                (opt) => opt.value === selectedPalette
            );
            setSelectedColors(selectedOption?.colors || {});
        }
    }, [selectedPalette, props.predefinedOptions]);

    useEffect(() => {
        const selectedPaletteValue = props.value?.selectedPalette;
        if (selectedPaletteValue && props.images) {
            const matchedImage = props.images.find(
                (img) => img.value === selectedPaletteValue
            );
            if (matchedImage?.img) {
                setSelectedImage(matchedImage.img);
            }
        }
    }, [props.value, props.images]);

    const handlePaletteChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedPalette(value);

        // Set mode based on selection
        if (value === 'custom') {
            setMode('custom');
        } else {
            setMode('predefined');
        }

        const option = props.predefinedOptions.find(
            (opt) => opt.value === value
        );
        const colors = value === 'custom' ? customColors : option?.colors || {};

        setSelectedColors(colors);

        // Use the actual field name from props instead of hardcoded string
        props.onChange?.({
            target: {
                name: 'store_color_settings',
                value: {
                    selectedPalette: value,
                    colors,
                },
            },
        });
    };

    const handleCustomChange = (field: keyof CustomColors, value: string) => {
        const updated = { ...customColors, [field]: value };
        setCustomColors(updated);
        setSelectedColors(updated);
        setSelectedPalette('custom');
        setMode('custom'); // Ensure mode is set to custom

        props.onChange?.({
            target: {
                name: 'store_color_settings',
                value: {
                    selectedPalette: 'custom',
                    colors: updated,
                },
            },
        });
    };

    return (
        <>
            <div className={props.wrapperClass}>
                { /* Toggle Mode */}
                {!selectedImage && (
                    <>
                        <ToggleSetting
                            wrapperClass="setting-form-input"
                            descClass="settings-metabox-description"
                            options={[
                                {
                                    key: 'predefined',
                                    value: 'predefined',
                                    label: 'Pre-defined Palette',
                                },
                                {
                                    key: 'custom',
                                    value: 'custom',
                                    label: 'Custom Palette',
                                },
                            ]}
                            value={mode}
                            onChange={(val: string) => {
                                if (val === 'predefined') {
                                    setMode('predefined');

                                    const value =
                                        props.predefinedOptions[0]?.value ?? '';

                                    setSelectedPalette(value);

                                    const option = props.predefinedOptions.find(
                                        (opt) => opt.value === value
                                    );

                                    const colors = option?.colors || {};

                                    setSelectedColors(colors);

                                    props.onChange?.({
                                        target: {
                                            name: 'store_color_settings',
                                            value: {
                                                selectedPalette: value,
                                                colors,
                                            },
                                        },
                                    });
                                }

                                if (val === 'custom') {
                                    setMode('custom');
                                    setSelectedPalette('custom');
                                    setSelectedColors(customColors);

                                    props.onChange?.({
                                        target: {
                                            name: 'store_color_settings',
                                            value: {
                                                selectedPalette: 'custom',
                                                colors: customColors,
                                            },
                                        },
                                    });
                                }
                            }}
                        />

                    </>
                )}
            </div>

            <div className="color-setting">
                <div className="color-palette-wrapper">
                    <div className="predefined">
                        { /* Predefined Palettes */}
                        {mode === 'predefined' &&
                            props.predefinedOptions.map((option) => {
                                const checked =
                                    selectedPalette === option.value;
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
                                                    {option.colors &&
                                                        Object.values(
                                                            option.colors
                                                        ).map((c, i) => (
                                                            <div
                                                                key={i}
                                                                style={{
                                                                    backgroundColor:
                                                                        c,
                                                                }}
                                                            ></div>
                                                        ))}
                                                </div>
                                            )}
                                            {option.image && (
                                                <div className="color">
                                                    <img
                                                        src={option.image}
                                                        alt=""
                                                    />
                                                </div>
                                            )}

                                            <span>{option.label}</span>
                                        </label>
                                    </div>
                                );
                            })}
                    </div>
                    <div className="custom">
                        { /* Custom Palette */}
                        {mode === 'custom' && (
                            <div className="palette">
                                {Object.entries(customColors).map(
                                    ([key, val]) => (
                                        <div
                                            className="color-wrapper"
                                            key={key}
                                        >
                                            <input
                                                type="color"
                                                value={val}
                                                onChange={(e) =>
                                                    handleCustomChange(
                                                        key as keyof CustomColors,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <label>
                                                <div>
                                                    {key
                                                        .replace(
                                                            /([A-Z])/g,
                                                            ' $1'
                                                        )
                                                        .replace(/^./, (s) =>
                                                            s.toUpperCase()
                                                        )}
                                                </div>
                                                <span>{val}</span>
                                            </label>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>

                { /* Live Preview */}
                {props.showPreview && (
                    <div className="preview-wrapper">
                        { /* Sidebar */}
                        <div className="left-wrapper">
                            <div className="logo-wrapper">
                                <div className="logo" style={{ color: selectedColors.colorPrimary }}>MultivendorX</div>
                                <i className="adminlib-menu"></i>
                            </div>
                            <ul className="dashboard-tabs">
                                <li className="tab-name active">
                                    <a
                                        className="tab"
                                        style={{
                                            color: '#fff',
                                            background: selectedColors.colorPrimary,
                                        }}
                                    >
                                        <i className="adminlib-module"></i>
                                        Dashboard
                                    </a>
                                </li>

                                <li className="tab-name ">
                                    <a className="tab">
                                        <i className="adminlib-single-product"></i>
                                        Products
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a className="tab">
                                        <i className="adminlib-sales"></i>
                                        Sales
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <ul className="subtabs">
                                    <li>
                                        <a>Order</a>
                                    </li>
                                    <li>
                                        <a>Refund</a>
                                    </li>
                                    <li>
                                        <a>Commissions</a>
                                    </li>
                                </ul>

                                <li className="tab-name ">
                                    <a className="tab">
                                        <i className="adminlib-coupon"></i>
                                        Coupons
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminlib-wallet"></i>
                                        Wallet
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminlib-customer-service"></i>
                                        Store Support
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminlib-report"></i>
                                        Stats / Report
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>
                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminlib-resources"></i>
                                        Resources
                                    </a>
                                    <i className="admin-arrow adminlib-pagination-right-arrow"></i>
                                </li>
                            </ul>
                        </div>

                        { /* Content Area */}
                        <div className="tab-wrapper">
                            <div className="top-navbar">
                                <div className="navbar-leftside"></div>
                                <div className="navbar-rightside">
                                    <ul className="navbar-right">
                                        <li>
                                            <div className="adminlib-icon adminlib-moon"></div>
                                        </li>
                                        <li>
                                            <div className="adminlib-icon adminlib-product-addon"></div>
                                        </li>
                                        <li>
                                            <div className="adminlib-icon adminlib-storefront"></div>
                                        </li>
                                        <li>
                                            <div className="adminlib-icon adminlib-notification"></div>
                                        </li>
                                        <li>
                                            <div className="adminlib-icon adminlib-crop-free"></div>
                                        </li>

                                        <li className="dropdown login-user">
                                            <a
                                                href=""
                                                className="dropdown-toggle"
                                            >
                                                <div
                                                    className="avatar-wrapper"
                                                    style={{
                                                        backgroundColor:
                                                            selectedColors.colorPrimary,
                                                    }}
                                                >
                                                    <i className="adminlib-person"></i>
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="tab-content-wrapper">
                                <div className="title-wrapper">
                                    <div className="left-section">
                                        <div className="title">
                                            Good Morning, Store owner!
                                        </div>
                                        <div className="des"></div>
                                    </div>
                                    <div
                                        className="dashboard-btn"
                                        style={{
                                            background:
                                                selectedColors.colorPrimary,
                                        }}
                                    >
                                        Add new
                                    </div>
                                </div>

                                <div className="dashboard-card-wrapper">
                                    <div
                                        className="item"
                                        style={{
                                            background: `color-mix(in srgb, ${selectedColors.colorPrimary} 15%, transparent)`,
                                        }}
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={{
                                                background:
                                                    selectedColors.colorPrimary,
                                            }}
                                        >
                                            <i className="adminlib-dollar"></i>
                                        </div>
                                    </div>
                                    <div
                                        className="item"
                                        style={{
                                            background: `color-mix(in srgb, ${selectedColors.colorSecondary} 15%, transparent)`,
                                        }}
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={{
                                                background:
                                                    selectedColors.colorSecondary,
                                            }}
                                        >
                                            <i className="adminlib-order"></i>
                                        </div>
                                    </div>
                                    <div
                                        className="item"
                                        style={{
                                            background: `color-mix(in srgb, ${selectedColors.colorAccent} 15%, transparent)`,
                                        }}
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={{
                                                background:
                                                    selectedColors.colorAccent,
                                            }}
                                        >
                                            <i className="adminlib-store-seo"></i>
                                        </div>
                                    </div>
                                    <div
                                        className="item"
                                        style={{
                                            background: `color-mix(in srgb, ${selectedColors.colorSupport} 15%, transparent)`,
                                        }}
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={{
                                                background:
                                                    selectedColors.colorSupport,
                                            }}
                                        >
                                            <i className="adminlib-commission"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-row">
                                    <div className="section w-65">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="section w-35">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>

                                <div className="dashboard-row">
                                    <div className="section w-35">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="section w-65">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            { /* Image Palette List */}
            <div className="color-setting two-column-layout">
                <div className="image-list">
                    {props.images &&
                        props.images.map((imgOption) => (
                            <div
                                key={imgOption.key}
                                className={`image-thumbnail ${selectedPalette === imgOption.value
                                        ? 'active'
                                        : ''
                                    }`}
                                onClick={() => {
                                    const value = imgOption.value || '';
                                    setSelectedPalette(value);
                                    setSelectedImage(imgOption.img || null);
                                    setMode('predefined'); // Set mode to predefined when selecting an image

                                    // You need to get the corresponding predefined option
                                    const option = props.predefinedOptions.find(
                                        (opt) => opt.value === value
                                    );
                                    const colors = option?.colors || {};

                                    props.onChange?.({
                                        target: {
                                            name: 'store_color_settings', // Use the correct field name
                                            value: {
                                                selectedPalette: value,
                                                colors,
                                            },
                                        },
                                    });
                                }}
                            >
                                <img
                                    src={imgOption.img}
                                    alt={imgOption.label}
                                />
                                <p>{imgOption.label}</p>
                            </div>
                        ))}
                </div>

                { /* Right side: preview */}
                <div className="image-preview">
                    {selectedImage && (
                        <img src={selectedImage} alt="Selected Template" />
                    )}
                </div>
            </div>

            {props.description && (
                <p
                    className={props.descClass}
                    dangerouslySetInnerHTML={{ __html: props.description }}
                ></p>
            )}
        </>
    );
};

export default ColorSettingInput;
