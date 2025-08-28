import { render } from "@wordpress/element";
// Load all files from dashboard folder
const modules = require.context("./dashboard", false, /\.tsx$/);
export default function replaceDashboardDivs(container: HTMLElement) {
  const color = (window as any).color;
  if (color?.color?.colors) {
    const theme = {
      selectedPalette: "custom",
      colors: {
        themeColor: color.color.colors.themeColor,
        heading: color.color.colors.heading,
        bodyText: color.color.colors.bodyText,
        buttonText: color.color.colors.buttonText,
        buttonBg: color.color.colors.buttonBg,
        buttonHoverText: color.color.colors.buttonHoverText,
        buttonHoverBg: color.color.colors.buttonHoverBg,
      },
    };
    // :white_tick: Apply CSS variables dynamically
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value as string);
    });
    console.log("Theme colors applied:", theme.colors);
  } else {
    console.warn("Global color config not found, skipping theme CSS variables.");
  }
  // :white_tick: Mount dashboard components
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