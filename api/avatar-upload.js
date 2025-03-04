import { handleUpload } from "@vercel/blob/client";

export default async function handler(request, response) {
    try {
        const body = await request.json();

        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // Here you could add authentication checks
                return {
                    allowedContentTypes: [
                        "image/jpeg",
                        "image/png",
                        "image/gif",
                        "image/webp",
                    ],
                    maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
                    tokenPayload: JSON.stringify({
                        // You could store user info here if needed
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This won't work locally, but will on Vercel
                console.log("Upload completed:", blob.url);
            },
        });

        return response.status(200).json(jsonResponse);
    } catch (error) {
        console.error("Error in upload handler:", error);
        return response.status(400).json({ error: error.message });
    }
}
