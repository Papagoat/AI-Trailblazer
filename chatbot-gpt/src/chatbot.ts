import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { getGoogleProjectId } from "./google-helper-file";

import { GoogleVertexAI } from "langchain/llms/googlevertexai";

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const getModelCompletion = async (userMessage: string) => {
  const projectId = await getGoogleProjectId();

  const model = new GoogleVertexAI({
    temperature: 0.7,
    authOptions: {
      projectId,
    },
  });

  const res = await model.call(userMessage);

  return res;
};

app.post("/api/message", async (req: Request, res: Response) => {
  const userMessage = req.body.message ?? "";

  if (!userMessage) {
    res.send("Empty message");
    return;
  }

  try {
    const botReply = await getModelCompletion(userMessage);
    res.send(botReply);
  } catch (error) {
    console.error(`Error calling Vertex AI API:  ${error}`);
    res.status(500).send("Error getting a response from the bot");
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).send(err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
