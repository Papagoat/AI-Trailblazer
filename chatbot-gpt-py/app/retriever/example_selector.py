from langchain.embeddings import VertexAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import SemanticSimilarityExampleSelector

from app.prompt_templates.fewshot_templates import fewshot_examples

def get_fewshot_example_selector():
    """
    This method returns an example selector that select from a series of 
    examples to dynamically place in-context information into your prompt.
    """
    embeddings = VertexAIEmbeddings(model_name="textembedding-gecko@001")
    return SemanticSimilarityExampleSelector.from_examples(
        fewshot_examples,
        embeddings,
        FAISS,
        k=2
    )