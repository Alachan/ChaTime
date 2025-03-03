import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },

            colors: {
                primary: "#344e41", //
                secondary: "#4a4e69",
                save: "#168aad",
                "happy-blue": "#00a6fb",
                "light-cyan": "#edf6f9",
                "gray-pink": "#9d8189",
                "moderate-blue": "#415a77",
            },
        },
    },

    plugins: [forms],
};
