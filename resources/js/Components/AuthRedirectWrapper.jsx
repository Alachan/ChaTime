import { useEffect, useState } from "react";
import axios from "axios";

export default function AuthRedirectWrapper({ children }) {
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            console.log("No token found, redirecting to /login");
            window.location.href = "/login";
            return;
        }

        // Attach the token to axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        axios
            .get("/api/user")
            .then((response) => {
                setUser(response.data);
                setIsAuthChecked(true);

                // Redirect users away from login/register if they're already authenticated
                const currentPath = window.location.pathname;
                if (["/login", "/register"].includes(currentPath)) {
                    //window.location.href = "/chatime";
                }
            })
            .catch((error) => {
                console.error("Auth check failed:", error);
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
            });
    }, []);

    if (!isAuthChecked) return <div>Loading...</div>;

    return children;
}
