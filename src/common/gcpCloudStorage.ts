import { db } from "./db";
import { Storage } from "@google-cloud/storage";
export async function getLogoFileName(shop: string) {
  // console.log(shop)
  const existingUser = await db.chatbotCustomization.findUnique({
    where: {
      shopDomain: shop
    },
    select: {
      logoFilename: true
    }
  });
  console.log(existingUser)
  if (existingUser) {
    return existingUser.logoFilename;
  }
  else {
    return "hell"
  }
}


export async function checkFileExists(email: string): Promise<boolean> {
    const bucketName = process.env.LOGO_BUCKET_NAME || "";
    const fileName = await getLogoFileName(email) ;
    console.log(fileName)
    console.log("fileName")

    const storage = new Storage({
        projectId: process.env.PROJECT_ID,
        credentials: {
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        },
    });

    const bucket = storage.bucket(bucketName);

    const file = bucket.file(fileName);

    try {
        const [exists] = await file.exists();
        if (exists) {
            return true;
        }
    } catch (error) {
        console.error(`Error checking file existence for ${fileName}:`, error);
        throw error;
    }

    return false;
}
