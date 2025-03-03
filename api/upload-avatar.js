import { put } from "@vercel/blob";

export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(405).json({ error: "Method not allowed" });
    }

    try {
        const form = await request.formData();
        const file = form.get("profile_picture");

        if (!file) {
            return response.status(400).json({ error: "No file provided" });
        }

        // Create a unique filename
        const uniqueFilename = `${Date.now()}-${file.name}`;

        // Upload to Vercel Blob
        const blob = await put(`profile_pictures/${uniqueFilename}`, file, {
            access: "public",
        });

        // Return the URL to the uploaded file
        return response.status(200).json({ url: blob.url });
    } catch (error) {
        console.error("Error uploading file:", error);
        return response.status(500).json({ error: "Error uploading file" });
    }
}
