import { put } from "@vercel/blob";

export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(405).json({ error: "Method not allowed" });
    }

    try {
        const form = await request.formData();
        const file = form.get("file");

        if (!file) {
            return response
                .status(400)
                .json({ error: "No file found in request" });
        }

        // Create a unique filename with timestamp
        const filename = `${Date.now()}-${file.name}`;

        // Use Vercel Blob's put function with your token (which is automatically loaded from env)
        const blob = await put(`profile-pictures/${filename}`, file, {
            access: "public",
        });

        return response.status(200).json(blob);
    } catch (error) {
        console.error("Error in blob upload:", error);
        return response
            .status(500)
            .json({ error: error.message || "Error uploading file" });
    }
}
