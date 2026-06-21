"""Listener agent — supportive hearing for one child at a time."""

from pathlib import Path

from nakanaori.schemas.responses import ListenerResponse

PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_listener_prompt() -> str:
    return (PROMPTS_DIR / "listener.md").read_text(encoding="utf-8")


class ListenerAgent:
    """Collects child utterances with calm, non-judgmental responses."""

    def listen_turn(self, child_label: str, utterance: str) -> ListenerResponse:
        # Stub: replace with ADK + Gemini invocation
        message = (
            f"{child_label}さん、話してくれてありがとう。"
            "ゆっくり聞いているよ。"
        )
        if len(utterance) > 20:
            message = (
                f"{child_label}さん、そうだったんだね。"
                "もう少し教えてくれる？"
            )
        return ListenerResponse(agent_message=message, needs_more=False)

    def prompt_for_more(self, child_label: str) -> str:
        return f"{child_label}さん、他にも伝えたいことはある？"
