export type SearchItem = {
    icon?: string;
    name?: string;
    desc?: string;
    link: string;
};
export interface ProfileItem {
    title: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
}
export interface PopoverItem {
    title: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
    desc?: string;
    time?: string;
    className?: string;
}
export interface PopoverTab {
    id: string;
    label: string;
    icon?: string;
    content: React.ReactNode;
        footer?: {
        url: string;
        icon?: string;
        text: string;
    };
}

// Generic Popover configuration
export interface HeaderPopover {
    toggleIcon: string;
    width?: string;
    template: 'default' | 'notification' | 'tab';
    items?: PopoverItem[]; 
    tabs?: PopoverTab[];   
    defaultActiveTab?: string;
}

export type AdminHeaderProps = {
    brandImg: string;
    results?: SearchItem[];
    free?: string;
    pro?: string;

    showProfile?: boolean;
    profileItems?: ProfileItem[];

    chatUrl?: string;

    search?: {
        placeholder?: string;
        options?: { label: string; value: string }[];
    };

    onQueryUpdate: (payload: {
        searchValue: string;
        searchAction?: string;
    }) => void;

    onResultClick: (res: SearchItem) => void;
    popovers?: HeaderPopover[];
};

export type SupportChatProps = {
    chatUrl: string;
};

type SearchOption = {
    label: string;
    value: string;
};

type SearchConfig = {
    placeholder?: string;
    options?: SearchOption[];
};

type SearchPayload =
    | { searchValue: string }
    | { searchValue: string; searchAction: string };

export type HeaderSearchProps = {
    search?: SearchConfig;
    results: SearchItem[];
    onQueryUpdate: (payload: SearchPayload) => void;
    onResultClick: (res: SearchItem) => void;
};
