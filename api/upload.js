import { put } from "@vercel/blob";
import busboy from "busboy";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Use busboy to parse multipart form data
        const bb = busboy({ headers: req.headers });

        let fileBuffer = null;
        let fileName = "";

        // Handle file upload
        bb.on("file", (name, file, info) => {
            const { filename, mimeType } = info;
            fileName = filename;

            const chunks = [];
            file.on("data", (data) => {
                chunks.push(data);
            });

            file.on("end", () => {
                fileBuffer = Buffer.concat(chunks);
            });
        });

        // Handle completion
        const uploadComplete = new Promise((resolve, reject) => {
            bb.on("finish", resolve);
            bb.on("error", reject);
            req.pipe(bb);
        });

        await uploadComplete;

        if (!fileBuffer) {
            return res.status(400).json({ error: "No file received" });
        }

        // Generate a unique filename
        const uniqueName = `avatar-${Date.now()}-${fileName || "image.jpg"}`;

        // Upload to Vercel Blob
        const blob = await put(uniqueName, fileBuffer, {
            access: "public",
        });

        return res.status(200).json({ url: blob.url });
    } catch (error) {
        console.error("Error in blob upload:", error);
        return res.status(500).json({ error: error.message });
    }
}
