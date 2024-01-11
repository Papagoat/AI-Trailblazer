# Set up

| Step | Description            | Command                                       |
|------|------------------------|-----------------------------------------------|
| 1.   | Install poetry         | `brew install poetry`                         |
| 2.   | Activate .venv         | `poetry shell` or `source .venv/bin/activate` |
| 3.   | Install pkgs           | `poetry install --no-root`                    |
| 4.   | Start app              | `uvicorn app.main:app --reload --port 3001`        |
| 5.   | Docs                   | `localhost:3001/docs`                         |

# TODO:
1. [✅] Rewrite chat-gpt (JS) int chat-gpt-py (python)
2. [✅] Add in Memory 
3. [✅] Add in Production ready servers
4. [✅] Dockerise
5. [✅] Push to GCP and test
6. [✅] Add in Memory backed vector store
7. [✅] Create Jupyter Playbook for UXDs to play around with prompts
8. [✅] See how to handle eligibility criteria tracking
9. [  ] Play around with Paraphrase Chain's Prompt to refine it
10.[  ] Refine Conversation Chain's Chat history to rmb the current topic as multiple dialogue turn passes

# Notes
1. Need to deploy api image on GCP with more memory. Not sure why, but it might be because
of: 
- FAISS vector store
- Gunicorn running 4 workers (probably can reduce to 2 or 1)