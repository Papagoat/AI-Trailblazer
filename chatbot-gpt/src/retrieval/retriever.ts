import fs from "fs";
import { GoogleVertexAIEmbeddings } from "langchain/embeddings/googlevertexai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { GoogleCloudStorageHelper } from "../misc/googleHelperFile";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const initLocalPdfDir = async (dir: string = "pdfs") => {
  const BUCKET_NAME = "financial-websites-pdfs";
  const pdfs = await new GoogleCloudStorageHelper().getPDFsFromBucket(
    BUCKET_NAME
  );

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const promises = pdfs.map(
    async (pdf) =>
      await pdf.download({
        destination: pdf.name,
      })
  );

  return await Promise.all(promises);
};

export const initRetriever = async (dir: string = "pdfs") => {
  await initLocalPdfDir();

  /* Load all PDFs within the specified directory */
  const dirLoader = new DirectoryLoader(dir, {
    ".pdf": (path: string) => {
      return new PDFLoader(path, {});
    },
  });

  const docs = await dirLoader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);

  const vectorStore = await FaissStore.fromDocuments(
    splitDocs,
    new GoogleVertexAIEmbeddings()
  );

  return vectorStore.asRetriever();
};
