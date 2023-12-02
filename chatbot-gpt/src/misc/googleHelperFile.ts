// import fs from "fs";
import { GoogleAuth } from "google-auth-library";
import { Storage, TransferManager } from "@google-cloud/storage";

class GoogleHelper {
  private createGoogleAuth = (
    scopes: string = "https://www.googleapis.com/auth/cloud-platform"
  ) => new GoogleAuth({ scopes });

  public getGoogleProjectId = async () => {
    const auth = this.createGoogleAuth();
    const projectId = await auth.getProjectId();
    return projectId;
  };
}

export class GoogleCloudStorageHelper {
  public getPDFsFromBucket = async (bucketName: string) => {
    const projectId = await new GoogleHelper().getGoogleProjectId();
    const storage = new Storage({ projectId });

    const [pdfs] = await storage.bucket(bucketName).getFiles()
    return pdfs;
  };

  public uploadPDFsToBucket = async (
    fileList: string[] = [],
    bucketName: string
  ) => {
    try {
      const projectId = await new GoogleHelper().getGoogleProjectId();
      const storage = new Storage({ projectId });
      const transferManager = new TransferManager(storage.bucket(bucketName));

      // creates pdfs folder in GCS Bucket -- intended
      // https://cloud.google.com/storage/docs/folders
      // https://cloud.google.com/storage-transfer/docs/create-url-list#url-list-format
      await transferManager.uploadManyFiles(fileList);
    } catch (error) {
      console.log(error);
    }
  };
}
