import { useState, useEffect, ReactNode } from 'react';
import { LinkProps } from 'react-router-dom';
import '../styles/web/Tabs.scss';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import AdminFooter, { SupportLink } from './AdminFooter';

type TabContent = {
  id: string;
  name: string;
  desc?: string;
  icon?: string;
  link?: string;
  proDependent?: boolean;
};

type TabData = {
  name?: string;
  type: 'file' | 'folder';
  content: TabContent | TabData[];
};

type BreadcrumbItem = { name: string; id: string; type: string };

type TabsProps = {
  tabData: TabData[];
  currentTab: string;
  getForm: (tabId: string) => ReactNode;
  prepareUrl: (tabId: string) => string;
  HeaderSection?: () => JSX.Element;
  BannerSection?: () => JSX.Element;
  supprot: SupportLink[];
  Link: React.ElementType<LinkProps>;
  settingName?: string;
  // Add navigation function prop
  onNavigate?: (url: string) => void;
};

// Helper functions outside component to avoid recreation on every render
const isFile = (item: TabData): item is TabData & { content: TabContent } => {
  return item.type === 'file';
};

const isFolder = (item: TabData): item is TabData & { content: TabData[] } => {
  return item.type === 'folder';
};

const findFirstFile = (items: TabData[]): TabContent | null => {
  for (const item of items) {
    if (isFile(item)) {
      return item.content;
    }
    if (isFolder(item)) {
      const found = findFirstFile(item.content);
      if (found) return found;
    }
  }
  return null;
};

const findTabInItems = (items: TabData[], targetId: string): TabContent | null => {
  for (const item of items) {
    if (isFile(item) && item.content.id === targetId) {
      return item.content;
    }
    if (isFolder(item)) {
      const found = findTabInItems(item.content, targetId);
      if (found) return found;
    }
  }
  return null;
};

const findTabIcon = (items: TabData[], activeTabId: string): string | undefined => {
  for (const item of items) {
    if (isFile(item) && item.content.id === activeTabId) {
      return item.content.icon;
    }
    if (isFolder(item)) {
      const icon = findTabIcon(item.content, activeTabId);
      if (icon) return icon;
    }
  }
  return undefined;
};

const checkIfFolderContainsTab = (items: TabData[], activeTabId: string): boolean => {
  return items.some(item => {
    if (isFile(item)) {
      return item.content.id === activeTabId;
    }
    if (isFolder(item)) {
      return checkIfFolderContainsTab(item.content, activeTabId);
    }
    return false;
  });
};

const findTabDescription = (items: TabData[], activeTabId: string): ReactNode => {
  for (const item of items) {
    if (isFile(item) && item.content.id === activeTabId) {
      const tab = item.content;
      if (tab.id === 'support') return null;
      
      return (
        <div className="divider-section" key={tab.id}>
          <div className="title">{tab.name}</div>
          {tab.desc && <div className="desc">{tab.desc}</div>}
        </div>
      );
    }
    if (isFolder(item)) {
      const desc = findTabDescription(item.content, activeTabId);
      if (desc) return desc;
    }
  }
  return null;
};

// Helper function to search for breadcrumb path
const searchForBreadcrumbPath = (
  items: TabData[], 
  targetId: string, 
  currentPath: BreadcrumbItem[]
): BreadcrumbItem[] | null => {
  for (const item of items) {
    if (isFile(item) && item.content.id === targetId) {
      return [...currentPath, { 
        name: item.content.name, 
        id: targetId, 
        type: 'file' 
      }];
    }
    
    if (isFolder(item)) {
      const folderPath = { 
        name: item.name || '', 
        id: item.name || '', 
        type: 'folder' 
      };
      const result = searchForBreadcrumbPath(
        item.content, 
        targetId, 
        [...currentPath, folderPath]
      );
      if (result) return result;
    }
  }
  return null;
};

