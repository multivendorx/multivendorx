// External Dependencies
import React, { ChangeEvent, useState, useEffect, useMemo } from 'react';

// Internal Dependencies
import '../styles/web/ColorSettingInput.scss';
import { ToggleSettingUI } from './ToggleSetting';
import { SelectInputUI } from './SelectInput';
import PdfDownloadButton from './PdfDownloadButton';
import { FieldComponent } from './types';

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


interface ColorSettingProps {
    filedKey: string;
    wrapperClass?: string;
    inputClass?: string;
    predefinedOptions: PaletteOption[];
    images: ImagePaletteOption[];

    value?: {
        selectedPalette: string;
        colors: Partial<CustomColors>;
        templateKey?: string;
    };

    onChange?: (e: {
        target: {
            name: string;
            value:
            | ColorSettingValue
            | { templateKey: string; };
        };
    }) => void;
    idPrefix?: string;
    templates?: Template[];
    showPdfButton?: boolean;
    pdfFileName?: string;
}

export const ColorSettingInputUI: React.FC<ColorSettingProps> = (props) => {
    const { filedKey, predefinedOptions = [], images = [], templates = [], value, onChange, showPdfButton } = props;

    // Initialize selectedPalette from DB value or default to first option
    const initialPalette =
        value?.selectedPalette ||
        (predefinedOptions[0]?.value ?? '');
    const initialColors = value?.colors || {};
    const [templateKey, setTemplateKey] = useState(
        value?.templateKey || templates?.[0]?.key
    );

    const activeTemplate = useMemo(
        () => templates?.find(t => t.key === templateKey),
        [templates, templateKey]
    );
    const ActivePdf = activeTemplate?.pdf;

    const emitChange = (payload: any) => {
        onChange?.({
            target: {
                name: filedKey,
                value: payload
            }
        });
    };

    const changeTemplate = (key: string) => {
        setTemplateKey(key);
        emitChange({
            templateKey: key,
            colors: customColors,
        });
    };
    const emitTemplateChange = (colors: CustomColors, key?: string) => {
        emitChange({
            templateKey: key || templateKey,
            colors,
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
        images?.[0]?.img || null
    );

    useEffect(() => {
        if (selectedPalette !== 'custom') {
            const selectedOption = predefinedOptions.find(
                (opt) => opt.value === selectedPalette
            );
            setSelectedColors(selectedOption?.colors || {});
        }
    }, [selectedPalette, predefinedOptions]);

    useEffect(() => {
        const selectedPaletteValue = value?.selectedPalette;
        if (!selectedPaletteValue) return;

        const matchedImage = images.find(
            (img) => img.value === selectedPaletteValue
        );

        if (matchedImage?.img) {
            setSelectedImage(matchedImage.img);
        }
    }, [value?.selectedPalette, images]);

    const handlePaletteChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedPalette(value);

        // Set mode based on selection
        if (value === 'custom') {
            setMode('custom');
        } else {
            setMode('predefined');
        }

        const option = predefinedOptions.find(
            (opt) => opt.value === value
        );
        const colors = value === 'custom' ? customColors : option?.colors || {};

        setSelectedColors(colors);
        emitChange({
            selectedPalette: value,
            colors,
        });
    };

    const handleCustomChange = (field: keyof CustomColors, value: string) => {
        const updated = { ...customColors, [field]: value };
        setCustomColors(updated);
        setSelectedColors(updated);
        setSelectedPalette('custom');
        setMode('custom'); // Ensure mode is set to custom
        emitChange({
            selectedPalette: 'custom',
            colors: updated,
        });
    };
    return (
        <div className="color-settings-wrapper">
            {(templates?.length ?? 0) > 1 && (
                <div className={props.wrapperClass}>
                    <div className="form-group-setting-wrapper">
                        <label>Select Template</label>
                        <SelectInputUI
                            name="dashboard_template"
                            options={templates!.map((tpl) => ({
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
                </div>
            )}
            {/* <Tabs tabs={list.tabs} /> */}
            {predefinedOptions.length > 0 && (
                <div className="color-setting">
                    <div className="color-palette-wrapper">
                        { /* Toggle Mode */}
                        {!selectedImage && (
                            <div className="form-group-setting-wrapper">
                                <label>Color Palette</label>
                                <ToggleSettingUI
                                    options={[
                                        {
                                            key: 'predefined',
                                            value: 'predefined',
                                            label: 'Pre-defined',
                                        },
                                        {
                                            key: 'custom',
                                            value: 'custom',
                                            label: 'Custom',
                                        },
                                    ]}
                                    value={mode}
                                    onChange={(val: string | string[]) => {
                                        const selectedVal = Array.isArray(val) ? val[0] : val;

                                        if (selectedVal === 'predefined') {
                                            setMode('predefined');

                                            const value =
                                                predefinedOptions[0]?.value ??
                                                '';

                                            setSelectedPalette(value);

                                            const option = predefinedOptions.find(
                                                (opt) => opt.value === value
                                            );

                                            const colors = option?.colors || {};

                                            setSelectedColors(colors);
                                            emitChange({
                                                selectedPalette: value,
                                                colors,
                                            });
                                        }

                                        if (selectedVal === 'templates') {
                                            setMode('templates');
                                            setSelectedPalette('templates');
                                            setSelectedColors(customColors);
                                            emitTemplateChange(customColors, templateKey);
                                        }

                                        if (selectedVal === 'custom') {
                                            setMode('custom');
                                            setSelectedPalette('custom');
                                            setSelectedColors(customColors);
                                            emitChange({
                                                selectedPalette: 'custom',
                                                colors: customColors,
                                            });
                                        }

                                    }}
                                />
                            </div>
                        )}
                        {/* Predefined Palettes */}
                        {mode === 'predefined' && (
                            <div className="predefined">
                                {predefinedOptions.map((option) => {
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
            {images.length > 0 && (
                <div className="color-setting">
                    <div className="image-list">
                        {images &&
                            images.map((imgOption) => (
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
                                        const option = predefinedOptions.find(
                                            (opt) => opt.value === value
                                        );
                                        const colors = option?.colors || {};
                                        emitChange({
                                            selectedPalette: value,
                                            colors,
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

            {showPdfButton && ActivePdf && (
                <PdfDownloadButton
                    PdfComponent={() => <ActivePdf colors={selectedColors as CustomColors} />}
                    fileName={`invoice-${templateKey}.pdf`}
                />
            )}
        </div>
    );
};

const ColorSettingInput: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <ColorSettingInputUI
            filedKey={field.key}
            wrapperClass="form-group-color-setting"
            inputClass="setting-form-input"
            predefinedOptions={field.predefinedOptions ?? []}
            images={field.images ?? []}
            value={value}
            templates={field.templates}
            onChange={(e) => {
                if (!canAccess) return;
                onChange(e.target.value)
            }}
            idPrefix="color-setting"
            showPdfButton={field.showPdfButton ?? false}
        />
    ),

    validate: (field, value) => {
        return null;
    },

};

export default ColorSettingInput;