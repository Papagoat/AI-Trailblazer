import express, { NextFunction, Request, Response } from "express";
import { initRetriever } from "./retrieval/retriever";
import cors from "cors";
import { ConversationalRetrievalQA } from "./retrieval/ConversationalRetrievalQA";

const app = express();

initRetriever()
  .then((retriever) => {
    app.use(
      cors({
        origin: process.env.FRONTEND_ORIGIN,
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post("/api/message", async (req: Request, res: Response) => {
      try {
        const message = req.body.message ?? "";
        const chain = ConversationalRetrievalQA.getInstance(retriever);
        const result = await chain.getMessage(message);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.send(error);
      }
    });

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err);
      res.status(500).send(err);
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.error("APP", { error }));
