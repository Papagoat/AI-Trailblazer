FROM python:3.11 as python-base
RUN mkdir app
WORKDIR  /code
COPY ./pyproject.toml /code
COPY ./poetry.lock* /code

RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-root
COPY ./app /code/app
COPY gcp-compute-engine-service-acc-keys.json /code
COPY .env.production /code/.env
EXPOSE 8080
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", \
  "--timeout", "1000", "app.main:app", "--bind", "0.0.0.0:8080", \
  "--log-level", "info"]
