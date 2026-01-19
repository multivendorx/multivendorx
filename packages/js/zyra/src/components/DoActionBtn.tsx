import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { getApiLink, sendApiResponse } from '../utils/apiService';
import '../styles/web/DoActionBtn.scss';

// Types
interface Task {
    action: string;
    message: string;
    cacheKey?: string; // Dynamic cache key
    successMessage?: string; // Custom success message
    failureMessage?: string; // Custom failure message
}

interface SyncStatus {
    action: string;
    current: number;
    total: number;
}

interface DynamicResponse {
    success: boolean;
    running?: boolean;
    status?: SyncStatus[];
    data?: any; // Can be any data type
    message?: string;
    [key: string]: any; // Allow any additional properties
}

interface ApiResponse {
    success?: boolean;
    [key: string]: any; // Fully dynamic response structure
}

interface AppLocalizer {
    nonce: string;
    apiUrl: string;
    restUrl: string;
    [key: string]: string | number | boolean;
}

interface AdditionalData {
    [key: string]: any; // Fully dynamic cache storage
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
    appLocalizer: AppLocalizer;
    successMessage?: string; // Global success message
    failureMessage?: string; // Global failure message
    onComplete?: (data: any) => void; // Callback on completion
    onError?: (error: any) => void; // Callback on error
    onTaskComplete?: (task: Task, response: any) => void; // Callback per task
}

type TaskStatus = 'running' | 'success' | 'failed';

