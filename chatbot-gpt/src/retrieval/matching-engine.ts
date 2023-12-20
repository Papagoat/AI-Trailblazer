import { GoogleVertexAIEmbeddings } from "langchain/embeddings/googlevertexai";

import { MatchServiceClient } from "@google-cloud/aiplatform";
import { GoogleCloudStorageDocstore } from "langchain/stores/doc/gcs";
import { Document } from "langchain/document";

(async () => {
  const store = new GoogleCloudStorageDocstore({
    bucket: "engaged-domain-403109-me-bucket",
    prefix: "documents/",
  });

  const aiplatformClient = new MatchServiceClient({
    apiEndpoint: "544096957.asia-southeast1-510519063638.vdb.vertexai.goog",
  });
  const indexEndpoint =
    "https://544096957.asia-southeast1-510519063638.vdb.vertexai.goog/v1/projects/510519063638/locations/asia-southeast1/indexEndpoints/3617586769429528576";
  const deployedIndexId = "engaged_domain_403109_me_index_20231213104529";

  const embeddings = new GoogleVertexAIEmbeddings();
  const query_embedding = await embeddings.embedQuery("Tell me what is SPED.");

  const request = {
    indexEndpoint,
    deployedIndexId,
    region: "asia-southeast1",
    returnFullDatapoint: true,
    queries: [
      {
        neighborCount: 4,
        datapoint: {
          featureVector: query_embedding,
        },
      },
    ],
  };

  const [response]: any = await aiplatformClient.findNeighbors(request);
  console.log(response.nearestNeighbors);

  const nearestNeighbors = response.nearestNeighbors ?? [];
  const nearestNeighbor = nearestNeighbors[0];
  const neighbors = nearestNeighbor?.neighbors ?? [];

  console.log(nearestNeighbors);
  console.log(neighbors);

  const ret = await Promise.all(
    neighbors.map(async (neighbor: any) => {
      const id = neighbor?.datapoint?.datapointId;
      const distance = neighbor?.distance;
      let doc: any;
      try {
        doc = await store.search(id);
      } catch (xx) {
        // Documents that are in the index are returned, even if they
        // are not in the document store, to allow for some way to get
        // the id so they can be deleted.
        console.error(xx);
        console.warn(
          [
            `Document with id "${id}" is missing from the backing docstore.`,
            `This can occur if you clear the docstore without deleting from the corresponding Matching Engine index.`,
            `To resolve this, you should call .delete() with this id as part of the "ids" parameter.`,
          ].join("\n")
        );
        doc = new Document({ pageContent: `Missing document ${id}` });
      }
      doc.id ??= id;
      return [doc, distance];
    })
  );

  console.log({ ret });

  ret.forEach(([doc, distance]) => {
    console.log(doc);
    console.log(distance);
  });

})();
