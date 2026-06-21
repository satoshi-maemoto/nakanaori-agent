"""Mediation workflow — coordinates agents for one session."""

from nakanaori.confirmation_agent import ConfirmationAgent
from nakanaori.emotion_guard_agent import EmotionGuardAgent
from nakanaori.fact_structurer_agent import FactStructurerAgent
from nakanaori.listener_agent import ListenerAgent
from nakanaori.orchestrator import ChildTurn, SessionOrchestrator, SessionState, SessionStateName
from nakanaori.schemas.teacher_brief import StructuredFacts, TeacherBrief
from nakanaori.teacher_brief_agent import TeacherBriefAgent


class MediationWorkflow:
    """End-to-end mediation stub (replace agent internals with ADK + Gemini)."""

    def __init__(self) -> None:
        self.orchestrator = SessionOrchestrator()
        self.guard = EmotionGuardAgent()
        self.listener = ListenerAgent()
        self.structurer = FactStructurerAgent()
        self.confirmation = ConfirmationAgent()
        self.brief_agent = TeacherBriefAgent()

    def create_session(
        self,
        session_id: str,
        child_a_label: str = "子どもA",
        child_b_label: str = "子どもB",
    ) -> SessionState:
        return SessionState(
            session_id=session_id,
            state=SessionStateName.LISTENING_A,
            child_a_label=child_a_label,
            child_b_label=child_b_label,
        )

    def process_child_turn(
        self,
        session: SessionState,
        child_id: str,
        utterance: str,
    ) -> tuple[SessionState, str, bool]:
        risk = self.guard.assess_risk(utterance)
        if self.guard.should_escalate(risk):
            session = self.orchestrator.mark_escalated(session, risk.reason or "高リスク")
            return session, "大丈夫？先生を呼ぶね。", True

        turn = ChildTurn(child_id=child_id, utterance=utterance)
        if child_id == "a":
            session.turns_a.append(turn)
            label = session.child_a_label
        else:
            session.turns_b.append(turn)
            label = session.child_b_label

        response = self.listener.listen_turn(label, utterance)
        session = self.orchestrator.advance_after_turn(session, child_id)

        if session.state == SessionStateName.STRUCTURING:
            structured = self.structurer.structure(session)
            session.structured = structured.model_dump()
            session = self.orchestrator.mark_ready_for_teacher(session)

        return session, response.agent_message, False

    def get_teacher_brief(self, session: SessionState) -> TeacherBrief:
        structured = None
        if session.structured:
            structured = StructuredFacts.model_validate(session.structured)
        if session.escalated:
            return self.brief_agent.format_escalation_brief(
                session,
                session.escalation_reason or "エスカレーション",
            )
        return self.brief_agent.generate_brief(session, structured)
