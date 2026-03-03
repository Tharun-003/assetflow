/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1E3A5F', // Deep Blue
                },
                accent: {
                    DEFAULT: '#F59E0B', // Gold / Amber
                },
                card: '#F9FAFB',
                tableHeader: '#F3F4F6',
                primaryText: '#111827',
                secondaryText: '#6B7280',
                borderContent: '#E5E7EB',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
            borderRadius: {
                'xl': '0.75rem',
            }
        },
    },
    plugins: [],
}
