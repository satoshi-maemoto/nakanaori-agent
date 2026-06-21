# User Stories

## US-01: Child speaks to robot in turn

**As** Child A or Child B  
**I want** to tell the robot what happened in my own words  
**So that** I can explain without facing the other child while upset

**Acceptance criteria**:

- Child can start or join a mediation session
- Robot responds with calm, supportive prompts
- Each child has a separate listening channel (not simultaneous confrontation)
- Robot does not say who is right or wrong

**Priority**: P0

---

## US-02: Agent structures facts and feelings

**As** the Nakanaori system  
**I want** to separate observable facts, reported feelings, and unknown points  
**So that** the teacher receives neutral, structured information

**Acceptance criteria**:

- Output includes: when/where, what happened (facts), how each child felt, what is still unclear
- No fields like `guilty_party`, `verdict`, or `winner`
- Facts use neutral language ("A said...", "B reported...")

**Priority**: P0

---

## US-03: Child confirms or corrects summary

**As** Child A or Child B  
**I want** to hear the robot read back what it understood and fix mistakes  
**So that** my side of the story is accurately represented

**Acceptance criteria**:

- Robot presents summary in child-friendly language
- Child can say "that's wrong" and provide corrections
- System updates structured data after correction

**Priority**: P1

---

## US-04: Teacher receives one-page brief

**As** Mr. Tanaka (teacher)  
**I want** a single brief with timeline, both sides, and suggested questions  
**So that** I can intervene fairly without re-interviewing both children from scratch

**Acceptance criteria**:

- Dashboard shows: timeline, facts per child, feelings per child, agreements, disagreements, unknowns
- Brief includes disclaimer: AI organizes only; teacher decides
- Brief available when both children have been heard (or on escalation)

**Priority**: P0

---

## US-05: Immediate escalation for high-risk content

**As** the Nakanaori system  
**I want** to stop mediation and alert the teacher immediately  
**When** violence, bullying, self-harm, or abuse is indicated

**Acceptance criteria**:

- EmotionGuard detects high-risk triggers
- Session moves to `escalated` state
- Teacher brief marked urgent; mediation workflow does not continue autonomously

**Priority**: P0

---

## US-06: Teacher views session list

**As** Mr. Tanaka  
**I want** to see active and recent mediation sessions  
**So that** I can prioritize which conflicts to address

**Acceptance criteria**:

- List shows session status: listening, confirming, ready_for_teacher, escalated, closed
- Escalated sessions visually distinct

**Priority**: P1

---

## US-07: Kebbi as physical avatar (sibling repo)

**As** Child  
**I want** to talk to the Kebbi robot in the classroom  
**So that** the experience feels natural and calming

**Acceptance criteria**:

- Kebbi client calls Nakanaori session API (not CharaTomo chat API)
- TTS plays robot responses; mic captures child speech (Phase 2)
- Documented in `clients/kebbi/api-contract.md`

**Priority**: P2
