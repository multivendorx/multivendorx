# Zyra

This package includes a library of components that can be used to create pages in the MultiVendorX.

## Installation

Install the module

- Go to project directory . Run
```bash
pnpm install
```
```bash
pnpm add zyra@workspace:* 
```
- Note : Normally, this adds `zyra` to your project automatically. If any issue occurs, you can manually add it by inserting `"zyra": "workspace:*"` into the `dependencies` section of your `package.json` and then run `pnpm i`.
## Usage

- For zyra styles first include it into root folder like `index.tsx`or `index.jsx` ( this is for one time import)

```jsx
import 'zyra/build/index.css';
```
- Next create you component using `zyra`
```jsx
// for component 

import { ProPopup } from "zyra";

const proPopupPropsData = {
    proUrl: "#",
    title: "This is an example title",
    messages: [
       "Example Message 1",
       "Example Message 2",
       "Example Message 2",
    ],
};

const ShowProPopup = () => {
    return <ProPopup {...proPopupPropsData} />;
};

```

## Stories

Launch Storybook for better component view.

First go to the root of the repo , then

If `node_modules` is missing first run
```bash
pnpm i
```
when `node_modules` is fully installed then for storybook run
```bash
pnpm run watch:storybook
```

For more details explore [**DEVELOPER-DOC.md**](DEVELOPER-DOC.md)