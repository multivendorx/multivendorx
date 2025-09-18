/**
 * External dependencies
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/DropDownMapping.scss';

// Types
interface DropDownMappingProps {
    value?: [ string, string ][];
    onChange: ( value: [ string, string ][] ) => void;
    proSetting?: boolean;
    proSettingChanged: () => boolean;
    description?: string;
    syncFieldsMap: Record<
        string,
        { heading: string; fields: Record< string, string > }
    >;
}

const DropDownMapping: React.FC< DropDownMappingProps > = ( {
    value = [],
    onChange,
    proSetting,
    proSettingChanged,
    description,
    syncFieldsMap,
} ) => {
    const systems = useMemo(
        () => Object.keys( syncFieldsMap ),
        [ syncFieldsMap ]
    );

    // const formattedValue =
    //     Array.isArray(value) && value.every(Array.isArray) ? value : [];

    const formattedValue = ( value || [] ).filter(
        ( pair ) =>
            Array.isArray( pair ) && pair.length === 2 && pair[ 0 ] && pair[ 1 ]
    );

    const [ selectedFields, setSelectedFields ] =
        useState< [ string, string ][] >( formattedValue );
    const [ availableFields, setAvailableFields ] = useState<
        Record< string, string[] >
    >( {} );
    const [ btnAllow, setBtnAllow ] = useState( false );
    const settingChanged = useRef( false );

    //Fix infinite loop by memoizing and ensuring stable dependencies
    useEffect( () => {
        const updatedAvailableFields: Record< string, string[] > = {};
        systems.forEach( ( system ) => {
            updatedAvailableFields[ system ] = Object.keys(
                syncFieldsMap[ system ].fields
            ).filter(
                ( field ) =>
                    ! selectedFields.some(
                        ( [ selectedFieldA, selectedFieldB ] ) =>
                            selectedFieldA === field || selectedFieldB === field
                    )
            );
        } );
        setAvailableFields( updatedAvailableFields );
    }, [ selectedFields, systems, syncFieldsMap ] );

    const changeSelectedFields = (
        fieldIndex: number,
        data: string,
        systemIndex: number
    ) => {
        setSelectedFields( ( prevFields ) =>
            prevFields.map( ( fieldPair, index ) => {
                if ( index === fieldIndex ) {
                    const newPair = [ ...fieldPair ] as [ string, string ];
                    newPair[ systemIndex ] = data;
                    return newPair;
                }
                return fieldPair;
            } )
        );
        settingChanged.current = true;
    };

    const removeSelectedFields = ( fieldIndex: number ) => {
        setSelectedFields( ( prevFields ) =>
            prevFields.filter( ( _, index ) => index !== fieldIndex )
        );
        setBtnAllow( false );
        settingChanged.current = true;
    };

    const insertSelectedFields = () => {
        if (
            availableFields[ systems[ 0 ] ]?.length &&
            availableFields[ systems[ 1 ] ]?.length
        ) {
            const systemAField = availableFields[ systems[ 0 ] ].shift()!;
            const systemBField = availableFields[ systems[ 1 ] ].shift()!;
            setSelectedFields( ( prevFields ) => [
                ...prevFields,
                [ systemAField, systemBField ],
            ] );
            setBtnAllow(
                availableFields[ systems[ 0 ] ].length === 0 &&
                    availableFields[ systems[ 1 ] ].length === 0
            );
            settingChanged.current = true;
        } else {
            // eslint-disable-next-line no-console
            console.log( 'Unable to add sync fields' );
        }
    };

    useEffect( () => {
        if ( settingChanged.current ) {
            settingChanged.current = false;
            onChange( selectedFields );
        }
    }, [ selectedFields, onChange ] );

    return (
        <>
            <div className="dropdown-mapping-container">
                <div className="main-wrapper">
                    <div className="main-wrapper-heading">
                        <span>{ syncFieldsMap[ systems[ 0 ] ].heading }</span>
                        <span>{ syncFieldsMap[ systems[ 1 ] ].heading }</span>
                    </div>
                    <div className="map-content-wrapper">
                        <select className="basic-select" disabled>
                            <option value="email">Email</option>
                        </select>
                        <span className="connection-icon">⇌</span>
                        <select className="basic-select" disabled>
                            <option value="email">Email</option>
                        </select>
                    </div>
                    { selectedFields.length > 0 &&
                        selectedFields.map(
                            ( [ systemAField, systemBField ], index ) => (
                                <div
                                    className="map-content-wrapper"
                                    key={ index }
                                >
                                    <select
                                        className="basic-select"
                                        value={ systemAField }
                                        onChange={ ( e ) => {
                                            if ( ! proSettingChanged() ) {
                                                settingChanged.current = true;
                                                changeSelectedFields(
                                                    index,
                                                    e.target.value,
                                                    0
                                                );
                                            }
                                        } }
                                    >
                                        <option value={ systemAField }>
                                            {
                                                syncFieldsMap[ systems[ 0 ] ]
                                                    .fields[ systemAField ]
                                            }
                                        </option>
                                        { availableFields[ systems[ 0 ] ]?.map(
                                            ( option ) => (
                                                <option
                                                    key={ option }
                                                    value={ option }
                                                >
                                                    {
                                                        syncFieldsMap[
                                                            systems[ 0 ]
                                                        ].fields[ option ]
                                                    }
                                                </option>
                                            )
                                        ) }
                                    </select>
                                    <span className="connection-icon">
                                        &#8652;
                                    </span>
                                    <select
                                        className="basic-select"
                                        value={ systemBField }
                                        onChange={ ( e ) => {
                                            if ( ! proSettingChanged() ) {
                                                settingChanged.current = true;
                                                changeSelectedFields(
                                                    index,
                                                    e.target.value,
                                                    1
                                                );
                                            }
                                        } }
                                    >
                                        <option value={ systemBField }>
                                            {
                                                syncFieldsMap[ systems[ 1 ] ]
                                                    .fields[ systemBField ]
                                            }
                                        </option>
                                        { availableFields[ systems[ 1 ] ]?.map(
                                            ( option ) => (
                                                <option
                                                    key={ option }
                                                    value={ option }
                                                >
                                                    {
                                                        syncFieldsMap[
                                                            systems[ 1 ]
                                                        ].fields[ option ]
                                                    }
                                                </option>
                                            )
                                        ) }
                                    </select>
                                    <button
                                        className="admin-btn btn-purple remove-mapping"
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            if ( ! proSettingChanged() ) {
                                                settingChanged.current = true;
                                                removeSelectedFields( index );
                                            }
                                        } }
                                    >
                                        <span className="text">Clear</span>
                                        <span className="icon adminlib-close"></span>
                                    </button>
                                </div>
                            )
                        ) }
                </div>
                <div className="add-mapping-container">
                    <button
                        className={ `admin-btn btn-purple ${
                            btnAllow ? 'not-allow' : ''
                        }` }
                        onClick={ ( e ) => {
                            e.preventDefault();
                            if ( ! proSettingChanged() ) {
                                settingChanged.current = true;
                                insertSelectedFields();
                            }
                        } }
                    >
                        <span className="text">Add</span>
                        <i className="adminlib-vendor-form-add"></i>
                    </button>
                    { proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span> }
                </div>
            </div>
            { description && (
                <p
                    className="settings-metabox-description"
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </>
    );
};

export default DropDownMapping;
