from langchain_core.prompt_values import ChatPromptValue, StringPromptValue
import pprint

pp = pprint.PrettyPrinter(indent=2)

def debug_fn(x):
    """This function takes a generic, and prints it before passing it on to the next function.

    Think of it as a middleware.

    Examples: 
    answer = {
            "question": lambda x: x["question"],
            # pylint: disable-next=not-callable
            "answer": final_inputs | ANSWER_PROMPT | debug_fn | self.model,
            "docs": itemgetter("docs"),
        }

    standalone_question = {
            "standalone_question": {
                "question": lambda x: x["question"],
                "chat_history": lambda x: x["chat_history"],
            }
            | CONDENSE_QUESTION_PROMPT
            | debug_fn
            | self.model
            | StrOutputParser(),
        }
    """
    if isinstance(x, (ChatPromptValue, StringPromptValue)):
        prompt_val = x.to_string()
        pp.pprint({
          "len": len(prompt_val),
          "prompt_val": prompt_val,
        })
    else:
        # Prints input as is
        pp.pprint(x)
    
    return x
