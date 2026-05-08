import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { FieldComponent, ZyraVariable } from './fieldUtils';
import { getApiLink } from '../utils/apiService';
import { ButtonInputUI } from './ButtonInput';
import { ItemListUI } from './ItemList';
import { Notice } from './Notice';

interface Task {
    action: string;
    message: string;
    successMessage?: string;
    failureMessage?: string;
    requiresResponeData?: boolean;
    previousResponseData?: string[];
}

interface SequentialTaskExecutorProps {
    buttonText: string;
    apilink: string;
    parameter?: string;
    action: string;
    interval: number;
    successMessage?: string;
    failureMessage?: string;
    tasks: Task[];
    onComplete?: () => void;
    onError?: (error: unknown) => void;
    onTaskComplete?: (task: Task, response: unknown) => void;
}

interface DynamicResponse {
    success: boolean;
    data?: unknown;
    message?: string;
    [key: string]: unknown;
}

export const SequentialTaskExecutorUI: React.FC<SequentialTaskExecutorProps> = ({
    buttonText,
    apilink,
    action,
    parameter,
    interval,
    successMessage,
    failureMessage,
    tasks,
    onComplete,
    onError,
    onTaskComplete,
}) => {
    const [loading, setLoading] = useState(false);
    const [taskSequence, setTaskSequence] = useState<
        {
            message: string;
            status: 'running' | 'success' | 'failed';
            successMessage?: string;
            failureMessage?: string;
        }[]
    >([]);
    const [processStatus, setProcessStatus] = useState('');
    const [syncStarted, setSyncStarted] = useState(false);
    const [syncStatus, setSyncStatus] = useState([]);

    const processStarted = useRef(false);
    const taskIndex = useRef(0);
    const lastResult = useRef<number[]>([]);
    const fetchStatusRef = useRef<NodeJS.Timeout | null>(null);
    const allResponses = useRef({});

    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const updateTaskStatus = (
        status: 'running' | 'success' | 'failed',
        customMessage?: string
    ) => {
        setTaskSequence((prev) => {
            const updated = [...prev];
            const lastTask = updated[updated.length - 1];

            if (lastTask) {
                lastTask.status = status;
                if (customMessage) {
                    lastTask[
                        status === 'success'
                            ? 'successMessage'
                            : 'failureMessage'
                    ] = customMessage;
                }
            }
            return updated;
        });
    };

    const handleTaskResponse = async (
        currentTask: Task,
        response: DynamicResponse
    ) => {
        const isSuccess = response?.success === true;

        const message = isSuccess
            ? currentTask.successMessage ||
            response?.message ||
            'Task completed'
            : currentTask.failureMessage || response?.message || 'Task failed';

        if (isSuccess) {
            if (Array.isArray(response?.data) && response.data.length > 0) {
                lastResult.current = response.data;
            }

            onTaskComplete?.(currentTask, response);
        } else {
            onError?.({ task: currentTask, response, error: message });
        }

        updateTaskStatus(isSuccess ? 'success' : 'failed', message);

        return isSuccess ? 'success' : 'failed';
    };

    const executeSequentialTasks = useCallback(async () => {
        if (taskIndex.current >= tasks.length) {
            setProcessStatus('completed');
            setLoading(false);
            processStarted.current = false;
            onComplete?.();
            return;
        }

        const currentTask = tasks[taskIndex.current];

        setTaskSequence((prev) => [
            ...prev,
            {
                message: currentTask.message,
                status: 'running',
                successMessage: currentTask.successMessage,
                failureMessage: currentTask.failureMessage,
            },
        ]);

        await sleep(interval);

        try {
            const payload: Record<string, unknown> = {};

            if (action) {
                payload.action = currentTask.action;
            }
            if (parameter) {
                payload.parameter = parameter;
            }

            if (currentTask.requiresResponeData) {
                payload.responseData = lastResult.current;
            }

            if (currentTask.previousResponseData?.length) {
                currentTask.previousResponseData.forEach((taskName: string) => {
                    payload[taskName] = allResponses.current[taskName];
                });
            }

            const response = await axios.post(
                getApiLink(ZyraVariable, apilink),
                payload,
                {
                    headers: {
                        'X-WP-Nonce': ZyraVariable.nonce,
                    },
                }
            );

            allResponses.current[currentTask.action] = response.data;

            const formattedResponse = {
                success: response.data?.success === true,
                data: response.data?.data,
                message: response.data?.message,
                ...response.data,
            };

            const status = await handleTaskResponse(
                currentTask,
                formattedResponse
            );

            if (status === 'failed') {
                setProcessStatus('failed');
                setLoading(false);
                processStarted.current = false;
                return;
            }
            taskIndex.current++;
            await executeSequentialTasks();
        } catch (error) {
            console.error('Task execution failed:', error);
            updateTaskStatus('failed', 'Task execution failed');
            setProcessStatus('failed');
            setLoading(false);
            processStarted.current = false;
            onError?.({ task: currentTask, error });
        }
    }, [tasks, interval, apilink, action, onComplete, onError, onTaskComplete]);

    const startProcess = useCallback(() => {
        if (processStarted.current) {
            return;
        }

        processStarted.current = true;
        setLoading(true);
        setTaskSequence([]);
        setProcessStatus('');
        taskIndex.current = 0;
        lastResult.current = [];

        executeSequentialTasks();
    }, [executeSequentialTasks]);

    const fetchSyncStatus = useCallback(() => {
        axios
            .get(getApiLink(appLocalizer, apilink), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { parameter },
            })
            .then(({ data }) => {
                setSyncStarted(data.running);
                setSyncStatus(data.status || []);
            });
    }, [appLocalizer, apilink, parameter]);

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

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();

        // If tasks exist → run normal flow
        if (tasks && tasks.length > 0) {
            startProcess();
            return;
        }

        setLoading(true);

        const payload: Record<string, unknown> = {};

        if (parameter) {
            payload.parameter = parameter;
        }

        axios
            .post(getApiLink(ZyraVariable, apilink), payload, {
                headers: {
                    'X-WP-Nonce': ZyraVariable.nonce,
                },
            })
            .then(() => {
                setSyncStarted(false);
                return fetchSyncStatus();
            })
            .then(() => {
                setProcessStatus('completed');
            })
            .catch((error) => {
                console.error('Initial POST failed:', error);
                setProcessStatus('failed');
                onError?.(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // const getItemListItems = () => {
    //     return taskSequence.map((task, index) => ({
    //         id: `task-${index}`,
    //         title: task.message,
    //         icon: task.status,
    //         className: `task-status-${task.status}`,
    //     }));
    // };

    return (
        <>
            <div className="loader-wrapper">
                <ButtonInputUI
                    buttons={[
                        {
                            text: buttonText,
                            color: 'purple-bg',
                            onClick: handleButtonClick,
                            disabled: loading,
                            icon: loading ? 'spinner' : 'play',
                        },
                    ]}
                    position="left"
                />

                {loading && (
                    <div className="loader">
                        <div className="three-body-dot" />
                    </div>
                )}
            </div>

            {/* {taskSequence.length > 0 && (
                <ItemListUI items={getItemListItems()} className="task-list" />
            )} */}
            {taskSequence.length > 0 &&
                taskSequence.map((task, index) => (
                    <div key={index} className="details-status-row">
                        {task.message}
                        <div className="status-meta">
                            <span className="status-icons">
                                <i className="admin-font adminfont-check" />
                            </span>
                        </div>
                    </div>
                ))}

            {syncStatus &&
                syncStatus.length > 0 &&
                syncStatus.map((status, idx) => (
                    <div key={idx} className="details-status-row">
                        {status.action}
                        <div className="status-meta">
                            <span className="status-icons">
                                <i className="admin-font adminfont-check" />
                            </span>
                            <span>
                                {status.current} / {status.total}
                            </span>
                        </div>
                    </div>
                ))}

            {processStatus && (
                <Notice
                    type={processStatus === 'failed' ? 'error' : 'success'}
                    displayPosition="inline-notice"
                    message={
                        processStatus === 'failed'
                            ? failureMessage
                            : successMessage
                    }
                />
            )}
        </>
    );
};
const SequentialTaskExecutor: FieldComponent = {
    render: ({ field }) => (
        <SequentialTaskExecutorUI
            buttonText={field.buttonText}
            apilink={field.apilink}
            parameter={field.parameter}
            action={field.action}
            interval={field.interval}
            successMessage={field.successMessage}
            failureMessage={field.failureMessage}
            tasks={field.tasks}
            onComplete={field.onComplete}
            onError={field.onError}
            onTaskComplete={field.onTaskComplete}
        />
    ),
};

export default SequentialTaskExecutor;