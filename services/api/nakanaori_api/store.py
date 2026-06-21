"""In-memory session store (MVP). Replace with Firestore for production."""

from nakanaori.orchestrator import SessionState

_sessions: dict[str, SessionState] = {}


def put(session: SessionState) -> None:
    _sessions[session.session_id] = session


def get(session_id: str) -> SessionState | None:
    return _sessions.get(session_id)
