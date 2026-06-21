"""Tests for Nakanaori agents."""

from nakanaori.emotion_guard_agent import EmotionGuardAgent
from nakanaori.workflow import MediationWorkflow


def test_create_session_starts_listening_a():
    wf = MediationWorkflow()
    session = wf.create_session("test-session-id")
    assert session.state.value == "listening_a"


def test_child_turn_advances_state():
    wf = MediationWorkflow()
    session = wf.create_session("s1")
    session, msg, escalated = wf.process_child_turn(session, "a", "今日ケンカした")
    assert not escalated
    assert "ありがとう" in msg or "聞い" in msg
    assert session.state.value == "listening_b"


def test_escalation_on_high_risk():
    guard = EmotionGuardAgent()
    assessment = guard.assess_risk("殴ってしまった")
    assert assessment.should_escalate


def test_teacher_brief_has_disclaimer():
    wf = MediationWorkflow()
    session = wf.create_session("s2")
    wf.process_child_turn(session, "a", "消しゴムがなくなった")
    session, _, _ = wf.process_child_turn(session, "b", "拾っただけ")
    brief = wf.get_teacher_brief(session)
    assert "最終的な判断は先生" in brief.ai_disclaimer
