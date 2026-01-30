type FilterValue = string | string[] | { startDate: Date; endDate: Date };

export type QueryProps = {
    orderby?: string;
    order?: string;
    page?: string;
    per_page?: number;
    paged?: number | string;
    filter?: Record<string, FilterValue>;
    categoryFilter?: string;
    searchValue?: string;
};

export type TableHeader = {
    defaultSort?: boolean;
    defaultOrder?: string;
    isLeftAligned?: boolean;
    isNumeric?: boolean;
    isSortable?: boolean;
    key: string;
    label?: React.ReactNode;
    required?: boolean;
    screenReaderLabel?: string;
    cellClassName?: string;
    visible?: boolean;
    isEditable?: boolean;
    editType?: string;
    options?: { label: string; value: string | number }[];
};

export type TableRow = {
    display?: React.ReactNode;
    value?: string | number | boolean;
};

export type categoryCounts = {
	value: string;
	label: string;
	count: number;
};