const DoActionBtn: React.FC<DoActionBtnProps> = ({
    interval,
    proSetting,
    proSettingChanged,
    value,
    description,
    apilink,
    parameter,
    tasks,
    appLocalizer,
    successMessage = 'Process completed successfully',
    failureMessage = 'Process failed',
    onComplete,
    onError,
    onTaskComplete,
}) => {
    const [syncStarted, setSyncStarted] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [taskSequence, setTaskSequence] = useState<
        {
            name: string;
            message: string;
            status: TaskStatus;
            successMessage?: string;
            failureMessage?: string;
        }[]
    >([]);
    const [processStatus, setProcessStatus] = useState('');
    const [processResult, setProcessResult] = useState<any>(null);

    const fetchStatus = useRef<string>('');
    const fetchStatusRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const processStarted = useRef(false);
    const additionalData = useRef<AdditionalData>({});
    const taskIndex = useRef(0);

    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const fetchSyncStatus = useCallback(() => {
        axios
            .get(getApiLink(appLocalizer, apilink), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { parameter },
            })
            .then(({ data }: { data: DynamicResponse }) => {
                setSyncStarted(data.running || false);
                setSyncStatus(data.status || []);
            })
            .catch(() => {
                // Handle error gracefully for backward compatibility
                setSyncStarted(false);
                setSyncStatus([]);
            });
    }, [appLocalizer, apilink, parameter]);

    const updateTaskStatus = (status: TaskStatus, customMessage?: string) => {
        setTaskSequence((prev) => {
            const updated = [...prev];
            const last = updated.length - 1;
            if (last >= 0) {
                updated[last].status = status;
                if (customMessage) {
                    if (status === 'success') {
                        updated[last].successMessage = customMessage;
                    } else if (status === 'failed') {
                        updated[last].failureMessage = customMessage;
                    }
                }
            }
            return updated;
        });
    };

    const handleTaskResponse = async (
        currentTask: Task,
        response: DynamicResponse
    ): Promise<TaskStatus> => {
        let status: TaskStatus = 'success';
        let customMessage = '';

        // Store response data if cacheKey is specified
        if (currentTask.cacheKey && response.data !== undefined) {
            additionalData.current[currentTask.cacheKey] = response.data;
        }

        // Determine task success based on response
        if (!response?.success) {
            status = 'failed';
            customMessage = currentTask.failureMessage || response?.message || 'Task failed';

            // Call error callback if provided
            if (onError) {
                onError({ task: currentTask, response, error: customMessage });
            }
        } else {
            // Call task completion callback
            if (onTaskComplete) {
                onTaskComplete(currentTask, response);
            }

            // Use custom success message if provided
            if (currentTask.successMessage) {
                customMessage = currentTask.successMessage;
            }
        }

        updateTaskStatus(status, customMessage);
        return status;
    };

    const executeSequentialTasks = useCallback(async () => {
        if (taskIndex.current >= tasks.length) {
            // All tasks completed
            setProcessStatus('completed');
            setProcessResult(additionalData.current);
            setLoading(false);
            processStarted.current = false;

            // Call completion callback
            if (onComplete) {
                onComplete(additionalData.current);
            }
            return;
        }

        const currentTask = tasks[taskIndex.current];

        // Add task to sequence
        setTaskSequence((prev) => [
            ...prev,
            {
                name: currentTask.action,
                message: currentTask.message,
                status: 'running',
                successMessage: currentTask.successMessage,
                failureMessage: currentTask.failureMessage,
            },
        ]);

        // Add delay between tasks
        await sleep(interval);

        try {
            // Build dynamic payload
            const payload: Record<string, any> = {
                action: currentTask.action,
                parameter,
            };

            // Add all cached data from previous tasks
            Object.entries(additionalData.current).forEach(([key, value]) => {
                if (value !== undefined) {
                    payload[key] = value;
                }
            });

            // Execute task
            const response = (await sendApiResponse(
                appLocalizer,
                getApiLink(appLocalizer, apilink),
                payload
            )) as DynamicResponse;

            // Handle task response
            const status = await handleTaskResponse(currentTask, response);

            if (status === 'failed') {
                setProcessStatus('failed');
                setLoading(false);
                processStarted.current = false;
                return;
            }

            // Move to next task
            taskIndex.current++;
            await executeSequentialTasks();
        } catch (error) {
            console.error('Task execution failed:', error);
            updateTaskStatus('failed', 'Task execution failed');
            setProcessStatus('failed');
            setLoading(false);
            processStarted.current = false;

            if (onError) {
                onError({ task: currentTask, error });
            }
        }
    }, [tasks, interval, appLocalizer, apilink, parameter, onComplete, onError, onTaskComplete]);

    const startProcess = useCallback(() => {
        if (processStarted.current) {
            return;
        }
        processStarted.current = true;
        setLoading(true);
        setTaskSequence([]);
        setProcessStatus('');
        setProcessResult(null);
        additionalData.current = {};
        taskIndex.current = 0;
        executeSequentialTasks();
    }, [executeSequentialTasks]);

    useEffect(() => {
        if (syncStarted) {
            fetchStatusRef.current = setInterval(fetchSyncStatus, interval);
        } else if (fetchStatusRef.current) {
            clearInterval(fetchStatusRef.current);
            fetchStatusRef.current = null;
        }

        return () => {
            if (fetchStatusRef.current) {
                clearInterval(fetchStatusRef.current);
            }
        };
    }, [syncStarted, fetchSyncStatus, interval]);

    useEffect(() => {
        fetchSyncStatus();
    }, [fetchSyncStatus]);

    const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (proSettingChanged()) {
            return;
        }

        if (parameter === 'action' || parameter === 'connection_test') {
            startProcess();
        } else {
            setSyncStarted(true);
            try {
                const response = await axios.post(
                    getApiLink(appLocalizer, apilink),
                    { parameter },
                    { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                );
                if (response.data) {
                    setSyncStarted(false);
                    fetchSyncStatus();
                }
            } catch {
                setSyncStarted(false);
                fetchStatus.current = 'failed';
            }
        }
    };

    return (
        <>
            <div className="do-action-wrapper">
                <div className="loader-wrapper">
                    <button
                        className="admin-btn btn-purple btn-effect"
                        onClick={handleButtonClick}
                        disabled={loading || syncStarted}
                    >
                        {value}
                    </button>
                    {(loading || syncStarted) && (
                        <div className="loader">
                            <div className="three-body-dot" />
                            <div className="three-body-dot" />
                            <div className="three-body-dot" />
                        </div>
                    )}
                    {proSetting && (
                        <span className="admin-pro-tag">
                            <i className="adminlib-pro-tag"></i>Pro
                        </span>
                    )}
                </div>

                {syncStarted && (
                    <div className="fetch-display-output info">
                        Process started, please wait...
                    </div>
                )}

                {fetchStatus.current === 'failed' && (
                    <div className="fetch-display-output failed">
                        {failureMessage}
                    </div>
                )}

                <p
                    className="settings-metabox-description"
                    dangerouslySetInnerHTML={{ __html: description }}
                />

                {/* Task Progress Display */}
                {taskSequence.map((task, idx) => (
                    <div
                        key={idx}
                        className={`${task.status} details-status-row`}
                    >
                        <div className="task-message">
                            <span className="task-text">{task.message}</span>
                            {task.status !== 'running' && task.status === 'success' && task.successMessage && (
                                <span className="task-custom-message success">
                                    {task.successMessage}
                                </span>
                            )}
                            {task.status === 'failed' && task.failureMessage && (
                                <span className="task-custom-message failed">
                                    {task.failureMessage}
                                </span>
                            )}
                        </div>
                        {task.status !== 'running' && (
                            <div className="status-meta">
                                <span className="status-icons">
                                    <i
                                        className={`admin-font ${task.status === 'failed'
                                                ? 'adminlib-cross'
                                                : 'adminlib-icon-yes'
                                            }`}
                                    />
                                </span>
                            </div>
                        )}
                    </div>
                ))}

                {/* Process Completion Status */}
                {processStatus && (
                    <div
                        className={`fetch-display-output ${processStatus === 'failed' ? 'failed' : 'success'
                            }`}
                    >
                        {processStatus === 'failed' ? (
                            <p>
                                {failureMessage}
                                {parameter === 'connection_test' && (
                                    <>
                                        {' '}Check details in{' '}
                                        <Link
                                            className="errorlog-link"
                                            to="?page=moowoodle#&tab=settings&subtab=log"
                                        >
                                            error log
                                        </Link>
                                        .
                                    </>
                                )}
                            </p>
                        ) : (
                            successMessage
                        )}
                    </div>
                )}

                {/* Sync Status Display */}
                {syncStatus && syncStatus.length > 0 && (
                    <div className="sync-status-container">
                        {syncStatus.map((status, idx) => (
                            <div key={idx} className="details-status-row sync-status">
                                <span className="sync-action">{status.action}</span>
                                <div className="status-meta">
                                    <span className="status-icons">
                                        <i className="admin-font adminlib-icon-yes" />
                                    </span>
                                    <span className="sync-progress">
                                        {status.current} / {status.total}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default DoActionBtn;
