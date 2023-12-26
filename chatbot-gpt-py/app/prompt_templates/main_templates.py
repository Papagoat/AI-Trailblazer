STANDALONE_TEMPLATE = """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
        
        Please answer in the same language as the incoming question.

        Relevant pieces of previous conversation:
        {chat_history}

        (You do not need to use these pieces of information if not relevant)

        Use the few shot examples below to better craft the standalone question.
        {examples}

        Follow Up Input: {question}
        Standalone question:
        """

ANSWER_TEMPLATE = """Try to answer the question based on the following context:
        {context}

        Question: {question}
        """