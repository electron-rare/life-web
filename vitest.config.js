import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: [],
        coverage: {
            provider: "v8",
            reporter: ["text", "text-summary"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/**/*.test.*", "src/**/__tests__/**"],
        },
    },
});
