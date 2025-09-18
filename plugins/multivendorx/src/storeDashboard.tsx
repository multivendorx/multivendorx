import { render } from "@wordpress/element";
// Load all files from dashboard folder
const modules = require.context("./dashboard", false, /\.tsx$/);
export default function replaceDashboardDivs(container: HTMLElement) {
  const colorConfig = (window as any).appLocalizer?.color?.colors;
  if (colorConfig) {
    const theme = {
      selectedPalette: "custom",
      colors: {
        themeColor: colorConfig.themeColor,
        heading: colorConfig.heading,
        bodyText: colorConfig.bodyText,
        buttonText: colorConfig.buttonText,
        buttonBg: colorConfig.buttonBg,
        buttonHoverText: colorConfig.buttonHoverText,
        buttonHoverBg: colorConfig.buttonHoverBg,
      },
    };

    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value as string);
    });

    console.log("Theme colors applied:", theme.colors);
  } else {
    console.warn("Global color config not found, skipping theme CSS variables.");
  }
  const children = container.querySelectorAll<HTMLDivElement>("div[id]");
  children.forEach((div) => {
    const id = div.id; // e.g. "dashboard", "all-orders"
    const filePath = `./${id}.tsx`;

    if (modules.keys().includes(filePath)) {
      try {
        const Component = modules(filePath).default;
        render(<Component />, div);
      } catch (err) {
        console.error(`Failed to render component for ${id}`, err);
      }
    }
  });
}
