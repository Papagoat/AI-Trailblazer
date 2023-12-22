# Set up

| Step | Description            | Command                                       |
|------|------------------------|-----------------------------------------------|
| 1.   | Install poetry         | `brew install poetry`                         |
| 2.   | Activate .venv         | `poetry shell` or `source .venv/bin/activate` |
| 3.   | Install pkgs           | `poetry install --no-root`                    |
| 4.   | Start app              | `uvicorn app:app --reload --port 3001`        |
| 5.   | Docs                   | `localhost:3001/docs`                         |

# TODO:
1. [✅] Rewrite chat-gpt (JS) int chat-gpt-py (python)
2. [✅] Add in Memory 
3. [🚧] Add in Production ready servers
4. [  ] Dockerise
5. [  ] Push to GCP and test

# Notes

### S1. Production Ready Servers
1. Gunicorn
2. Hypercorn

> `gunicorn -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:5000 main:app`