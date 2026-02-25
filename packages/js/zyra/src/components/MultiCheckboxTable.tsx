// External dependencies
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';

// Internal dependencies
import '../styles/web/MultiCheckboxTable.scss';
import { FieldComponent } from './types';

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
    const renderableSelectedValue = popupOpend
        ? selectedValues
        : selectedValues.slice( 0, 1 );

    return (
        <div className="selected-container">
            <div className="selected-items-container">
                { renderableSelectedValue.map( ( value ) => (
                    <div className="selected-items" key={ value.value }>
                        <span>{ value.label }</span>
                        <div
                            className=""
                            role="button"
                            tabIndex={ 0 }
                            onClick={ () => removeSelectedValues( value ) }
                        >
                            <i className="admin-font adminfont-close"></i>
                        </div>
                    </div>
                ) ) }
            </div>

            <div className="container-items-controls">
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

                <div
                    className="clear-all-data items-controls"
                    role="button"
                    tabIndex={ 0 }
                    onClick={ clearSelectedValues }
                >
                    <i className="admin-font adminfont-close"></i>
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
        const handleDocumentClick = () => setModalOpen( false );
        document.addEventListener( 'click', handleDocumentClick );
        return () => document.removeEventListener( 'click', handleDocumentClick );
    }, [] );

    const handleInputChange = ( event: React.ChangeEvent<HTMLInputElement> ) => {
        setModalOpen( true );
        setFilter( event.target.value );
    };

    const handleInputClick = ( e: React.MouseEvent ) => {
        e.stopPropagation();
        setModalOpen( true );
    };

    const handleOptionClick = ( option: Option ) => {
        insertSelectedValues( option );
        setModalOpen( false );
    };

    return (
        <>
            <div className="selected-input">
                <input
                    className="basic-input"
                    placeholder="Select..."
                    value={ filter }
                    onChange={ handleInputChange }
                    onClick={ handleInputClick }
                />
                <span>
                    <i className="admin-font adminfont-keyboard-arrow-down"></i>
                </span>
            </div>

            { modalOpen && (
                <div className="option-container">
                    { ! searchStarted ? (
                        options.map( ( option ) => (
                            <div
                                key={ option.value }
                                className="options-item"
                                role="button"
                                tabIndex={ 0 }
                                onClick={ () => handleOptionClick( option ) }
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
    const [ selectedValues, setSelectedValues ] = useState< Option[] >( values );
    const [ options, setOptions ] = useState< Option[] >( option );
    const [ popupOpened, setPopupOpened ] = useState< boolean >( false );
    const [ searchStarted, setSearchStarted ] = useState< boolean >( false );
    const [ filter, setFilter ] = useState< string >( '' );
    const settingChanged = useRef< boolean >( false );

    const getOptions = useCallback( async (): Promise< Option[] > => {
        if ( asyncFetch && asyncGetOptions ) {
            setSearchStarted( true );
            const fetchedOptions = await asyncGetOptions( filter );
            setSearchStarted( false );
            return fetchedOptions;
        }
        return option;
    }, [ asyncFetch, asyncGetOptions, filter, option ] );

    const insertSelectedValues = ( value: Option ) => {
        settingChanged.current = true;
        setSelectedValues( ( prev ) => [ ...prev, value ] );
    };

    const removeSelectedValues = ( value: Option ) => {
        settingChanged.current = true;
        setSelectedValues( ( prev ) =>
            prev.filter( ( prevValue ) => prevValue.value !== value.value )
        );
    };

    const clearSelectedValues = () => {
        settingChanged.current = true;
        setSelectedValues( [] );
    };

    const getFilteredOptionValue = useCallback( async (): Promise<Option[]> => {
        const allOptions = await getOptions();
        
        // Filter out selected values
        const unselectedOptions = allOptions.filter(
            ( opt ) => !selectedValues.some( ( sel ) => sel.value === opt.value )
        );

        // Apply text filter if needed
        if ( !asyncFetch && filter ) {
            return unselectedOptions.filter(
                ( opt ) => 
                    opt.value.toString().includes( filter ) || 
                    opt.label.includes( filter )
            );
        }

        return unselectedOptions;
    }, [ asyncFetch, filter, getOptions, selectedValues ] );

    useEffect( () => {
        if ( settingChanged.current ) {
            settingChanged.current = false;
            onChange( selectedValues );
        }
    }, [ selectedValues, onChange ] );

    useEffect( () => {
        getFilteredOptionValue().then( setOptions );
    }, [ filter, option, selectedValues, getFilteredOptionValue ] );

    const selectedDisplayProps = {
        popupOpend: popupOpened,
        setPopupOpend: setPopupOpened,
        selectedValues,
        clearSelectedValues,
        removeSelectedValues,
    };

    const searchDisplayProps = {
        options,
        filter,
        setFilter,
        insertSelectedValues,
        searchStarted,
    };

    return (
        <main className="grid-table-main-container" id="modal-support">
            <section className="main-container">
                { !popupOpened ? (
                    <>
                        <SelectedOptionDisplay { ...selectedDisplayProps } />
                        <SearchOptionDisplay { ...searchDisplayProps } />
                    </>
                ) : (
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
                            <i className="admin-font adminfont-cross"></i>
                        </div>
                        <SelectedOptionDisplay { ...selectedDisplayProps } />
                        <SearchOptionDisplay { ...searchDisplayProps } />
                    </Modal>
                ) }
            </section>
        </main>
    );
};

interface Column {
    key: string;
    label: string;
    type?: 'checkbox' | 'description';
    moduleEnabled?: string;
    proSetting?: string;
}

interface Row {
    key: string;
    label: string;
    description?: string;
    options?: { value: string | number; label: string }[];
}

interface CapabilityGroup {
    label: string;
    desc: string;
    capability: Record< string, string >;
}

type Rows = Record< string, CapabilityGroup >;

interface MultiCheckboxTableProps {
    rows: Row[];
    columns: Column[];
    description?: string;
    onChange: ( key: string, value: string[] | Option[] ) => void;
    setting: Record< string, string[] | Option[] >;
    proSetting?: boolean;
    modules: string[];
    storeTabSetting: Record< string, string[] >;
    khali_dabba: boolean;
    onBlocked?: (type: 'pro' | 'module', payload?: string) => void;
}

const MultiCheckboxTableUI: React.FC< MultiCheckboxTableProps > = ( {
    rows,
    columns,
    onChange,
    setting,
    storeTabSetting,
    proSetting,
    modules,
    onBlocked,
    khali_dabba,
} ) => {
    const [ openGroup, setOpenGroup ] = useState< string | null >( () => {
        if ( !Array.isArray( rows ) && Object.keys( rows ).length > 0 ) {
            return Object.keys( rows )[ 0 ];
        }
        return null;
    } );

    const handleCheckboxChange = (
        column: Column,
        rowKey: string,
        isChecked: boolean,
        currentValue: string[] | Option[]
    ) => {
        if ( column.proSetting && !khali_dabba ) {
            onBlocked?.('pro');
            return;
        }

        if ( column.moduleEnabled && !modules.includes( column.moduleEnabled ) ) {
            onBlocked?.('module', column.moduleEnabled);
            return;
        }

        const selectedKeys = Array.isArray( currentValue ) ? currentValue as string[] : [];
        const updatedSelection = isChecked
            ? [ ...selectedKeys, rowKey ]
            : selectedKeys.filter( ( keyVal ) => keyVal !== rowKey );

        onChange( column.key, updatedSelection );
    };

    const renderCheckboxCell = ( column: Column, rowKey: string, isChecked: boolean ) => {
        const currentValue = setting[ column.key ] as string[] | Option[];
        
        return (
            <td key={ `${ column.key }_${ rowKey }` }>
                <input
                    type="checkbox"
                    checked={ isChecked }
                    onChange={ ( e ) => 
                        handleCheckboxChange( column, rowKey, e.target.checked, currentValue )
                    }
                />
            </td>
        );
    };

    if ( Array.isArray( rows ) ) {
        return (
            <>
                { proSetting && (
                    <span className="admin-pro-tag">
                        <i className="adminfont-pro-tag"></i>Pro
                    </span>
                ) }
                <table className="grid-table">
                    <thead>
                        <tr>
                            <th></th>
                            { columns.map( ( column ) => (
                                <th key={ column.key }>
                                    { column.label }
                                    { column?.proSetting && !khali_dabba && (
                                        <span className="admin-pro-tag">
                                            <i className="adminfont-pro-tag"></i>Pro
                                        </span>
                                    ) }
                                </th>
                            ) ) }
                        </tr>
                    </thead>
                    <tbody>
                        { rows.map( ( row ) => (
                            <tr key={ row.key }>
                                <td>{ row.label }</td>
                                { columns.map( ( column ) => {
                                    if ( column.type === 'description' ) {
                                        return (
                                            <td key={ `desc_${ row.key }` }>
                                                { row.description || '—' }
                                            </td>
                                        );
                                    }

                                    if ( row.options ) {
                                        const value = ( setting[ `${ column.key }_${ row.key }` ] as Option[] ) || [];
                                        return (
                                            <td key={ `${ column.key }_${ row.key }` }>
                                                <Select
                                                    values={ value }
                                                    onChange={ ( newValue ) => 
                                                        onChange( `${ column.key }_${ row.key }`, newValue )
                                                    }
                                                    option={ row.options }
                                                    isMulti
                                                />
                                            </td>
                                        );
                                    }

                                    const isChecked = Array.isArray( setting[ column.key ] ) && 
                                        ( setting[ column.key ] as string[] ).includes( row.key );
                                    
                                    return renderCheckboxCell( column, row.key, isChecked );
                                } ) }
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </>
        );
    }

    return (
        <>
            { proSetting && (
                <span className="admin-pro-tag">
                    <i className="adminfont-pro-tag"></i>Pro
                </span>
            ) }
            <table className="grid-table">
                <thead>
                    <tr>
                        <th></th>
                        { columns.map( ( column ) => (
                            <th key={ column.key }>
                                { column.label }
                                { column?.proSetting && !khali_dabba && (
                                    <span className="admin-pro-tag">
                                        <i className="adminfont-pro-tag"></i>Pro
                                    </span>
                                ) }
                            </th>
                        ) ) }
                    </tr>
                </thead>
                <tbody>
                    { Object.entries( rows as Rows ).map( ( [ groupKey, group ] ) => {
                        const isOpen = openGroup === groupKey;
                        return (
                            <React.Fragment key={ groupKey }>
                                <div
                                    className="toggle-header"
                                    onClick={ () => setOpenGroup( isOpen ? null : groupKey ) }
                                >
                                    <div className="header-title">
                                        { group.label }
                                        <i
                                            className={ `adminfont-${
                                                isOpen ? 'keyboard-arrow-down' : 'pagination-right-arrow'
                                            }` }
                                        ></i>
                                    </div>
                                </div>

                                { isOpen && Object.entries( group.capability ).map( ( [ capKey, capLabel ] ) => (
                                    <tr key={ capKey }>
                                        <td>{ capLabel }</td>
                                        { columns.map( ( column ) => {
                                            const hasExists = storeTabSetting && 
                                                Object.values( storeTabSetting ).some( 
                                                    ( arr ) => arr?.includes( capKey )
                                                );

                                            const isChecked = Array.isArray( setting[ column.key ] ) && 
                                                ( setting[ column.key ] as string[] ).includes( capKey );

                                            return (
                                                <td key={ `${ column.key }_${ capKey }` }>
                                                    <input
                                                        placeholder="select"
                                                        type="checkbox"
                                                        checked={ isChecked }
                                                        disabled={ !hasExists }
                                                        onChange={ ( e ) => {
                                                            if ( column.proSetting && !khali_dabba ) {
                                                                onBlocked?.('pro');
                                                                return;
                                                            }
                                                            if ( column.moduleEnabled && !modules.includes( column.moduleEnabled ) ) {
                                                                onBlocked?.('module', column.moduleEnabled);
                                                                return;
                                                            }

                                                            const selectedKeys = Array.isArray( setting[ column.key ] )
                                                                ? ( setting[ column.key ] as string[] )
                                                                : [];

                                                            const updatedSelection = e.target.checked
                                                                ? [ ...selectedKeys, capKey ]
                                                                : selectedKeys.filter( ( keyVal ) => keyVal !== capKey );

                                                            onChange( column.key, updatedSelection );
                                                        } }
                                                    />
                                                </td>
                                            );
                                        } ) }
                                    </tr>
                                ) ) }
                            </React.Fragment>
                        );
                    } ) }
                </tbody>
            </table>
        </>
    );
};

const MultiCheckboxTable: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer, modules, settings, onOptionsChange, onBlocked, storeTabSetting }) => (
        <MultiCheckboxTableUI
            khali_dabba={appLocalizer?.khali_dabba ?? false}
            rows={field.rows ?? []} // row array
            columns={field.columns ?? []} // columns array
            description={String(field.desc)}
            setting={settings}
            storeTabSetting={storeTabSetting}
            proSetting={field.proSetting ?? false}
            modules={modules} //Active module list for dependency validation.
            onBlocked={onBlocked}
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val)
            }}
        />
    ),
    validate: (field, value) => null,
};

export default MultiCheckboxTable;
