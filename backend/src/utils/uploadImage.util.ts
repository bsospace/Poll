import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { envConfig } from "../config/config";
import path from 'path';
import fs from 'fs';

export interface UploadResult {
    url: string;
    fileName: string;
}

const R2_ENDPOINT = `https://${envConfig.cloudflareR2AccountId}.r2.cloudflarestorage.com`;

export const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: envConfig.cloudflareR2AccessKey,
    secretAccessKey: envConfig.cloudflareR2SecretKey,
  },
});

/**
 * ฟังก์ชันสำหรับอัปโหลดไฟล์ไปยัง Cloudflare R2
 * @param filePath ตำแหน่งไฟล์ใน Local
 * @param originalName ชื่อไฟล์เดิม
 * @returns URL ของไฟล์ที่อัปโหลดแล้ว
 */
export const uploadToCloudflare = async (
    filePath: string,
    originalName: string
  ): Promise<UploadResult> => {
    try {
      const fileContent = fs.readFileSync(filePath);
      const uniqueFileName = `uploads/${Date.now()}_${originalName}`;
  
      const command = new PutObjectCommand({
        Bucket: `${envConfig.cloudflareR2BucketName}`,
        Key: uniqueFileName,
        Body: fileContent,
        ContentType: getMimeType(originalName),
      });
  
      // await s3Client.send(command);
  
      // ลบไฟล์จาก Local หลังอัปโหลดสำเร็จ
      fs.unlinkSync(filePath);
  
      return {
        url: `${R2_ENDPOINT}/${envConfig.cloudflareR2BucketName}/${uniqueFileName}`,
        fileName: uniqueFileName,
      };
    } catch (error) {
      console.error('Error uploading to Cloudflare:', error);
      throw new Error('Failed to upload file to Cloudflare.');
    }
  };

  /**
 * ดึง MIME type จากชื่อไฟล์
 * @param filename ชื่อไฟล์
 * @returns MIME type ของไฟล์
 */
const getMimeType = (filename: string): string => {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };
