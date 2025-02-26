import { toast } from "sonner";
import { axiosInstance } from "./Utils";

export const preUploadImage = async (file: File): Promise<{ key: string; url: string } | null> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        console.log("Uploading File:", file.name, "Size:", file.size);

        const response = await axiosInstance.post("/r2/pre-upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("Pre-Upload Response:", response.data);

        return {
            key: response.data.data.key,
            url: response.data.data.url,
        };

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Image upload error:", error.message);
        }

        if (typeof error === "object" && error !== null && "response" in error) {
            const err = error as { response: { data?: { message?: string; error?: string } } };

            console.error("Server Error Response:", err.response.data);
            toast.error(err.response.data?.message ?? "Image upload failed. Try again.");
        } else {
            toast.error("Image upload failed. Try again.");
        }

        return null;
    }
};