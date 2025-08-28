import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminHeader, initializeModules } from "zyra";
import Settings from "./components/Settings/Settings";
import Modules from "./components/Modules/Modules";
import Store from "./components/Store/Store";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import Brand from "./assets/images/mvx-brand-logo.png";
import StatusAndTools from "./components/StatusAndTools/StatusAndTools";
import SetupWizard from "./blocks/setupWizard/SetupWizard";
import WorkBoard from "./components/WorkBoard/workboard";
import Memberships from "./components/Membership/Membership";
import Commission from "./components/Commission/Commission";

localStorage.setItem("force_multivendorx_context_reload", "true");

const Route = () => {
  const currentTab = new URLSearchParams(useLocation().hash);

  return (
    <>
      {currentTab.get("tab") === "settings" && (
        <div id="settings">
          <Settings id={"settings"} />
        </div>
      )}
      {currentTab.get("tab") === "memberships" && (
        <div id="memberships">
          <Memberships />
        </div>
      )}
      {currentTab.get("tab") === "status-tools" && (
        <div id="status-tools">
          <StatusAndTools id="status-tools" />
        </div>
      )}
      {currentTab.get("tab") === "modules" && (
        <div id="modules">
          <Modules />
        </div>
      )}
      {currentTab.get("tab") === "stores" && (
        <div id="stores">
          <Store />
        </div>
      )}
      {currentTab.get("tab") === "work-board" && (
        <div id="work-board">
          <WorkBoard />
        </div>
      )}
      {currentTab.get("tab") === "dashboard" && (
        <div id="dashboard">
          <AdminDashboard />
        </div>
      )}
      {currentTab.get("tab") === "commissions" && (
        <div id="commissions">
          <Commission/>
        </div>
      )}
      {currentTab.get("tab") === "setup" && (
        <div id="setup">
          <SetupWizard />
        </div>
      )}
    </>
  );
};

const App = () => {
  const currentTabParams = new URLSearchParams(useLocation().hash);

  // --- 🔎 SEARCH STATE ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ text: string; element: Element }[]>(
    []
  );
  const [selectValue, setSelectValue] = useState("documents");

  // --- SEARCH HANDLERS ---
  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    // --- Define all sections ---
    let sections: { tab: string; el: Element | null }[] = [
      { tab: "settings", el: document.getElementById("settings") },
      { tab: "modules", el: document.getElementById("modules") },
      { tab: "status-tools", el: document.getElementById("status-tools") },
      { tab: "stores", el: document.getElementById("stores") },
      { tab: "work-board", el: document.getElementById("work-board") },
      { tab: "dashboard", el: document.getElementById("dashboard") },
      { tab: "setup", el: document.getElementById("setup") },
      { tab: "memberships", el: document.getElementById("memberships") },
    ];

    // --- ADD THIS FILTER ---
    if (selectValue !== "all") {
      sections = sections.filter((s) => s.tab === selectValue);
    }

    const found: { text: string; element: Element; tab: string }[] = [];

    sections.forEach(({ tab, el }) => {
      if (!el) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (
          node.nodeValue &&
          node.nodeValue.toLowerCase().includes(value.toLowerCase())
        ) {
          found.push({
            text: node.nodeValue.trim(),
            element: node.parentElement!,
            tab,
          });
        }
      }
    });

    setResults(found);
  };

  const handleResultClick = (res: { element: Element; tab: string }) => {
    // switch tab by updating URL hash
    window.location.hash = `&tab=${res.tab}`;

    // wait for new tab to mount
    setTimeout(() => {
      res.element.scrollIntoView({ behavior: "smooth", block: "center" });
      res.element.classList.add("highlight-search");
      setTimeout(() => res.element.classList.remove("highlight-search"), 2000);
    }, 400); // slight delay so DOM is ready

    setResults([]);
    setQuery("");
  };

  const handleSelectChange = (val: string) => {
    setSelectValue(val);
  };

  // --- INIT MODULES ---
  useEffect(() => {
    initializeModules(appLocalizer, "multivendorx", "free", "modules");
  }, []);

  // --- TAB HIGHLIGHT LOGIC ---
  document
    .querySelectorAll("#toplevel_page_multivendorx>ul>li>a")
    .forEach((menuItem) => {
      const menuItemUrl = new URL((menuItem as HTMLAnchorElement).href);
      const menuItemHashParams = new URLSearchParams(
        menuItemUrl.hash.substring(1)
      );

      if (menuItem.parentNode) {
        (menuItem.parentNode as HTMLElement).classList.remove("current");
      }
      if (menuItemHashParams.get("tab") === currentTabParams.get("tab")) {
        (menuItem.parentNode as HTMLElement).classList.add("current");
      }
    });

  return (
    <>
      <AdminHeader
        brandImg={Brand}
        query={query}
        results={results}
        onSearchChange={handleSearchChange}
        onResultClick={handleResultClick}
        onSelectChange={handleSelectChange}
        selectValue={selectValue}
      />
      <Route />
    </>
  );
};

export default App;