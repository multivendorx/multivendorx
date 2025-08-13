import React, { ChangeEvent, useState, useEffect } from 'react';

interface PaletteOption {
    key?: string;
    value?: string;
    label?: string;
    color?: string[];
}

interface CustomColors {
    buttonText: string;
    buttonBg: string;
    buttonBorder: string;
    buttonHoverText: string;
    buttonHoverBg: string;
    buttonHoverBorder: string;
    sidebarText: string;
    sidebarBg: string;
    sidebarActiveText: string;
    sidebarActiveBg: string;
}

interface ColorSettingProps {
    wrapperClass?: string;
    inputClass?: string;
    descClass?: string;
    description?: string;
    predefinedOptions: PaletteOption[];
    value?: string;
    customValue?: Partial<CustomColors>;
    onChange?: (e: { target: { name: string; value: any } }) => void;
    idPrefix?: string;
    showPreview?: boolean;
}

const ColorSettingInput: React.FC<ColorSettingProps> = (props) => {
    const [mode, setMode] = useState<'predefined' | 'custom'>('predefined');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedPalette, setSelectedPalette] = useState(props.value || '');
    const [customColors, setCustomColors] = useState<CustomColors>({
        buttonText: '#ffffff',
        buttonBg: '#007cba',
        buttonBorder: '#005f8d',
        buttonHoverText: '#ffffff',
        buttonHoverBg: '#005f8d',
        buttonHoverBorder: '#00486a',
        sidebarText: '#ffffff',
        sidebarBg: '#202528',
        sidebarActiveText: '#ffffff',
        sidebarActiveBg: '#3f85b9',
        ...props.customValue,
    });

    useEffect(() => {
        const selected = props.predefinedOptions.find(opt => opt.value === selectedPalette);
        setSelectedColors(selected?.color || []);
    }, [selectedPalette, props.predefinedOptions]);

    const handlePaletteChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedPalette(e.target.value);
        props.onChange?.({ target: { name: 'vendor_color_settings', value: e.target.value } });
    };

    const handleCustomChange = (field: keyof CustomColors, value: string) => {
        const updated = { ...customColors, [field]: value };
        setCustomColors(updated);
        props.onChange?.({ target: { name: 'customColors', value: updated } });
    };

    return (
        <>
            <div className={props.wrapperClass} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Toggle Mode */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setMode('predefined')}
                        style={{
                            padding: '8px 14px',
                            border: mode === 'predefined' ? '2px solid #007cba' : '1px solid #ccc',
                            background: mode === 'predefined' ? '#f0faff' : '#fff',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        Pre-defined Palette
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('custom')}
                        style={{
                            padding: '8px 14px',
                            border: mode === 'custom' ? '2px solid #007cba' : '1px solid #ccc',
                            background: mode === 'custom' ? '#f0faff' : '#fff',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        Custom Palette
                    </button>
                </div>

                {/* Predefined Palettes */}
                {mode === 'predefined' && props.predefinedOptions.map(option => {
                    const checked = selectedPalette === option.value;
                    return (
                        <div key={option.key} style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                className={props.inputClass}
                                id={`${props.idPrefix}-${option.key}`}
                                type="radio"
                                name="vendor_color_scheme_picker"
                                checked={checked}
                                value={option.value}
                                onChange={handlePaletteChange}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor={`${props.idPrefix}-${option.key}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: checked ? '2px solid #007cba' : '1px solid #ccc',
                                    borderRadius: '6px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    backgroundColor: checked ? '#f0faff' : '#fff',
                                    width: '240px',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{option.label}</span>
                                {Array.isArray(option.color) && (
                                    <div style={{ display: 'flex', width: '70px', height: '18px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                        {option.color.map((c, i) => (
                                            <div key={i} style={{ flex: 1, backgroundColor: c }}></div>
                                        ))}
                                    </div>
                                )}
                            </label>
                        </div>
                    );
                })}

                {/* Custom Palette */}
                {mode === 'custom' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {Object.entries(customColors).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 500 }}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                </label>
                                <input
                                    type="color"
                                    value={val}
                                    onChange={(e) => handleCustomChange(key as keyof CustomColors, e.target.value)}
                                    style={{ width: '100%', height: '36px', cursor: 'pointer' }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Live Preview */}
            {props.showPreview && (
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    width: '500px',
                    height: '260px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                    {/* Sidebar */}
                    <div
                        style={{
                            backgroundColor: mode === 'custom' ? customColors.sidebarBg : selectedColors[0],
                            color: mode === 'custom' ? customColors.sidebarText : '#fff',
                            width: '110px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        <div>Menu 1</div>
                        <div>Menu 2</div>
                        <div>Menu 3</div>
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1, padding: '20px', backgroundColor: '#f9f9f9' }}>
                        <h4 style={{ marginBottom: '10px' }}>Dashboard</h4>
                        <button
                            style={{
                                backgroundColor: mode === 'custom' ? customColors.buttonBg : selectedColors[3],
                                color: mode === 'custom' ? customColors.buttonText : '#fff',
                                border: `1px solid ${mode === 'custom' ? customColors.buttonBorder : selectedColors[2]}`,
                                padding: '8px 14px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Button
                        </button>
                    </div>
                </div>
            )}

            {props.description && (
                <p className={props.descClass} dangerouslySetInnerHTML={{ __html: props.description }}></p>
            )}
        </>
    );
};

export default ColorSettingInput;
