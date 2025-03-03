import React, { useEffect, useState } from "react";

export default function SakuraEffect() {
    const [petals, setPetals] = useState([]);

    useEffect(() => {
        const createPetal = () => {
            const duration = Math.random() * 5 + 5; // 5s - 10s
            const delay = Math.random() * 2; // 0s - 2s

            return {
                id: Math.random(),
                left: Math.random() * 100 + "vw",
                animationDuration: duration + "s",
                animationDelay: delay + "s",
                size: Math.random() * 25 + 10 + "px",
                rotate: Math.random() * 360,
                expireAt: Date.now() + (duration + delay) * 1000 + 3000, // Extra 3s buffer
            };
        };

        // Generate initial petals
        setPetals(Array.from({ length: 10 }, createPetal));

        // Add new petals every second
        const interval = setInterval(() => {
            const now = Date.now();
            setPetals((prev) => [
                ...prev.filter((petal) => now < petal.expireAt), // Remove only fully completed petals
                createPetal(),
            ]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[0]">
            {petals.map((petal) => (
                <img
                    key={petal.id}
                    src="/images/sakura.png"
                    alt="Sakura Petal"
                    className={`absolute animate-fall`}
                    style={{
                        left: petal.left,
                        width: petal.size,
                        height: "auto",
                        animationDuration: petal.animationDuration,
                        animationDelay: petal.animationDelay,
                        transform: `rotate(${petal.rotate}deg)`,
                    }}
                />
            ))}
        </div>
    );
}
