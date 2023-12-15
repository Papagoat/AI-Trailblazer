import { MatchingEngine } from "langchain/vectorstores/googlevertexai";
// import { SyntheticEmbeddings } from "langchain/embeddings/fake";
import { GoogleCloudStorageDocstore } from "langchain/stores/doc/gcs";
import { GoogleVertexAIEmbeddings } from "langchain/embeddings/googlevertexai";

(async () => {
  const GOOGLE_CLOUD_STORAGE_BUCKET = "engaged-domain-403109-me-bucket";
  const GOOGLE_VERTEXAI_MATCHINGENGINE_INDEX =
    "projects/510519063638/locations/asia-southeast1/indexes/4693366538231611392";
  const GOOGLE_VERTEXAI_MATCHINGENGINE_INDEXENDPOINT =
    "projects/510519063638/locations/asia-southeast1/indexEndpoints/3617586769429528576";
  const ENDPOINT = "https://asia-southeast1-aiplatform.googleapis.com";
  const REGION = "asia-southeast1";
  const DEPLOYED_INDEX_ID = "engaged_domain_403109_me_index_20231213104529";
  const API_ENDPOINT = "544096957.asia-southeast1-510519063638.vdb.vertexai.goog"

  const embeddings = new GoogleVertexAIEmbeddings()

  const store = new GoogleCloudStorageDocstore({
    bucket: GOOGLE_CLOUD_STORAGE_BUCKET!,
  });

  const config = {
    index: GOOGLE_VERTEXAI_MATCHINGENGINE_INDEX!,
    indexEndpoint: GOOGLE_VERTEXAI_MATCHINGENGINE_INDEXENDPOINT!,
    apiVersion: "v1beta",
    docstore: store,
    endpoint: ENDPOINT,
    location: REGION,
    deployedIndexId: DEPLOYED_INDEX_ID,
    apiEndpoint: API_ENDPOINT,
  };

  const engine = new MatchingEngine(embeddings, config);

  const results = await engine.similaritySearch("this");
  console.log({ results }); // returns { results: [] }
})();
