import { ConfirmationAgent } from "./agents/confirmation.js";
import { EmotionGuardAgent } from "./agents/emotion-guard.js";
import { FactStructurerAgent } from "./agents/fact-structurer.js";
import { ListenerAgent } from "./agents/listener.js";
import { TeacherBriefAgent } from "./agents/teacher-brief.js";
import {
  SessionOrchestrator,
  SessionStateName,
  type SessionState,
} from "./orchestrator.js";
import type { SessionInsights, StructuredFacts, TeacherBrief } from "./schemas.js";
import { StructuredFactsSchema } from "./schemas.js";

export class MediationWorkflow {
  readonly orchestrator = new SessionOrchestrator();
  private readonly guard = new EmotionGuardAgent();
  private readonly listener = new ListenerAgent();
  private readonly structurer = new FactStructurerAgent();
  private readonly confirmation = new ConfirmationAgent();
  private readonly briefAgent = new TeacherBriefAgent();

  createSession(
    sessionId: string,
    childALabel = "子どもA",
    childBLabel = "子どもB",
  ): SessionState {
    return {
      session_id: sessionId,
      state: SessionStateName.LISTENING_A,
      child_a_label: childALabel,
      child_b_label: childBLabel,
      turns_a: [],
      turns_b: [],
      structured: null,
      escalated: false,
      escalation_reason: null,
    };
  }

  async processChildTurn(
    session: SessionState,
    childId: string,
    utterance: string,
    options?: { finishTurn?: boolean },
  ): Promise<[SessionState, string, boolean]> {
    const finishTurn = options?.finishTurn ?? false;
    const text = utterance.trim();

    if (!text && !finishTurn) {
      throw new Error("utterance required");
    }

    if (text) {
      const risk = this.guard.assessRisk(text);
      if (this.guard.shouldEscalate(risk)) {
        const escalated = this.orchestrator.markEscalated(
          session,
          risk.reason ?? "高リスク",
        );
        return [escalated, "大丈夫？先生を呼ぶね。", true];
      }
    }

    let updated = { ...session };
    const label = childId === "a" ? session.child_a_label : session.child_b_label;
    let agentMessage: string;

    if (text) {
      const turn = { child_id: childId, utterance: text };
      if (childId === "a") {
        updated = { ...updated, turns_a: [...updated.turns_a, turn] };
      } else {
        updated = { ...updated, turns_b: [...updated.turns_b, turn] };
      }
      const response = await this.listener.listenTurn(label, text);
      agentMessage = response.agent_message;
    } else {
      agentMessage =
        childId === "a"
          ? `${session.child_b_label} の ばん だよ。`
          : "おつかれさま。先生に つたえるね。";
    }

    if (finishTurn) {
      updated = this.orchestrator.advanceAfterTurn(updated, childId);

      if (updated.state === SessionStateName.STRUCTURING) {
        const structured = await this.structurer.structure(updated);
        updated = {
          ...this.orchestrator.markReadyForTeacher(updated),
          structured: structured as unknown as Record<string, unknown>,
        };
        if (!text) {
          agentMessage = "おつかれさま。先生に つたえるね。";
        }
      } else if (!text && childId === "a") {
        agentMessage = `${session.child_b_label} の ばん だよ。`;
      }
    }

    return [updated, agentMessage, false];
  }

  getSessionInsights(session: SessionState): SessionInsights {
    const structured = session.structured
      ? StructuredFactsSchema.parse(session.structured)
      : this.structurer.buildPreviewStructure(session);
    return this.briefAgent.buildInsights(structured);
  }

  getTeacherBrief(session: SessionState): TeacherBrief {
    let structured: StructuredFacts | null = null;
    if (session.structured) {
      structured = StructuredFactsSchema.parse(session.structured);
    }
    if (session.escalated) {
      return this.briefAgent.formatEscalationBrief(
        session,
        session.escalation_reason ?? "エスカレーション",
      );
    }
    return this.briefAgent.generateBrief(session, structured);
  }
}

export { ConfirmationAgent, EmotionGuardAgent, FactStructurerAgent, ListenerAgent, TeacherBriefAgent };
export * from "./orchestrator.js";
export * from "./schemas.js";
