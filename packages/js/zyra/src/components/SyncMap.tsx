/**
 * External dependencies
 */
import React, { useEffect, useRef, useState, useMemo } from "react";

/**
 * Internal dependencies
 */
import "../styles/web/SyncMap.scss";

// Types
export interface SyncMapProps {
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

const SyncMap: React.FC< SyncMapProps > = ( {
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

    const formattedValue =
        Array.isArray( value ) && value.every( Array.isArray ) ? value : [];

    const [ selectedFields, setSelectedFields ] =
        useState< [ string, string ][] >( formattedValue );
    const [ availableFields, setAvailableFields ] = useState<
        Record< string, string[] >
    >( {} );
    const [ btnAllow, setBtnAllow ] = useState( false );
    const settingChanged = useRef( false );

    // ✅ Fix infinite loop by memoizing and ensuring stable dependencies
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
    }, 
    [
        selectedFields,
        systems,
        syncFieldsMap
    ] );

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
            console.log( "Unable to add sync fields" );
        }
    };

    useEffect( () => {
        if ( settingChanged.current ) {
            settingChanged.current = false;
            onChange( selectedFields );
        }
    }, [ selectedFields, onChange ] );

    return (
        <div className="sync-map-container">
            <div className="container-wrapper">
                <div className="main-wrapper">
                    <div className="main-wrapper-heading">
                        <span>{ syncFieldsMap[ systems[ 0 ] ].heading }</span>
                        <span>{ syncFieldsMap[ systems[ 1 ] ].heading }</span>
                    </div>
                    <div className="map-content-wrapper">
                        <select disabled>
                            <option value="email">Email</option>
                        </select>
                        <span className="connection-icon">⇌</span>
                        <select disabled>
                            <option value="email">Email</option>
                        </select>
                    </div>
                    { selectedFields.map(
                        ( [ systemAField, systemBField ], index ) => (
                            <div className="map-content-wrapper" key={ index }>
                                <select
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
                                <span className="connection-icon">&#8652;</span>
                                <select
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
                                    className="btn-purple remove-mapping"
                                    onClick={ ( e ) => {
                                        e.preventDefault();
                                        if ( ! proSettingChanged() ) {
                                            settingChanged.current = true;
                                            removeSelectedFields( index );
                                        }
                                    } }
                                >
                                    <span className="text">Clear</span>
                                    <span className="icon adminLib-close"></span>
                                </button>
                            </div>
                        )
                    ) }
                </div>
                <div className="btn-container">
                    <div className="add-mapping-container">
                        <button
                            className={ `btn-purple add-mapping ${
                                btnAllow ? "not-allow" : ""
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
                            <i className="adminLib-vendor-form-add"></i>
                        </button>
                        { proSetting && (
                            <span className="admin-pro-tag">pro</span>
                        ) }
                    </div>
                </div>
            </div>
            { description && (
                <p
                    className="settings-metabox-description"
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </div>
    );
};

export default SyncMap;
