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
                medsea: "#168aad",
                tea: "#d8e2dc",
                brush: "#003049",
                "happy-blue": "#00a6fb",
                "light-cyan": "#edf6f9",
                "gray-pink": "#9d8189",
                "moderate-blue": "#415a77",
                land: "#355070",
                pinkish: "#d7b9d5",
                blood: "#774c60",
                killer: "#372549",
                moody: "#bfbfe4",
                air: "#b8d0eb",
                boomer: "#484a47",
                windy: "#c1d1e4",
                spring: "#7ae582",
                garden: "#2dc653",
                memory: "#e3d5ca",
                fade: "#f0f8ff",
            },
        },
    },

    plugins: [forms],
};
