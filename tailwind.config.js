const config = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    500: "#0f766e",
                    700: "#115e59"
                },
                accent: {
                    500: "#f97316"
                }
            }
        }
    },
    plugins: []
};
export default config;
