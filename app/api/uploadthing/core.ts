import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Admin-only image uploader for products
  productImages: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized - Admin access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Product image upload completed for admin:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name
      };
    }),

  // Category image uploader for admin
  categoryImages: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized - Admin access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Category image upload completed for admin:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name
      };
    }),

  // Profile avatar uploader for users
  avatarUploader: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user) {
        throw new Error("Unauthorized - Authentication required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload completed for user:", metadata.userId);
      console.log("File URL:", file.url);
      
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
