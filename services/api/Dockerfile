FROM python:3.12-slim

WORKDIR /app

# Install agents package
COPY agents/pyproject.toml agents/
COPY agents/nakanaori agents/nakanaori/
RUN pip install --no-cache-dir ./agents

# Install API
COPY services/api/pyproject.toml services/api/
COPY services/api/nakanaori_api services/api/nakanaori_api/
RUN pip install --no-cache-dir ./services/api

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "uvicorn nakanaori_api.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
