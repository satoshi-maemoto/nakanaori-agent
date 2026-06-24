import { ConfirmationAgent } from "./agents/confirmation.js";
import { ChildNavigatorAgent, extractChildName } from "./agents/child-navigator.js";
import { EmotionGuardAgent } from "./agents/emotion-guard.js";
import { FactStructurerAgent } from "./agents/fact-structurer.js";
import { ListenerAgent } from "./agents/listener.js";
import { TeacherBriefAgent } from "./agents/teacher-brief.js";
import {
  SessionOrchestrator,
  SessionStateName,
  type ClientChannel,
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
  private readonly navigator = new ChildNavigatorAgent();

  createSession(
    sessionId: string,
    childALabel = "子どもA",
    childBLabel = "子どもB",
    clientChannel: ClientChannel = "web",
  ): SessionState {
    return {
      session_id: sessionId,
      state: SessionStateName.LISTENING_A,
      child_a_label: childALabel,
      child_b_label: childBLabel,
      child_a_name: null,
      child_b_name: null,
      turns_a: [],
      turns_b: [],
      structured: null,
      analysis_cache_key: null,
      analysis_snapshot: null,
      escalated: false,
      escalation_reason: null,
      client_channel: clientChannel,
    };
  }

  private analysisCacheKey(session: SessionState): string {
    const a = session.turns_a.map((t) => t.utterance).join("\u0000");
    const b = session.turns_b.map((t) => t.utterance).join("\u0000");
    return `${a}\u0001${b}`;
  }

  /** LLM-backed teacher insights (cached on session by turn content). */
  async refreshSessionInsights(
    session: SessionState,
  ): Promise<{ insights: SessionInsights; session: SessionState }> {
    const sessionWithNames = this.withDisplayLabels(session);

    if (session.structured) {
      const structured = StructuredFactsSchema.parse(session.structured);
      return {
        insights: this.briefAgent.buildInsights(structured),
        session,
      };
    }

    const cacheKey = this.analysisCacheKey(sessionWithNames);
    if (
      session.analysis_cache_key === cacheKey &&
      session.analysis_snapshot
    ) {
      const structured = StructuredFactsSchema.parse(session.analysis_snapshot);
      return {
        insights: this.briefAgent.buildInsights(structured),
        session,
      };
    }

    const hasTurns =
      sessionWithNames.turns_a.length > 0 || sessionWithNames.turns_b.length > 0;
    if (!hasTurns) {
      return {
        insights: {
          agreements: [],
          disagreements: [],
          unknowns: [],
          teacher_hints: [],
        },
        session,
      };
    }

    const structured = await this.structurer.analyzeSession(sessionWithNames);
    const updated: SessionState = {
      ...session,
      analysis_cache_key: cacheKey,
      analysis_snapshot: structured as unknown as Record<string, unknown>,
    };
    return {
      insights: this.briefAgent.buildInsights(structured),
      session: updated,
    };
  }

  async getSessionInsights(session: SessionState): Promise<SessionInsights> {
    const { insights } = await this.refreshSessionInsights(session);
    return insights;
  }

  getSessionWelcome(): string {
    return this.navigator.sessionWelcome();
  }

  async processChildTurn(
    session: SessionState,
    childId: "a" | "b",
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
    let agentMessage: string;

    if (text) {
      const turn = { child_id: childId, utterance: text };
      if (childId === "a") {
        updated = { ...updated, turns_a: [...updated.turns_a, turn] };
      } else {
        updated = { ...updated, turns_b: [...updated.turns_b, turn] };
      }

      if (this.navigator.isCollectingName(session, childId)) {
        const name = extractChildName(text);
        updated =
          childId === "a"
            ? { ...updated, child_a_name: name }
            : { ...updated, child_b_name: name };
        agentMessage = this.navigator.afterNameReceived(
          name,
          childId,
          updated.client_channel ?? "web",
        );
      } else {
        const displayName = this.navigator.displayName(updated, childId);
        const turns = childId === "a" ? updated.turns_a : updated.turns_b;
        const priorUtterances = turns.slice(0, -1).map((t) => t.utterance);
        const response = await this.listener.listenTurn(displayName, text, {
          priorUtterances,
        });
        agentMessage = response.agent_message;
      }
    } else if (finishTurn && childId === "a") {
      agentMessage = this.navigator.handoffToNextChild(session, "b");
    } else if (finishTurn && childId === "b") {
      agentMessage = this.navigator.finishMessage(session, "b");
    } else {
      agentMessage = this.navigator.greetingForChild(session, childId, true);
    }

    if (finishTurn) {
      updated = this.orchestrator.advanceAfterTurn(updated, childId);

      if (updated.state === SessionStateName.STRUCTURING) {
        const structured = await this.structurer.structure(this.withDisplayLabels(updated));
        updated = {
          ...this.orchestrator.markReadyForTeacher(updated),
          structured: structured as unknown as Record<string, unknown>,
        };
        agentMessage = this.navigator.finishMessage(updated, childId);
      } else if (!text && childId === "a") {
        agentMessage = this.navigator.handoffToNextChild(updated, "b");
      }
    }

    return [updated, agentMessage, false];
  }

  /** 先生向け整理では、わかった名前をラベルに反映する */
  private withDisplayLabels(session: SessionState): SessionState {
    return {
      ...session,
      child_a_label: session.child_a_name ?? session.child_a_label,
      child_b_label: session.child_b_name ?? session.child_b_label,
    };
  }

  getTeacherBrief(session: SessionState): TeacherBrief {
    const sessionWithNames = this.withDisplayLabels(session);
    let structured: StructuredFacts | null = null;
    if (session.structured) {
      structured = StructuredFactsSchema.parse(session.structured);
    }
    if (session.escalated) {
      return this.briefAgent.formatEscalationBrief(
        sessionWithNames,
        session.escalation_reason ?? "エスカレーション",
      );
    }
    return this.briefAgent.generateBrief(sessionWithNames, structured);
  }
}

export { ChildNavigatorAgent, ConfirmationAgent, EmotionGuardAgent, FactStructurerAgent, ListenerAgent, TeacherBriefAgent };
export * from "./orchestrator.js";
export * from "./schemas.js";
