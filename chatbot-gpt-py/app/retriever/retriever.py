import os

from langchain.embeddings import VertexAIEmbeddings
from langchain.vectorstores.matching_engine import MatchingEngine

def getRetriever():
    """
    This method returns a retriever using vector search (ie. Matching Engine)
    """
    PROJECT_ID = os.getenv('PROJECT_ID')
    REGION = os.getenv('REGION')
    GCS_BUCKET = os.getenv('GCS_BUCKET')
    ME_INDEX_ID = os.getenv('ME_INDEX_ID')
    ME_ENDPOINT_ID = os.getenv('ME_ENDPOINT_ID')

    embeddings = VertexAIEmbeddings(location=REGION)

    me = MatchingEngine.from_components(
        project_id=PROJECT_ID,
        region=REGION,
        gcs_bucket_name=GCS_BUCKET,
        embedding=embeddings,
        index_id=ME_INDEX_ID,
        endpoint_id=ME_ENDPOINT_ID,
    )

    NUMBER_OF_RESULTS = 10

    # Expose index to the retriever
    # https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.matching_engine.MatchingEngine.html?highlight=matchingengine#langchain_community.vectorstores.matching_engine.MatchingEngine.as_retriever
    retriever = me.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": NUMBER_OF_RESULTS,
        },
    )

    return retriever