import React, { ChangeEvent, useState, useEffect, useMemo } from 'react';
import '../styles/web/ColorSettingInput.scss';
import ToggleSetting from './ToggleSetting';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FormGroupWrapper from './UI/FormGroupWrapper';
import FormGroup from './UI/FormGroup';
import SelectInput from './SelectInput';

interface CustomColors {
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorSupport: string;
}

interface ColorSettingValue {
    selectedPalette: string;
    colors: Partial<CustomColors>;
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

interface Template {
    key: string;
    label: string;
    preview?: React.ComponentType<any>;
    component: React.ComponentType<any>;
    pdf?: React.FC<{ colors: CustomColors }>;
}

interface PresetTheme {
    name: string;
    vars: Partial<ThemeVars>;
}

interface ColorSettingProps {
    wrapperClass?: string;
    inputClass?: string;
    descClass?: string;
    description?: string;

    predefinedOptions: PaletteOption[];
    images: ImagePaletteOption[];

    value?: {
        selectedPalette: string;
        colors: Partial<CustomColors>;
        templateKey?: string;
        themeVars?: ThemeVars;
    };

    onChange?: (e: {
        target: {
            name: string;
            value:
            | ColorSettingValue
            | { templateKey: string; themeVars: ThemeVars };
        };
    }) => void;
    idPrefix?: string;
    templates?: Template[];
    showPdfButton?: boolean;
    pdfFileName?: string;
}

const ColorSettingInput: React.FC<ColorSettingProps> = (props) => {
    // Initialize selectedPalette from DB value or default to first option
    const initialPalette =
        props.value?.selectedPalette ||
        (props.predefinedOptions[0]?.value ?? '');
    const initialColors = props.value?.colors || {};
    const [templateKey, setTemplateKey] = useState(
        props.value?.templateKey || props.templates?.[0]?.key
    );

    const activeTemplate = useMemo(
        () => props.templates?.find(t => t.key === templateKey),
        [props.templates, templateKey]
    );
    const ActivePdf = activeTemplate?.pdf;
    const changeTemplate = (key: string) => {
        setTemplateKey(key);

        props.onChange?.({
            target: {
                name: 'store_color_settings',
                value: {
                    templateKey: key,
                    colors: customColors,
                },
            },
        });
    };
    const emitTemplateChange = (colors: CustomColors, key?: string) => {
        props.onChange?.({
            target: {
                name: 'store_color_settings',
                value: {
                    templateKey: key || templateKey,
                    colors,
                },
            },
        });
    };

    // 🔹 Determine initial mode based on whether templates are provided
    const initialMode = initialPalette === 'templates'
        ? 'templates'
        : initialPalette === 'custom'
            ? 'custom'
            : 'predefined';

    const [mode, setMode] = useState<'predefined' | 'custom' | 'templates'>(
        initialMode as 'predefined' | 'custom' | 'templates'
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
                        <div className="form-group-setting-wrapper">
                            <label>Select Color</label>
                            <ToggleSetting
                                wrapperClass="setting-form-input"
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
                                onChange={(val: string | string[]) => {
                                    const selectedVal = Array.isArray(val) ? val[0] : val;

                                    if (selectedVal === 'predefined') {
                                        setMode('predefined');

                                        const value =
                                            props.predefinedOptions[0]?.value ??
                                            '';

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

                                    if (selectedVal === 'custom') {
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
                                    if (selectedVal === 'templates') {
                                        setMode('templates');
                                        setSelectedPalette('templates');
                                        setSelectedColors(customColors);

                                        emitTemplateChange(customColors, templateKey);
                                    }
                                }}
                            />
                        </div>
                    </>
                )}

                {(props.templates?.length ?? 0) > 1 && (
                    <div className="form-group-setting-wrapper">
                        <label>Select Template</label>
                        <SelectInput
                            name="dashboard_template"
                            type="single-select"
                            options={props.templates!.map((tpl) => ({
                                label: tpl.label,
                                value: tpl.key,
                            }))}
                            value={templateKey}
                            onChange={(newValue: any) => {
                                if (!newValue || Array.isArray(newValue)) {
                                    return;
                                }
                                changeTemplate(newValue.value);
                            }}
                        />
                    </div>
                )}
            </div>

            {props.predefinedOptions && (
                <div className="color-setting">
                    <div className="color-palette-wrapper">
                        {/* Predefined Palettes */}
                        {mode === 'predefined' && (
                            <div className="predefined">
                                {props.predefinedOptions.map((option) => {
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

                                            <label htmlFor={`${props.idPrefix}-${option.key}`}>
                                                {option.colors && (
                                                    <div className="color">
                                                        {Object.values(option.colors).map((c, i) => (
                                                            <div
                                                                key={i}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {option.image && (
                                                    <div className="color">
                                                        <img src={option.image} alt="" />
                                                    </div>
                                                )}

                                                <span>{option.label}</span>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        { /* Custom Palette */}
                        {mode === 'custom' && (
                            <div className="custom">
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
                            </div>
                        )}
                    </div>
                    {activeTemplate && (
                        <div className="preview-wrapper">
                            <activeTemplate.component
                                colors={{
                                    colorPrimary: selectedColors.colorPrimary ?? customColors.colorPrimary,
                                    colorSecondary: selectedColors.colorSecondary ?? customColors.colorSecondary,
                                    colorAccent: selectedColors.colorAccent ?? customColors.colorAccent,
                                    colorSupport: selectedColors.colorSupport ?? customColors.colorSupport,
                                }}
                                isPreview
                            />
                        </div>
                    )}
                </div>
            )}

            { /* Image Palette List */}
            {props.images && (
                <div className="color-setting">
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
            )}

            {props.description && (
                <p
                    className={props.descClass}
                    dangerouslySetInnerHTML={{ __html: props.description }}
                ></p>
            )}

            {props.showPdfButton && ActivePdf && (
                <PDFDownloadLink
                    document={
                        <ActivePdf
                            colors={{
                                colorPrimary: customColors.colorPrimary ?? '#FF5959',
                                colorSecondary: customColors.colorSecondary ?? '#FADD3A',
                                colorAccent: customColors.colorAccent ?? '#49BEB6',
                                colorSupport: customColors.colorSupport ?? '#075F63',
                            }}
                        />
                    }
                    fileName={`invoice-${templateKey}.pdf`}
                >
                    {({ loading }) => (loading ? 'Generating PDF…' : 'Download PDF')}
                </PDFDownloadLink>
            )}
        </>
    );
};

export default ColorSettingInput;