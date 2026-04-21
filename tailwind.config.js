import sharedConfig from "@finefab/ui/tailwind.config";
const config = {
    ...sharedConfig,
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
        "../finefab-ui/src/**/*.{ts,tsx}",
    ],
};
export default config;
