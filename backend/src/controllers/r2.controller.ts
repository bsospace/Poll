import { Request, Response } from "express";
import { R2Service } from "../services/r2.services";

export class R2Controller {
    private r2Service: R2Service;

    constructor(r2Service: R2Service) {
        this.r2Service = r2Service;

        this.preUpload = this.preUpload.bind(this);
        this.getImages = this.getImages.bind(this);
        this.deleteImage = this.deleteImage.bind(this);
    }

    /**
     * Handles pre-upload by directly uploading the file to R2 and returning a key
     */
    public async preUpload(req: Request, res: Response): Promise<any> {
        try {
            // Ensure files exist
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }
    
            const { relatedId, relatedTo, table } = req.body;
    
            const { buffer, originalname } = files[0]; // Access first file
    
            // Upload file directly to R2 and get the file key
            const uploadResult = await this.r2Service.uploadToR2Directly(buffer, originalname);
    
            // Save metadata in DB
            const savedImage = await this.r2Service.saveImageRecord(
                uploadResult.key,
                uploadResult.url,
                relatedId,
                relatedTo,
                table
            );
    
            return res.status(200).json({
                success: true,
                message: "File uploaded to R2 successfully",
                data: savedImage,
            });
    
        } catch (error: unknown) {
            console.error("Pre-upload error:", error);
    
            // Handle known error types
            if (error instanceof Error) {
                return res.status(500).json({ success: false, message: error.message });
            }
    
            return res.status(500).json({ success: false, message: "Pre-upload to R2 failed" });
        }
    }
    
    /**
     * Retrieves images associated with a given related entity
     */
    async getImages(req: Request, res: Response): Promise<any> {
        try {
            const { key } = req.params;
            const images = await this.r2Service.getImageByKey(key);
            return res.json(images);
        } catch (error) {
            console.error("Get images error:", error);
            return res.status(500).json({ error: "Failed to retrieve images" });
        }
    }

    /**
     * Deletes an image from R2 and database
     */
    async deleteImage(req: Request, res: Response): Promise<any> {
        try {
            const { key } = req.params;
            await this.r2Service.deleteFile(key);
            return res.json({ message: "Image deleted successfully" });
        } catch (error) {
            console.error("Delete image error:", error);
            return res.status(500).json({ error: "Failed to delete image" });
        }
    }
}
