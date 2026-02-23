import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { AdminButtonUI } from './AdminButton';
import ItemList, { ItemListUI } from './ItemList';

// Keep the exact same props interface as the original DoActionBtn
interface Task {
    action: string;
    message: string;
    cacheKey?: string;
    successMessage?: string;
    failureMessage?: string;
}

interface DoActionTaskListProps {
    buttonKey: string;          // Keep even if not used
    value: string;              // Button text
    apilink: string;            // API endpoint
    parameter: string;          // Parameter name
    interval: number;           // Keep for backward compatibility
    proSetting: boolean;
    proSettingChanged: () => boolean;
    appLocalizer: {
        nonce: string;
        apiUrl: string;
        restUrl: string;
        [key: string]: any;
    };
    successMessage?: string;
    failureMessage?: string;
    tasks: Task[];
    onComplete?: (data: any) => void;
    onError?: (error: any) => void;
    onTaskComplete?: (task: Task, response: any) => void;
}

const DoActionBtn: React.FC<DoActionTaskListProps> = ({
    buttonKey,  // Keep even if not used for backward compatibility
    value,
    apilink,
    parameter,
    interval,   // Keep for backward compatibility
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
    const [isLoading, setIsLoading] = useState(false);
    const [processStatus, setProcessStatus] = useState<'success' | 'failed' | null>(null);
    const [taskStatuses, setTaskStatuses] = useState<Record<string, {
        status: 'pending' | 'running' | 'success' | 'failed';
        message: string;
        customMessage?: string;
    }>>({});
    const [cache, setCache] = useState<Record<string, any>>({});

    // Initialize task statuses
    useEffect(() => {
        const initialStatuses: Record<string, any> = {};
        tasks.forEach(task => {
            initialStatuses[task.action] = {
                status: 'pending',
                message: task.message,
            };
        });
        setTaskStatuses(initialStatuses);
    }, [tasks]);

    const updateTaskStatus = (
        action: string, 
        status: 'pending' | 'running' | 'success' | 'failed', 
        customMessage?: string
    ) => {
        setTaskStatuses(prev => ({
            ...prev,
            [action]: {
                ...prev[action],
                status,
                customMessage,
            }
        }));
    };

    const executeTasks = async () => {
        setIsLoading(true);
        setProcessStatus(null);
        
        // Reset all tasks to pending
        tasks.forEach(task => {
            updateTaskStatus(task.action, 'pending');
        });
        
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            
            // Update current task to running
            updateTaskStatus(task.action, 'running');
            
            try {
                // Prepare payload with cached data
                const payload: Record<string, any> = {
                    action: task.action,
                    [parameter]: 'action', // Match original parameter structure
                    ...cache
                };

                // Use the same API call pattern as original
                const response = await axios.post(
                    `${appLocalizer.apiUrl}/${apilink}`, // Match original URL structure
                    payload,
                    { 
                        headers: { 
                            'X-WP-Nonce': appLocalizer.nonce,
                            'Content-Type': 'application/json',
                        } 
                    }
                );

                // Check response structure (matches original DynamicResponse)
                const responseData = response.data;
                const isSuccess = responseData?.success !== false;

                // Cache response data if needed
                if (task.cacheKey && responseData?.data !== undefined) {
                    setCache(prev => ({ 
                        ...prev, 
                        [task.cacheKey]: responseData.data 
                    }));
                }

                if (isSuccess) {
                    // Task succeeded
                    updateTaskStatus(
                        task.action, 
                        'success', 
                        task.successMessage || responseData?.message || 'Task completed'
                    );
                    
                    // Call task completion callback
                    onTaskComplete?.(task, responseData);
                } else {
                    // Task failed
                    updateTaskStatus(
                        task.action, 
                        'failed', 
                        task.failureMessage || responseData?.message || 'Task failed'
                    );
                    
                    setProcessStatus('failed');
                    onError?.({ task, response: responseData, error: responseData?.message });
                    setIsLoading(false);
                    return;
                }

                // Use interval for delay between tasks (matches original)
                if (i < tasks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, interval));
                }
            } catch (error) {
                console.error('Task execution failed:', error);
                updateTaskStatus(task.action, 'failed', 'Execution error');
                setProcessStatus('failed');
                setIsLoading(false);
                onError?.({ task, error });
                return;
            }
        }

        // All tasks completed successfully
        setProcessStatus('success');
        onComplete?.(cache);
        setIsLoading(false);
    };

    const handleButtonClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (proSettingChanged()) {
            return;
        }
        executeTasks();
    }, [proSettingChanged]);

    // Convert tasks to ItemList format
    const getItemListItems = () => {
        return tasks.map(task => {
            const taskStatus = taskStatuses[task.action] || { status: 'pending', message: task.message };
            
            // Map status to icon
            let icon = 'pending';
            if (taskStatus.status === 'running') icon = 'spinner';
            else if (taskStatus.status === 'success') icon = 'yes';
            else if (taskStatus.status === 'failed') icon = 'cross';

            // Determine description
            let desc = task.message;
            if (taskStatus.status === 'running') desc = 'Processing...';
            else if (taskStatus.customMessage) desc = taskStatus.customMessage;

            return {
                id: task.action,
                title: task.message,
                desc: desc,
                icon: icon,
                className: `task-status-${taskStatus.status}`,
                // Make items non-clickable
                action: undefined,
            };
        });
    };

    return (
        <div className="do-action-task-list" data-button-key={buttonKey}>
            <div className="action-header">
                <AdminButtonUI
                    buttons={[{
                        text: value,
                        color: 'purple-bg',
                        onClick: handleButtonClick,
                        disabled: isLoading || proSetting,
                        icon: isLoading ? 'spinner' : 'play',
                        children: null,
                        customStyle: {},
                        style: {},
                    }]}
                    wrapperClass="action-button-wrapper"
                    position="left"
                />
                
                {proSetting && (
                    <span className="admin-pro-tag">
                        <i className="adminlib-pro-tag"></i>Pro
                    </span>
                )}
                
                {isLoading && (
                    <div className="loader">
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                    </div>
                )}
            </div>

            {/* Task List Display */}
            {Object.keys(taskStatuses).length > 0 && (
                <div className="tasks-container">
                    <ItemListUI
                        items={getItemListItems()}
                        className="task-list"
                        background={true}
                        border={true}
                    />
                </div>
            )}

            {/* Completion Status */}
            {processStatus && (
                <div className={`process-status ${processStatus}`}>
                    {processStatus === 'success' ? (
                        <>
                            <i className="adminfont-yes color-green"></i>
                            <span>{successMessage}</span>
                        </>
                    ) : (
                        <>
                            <i className="adminfont-cross color-red"></i>
                            <span>{failureMessage}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoActionBtn;