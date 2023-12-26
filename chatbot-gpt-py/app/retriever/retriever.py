import os
import faiss

from langchain.embeddings import VertexAIEmbeddings
from langchain.vectorstores.matching_engine import MatchingEngine
from langchain.docstore import InMemoryDocstore
from langchain.vectorstores import FAISS
from langchain.memory import VectorStoreRetrieverMemory


def get_vector_search_retriever():
    """
    This method returns a retriever using vector search (ie. Matching Engine)
    """
    PROJECT_ID = os.getenv('PROJECT_ID')
    REGION = os.getenv('REGION')
    GCS_BUCKET = os.getenv('GCS_BUCKET')
    ME_INDEX_ID = os.getenv('ME_INDEX_ID')
    ME_ENDPOINT_ID = os.getenv('ME_ENDPOINT_ID')

    embeddings = VertexAIEmbeddings(location=REGION, model_name="textembedding-gecko@001")

    me = MatchingEngine.from_components(
        project_id=PROJECT_ID,
        region=REGION,
        gcs_bucket_name=GCS_BUCKET,
        embedding=embeddings,
        index_id=ME_INDEX_ID,
        endpoint_id=ME_ENDPOINT_ID,
    )

    NUMBER_OF_RESULTS = 4

    # Expose index to the retriever
    # https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.matching_engine.MatchingEngine.html?highlight=matchingengine#langchain_community.vectorstores.matching_engine.MatchingEngine.as_retriever
    retriever = me.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": NUMBER_OF_RESULTS,
        },
    )

    return retriever


def get_memory_retriever():
    """
    This method returns a vector store retriever that retrieves stored memories
    """
    EMBEDDING_SIZE = 768
    index = faiss.IndexFlatL2(EMBEDDING_SIZE)
    embedding_fn = VertexAIEmbeddings(model_name="textembedding-gecko@001")

    # pylint: disable-next=not-callable
    vectorstore_memory = FAISS(embedding_fn, index, InMemoryDocstore({}), {})

    retriever = vectorstore_memory.as_retriever(search_kwargs={"k": 2})
    memory = VectorStoreRetrieverMemory(
        retriever=retriever,
        return_messages=True,
        input_key="human",
        output_key="ai"
    )

    return memory
