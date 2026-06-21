"""FastAPI application entrypoint."""

import os

from fastapi import FastAPI

from nakanaori_api.routes.child_turn import router as child_turn_router
from nakanaori_api.routes.health import router as health_router
from nakanaori_api.routes.sessions import router as sessions_router
from nakanaori_api.routes.teacher_brief import router as teacher_brief_router

app = FastAPI(
    title="Nakanaori Agent API",
    description="学校のケンカを整理して先生につなぐ — 裁かない黒子AI",
    version="0.1.0",
)

app.include_router(health_router)
app.include_router(sessions_router, prefix="/v1")
app.include_router(child_turn_router, prefix="/v1")
app.include_router(teacher_brief_router, prefix="/v1")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "nakanaori-api",
        "philosophy": "主役は人。ロボットは黒子。",
    }


def main() -> None:
    import uvicorn

    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run("nakanaori_api.main:app", host="0.0.0.0", port=port)
