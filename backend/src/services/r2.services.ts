import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { envConfig } from "../config/config";
import path from "path";
import crypto from "crypto";

export class R2Service {
    private s3Client: S3Client;
    private prisma: PrismaClient;
    private R2_ENDPOINT: string;
    private BUCKET_NAME: string;

    constructor(prisma: PrismaClient) {
        this.R2_ENDPOINT = `https://${envConfig.cloudflareR2AccountId}.r2.cloudflarestorage.com`;
        this.BUCKET_NAME = envConfig.cloudflareR2BucketName;
        this.prisma = prisma;

        this.s3Client = new S3Client({
            region: "auto",
            endpoint: this.R2_ENDPOINT,
            credentials: {
                accessKeyId: envConfig.cloudflareR2AccessKey,
                secretAccessKey: envConfig.cloudflareR2SecretKey,
            },
        });
    }

    /**
     * Uploads file directly to R2 from memory buffer
     */
    public async uploadToR2Directly(fileBuffer: Buffer, originalName: string) {
        try {
            const uniqueFileName = `uploads/${Date.now()}_${originalName}`;

            const command = new PutObjectCommand({
                Bucket: this.BUCKET_NAME,
                Key: uniqueFileName,
                Body: fileBuffer,
                ContentType: this.getMimeType(originalName),
            });

            await this.s3Client.send(command);

            const fileUrl = `${envConfig.cloudflareR2Url}/${uniqueFileName}`;

            console.log(`📤 Uploaded file: ${uniqueFileName}`);

            return { key: uniqueFileName, url: fileUrl };
        } catch (error) {
            console.error("🚨 Error uploading to R2:", error);
            throw new Error("Failed to upload file to R2.");
        }
    }

    /**
     * Saves uploaded image metadata in the database
     */
    public async saveImageRecord(key: string, url: string, relatedId?: string, relatedTo?: string, table?: string) {
        try {
            return await this.prisma.image.create({
                data: {
                    key,
                    url,
                    relatedId,
                    relatedTo,
                    table,
                    hasUpload: false,
                },
            });
        } catch (error) {
            console.error("🚨 Error saving image record:", error);
            throw new Error("Failed to save image metadata.");
        }
    }

    /**
     * Retrieves an image by key
     */
    public async getImageByKey(key: string) {
        try {
            return await this.prisma.image.findUnique({
                where: { key },
            });
        }
        catch (error) {
            console.error("Error retrieving image by key:", error);
            throw new Error("Failed to retrieve image.");
        }
    }

    public async maskeHasUpload(key: string) {
        try {
            const image = await this.prisma.image.findUnique({ where: { key } });
            if (image) {
                await this.prisma.image.update({
                    where: { key },
                    data: { hasUpload: true },
                });
            }
        }
        catch (error) {
            console.error("Error updating image hasUpload:", error);
            throw new Error("Failed to update image.");
        }
    }

    /**
     * Retrieves all images associated with a related object
     */
    public async getImagesByRelatedObject(relatedTo: string, relatedId: string) {
        return await this.prisma.image.findMany({
            where: { relatedTo, relatedId, hasUpload: true },
        });
    }

    /**
     * Deletes an image from R2 and database
     */
    public async deleteFile(fileKey: string): Promise<void> {
        try {
            const image = await this.prisma.image.findUnique({ where: { key: fileKey } });

            if (!image) {
                throw new Error("Image not found in the database");
            }

            const command = new DeleteObjectCommand({
                Bucket: this.BUCKET_NAME,
                Key: fileKey,
            });

            await this.s3Client.send(command);
            await this.prisma.image.delete({ where: { key: fileKey } });

            console.log(`🗑️ Deleted file: ${fileKey}`);
        } catch (error) {
            console.error("🚨 Error deleting file from R2:", error);
            throw new Error("Failed to delete image.");
        }
    }

    /**
     * Generates a unique, safe file key for storage in R2
     */
    private generateFileKey(originalName: string): string {
        const extension = path.extname(originalName).toLowerCase();
        const filename = path.basename(originalName, extension);
        const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, ""); // Remove unsafe characters
        const uniqueId = crypto.randomUUID(); // Generates a unique identifier

        return `${safeFilename}_${uniqueId}${extension}`;
    }

    /**
     * Determines the MIME type of a file based on its extension
     */
    private getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        switch (ext) {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".pdf":
                return "application/pdf";
            default:
                return "application/octet-stream";
        }
    }
}
