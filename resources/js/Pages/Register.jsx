import { Head, Link, useForm, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import SakuraEffect from "@/Components/Effects/SakuraEffect";
import UserService from "@/Services/UserService";
import axios from "axios";

export default function Register() {
    const { data, setData, processing, errors } = useForm({
        username: "",
        email: "",
        password: "",
        name: "",
    });

    const submit = async (e) => {
        e.preventDefault();

        try {
            // First get CSRF cookie
            await axios.get("/sanctum/csrf-cookie");

            // Then attempt register
            const response = await UserService.register(data);

            // Store token in localStorage
            const token = response.data.token;
            localStorage.setItem("auth_token", token);

            // Navigate to TeaHub
            router.visit("/teahub");
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <Head title="Register" />

            <SakuraEffect />

            <header className="w-full px-6 py-4 flex justify-center md:justify-start z-[10]">
                <div className="md:ml-8 md:py-4">
                    <img
                        src="/logo.png"
                        alt="ChaTime Logo"
                        className="h-12 w-auto"
                    />
                </div>
            </header>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg z-[10]"
            >
                <Head title="Register" />

                <h2 className="text-center text-2xl font-bold">
                    Now is Chatime
                </h2>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-primary">*Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                            value={data.username}
                            onChange={(e) =>
                                setData("username", e.target.value)
                            }
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-primary">*Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-primary">*Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-primary">
                            Display Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
                        disabled={processing}
                    >
                        {processing ? "Registering..." : "Register"}
                    </motion.button>
                </form>

                <p className="text-center text-secondary">
                    Already have a cup?
                    <Link
                        href="/login"
                        className="text-indigo-500 hover:underline ml-1"
                    >
                        Chat up!
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
