// External Dependencies
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';

// Internal Dependencies
import { BlockRenderer, createBlock } from './BlockRenderer';
import { Block, BlockPatch } from './blockTypes';
import { ColumnRenderer, useColumnManager } from './ColumnRenderer';
import SettingMetaBox from '../SettingMetaBox';
import Tabs from '../Tabs';

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
    templates?: Array<{ id: string; name: string; previewText?: string; blocks?: Block[]; }>;
    activeTemplateId?: string;
    onTemplateSelect?: (id: string) => void;
    showTemplatesTab?: boolean;
    groupName: string;
    proSettingChange?: () => boolean;
    context?: string;
    inputTypeList?: Array<{ value: string; label: string }>;
}

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
    const settingHasChanged = useRef(false);
    const initialLoad = useRef(true);

    const [blocks, setBlocks] = useState<Block[]>(externalBlocks);
    const [openBlock, setOpenBlock] = useState<Block | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(
            (visibleGroups.length ? blockGroups.filter(g => visibleGroups.includes(g.id)) : blockGroups)
                .map(g => [g.id, true])
        )
    );

    useEffect(() => {
        if (JSON.stringify(externalBlocks) !== JSON.stringify(blocks)) {
            setBlocks(externalBlocks);
        }
    }, [externalBlocks]);

    const columnManager = useColumnManager({
        blocks,
        onBlocksUpdate: (updatedBlocks) => {
            setBlocks(updatedBlocks);
            markChanged();
        },
        openBlock,
        setOpenBlock,
    });

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }
        if (settingHasChanged.current) {
            onChange(blocks);
            settingHasChanged.current = false;
        }
    }, [blocks, onChange]);

    const markChanged = useCallback(() => settingHasChanged.current = true, []);

    const updateBlock = useCallback((index: number, patch: BlockPatch) => {
        if (proSettingChange()) return;
        setBlocks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...patch } as Block;
            if (openBlock?.id === updated[index].id){
            setOpenBlock(updated[index]);
        }
            return updated;
        });
        markChanged();
    }, [proSettingChange, openBlock?.id, markChanged, setOpenBlock]);

    const deleteBlock = useCallback((indexToDelete: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (proSettingChange()) return;
        const deletedBlock = blocks[indexToDelete];
        setBlocks(prev => prev.filter((_, index) => index !== indexToDelete));
        markChanged();
        if (openBlock?.id === deletedBlock?.id) {
            setOpenBlock(null);
            columnManager.clearSelection();
        }
    }, [proSettingChange, blocks, openBlock?.id, columnManager, markChanged]);

    const handleSetList = useCallback((newList: any[]) => {
        if (proSettingChange()) return;
        setBlocks(newList.map(item => createBlock(item, context)));
        markChanged();
    }, [proSettingChange, context, markChanged]);

    const handleSettingsChange = useCallback((key: string, value: any) => {
        if (proSettingChange()) return;
        if (columnManager.selectedLocation) {
            const { parentIndex, columnIndex, childIndex } = columnManager.selectedLocation;
            columnManager.handleChildUpdate(parentIndex, columnIndex, childIndex, { [key]: value });
            markChanged();
        } else {
            const index = blocks.findIndex(b => b.id === openBlock?.id);
            if (index >= 0) {
                if (key === 'layout' && blocks[index].type === 'columns') {
                    columnManager.handleLayoutChange(index, value);
                } else {
                    updateBlock(index, { [key]: value });
                    const updatedBlock = { ...blocks[index], [key]: value };
                    setOpenBlock(updatedBlock);
                }
                markChanged();
            }
        }
    }, [proSettingChange, columnManager, blocks, openBlock?.id, updateBlock, markChanged, setOpenBlock]);

    const toggleGroup = useCallback((id: string) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] })), []);

    const groupsToShow = visibleGroups.length ? blockGroups.filter(g => visibleGroups.includes(g.id)) : blockGroups;

    const getInputTypeList = useCallback(() => {
        if (inputTypeList) return inputTypeList;
        if (blockGroups[0]?.blocks) return blockGroups[0].blocks.map(b => ({ value: b.value, label: b.label }));
        return [];
    }, [inputTypeList, blockGroups]);

    const renderBlocksContent = () => (
        <>
            {groupsToShow.map(({ id, label, icon, blocks }) => (
                <aside key={id} className="elements-section">
                    <div className="section-meta" onClick={() => toggleGroup(id)}>
                        <div className="elements-title">{icon && <i className={icon} />}{label} <span>({blocks.length})</span></div>
                        <i className={`adminfont-pagination-right-arrow ${openGroups[id] ? 'rotate' : ''}`} />
                    </div>
                    {openGroups[id] && (
                        <ReactSortable list={blocks} setList={() => { }} sort={false}
                            group={{ name: groupName, pull: 'clone', put: false }}
                            className="section-container open">
                            {blocks.map(({ id: blockId, icon, label, value }) => (
                                <div key={blockId || value} className="elements-items">
                                    <i className={icon} /><p className="list-title">{label}</p>
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
            <div className="section-meta"><h2>Templates <span>({templates.length})</span></h2></div>
            <main className="section-container open">
                {templates.map(({ id, name, previewText }) => (
                    <div key={id} className={`template-item ${id === activeTemplateId ? 'active' : ''}`}
                        onClick={() => onTemplateSelect?.(id)}>
                        <div className="template-name">{name}</div>
                        {previewText && <div className="template-preview">{previewText}</div>}
                    </div>
                ))}
            </main>
        </aside>
    );

    return (
        <div className="registration-from-wrapper">
            <div className="elements-wrapper">
                <Tabs tabs={[
                    { label: 'Blocks', content: renderBlocksContent() },
                    ...(showTemplatesTab && templates.length ? [{ label: 'Templates', content: renderTemplatesContent() }] : [])
                ]} />
            </div>

            <div className="canvas-editor">
                <ReactSortable list={blocks} setList={handleSetList}
                    group={{ name: groupName, pull: true, put: true }} handle=".drag-handle" animation={150}>
                    {blocks.map((block, index) => (
                        <div className="field-wrapper" key={block.id}>
                            {block.type === 'columns' ? (
                                <ColumnRenderer block={block} parentIndex={index} blocks={blocks}
                                    isActive={openBlock?.id === block.id} groupName={groupName}
                                    openBlock={openBlock} setOpenBlock={setOpenBlock}
                                    onBlocksUpdate={(updatedBlocks) => { setBlocks(updatedBlocks); markChanged(); }}
                                    onSelect={() => { setOpenBlock(block); columnManager.clearSelection(); }}
                                    onDelete={() => deleteBlock(index)} />
                            ) : (
                                <BlockRenderer block={block}
                                    onSelect={() => { setOpenBlock(block); columnManager.clearSelection(); }}
                                    onChange={(patch) => updateBlock(index, patch)}
                                    onDelete={(e) => deleteBlock(index, e)}
                                    isActive={openBlock?.id === block.id} />
                            )}
                        </div>
                    ))}
                </ReactSortable>
            </div>

            <div className="settings-panel-wrapper">
                {openBlock && (
                    <SettingMetaBox formField={openBlock} opened={{ click: true }}
                        onChange={handleSettingsChange} inputTypeList={getInputTypeList()} />
                )}
            </div>
        </div>
    );
};

export default CanvasEditor;