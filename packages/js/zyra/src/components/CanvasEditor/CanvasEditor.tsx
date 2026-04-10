// External Dependencies
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import { BlockRenderer, createBlock } from './BlockRenderer';
import { Block, BlockPatch, BlockConfig, ColumnsBlock } from './blockTypes';
import {
    ColumnRenderer,
    useColumnManager,
    safeColumns,
} from './ColumnRenderer';
import SettingMetaBox from '../SettingMetaBox';
import { TabsUI } from '../Tabs';

interface CanvasEditorProps {
    blocks: Block[];
    onChange: (blocks: Block[]) => void;
    blockGroups: Array<{
        id: string;
        label: string;
        icon?: string;
        blocks: Array<{
            id: string;
            icon: string;
            value: string;
            label: string;
            fixedName?: string;
            placeholder?: string;
        }>;
    }>;
    visibleGroups?: string[];
    templates?: Array<{
        id: string;
        name: string;
        previewText?: string;
        blocks?: Block[];
    }>;
    activeTemplateId?: string;
    onTemplateSelect?: (id: string) => void;
    showTemplatesTab?: boolean;
    groupName: string;
    proSettingChange?: () => boolean;
    context?: string;
    inputTypeList?: Array<{ value: string; label: string }>;
}
type SortableItem = Partial<Block> | BlockConfig;

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
    blocks: externalBlocks,
    onChange,
    blockGroups,
    visibleGroups = [],
    templates = [],
    activeTemplateId,
    onTemplateSelect,
    showTemplatesTab = false,
    groupName,
    proSettingChange = () => false,
    context = 'default',
    inputTypeList,
}) => {
    const [blocks, setBlocks] = useState<Block[]>(externalBlocks);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(
            (visibleGroups.length
                ? blockGroups.filter((g) => visibleGroups.includes(g.id))
                : blockGroups
            ).map((g) => [g.id, true])
        )
    );

    const settingHasChanged = useRef(false);
    const initialLoad = useRef(true);
    const isInternalUpdate = useRef(false);
    const blocksRef = useRef(blocks);
    blocksRef.current = blocks;

    const isFormBuilder = context === 'form';

    const titleBlock = isFormBuilder
        ? blocks.find(b => b.type === 'title')
        : null;

    const submitBlock = isFormBuilder
        ? blocks.find(b => b.type === 'button')
        : null;

    const dynamicBlocks = isFormBuilder
        ? blocks.filter(b => b.type !== 'button' && b.type !== 'title')
        : blocks;
    useEffect(() => {
        if (context !== 'form') return;
        setBlocks(prev => {
            const hasSubmit = prev.some(b => b.type === 'button');

            if (hasSubmit) return prev;

            return [
                ...prev,
                createBlock({
                    value: 'button',
                    label: 'Submit',
                    placeholder: 'Submit',
                }),
            ];
        });
    }, []);

    useEffect(() => {
        if (context !== 'form') return;
        setBlocks(prev => {
            const hasTitle = prev.some(b => b.type === 'title');

            if (hasTitle) return prev;

            return [
                createBlock({
                    value: 'title',
                    label: 'Registration Form',
                }),
                ...prev,
            ];
        });
    }, []);

    useEffect(() => {
        if (!isInternalUpdate.current) {
            if (externalBlocks !== blocksRef.current) {
                setBlocks(
                    externalBlocks.map((b) => {
                        // ✅ If already a valid block → use as is
                        if (b?.id && b?.type) {
                            return b;
                        }

                        // fallback only if needed
                        return createBlock(b, context);
                    })
                );
            }
        }
    }, [externalBlocks]);

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }
        if (settingHasChanged.current) {
            onChange(blocks);
            settingHasChanged.current = false;
            isInternalUpdate.current = false;
        }
    }, [blocks]);

    const markChanged = useCallback(() => {
        settingHasChanged.current = true;
    }, []);

    const columnManager = useColumnManager({
        blocks,
        onBlocksUpdate: (updated) => {
            isInternalUpdate.current = true;
            setBlocks(updated);
            markChanged();
        },
        openBlock,
        setOpenBlock,
    });

    const pendingDrag = useRef<{
        canvas?: Block[];
        /** key: `${parentIdx}-${colIdx}` */
        columns: Map<string, Block[]>;
    } | null>(null);
    const dragFlushPending = useRef(false);

    const flushDrag = useCallback(() => {
        if (!pendingDrag.current) {
            return;
        }
        const { canvas, columns } = pendingDrag.current;
        pendingDrag.current = null;
        dragFlushPending.current = false;

        let next: Block[] = (() => {
            const current = blocksRef.current;

            if (!canvas) return current;

            if (context !== 'form') {
                return [...canvas];
            }

            const title = current.find(b => b.type === 'title');
            const submit = current.find(b => b.type === 'button');

            let result = [...canvas];

            if (title) result = [title, ...result];
            if (submit) result = [...result, submit];

            return result;
        })();

        columns.forEach((newCol, key) => {
            const [pi, ci] = key.split('-').map(Number);
            next = next.map((b, i) => {
                if (i !== pi || b.type !== 'columns') {
                    return b;
                }
                const cols = safeColumns(b as ColumnsBlock);
                cols[ci] = newCol;
                return { ...(b as ColumnsBlock), columns: cols };
            });
        });

        // const topLevelIds = new Set(next.map((b) => b.id));
        // next = next.map((b) => {
        //     if (b.type !== 'columns') {
        //         return b;
        //     }
        //     const cb = b as ColumnsBlock;
        //     return {
        //         ...cb,
        //         columns: safeColumns(cb).map((col) =>
        //             col.filter((c) => !topLevelIds.has(c.id))
        //         ),
        //     };
        // });

        isInternalUpdate.current = true;
        setBlocks(next);
        markChanged();
    }, [markChanged]);

    const scheduleDragFlush = () => {
        if (!dragFlushPending.current) {
            dragFlushPending.current = true;
            Promise.resolve().then(flushDrag);
        }
    };

    const handleCanvasSetList = useCallback(
        (rawList: SortableItem[]) => {
            if (proSettingChange()) {
                return;
            }
            if (!pendingDrag.current) {
                pendingDrag.current = { columns: new Map() };
            }
            pendingDrag.current.canvas = rawList.map((item) =>
                createBlock(item, context)
            );
            scheduleDragFlush();
        },
        [proSettingChange, context]
    );

    /** Column-level ReactSortable setList — called from ColumnRenderer */
    const handleColumnSetList = useCallback(
        (parentIdx: number, colIdx: number, rawList: SortableItem[]) => {
            if (!pendingDrag.current) {
                pendingDrag.current = { columns: new Map() };
            }
            pendingDrag.current.columns.set(
                `${parentIdx}-${colIdx}`,
                rawList.map((item) => createBlock(item))
            );
            scheduleDragFlush();
        },
        []
    );

    const updateBlock = useCallback(
        (index: number, patch: BlockPatch) => {
            if (proSettingChange()) {
                return;
            }
            setBlocks((prev) => {
                const current = prev[index];

                const isEqualValue = (
                    previousValue: unknown,
                    nextValue: unknown
                ): boolean => {
                    if (
                        Array.isArray(previousValue) &&
                        Array.isArray(nextValue)
                    ) {
                        if (previousValue.length !== nextValue.length) {
                            return false;
                        }

                        return previousValue.every(
                            (item, idx) => item === nextValue[idx]
                        );
                    }

                    return previousValue === nextValue;
                };

                const hasChanged = Object.keys(patch).some(
                    (key) =>
                        !isEqualValue(
                            current[key as keyof Block],
                            patch[key as keyof Block]
                        )
                );

                if (!hasChanged) {
                    return prev;
                }

                isInternalUpdate.current = true;

                const next = [...prev];
                next[index] = { ...current, ...patch } as Block;

                if (openBlock?.id === next[index].id) {
                    setOpenBlock(next[index]);
                }
                return next;
            });
            markChanged();
        },
        [proSettingChange, openBlock?.id, markChanged]
    );

    const deleteBlock = useCallback(
        (index: number, e?: React.MouseEvent) => {
            e?.stopPropagation();
            if (proSettingChange()) {
                return;
            }
            const deleted = blocks[index];
            setBlocks((prev) => {
                isInternalUpdate.current = true;
                return prev.filter((_, i) => i !== index);
            });
            markChanged();
            if (openBlock?.id === deleted?.id) {
                setOpenBlock(null);
                columnManager.clearSelection();
            }
        },
        [proSettingChange, blocks, openBlock?.id, columnManager, markChanged]
    );

    const handleChildMutate = useCallback(
        (index: number, updated: ColumnsBlock) => {
            setBlocks((prev) => {
                isInternalUpdate.current = true;
                return prev.map((b, i) => {
                    if (i !== index) {
                        return b;
                    }

                    // prevent unnecessary update
                    if (b === updated) {
                        return b;
                    }

                    isInternalUpdate.current = true;
                    return updated;
                });
            });
            markChanged();
        },
        [markChanged]
    );

    const handleSettingsChange = useCallback(
        (key: keyof Block, value: Block[keyof Block]) => {
            if (proSettingChange()) {
                return;
            }
            if (columnManager.selectedLocation) {
                const { parentIndex, columnIndex, childIndex } =
                    columnManager.selectedLocation;
                columnManager.handleChildUpdate(
                    parentIndex,
                    columnIndex,
                    childIndex,
                    { [key]: value }
                );
            } else {
                const index = blocks.findIndex((b) => b.id === openBlock?.id);
                if (index < 0) {
                    return;
                }
                if (key === 'layout' && blocks[index].type === 'columns') {
                    columnManager.handleLayoutChange(index, value);
                } else {
                    updateBlock(index, { [key]: value });
                }
            }
            markChanged();
        },
        [
            proSettingChange,
            columnManager,
            blocks,
            openBlock?.id,
            updateBlock,
            markChanged,
        ]
    );

    const toggleGroup = useCallback(
        (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] })),
        []
    );

    const getInputTypeList = useCallback(() => {
        if (inputTypeList) {
            return inputTypeList;
        }
        return (blockGroups[0]?.blocks ?? []).map((b) => ({
            value: b.value,
            label: b.label,
        }));
    }, [inputTypeList, blockGroups]);

    const groupsToShow = visibleGroups.length
        ? blockGroups.filter((g) => visibleGroups.includes(g.id))
        : blockGroups;

    const renderBlocksContent = () => (
        <>
            {groupsToShow.map(({ id, label, icon, blocks: palette }) => (
                <aside key={id} className="elements-section">
                    <div
                        className="section-meta"
                        onClick={() => toggleGroup(id)}
                    >
                        <div className="elements-title">
                            {icon && <i className={icon} />}
                            {label} <span>({palette.length})</span>
                        </div>
                        <i
                            className={`adminfont-pagination-right-arrow ${openGroups[id] ? 'rotate' : ''
                                }`}
                        />
                    </div>
                    {openGroups[id] && (
                        <ReactSortable
                            list={palette}
                            setList={() => { }}
                            sort={false}
                            group={{
                                name: groupName,
                                pull: 'clone',
                                put: false,
                            }}
                            className="section-container open"
                        >
                            {palette.map((item) => (
                                <div
                                    key={item.id || item.value}
                                    className="elements-items"
                                    onClick={() => {
                                        if (proSettingChange()) {
                                            return;
                                        }
                                        setBlocks((prev) => {
                                            isInternalUpdate.current = true;
                                            return [
                                                ...prev,
                                                createBlock(item, context),
                                            ];
                                        });
                                        markChanged();
                                    }}
                                >
                                    <i className={`adminfont-${item.icon}`} />
                                    <div className="elements-name">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </ReactSortable>
                    )}
                </aside>
            ))}
        </>
    );

    const renderTemplatesContent = () => (
        <aside className="elements-section">
            {/* <div className="section-meta">
                <h2>
                    Templates <span>({templates.length})</span>
                </h2>
            </div> */}
            <main className="template-list">
                {templates.map(({ id, name }) => (
                    <div
                        key={id}
                        className={`template-item ${id === activeTemplateId ? 'active' : ''
                            }`}
                        onClick={() => onTemplateSelect?.(id)}
                    >
                        <div className="template-name">{name}</div>

                        <div className="template-image-wrapper">
                            <div className="template-image">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </aside>
    );

    return (
        <div className="registration-from-wrapper">
            <div className="elements-wrapper">
                <TabsUI
                    tabs={[
                        {
                            label: 'Blocks',
                            content: renderBlocksContent(),
                        },
                        ...(showTemplatesTab && templates.length
                            ? [
                                {
                                    label: 'Templates',
                                    content: renderTemplatesContent(),
                                },
                            ]
                            : []),
                    ]}
                />
            </div>

            <div className="canvas-editor">
                {isFormBuilder && titleBlock && (
                    <BlockRenderer
                        block={titleBlock}
                        isActive={openBlock?.id === titleBlock.id}
                        onSelect={() => setOpenBlock(titleBlock)}
                        onChange={(patch) => {
                            const index = blocks.findIndex(b => b.id === titleBlock.id);
                            updateBlock(index, patch);
                        }}
                        showMeta={false} // 🚀 no drag, no delete
                    />
                )}

                <ReactSortable
                    list={dynamicBlocks}
                    setList={handleCanvasSetList}
                    group={{ name: groupName, pull: true, put: true }}
                    handle=".drag-handle"
                    animation={150}
                >
                    {dynamicBlocks.map((block, index) =>
                        block.type === 'columns' ? (
                            <ColumnRenderer
                                key={block.id}
                                block={block as ColumnsBlock}
                                parentIndex={index}
                                isActive={openBlock?.id === block.id}
                                groupName={groupName}
                                openBlock={openBlock}
                                setOpenBlock={setOpenBlock}
                                onColumnSetList={handleColumnSetList}
                                onChildMutate={(updated) =>
                                    handleChildMutate(index, updated)
                                }
                                selectedLocation={columnManager.selectedLocation}
                                onChildSelect={(location, child) => {
                                    setOpenBlock(child);
                                    columnManager.setSelectedLocation(location);
                                }}
                                onSelect={() => {
                                    setOpenBlock(block);
                                    columnManager.clearSelection();
                                }}
                                onDelete={() => deleteBlock(index)}
                            />
                        ) : (
                            <BlockRenderer
                                key={block.id}
                                block={block}
                                isActive={openBlock?.id === block.id}
                                onSelect={() => {
                                    setOpenBlock(block);
                                    columnManager.clearSelection();
                                }}
                                onChange={(patch) => updateBlock(index, patch)}
                                onDelete={(e) => deleteBlock(index, e)}
                            />
                        )
                    )}
                </ReactSortable>
                {isFormBuilder && submitBlock && (
                    <BlockRenderer
                        block={submitBlock}
                        isActive={openBlock?.id === submitBlock.id}
                        onSelect={() => setOpenBlock(submitBlock)}
                        onChange={(patch) => {
                            const index = blocks.findIndex(b => b.id === submitBlock.id);
                            updateBlock(index, patch);
                        }}
                        showMeta={false} // no drag, no delete
                    />
                )}
            </div>

            <div className="settings-panel-wrapper">
                {openBlock && (
                    <SettingMetaBox
                        formField={openBlock}
                        opened={{ click: true }}
                        onChange={handleSettingsChange}
                        inputTypeList={getInputTypeList()}
                    />
                )}
            </div>
        </div>
    );
};

export default CanvasEditor;
