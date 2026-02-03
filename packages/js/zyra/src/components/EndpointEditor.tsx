import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DragListView from 'react-drag-listview';
import '../styles/web/EndpointEditor.scss';
import { getApiLink } from '../utils/apiService';

interface Submenu {
    name: string;
    slug: string;
}

interface Endpoint {
    name: string;
    slug: string;
    submenu: Submenu[];
    icon: string;
    visible?: boolean; // show/hide
}
interface AppLocalizer {
    nonce: string;
    apiUrl: string;
    restUrl: string;
    [ key: string ]: string | number | boolean;
}

interface EndpointEditorProps {
    name: string;
    proSetting?: boolean;
    proSettingChanged?: () => boolean;
    apilink: string;
    appLocalizer: AppLocalizer;
    onChange: ( data: Record< string, Endpoint > ) => void;
}

const EndpointManager: React.FC< EndpointEditorProps > = ( {
    apilink,
    appLocalizer,
    onChange,
} ) => {
    const [ endpoints, setEndpoints ] = useState< [ string, Endpoint ][] >(
        []
    );
    const [ editKey, setEditKey ] = useState< string | null >( null );
    const [ editSlug, setEditSlug ] = useState< string >( '' );
    const [ editName, setEditName ] = useState< string >( '' );
    const editRef = useRef< HTMLDivElement >( null );

    // Close edit on outside click
    useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            if (
                editRef.current &&
                ! editRef.current.contains( event.target as Node )
            ) {
                setEditKey( null );
            }
        };

        if ( editKey ) {
            document.addEventListener( 'mousedown', handleClickOutside );
        } else {
            document.removeEventListener( 'mousedown', handleClickOutside );
        }

        return () => {
            document.removeEventListener( 'mousedown', handleClickOutside );
        };
    }, [ editKey ] );

    // Load data
    useEffect( () => {
        axios( {
            url: getApiLink( appLocalizer, apilink ),
            method: 'GET',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { menuOnly: true },
        } ).then( ( res ) => {
            const typedData = res.data as Record< string, Endpoint >;
            const data = Object.entries( typedData ).map( ( [ compareKey, v ] ) => [
                compareKey,
                { ...v, visible: v.visible !== false }, // default true
            ] ) as [ string, Endpoint ][];
            setEndpoints( data );
        } );
    }, [] );

    const autoSave = ( updated: [ string, Endpoint ][] ) => {
        setEndpoints( updated );
        onChange( Object.fromEntries( updated ) as Record< string, Endpoint > );
    };

    // Main menu drag
    const onDragEnd = ( fromIndex: number, toIndex: number ) => {
        const updated = [ ...endpoints ];
        const item = updated.splice( fromIndex, 1 )[ 0 ];
        updated.splice( toIndex, 0, item );
        autoSave( updated );
    };

    const startEdit = ( key: string, endpoint: Endpoint ) => {
        setEditKey( key );
        setEditName( endpoint.name );
        setEditSlug( endpoint.slug );
    };

    const renderRow = (
        [ key, endpoint ]: [ string, Endpoint ],
        index: number
    ) => {
        // Submenu drag
        const onSubmenuDragEnd = ( fromIndex: number, toIndex: number ) => {
            const updated = endpoints.map( ( [ compareKey, item ] ) => {
                if ( compareKey === key ) {
                    const submenuUpdated = [ ...item.submenu ];
                    const moved = submenuUpdated.splice( fromIndex, 1 )[ 0 ];
                    submenuUpdated.splice( toIndex, 0, moved );
                    return [ compareKey, { ...item, submenu: submenuUpdated } ];
                }
                return [ compareKey, item ];
            } ) as [ string, Endpoint ][];
            autoSave( updated );
        };

        return (
            <div key={ key } data-index={ index } className="menu-item">
                { editKey === key ? (
                    <div className="edit-menu" ref={ editRef }>
                        <div className="name-wrapper">
                            <i className="adminfont-drag"></i>
                            <label
                                htmlFor={ `menu-name-${ key }` }
                                className="input-label"
                            >
                                Menu name:{ ' ' }
                            </label>
                            <input
                                id={ `menu-name-${ key }` }
                                value={ editName }
                                onChange={ ( e ) => {
                                    const newName = e.target.value;
                                    setEditName( newName );
                                    const updated = endpoints.map(
                                        ( [ compareKey, item ] ) =>
                                            compareKey === editKey
                                                ? [
                                                      compareKey,
                                                      {
                                                          ...item,
                                                          name: newName,
                                                          slug: editSlug,
                                                          visible: item.visible,
                                                      },
                                                  ]
                                                : [ compareKey, item ]
                                    ) as [ string, Endpoint ][];
                                    autoSave( updated );
                                } }
                                placeholder="Enter menu name"
                                className="basic-input"
                            />
                            { key !== 'dashboard' && (
                                <>
                                    <label
                                        htmlFor={ `slug-${ key }` }
                                        className="input-label"
                                    >
                                        Slug:{ ' ' }
                                    </label>
                                    <input
                                        id={ `slug-${ key }` }
                                        value={ editSlug }
                                        onChange={ ( e ) => {
                                            // const newSlug = e.target.value;
                                            // setEditSlug(newSlug);
                                            // const updated = endpoints.map(([compareKey, item]) =>
                                            //   compareKey === editKey
                                            //     ? [compareKey, { ...item, name: editName, slug: newSlug, visible: item.visible }]
                                            //     : [compareKey, item]
                                            // ) as [string, Endpoint][];
                                            // autoSave(updated);
                                            let newSlug = e.target.value
                                                .toLowerCase()
                                                .replace( /[^a-z0-9-]/g, '' );
                                            setEditSlug( newSlug );

                                            if (
                                                newSlug !==
                                                e.target.value.toLowerCase()
                                            ) {
                                                return;
                                            }

                                            const trimmedValue = newSlug.trim();
                                            if ( ! trimmedValue ) {
                                                return;
                                            }

                                            // Collect all existing slugs (except the one being edited)
                                            const existingSlugs = endpoints
                                                .filter(
                                                    ( [ compareKey ] ) => compareKey !== editKey
                                                )
                                                .map(
                                                    ( [ , item ] ) => item.slug
                                                );

                                            // Generate unique slug
                                            let finalSlug = trimmedValue;
                                            let counter = 1;

                                            while (
                                                existingSlugs.includes(
                                                    finalSlug
                                                )
                                            ) {
                                                finalSlug = `${ trimmedValue }${ counter }`;
                                                counter++;
                                            }

                                            // Update endpoints
                                            const updated = endpoints.map(
                                                ( [ compareKey, item ] ) =>
                                                    compareKey === editKey
                                                        ? [
                                                              compareKey,
                                                              {
                                                                  ...item,
                                                                  name: editName,
                                                                  slug: finalSlug,
                                                                  visible:
                                                                      item.visible,
                                                              },
                                                          ]
                                                        : [ compareKey, item ]
                                            ) as [ string, Endpoint ][];

                                            autoSave( updated );
                                        } }
                                        placeholder="Slug"
                                        className="basic-input"
                                    />
                                </>
                            ) }
                        </div>
                    </div>
                ) : (
                    <div
                        style={ {
                            opacity: endpoint.visible === false ? 0.5 : 1,
                        } }
                        className="main-menu"
                    >
                        <div className="name-wrapper">
                            { key !== 'dashboard' && (
                                <i className="adminfont-drag"></i>
                            ) }
                            <i className={ endpoint.icon }></i>
                            <div className="name">
                                { endpoint.name }
                                { key !== 'dashboard' && (
                                    <>
                                        { ' ' }
                                        <code>{ endpoint.slug }</code>
                                    </>
                                ) }
                            </div>
                        </div>
                        { key !== 'dashboard' && (
                            <div className="edit-icon">
                                { endpoint.visible !== false && (
                                    <i
                                        onClick={ () =>
                                            startEdit( key, endpoint )
                                        }
                                        className="adminfont-edit"
                                    ></i>
                                ) }
                                <div>
                                    <i
                                        className={ `adminfont-eye${
                                            endpoint.visible === false
                                                ? '-blocked'
                                                : ''
                                        }` }
                                        onClick={ () => {
                                            const updated = endpoints.map(
                                                ( [ compareKey, item ] ) =>
                                                    compareKey === key
                                                        ? [
                                                              compareKey,
                                                              {
                                                                  ...item,
                                                                  visible:
                                                                      item.visible ===
                                                                      false
                                                                          ? true
                                                                          : false,
                                                              },
                                                          ]
                                                        : [ compareKey, item ]
                                            ) as [ string, Endpoint ][];
                                            autoSave( updated );
                                        } }
                                    ></i>
                                </div>
                            </div>
                        ) }
                    </div>
                ) }

                { /* Submenu drag list */ }
                { endpoint.submenu?.length > 0 && (
                    <DragListView
                        nodeSelector=".sub-menu"
                        handleSelector="" // whole row draggable
                        onDragEnd={ onSubmenuDragEnd }
                    >
                        <ul>
                            { endpoint.submenu.map( ( sub, index ) => {
                                const subKey = `${ key }-sub-${ index }`;
                                return (
                                    <li
                                        key={ index }
                                        className="sub-menu"
                                        style={ {
                                            opacity:
                                                endpoint.visible === false
                                                    ? 0.5
                                                    : 1,
                                        } }
                                    >
                                        { editKey === subKey ? (
                                            <>
                                                <label
                                                    htmlFor={ `submenu-name-${ key }-${ index }` }
                                                    className="input-label"
                                                >
                                                    Submenu Name:{ ' ' }
                                                </label>
                                                <span ref={ editRef }>
                                                    <input
                                                        id={ `submenu-name-${ key }-${ index }` }
                                                        value={ editName }
                                                        onChange={ ( e ) => {
                                                            const newName =
                                                                e.target.value;
                                                            setEditName(
                                                                newName
                                                            );
                                                            const updated =
                                                                endpoints.map(
                                                                    ( [
                                                                        compareKey,
                                                                        item,
                                                                    ] ) => {
                                                                        if (compareKey ===key) {
                                                                            const submenuUpdated =
                                                                                [
                                                                                    ...item.submenu,
                                                                                ];
                                                                            submenuUpdated[index] =
                                                                                {
                                                                                    ...submenuUpdated[index],
                                                                                    name: newName,
                                                                                };
                                                                            return [
                                                                                compareKey,
                                                                                {
                                                                                    ...item,
                                                                                    submenu:
                                                                                        submenuUpdated,
                                                                                },
                                                                            ];
                                                                        }
                                                                        return [compareKey,item,];
                                                                    }
                                                                ) as [
                                                                    string,
                                                                    Endpoint,
                                                                ][];
                                                            autoSave( updated );
                                                        } }
                                                        placeholder="Submenu name"
                                                        className="basic-input"
                                                    />
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="adminfont-drag"></i>
                                                { sub.name }
                                                <i
                                                    className="adminfont-edit"
                                                    onClick={ () => {
                                                        setEditKey( subKey );
                                                        setEditName( sub.name );
                                                        setEditSlug( sub.slug );
                                                    } }
                                                ></i>
                                            </>
                                        ) }
                                    </li>
                                );
                            } ) }
                        </ul>
                    </DragListView>
                ) }
            </div>
        );
    };

    return (
        <div className="endpoints-wrapper">
            <DragListView
                nodeSelector=".drag-row"
                handleSelector=".drag-handle"
                onDragEnd={ onDragEnd }
            >
                <div>
                    { endpoints.map( ( [ key, endpoint ], index ) => (
                        <div key={ key } className="endpoint drag-row">
                            { key === 'dashboard' ? (
                                <div className="dashboard">
                                    { renderRow( [ key, endpoint ], index ) }
                                </div>
                            ) : (
                                <div className="drag-handle menu-wrapper">
                                    { renderRow( [ key, endpoint ], index ) }
                                </div>
                            ) }
                        </div>
                    ) ) }
                </div>
            </DragListView>
        </div>
    );
};

export default EndpointManager;
