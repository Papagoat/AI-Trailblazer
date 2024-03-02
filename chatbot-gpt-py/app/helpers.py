from langchain.prompts.prompt import PromptTemplate
from langchain.schema import format_document


DEFAULT_DOCUMENT_PROMPT = PromptTemplate.from_template(template="{page_content}")

def combine_documents(
    docs, document_prompt=DEFAULT_DOCUMENT_PROMPT, document_separator="\n\n"
):
    """This method formats documents into a string"""
    doc_strings = [format_document(doc, document_prompt) for doc in docs]
    return document_separator.join(doc_strings)

def handle_malformed_json(x):
    """
    Function to handle occasional malformed LLM JSON output

    Backticks will be placed at the back of json string, breaking JsonOutputParser
    output='{...some json data}\n```'

    The fix is to remove the backticks if it happens.
    """
    if "\n```" in x.content:
        x.content = x.content.replace("\n```", "\n")
    return x