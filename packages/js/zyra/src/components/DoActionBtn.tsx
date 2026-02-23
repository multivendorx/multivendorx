import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { sendApiResponse, getApiLink } from '../utils/apiService';
import {AdminButtonUI} from './AdminButton';
import {ItemListUI} from './ItemList';


interface Task {
    action: string;
    message: string;
    cacheKey?: string;
    successMessage?: string;
    failureMessage?: string;
}

interface DoActionBtnProps {
    buttonKey: string;
    value: string;
    apilink: string;
    parameter: string;
    interval: number;
    proSetting: boolean;
    proSettingChanged: () => boolean;
    appLocalizer: any;
    successMessage?: string;
    failureMessage?: string;
    tasks: Task[];
    onComplete?: (data: any) => void;
    onError?: (error: any) => void;
    onTaskComplete?: (task: Task, response: any) => void;
}

interface DynamicResponse {
    success: boolean;
    data?: any;
    message?: string;
    [key: string]: any;
}

const DoActionBtn: React.FC<DoActionBtnProps> = ({
    value,
    apilink,
    parameter,
    interval,
    proSetting,
    proSettingChanged,
    appLocalizer,
    successMessage = 'Process completed successfully',
    failureMessage = 'Process failed',
    tasks,
    onComplete,
    onError,
    onTaskComplete,
}) => {
    const [loading, setLoading] = useState(false);
    const [taskSequence, setTaskSequence] = useState<{
        message: string;
        status: 'running' | 'success' | 'failed';
        successMessage?: string;
        failureMessage?: string;
    }[]>([]);
    const [processStatus, setProcessStatus] = useState('');

    // Refs for tracking state (exactly like original)
    const processStarted = useRef(false);
    const additionalData = useRef<Record<string, any>>({});
    const taskIndex = useRef(0);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const updateTaskStatus = (status: 'running' | 'success' | 'failed', customMessage?: string) => {
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
    ): Promise<'success' | 'failed'> => {
        let status: 'success' | 'failed' = 'success';
        let customMessage = '';

        // Store response data if cacheKey is specified
        if (currentTask.cacheKey && response.data !== undefined) {
            additionalData.current[currentTask.cacheKey] = response.data;
        }

        // Determine task success based on response
        if (!response?.success) {
            status = 'failed';
            customMessage = currentTask.failureMessage || response?.message || 'Task failed';
            onError?.({ task: currentTask, response, error: customMessage });
        } else {
            onTaskComplete?.(currentTask, response);
            if (currentTask.successMessage) {
                customMessage = currentTask.successMessage;
            }
        }

        updateTaskStatus(status, customMessage);
        return status;
    };

    const executeSequentialTasks = useCallback(async () => {
    if (taskIndex.current >= tasks.length) {
        setProcessStatus('completed');
        setLoading(false);
        processStarted.current = false;
        onComplete?.(additionalData.current);
        return;
    }

    const currentTask = tasks[taskIndex.current];

    // Add task to sequence
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
        // Define payload HERE before using it
        const payload: Record<string, any> = {
            [parameter]: currentTask.action
        };

        // Add cached data
        Object.entries(additionalData.current).forEach(([key, value]) => {
            if (value !== undefined) {
                payload[key] = value;
            }
        });

        // Debug logs
        console.log('Making request to:', getApiLink(appLocalizer, apilink));
        console.log('With payload:', payload);
        console.log('With nonce:', appLocalizer.nonce);

        // Try using axios directly
        const response = await axios.post(
            getApiLink(appLocalizer, apilink),
            payload,
            { 
                headers: { 
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json',
                } 
            }
        );

        console.log('Raw response:', response.data);
        console.log('Response status:', response.status);
        
        // Format response to match what handleTaskResponse expects
        const formattedResponse = {
            success: response.data?.success === true, // Make sure this is boolean
            data: response.data?.data,
            message: response.data?.message,
            ...response.data
        };

        console.log('Formatted response:', formattedResponse);

        const status = await handleTaskResponse(currentTask, formattedResponse);

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
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }
        updateTaskStatus('failed', 'Task execution failed');
        setProcessStatus('failed');
        setLoading(false);
        processStarted.current = false;
        onError?.({ task: currentTask, error });
    }
}, [tasks, interval, appLocalizer, apilink, parameter, onComplete, onError, onTaskComplete]);

    const startProcess = useCallback(() => {
        if (processStarted.current) return;
        
        processStarted.current = true;
        setLoading(true);
        setTaskSequence([]);
        setProcessStatus('');
        additionalData.current = {};
        taskIndex.current = 0;
        executeSequentialTasks();
    }, [executeSequentialTasks]);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (proSettingChanged()) return;
        startProcess();
    };

    // Convert taskSequence to ItemList items
    const getItemListItems = () => {
        return taskSequence.map((task, index) => {
            let icon = 'pending';
            if (task.status === 'running') icon = 'spinner';
            else if (task.status === 'success') icon = 'yes';
            else if (task.status === 'failed') icon = 'cross';

            let description = task.message;
            if (task.status === 'running') description = 'Processing...';
            else if (task.status === 'success' && task.successMessage) description = task.successMessage;
            else if (task.status === 'failed' && task.failureMessage) description = task.failureMessage;

            return {
                id: `task-${index}`,
                title: task.message,
                desc: description,
                icon: icon,
                className: `task-status-${task.status}`,
            };
        });
    };

    return (
        <div className="do-action-wrapper">
            <div className="loader-wrapper">
                <AdminButtonUI
                    buttons={[{
                        text: value,
                        color: 'purple-bg',
                        onClick: handleButtonClick,
                        disabled: loading || proSetting,
                        icon: loading ? 'spinner' : 'play',
                        children: null,
                        customStyle: {},
                        style: {},
                    }]}
                    wrapperClass=""
                    position="left"
                />
                
                {proSetting && (
                    <span className="admin-pro-tag">
                        <i className="adminlib-pro-tag"></i>Pro
                    </span>
                )}
                
                {loading && (
                    <div className="loader">
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                    </div>
                )}
            </div>

            {/* Task Progress Display */}
            {taskSequence.length > 0 && (
                <div className="tasks-container">
                    <ItemListUI
                        items={getItemListItems()}
                        className="task-list"
                        background={true}
                        border={true}
                    />
                </div>
            )}

            {/* Process Completion Status */}
            {processStatus && (
                <div className={`fetch-display-output ${processStatus === 'failed' ? 'failed' : 'success'}`}>
                    {processStatus === 'failed' ? failureMessage : successMessage}
                </div>
            )}
        </div>
    );
};

export default DoActionBtn;