const Tabs: React.FC<TabsProps> = ({
  tabData,
  currentTab,
  getForm,
  prepareUrl,
  HeaderSection,
  BannerSection,
  supprot,
  Link,
  settingName = '',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState(currentTab);
  const [menuStack, setMenuStack] = useState<TabData[][]>([tabData]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: settingName, id: 'root', type: 'root' },
  ]);
  const [noticeHTML, setNoticeHTML] = useState('');

  // Build breadcrumb path for a tab
  const createBreadcrumbPath = (targetId: string): BreadcrumbItem[] => {
    const path = searchForBreadcrumbPath(tabData, targetId, []);
    return path || [];
  };

  // Build menu stack from breadcrumb path
  const createMenuStack = (breadcrumbPath: BreadcrumbItem[]): TabData[][] => {
    const stack = [tabData];
    let currentItems = tabData;
    
    for (let i = 0; i < breadcrumbPath.length - 1; i++) {
      const crumb = breadcrumbPath[i];
      if (crumb.type === 'folder') {
        const folder = currentItems.find(item => 
          isFolder(item) && item.name === crumb.id
        );
        if (folder && isFolder(folder)) {
          currentItems = folder.content;
          stack.push(currentItems);
        }
      }
    }
    return stack;
  };

  // Update all navigation state
  const updateNavigationState = (tabId: string): void => {
    const path = createBreadcrumbPath(tabId);
    
    if (path.length > 0) {
      const fullPath = [
        { name: settingName, id: 'root', type: 'root' }, 
        ...path
      ];
      setBreadcrumbs(fullPath);
      setMenuStack(createMenuStack(path));
    } else {
      setBreadcrumbs([{ name: settingName, id: 'root', type: 'root' }]);
      setMenuStack([tabData]);
    }
  };

  // Switch to any tab and navigate
  const switchToTab = (tabId: string): void => {
    setActiveTab(tabId);
    updateNavigationState(tabId);
    
    // Navigate to the new URL
    const newUrl = prepareUrl(tabId);
    if (onNavigate) {
      onNavigate(newUrl);
    } else {
      // Fallback: use window.history if onNavigate not provided
      window.history.pushState(null, '', newUrl);
    }
  };

  // Open folder and go to first file
  const openFolderAndNavigate = (folderItems: TabData[]): void => {
    if (folderItems.length === 0) return;
    
    setMenuStack(prev => [...prev, folderItems]);
    const firstFile = findFirstFile(folderItems);
    if (firstFile) {
      switchToTab(firstFile.id);
    }
  };

  // Go back to root menu
  const goToRootMenu = (): void => {
    setMenuStack([tabData]);
    setBreadcrumbs([{ name: settingName, id: 'root', type: 'root' }]);
    
    const firstFile = findFirstFile(tabData);
    if (firstFile) {
      switchToTab(firstFile.id);
    } else {
      setActiveTab('');
    }
  };

  // Navigate to folder at breadcrumb level
  const navigateToFolderLevel = (targetIndex: number): void => {
    let currentItems = tabData;
    
    for (let i = 1; i <= targetIndex; i++) {
      const folder = currentItems.find(item => 
        isFolder(item) && item.name === breadcrumbs[i].id
      );
      if (folder && isFolder(folder)) {
        currentItems = folder.content;
      }
    }

    setMenuStack(prev => [...prev.slice(0, targetIndex), currentItems]);
    const firstFile = findFirstFile(currentItems);
    if (firstFile) {
      switchToTab(firstFile.id);
    }
  };

  // Handle breadcrumb clicks
  const handleBreadcrumbNavigation = (index: number, e: React.MouseEvent): void => {
    e.preventDefault(); // Only prevent default here since we're handling navigation manually
    const crumb = breadcrumbs[index];
    if (!crumb) return;

    if (crumb.type === 'root') {
      goToRootMenu();
    } else if (crumb.type === 'file') {
      switchToTab(crumb.id);
    } else if (crumb.type === 'folder') {
      navigateToFolderLevel(index);
    }
  };

  // Get current tab's icon
  const getCurrentTabIcon = (): string | undefined => {
    return findTabIcon(tabData, activeTab);
  };

  // Check if folder is currently active
  const isFolderCurrentlyActive = (folderItems: TabData[]): boolean => {
    return menuStack[menuStack.length - 1] === folderItems || 
           checkIfFolderContainsTab(folderItems, activeTab);
  };

  // Render breadcrumb links
  const renderBreadcrumbLinks = () =>
    breadcrumbs.map((crumb, index) => (
      <span key={index}>
        {index > 0 && ' / '}
        <Link
          to={crumb.type === 'file' ? prepareUrl(crumb.id) : '#'}
          onClick={(e) => handleBreadcrumbNavigation(index, e)}
        >
          {crumb.name}
        </Link>
      </span>
    ));

  // Render single menu item
  const renderSingleMenuItem = (item: TabData, index: number) => {
    if (isFile(item)) {
      const tab = item.content;
      if (!tab.id || !tab.name) return null;
      
      return (
        <Link
          key={tab.id}
          to={prepareUrl(tab.id)}
          className={`menu-item ${activeTab === tab.id ? 'active-current-tab' : ''}`}
          onClick={(e) => {
            // For file items, let the Link handle navigation naturally
            // Only prevent default if we need to do additional processing
            if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              switchToTab(tab.id);
            }
          }}
        >
          <p className="menu-name">{tab.name}</p>
        </Link>
      );
    }

    if (isFolder(item)) {
      const folderItems = item.content;
      if (folderItems.length === 0) return null;
      
      const firstFile = findFirstFile(folderItems);
      const folderUrl = firstFile ? prepareUrl(firstFile.id) : '#';
      const isActive = isFolderCurrentlyActive(folderItems);

      return (
        <Link
          key={`folder-${item.name || ''}-${index}`}
          to={folderUrl}
          className={`menu-item ${isActive ? 'active-current-tab' : ''}`}
          onClick={(e) => {
            if (firstFile && e.button === 0 && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              openFolderAndNavigate(folderItems);
            }
          }}
        >
          <p className="menu-name">{item.name}</p>
        </Link>
      );
    }

    return null;
  };

  // Render all menu items
  const renderAllMenuItems = (items: TabData[]) => items.map(renderSingleMenuItem);

  // Get active tab description
  const getActiveTabInfo = () => findTabDescription(tabData, activeTab);

  // Setup initial state
  useEffect(() => {
    const notice = document.querySelector('#screen-meta + .wrap .notice, #wpbody-content .notice');
    if (notice) {
      setNoticeHTML(notice.outerHTML);
      notice.remove();
    }

    if (currentTab) {
      // Update state without navigation for initial load
      setActiveTab(currentTab);
      updateNavigationState(currentTab);
    } else {
      const firstFile = findFirstFile(tabData);
      if (firstFile) {
        switchToTab(firstFile.id);
      }
    }
  }, [currentTab, tabData]);

  const currentMenu = menuStack[menuStack.length - 1];
  const parentTab = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.name : '';
  const tabIcon = getCurrentTabIcon();

  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon={tabIcon}
        parentTabName={parentTab}
        renderBreadcrumb={renderBreadcrumbLinks}
        renderMenuItems={renderAllMenuItems}
        tabData={tabData}
        goPremium={true}
      />
      {noticeHTML && <div className="wp-admin-notice" dangerouslySetInnerHTML={{ __html: noticeHTML }} />}
      <div className="general-wrapper">
        {HeaderSection && <HeaderSection />}
        <div className="middle-child-container">
          {menuStack.length > 1 && (
            <div id="current-tab-lists" className="current-tab-lists">
              <div className="current-tab-lists-container">{renderAllMenuItems(currentMenu)}</div>
            </div>
          )}
          <div className="tab-content">
            {getActiveTabInfo()}
            {getForm(activeTab)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tabs;