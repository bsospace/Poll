import { PrismaClient } from "@prisma/client";
import { R2Service } from "../services/r2.services";

const prisma = new PrismaClient();
const r2Service = new R2Service(prisma);

export async function deleteUnusedImagesCron() {
    try {
        console.log("Running deleteUnusedImagesCron...");

        // Find all images that have not been uploaded to R2
        const unusedImages = await prisma.image.findMany({
            where: { hasUpload: false },
        });

        if (unusedImages.length === 0) {
            console.log("No unused images found.");
            return;
        }

        console.log(`Found ${unusedImages.length} unused images to delete.`);

        await Promise.all(
            unusedImages.map(async (image) => {
                try {
                    // Delete the file from R2
                    await r2Service.deleteFile(image.key);

                    // Delete the image record from the database
                    await prisma.image.delete({ where: { key: image.key } });

                    console.log(`Deleted image: ${image.key}`);
                } catch (error) {
                    console.error(`Failed to delete image: ${image.key}`, error);
                }
            })
        );

        console.log("[INFO] Completed deleteUnusedImagesCron.");
    } catch (error) {
        console.error("[ERROR] Error in deleteUnusedImagesCron:", error);
    } finally {
        await prisma.$disconnect();
    }
}
