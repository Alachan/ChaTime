// api/upload.js
import { put } from "@vercel/blob";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Read the binary data from the request body
        const buffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", () => resolve(Buffer.concat(chunks)));
            req.on("error", reject);
        });

        // Generate a unique filename
        const filename = `avatar-${Date.now()}.jpg`;

        // Upload to Vercel Blob
        const blob = await put(filename, buffer, {
            access: "public",
        });

        // Return the URL
        return res.status(200).json({ url: blob.url });
    } catch (error) {
        console.error("Error in blob upload:", error);
        return res.status(500).json({ error: error.message });
    }
}
