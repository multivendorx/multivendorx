// Load all .tsx files inside this folder
const requireHook = require.context(".", false, /\.tsx$/);

requireHook.keys().forEach((fileName: string) => {
    if (fileName === "./index.ts") return; 
    requireHook(fileName);
});
