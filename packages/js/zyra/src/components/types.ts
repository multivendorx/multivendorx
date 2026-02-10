import { StepType } from '@reactour/tour';

export interface FieldComponent {
  render: React.FC<any>;
  validate?: (field: any, value: any) => string | null;
  normalize?: (value: any) => any;
}

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
    items?: PopoverItem[]; 
}

export interface HeaderPopoverWithTab {
    toggleIcon: string;
    tabs?: PopoverTab[];   
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
    utilityList?: HeaderPopover[];
    utilityListWithTab?: HeaderPopoverWithTab[],
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

// Types
export interface AppLocalizer {
    enquiry_form_settings_url?: string;
    page_url?: string;
    settings_page_url?: string;
    site_url?: string;
    module_page_url?: string;
    customization_settings_url?: string;
    apiUrl: string;
    nonce: string;
    restUrl: string;
}

export interface TourProps {
    appLocalizer: AppLocalizer;
    steps: StepType[];
    forceOpen: boolean;
}

interface TabFooter {
    url: string;
    icon?: string;
    text: string;
}

interface Tab {
    label: string;
    content: React.ReactNode;
    footer?:TabFooter;
}

export interface TabsProps {
    tabs: Tab[];
    defaultActiveIndex?: number;
}

export interface PopoverProps {
    toggleIcon?: string;
    toggleContent?: React.ReactNode;
}
