import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/trips",
                destination: `${process.env.BACKEND_URL ?? "http://localhost:8080"}/api/trips`,
            },
        ];
    },
};

export default nextConfig;