import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { getApiLink, sendApiResponse } from '../utils/apiService';
import '../styles/web/DoActionBtn.scss';

// Types
interface Task {
    action: string;
    message: string;
    cache?: 'course_id' | 'user_id';
}
interface SyncStatus {
    action: string;
    current: number;
    total: number;
}
interface ApiResponse {
    success?: boolean;
    courses?: { id: number }[];
    data?: {
        users?: { id: number }[];
    };
}
interface DoActionBtnProps {
    buttonKey: string;
    interval: number;
    proSetting: boolean;
    proSettingChanged: () => boolean;
    value: string;
    description: string;
    apilink: string;
    parameter: string;
    tasks: Task[];
    appLocalizer: Record< string, any >;
}
type TaskStatus = 'running' | 'success' | 'failed';

const DoActionBtn: React.FC< DoActionBtnProps > = ( {
    interval,
    proSetting,
    proSettingChanged,
    value,
    description,
    apilink,
    parameter,
    tasks,
    appLocalizer,
} ) => {
    const [ syncStarted, setSyncStarted ] = useState( false );
    const [ syncStatus, setSyncStatus ] = useState< SyncStatus[] >( [] );
    const [ loading, setLoading ] = useState( false );
    const [ taskSequence, setTaskSequence ] = useState<
        { name: string; message: string; status: TaskStatus }[]
    >( [] );
    const [ testStatus, setTestStatus ] = useState( '' );

    const fetchStatus = useRef< string >( '' );
    const fetchStatusRef = useRef< NodeJS.Timeout | null >( null );
    const connectTaskStarted = useRef( false );
    const additionalData = useRef< Record< string, any > >( {} );
    const taskIndex = useRef( 0 );

    const sleep = ( ms: number ) =>
        new Promise( ( resolve ) => setTimeout( resolve, ms ) );

    const fetchSyncStatus = useCallback( () => {
        axios
            .get( getApiLink( appLocalizer, apilink ), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { parameter },
            } )
            .then( ( { data } ) => {
                setSyncStarted( data.running );
                setSyncStatus( data.status || [] );
            } );
    }, [ appLocalizer, apilink, parameter ] );

    const updateTaskStatus = ( status: TaskStatus ) => {
        setTaskSequence( ( prev ) => {
            const updated = [ ...prev ];
            const last = updated.length - 1;
            if ( last >= 0 ) {
                updated[ last ].status = status;
            }
            return updated;
        } );
    };

    const doSequentialTask = useCallback( async () => {
        if ( taskIndex.current >= tasks.length ) {
            setTestStatus( 'Test Successful' );
            setLoading( false );
            connectTaskStarted.current = false;
            return;
        }

        const currentTask = tasks[ taskIndex.current ];
        setTaskSequence( ( prev ) => [
            ...prev,
            {
                name: currentTask.action,
                message: currentTask.message,
                status: 'running',
            },
        ] );

        await sleep( interval );

        try {
            const response = ( await sendApiResponse(
                appLocalizer,
                getApiLink( appLocalizer, apilink ),
                {
                    action: currentTask.action,
                    ...additionalData.current,
                    parameter,
                }
            ) ) as ApiResponse;

            let status: TaskStatus = 'success';

            if ( currentTask.cache === 'course_id' ) {
                const course = response?.courses?.[ 1 ];
                status = course ? 'success' : 'failed';
                if ( course ) additionalData.current.course_id = course.id;
            } else if ( currentTask.cache === 'user_id' ) {
                const user = response?.data?.users?.[ 0 ];
                status = user ? 'success' : 'failed';
                if ( user ) additionalData.current.user_id = user.id;
            } else if ( ! response?.success ) {
                status = 'failed';
            }

            updateTaskStatus( status );

            if ( status === 'failed' ) {
                setTestStatus( 'Failed' );
                setLoading( false );
                connectTaskStarted.current = false;
                return;
            }

            taskIndex.current++;
            await doSequentialTask();
        } catch {
            updateTaskStatus( 'failed' );
            setTestStatus( 'Failed' );
            setLoading( false );
            connectTaskStarted.current = false;
        }
    }, [ tasks, interval, appLocalizer, apilink, parameter ] );

    const startConnectionTask = useCallback( () => {
        if ( connectTaskStarted.current ) return;
        connectTaskStarted.current = true;
        setLoading( true );
        setTaskSequence( [] );
        setTestStatus( '' );
        additionalData.current = {};
        taskIndex.current = 0;
        doSequentialTask();
    }, [ doSequentialTask ] );

    useEffect( () => {
        if ( syncStarted ) {
            fetchStatusRef.current = setInterval( fetchSyncStatus, interval );
        } else if ( fetchStatusRef.current ) {
            clearInterval( fetchStatusRef.current );
            fetchStatusRef.current = null;
        }

        return () => {
            if ( fetchStatusRef.current ) {
                clearInterval( fetchStatusRef.current );
            }
        };
    }, [ syncStarted, fetchSyncStatus, interval ] );

    useEffect( () => {
        fetchSyncStatus();
    }, [ fetchSyncStatus ] );

    const handleSync = async ( e: React.MouseEvent< HTMLButtonElement > ) => {
        e.preventDefault();
        if ( proSettingChanged() ) return;

        if ( parameter === 'connection_test' ) {
            startConnectionTask();
        } else {
            setSyncStarted( true );
            try {
                const response = await axios.post(
                    getApiLink( appLocalizer, apilink ),
                    { parameter },
                    { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                );
                if ( response.data ) {
                    setSyncStarted( false );
                    fetchSyncStatus();
                }
            } catch {
                setSyncStarted( false );
                fetchStatus.current = 'failed';
            }
        }
    };

    return (
        <>
            <div className="loader-wrapper">
                <button
                    className="admin-btn btn-purple btn-effect"
                    onClick={ handleSync }
                >
                    { value }
                </button>
                { ( loading || syncStarted ) && (
                    <div className="loader">
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                    </div>
                ) }
                { proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span> }
            </div>

            { syncStarted && (
                <div className="fetch-display-output success">
                    Synchronization started, please wait.
                </div>
            ) }

            { fetchStatus.current === 'failed' && (
                <div className="fetch-display-output failed">Failed.</div>
            ) }

            <p
                className="settings-metabox-description"
                dangerouslySetInnerHTML={ { __html: description } }
            />

            { taskSequence.map( ( task, idx ) => (
                <div
                    key={ idx }
                    className={ `${ task.status } details-status-row` }
                >
                    { task.message }
                    { task.status !== 'running' && (
                        <>
                            <div className="status-meta">
                                <span className="status-icons">
                                    <i
                                        className={ `admin-font ${
                                            task.status === 'failed'
                                                ? 'adminlib-cross'
                                                : 'adminlib-icon-yes'
                                        }` }
                                    />
                                </span>
                            </div>
                        </>
                    ) }
                </div>
            ) ) }

            { testStatus && (
                <div
                    className={ `fetch-display-output ${
                        testStatus === 'Failed' ? 'failed' : 'success'
                    }` }
                >
                    { testStatus === 'Failed' ? (
                        <p>
                            Test connection failed. Check details in{ ' ' }
                            <Link
                                className="errorlog-link"
                                to="?page=moowoodle#&tab=settings&subtab=log"
                            >
                                error log
                            </Link>
                            .
                        </p>
                    ) : (
                        'Test connection successful'
                    ) }
                </div>
            ) }

            { syncStatus &&
                syncStatus.length > 0 &&
                syncStatus.map( ( status, idx ) => (
                    <div key={ idx } className="details-status-row">
                        { status.action }
                        <div className="status-meta">
                            <span className="status-icons">
                                <i className="admin-font adminlib-icon-yes" />
                            </span>
                            <span>
                                { status.current } / { status.total }
                            </span>
                        </div>
                    </div>
                ) ) }
        </>
    );
};

export default DoActionBtn;
