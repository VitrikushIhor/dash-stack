# Learning — Question, Answer and Result Contracts

- Date: 2026-10-09
- Updated: 2026-10-12 (normalization, duplicate answers and publication minima agreed)
- Status: Contract proposal; agreed product rules distinguished from remaining decisions
- Implementation: Documentation only; no runtime types, GraphQL schema or database changes
- Product baseline: [Feature specification](FEATURE-SPEC-learning.md)
- Architecture: [ADR-0010](../../adr/0010-learning-tests-and-topics.md)
- Persistence proposal: [Schema and dependencies](SCHEMA-AND-DEPENDENCIES-learning.md)
- Lifecycle proposal: [State and operation authorization](STATE-AND-ACCESS-learning.md)

## 1. Scope and confirmed rules

Define five subject-independent kinds: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT`, `GAPS`, `MATCHING`. A gap's `mode` is `TEXT` or `SELECT`; these are not separate question kinds. English is content, not a domain discriminator. Adding a future kind requires its own author validation, publication validation, player projection, answer validation, evaluation and rendering, without changing the semantics of existing kinds.

The user confirmed on 2026-10-09:

- Text comparison ignores case and leading/trailing whitespace only. Internal whitespace, punctuation and different apostrophe characters remain significant; authors supply accepted alternatives such as `don't` and `do not`.
- Display the percentage as a whole number: 2/3 becomes 67%. Preserve exact earned/maximum points.
- Matching is one-to-one with equal left/right collections and no extra choices in v1.

Also confirmed on 2026-10-12: canonically equivalent composed/decomposed letters compare equally; normalized duplicate accepted text answers must be corrected before publication while drafts remain saveable; publication requires at least two choice options, two matching pairs and one gap in a gap question.

Whole-test submission, zero for skipped units, exact-set multiple choice, one point per gap/pair, and post-submission explanations remain unchanged. This document proposes concrete field shapes; it does not finalize the remaining rich-document schema, transport SDL, document-based label extraction. Author drafts use explicit saving and the conflict flow in the feature specification.

## 2. Separate boundaries

| Boundary                 | Data                                                                                                    | Must not include                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Owner draft              | Editable prompt/configuration, incomplete solution, explanation, revision                               | Other owners' drafts or attempts                                                     |
| Published author content | Validated immutable content, complete solution, explanation, schema/scoring versions                    | Learner attempts/results                                                             |
| Player                   | Authorized page/version binding, pinned version and visible groups/questions; no stored learner answers | Solutions, explanations, correctness, accepted-answer lists or correct-pair metadata |
| Submitted result         | Frozen submitted answers, per-unit evaluation, correct answers, explanations, exact score               | Another caller's result or later draft content                                       |

Published author content is available through an explicitly authorized authoring/copy workflow, not an unrestricted version lookup. Public copying remains allowed; therefore this is a learning product, not an exam-secrecy guarantee.

Construct player DTOs from an allowlist; never serialize the author DTO and delete a few known fields. Recursively validate rich-document nodes/attributes and media references. No correctness flags, solution-bearing alt attributes, pair keys, author notes or unpublished explanations may enter the player projection. This cannot prevent an author from deliberately writing an answer in the visible prompt.

Owner preview uses the player renderer and an authorized draft projection. Incomplete questions show author-only validation issues; they are not silently repaired or published. Preview evaluation must not create learner attempts, public views or persistent results. A blocked owner cannot obtain preview data.

Agreed v1 editor capabilities: topic materials, question prompts, shared group text and explanations support paragraphs, headings, bold, italic, underline, lists, blockquotes, links and authorized images. Choice labels and matching-side labels support text plus bold/italic/underline only, without images, links or complex blocks. Titles, short descriptions and accepted text answers are plain text. Insert gap nodes through a dedicated editor action only in a GAPS question prompt. Tables, video, arbitrary HTML, text colors and font selection are deferred. Document schemas must enforce these field-specific capabilities server-side as well as in the editor.

In v1, gap nodes may appear inline in ordinary paragraphs or list-item paragraphs within a GAPS prompt, including multiple gaps in one sentence. Exclude gaps from headings, links, image captions and other gaps. Each gap has independent TEXT or SELECT answer configuration. Display numbering is derived from document order; moving a gap preserves its identity and solution. Deleting a gap removes its node, configuration and solution from local editor state together; persist only through explicit Save draft. Existing exactly-one-node/definition/solution validation still applies.

Ordinary clipboard paste (not a separate import feature) preserves text and only the formatting allowed by the destination field. Remove foreign styles/fonts, scripts and unsupported elements; notify the author when formatting is lost. Do not automatically embed or fetch external images; authors upload images separately through the authorized upload workflow. Pasted content remains local until explicit Save draft and can be checked in preview. Clipboard handling does not replace server-side document validation.

Rich-text links accept only validated absolute http:// or https:// web URLs, including links to platform tests/topics. External links open in a new tab with opener isolation. Do not generate automatic previews or fetch linked third-party content. Reject other URL schemes, including javascript:, file: and data:, at the document boundary. Platform links do not grant target access or restore guest attempts.

V1 explanations are optional and question-level only. Show the shared question explanation after submission for correct, incorrect and unanswered responses. A GAPS or MATCHING question has one explanation for all its units while correctness/scoring remains per gap or left-side pair. Per-option, per-gap and per-pair explanation fields are deferred.

## 3. Common content and identity

The following are application DTO names proposed for implementation, not existing repository APIs. IDs in examples are short illustrative values; production uses the repository's ID convention.

| Field                   | Contract                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `schemaVersion`         | Positive integer on the containing test draft/version; selects the bounded question/document decoder        |
| `scoringVersion`        | Positive integer on the publication and pinned attempt; selects the evaluation and text-normalization rules |
| `questionId`, `groupId` | Stable identities within the test, independent of array position                                            |
| `kind`                  | One of the five exact discriminators                                                                        |
| `prompt`                | Validated application-owned rich document; gap nodes allowed only for `GAPS`                                |
| `configuration`         | Kind-specific visible structure described below                                                             |
| `solution`              | Kind-specific private answer key described below                                                            |
| `explanation`           | Validated rich document; may be empty; returned to learners only after submission                           |
| `position`              | Ordering metadata; never used as answer identity or as a hidden matching relationship                       |

`Document` in the type sketch means the eventual validated, bounded application rich-document type. It is a type parameter to avoid inventing an editor-specific JSON schema here; it must not become `any` or unvalidated external data. Text, images/captions and basic formatting use that contract. The editor adapter and transport representation remain O-04/O-05/O-10 work.

Groups have `groupId`, `position`, optional empty `title`, `instruction` and shared `material`. A simple test uses its default group without asking the author to fill shared material. Group instructions/material are visible before submission and cannot contain hidden solution fields. Published tests contain at least one scored question; reject a zero-point publication.

Duplicate/copy remaps question, group, option, gap and matching-element IDs and every reference to them. Reorder preserves IDs. Deleting an option clears its selected answer key in the same draft mutation; deleting a gap removes its node, definition and solution together. Switching a question kind creates an empty configuration/solution for the new kind and clears stale local learner-preview answers. On a confirmed question-kind change, preserve the question prompt text, explanation, group membership and ordering. Reset all kind-specific configuration and solutions, including options, accepted answers, pairs and gaps, without automatic conversion even between single and multiple choice. Leaving GAPS removes gap nodes while preserving surrounding prompt text; disclose this in the confirmation. Returning to the old kind does not restore its former configuration. Apply the change locally until Save draft. These editor changes stay local until “Save draft”; server revision checks still apply to that save. Confirm destructive local editor actions before deleting a populated question, deleting a populated group and its questions, or switching kind when existing configuration/solutions would be cleared. Describe the content that will be lost; cancellation changes nothing. Empty elements may be deleted without confirmation. Confirmed changes remain local until Save draft and never directly alter the published version. Confirmation is agreed; any additional undo behavior is not specified by this decision.

## 4. Proposed author payloads

This self-contained TypeScript sketch describes draft payload shape. Publication uses separately validated contracts: nullable keys become required, arrays meet the semantic constraints below, and references are checked. Do not cast a draft to a published contract or use `Partial<PublishedQuestion>` as the draft schema.

```ts
type Option<Document> = { optionId: string; label: Document };
type MatchElement<Document> = { elementId: string; label: Document };
type Pair = { leftId: string; rightId: string };

type GapDefinition<Document> =
  | { gapId: string; mode: "TEXT" }
  | { gapId: string; mode: "SELECT"; options: Option<Document>[] };

type DraftGapSolution =
  | { gapId: string; mode: "TEXT"; acceptedAnswers: string[] }
  | { gapId: string; mode: "SELECT"; correctOptionId: string | null };

type QuestionDraft<Document> = {
  questionId: string;
  groupId: string;
  position: number;
  prompt: Document;
  explanation: Document;
} & (
  | {
      kind: "SINGLE_CHOICE";
      configuration: { options: Option<Document>[] };
      solution: { correctOptionId: string | null };
    }
  | {
      kind: "MULTIPLE_CHOICE";
      configuration: { options: Option<Document>[] };
      solution: { correctOptionIds: string[] };
    }
  | {
      kind: "TEXT";
      configuration: Record<string, never>;
      solution: { acceptedAnswers: string[] };
    }
  | {
      kind: "GAPS";
      configuration: { gaps: GapDefinition<Document>[] };
      solution: { gaps: DraftGapSolution[] };
    }
  | {
      kind: "MATCHING";
      configuration: {
        left: MatchElement<Document>[];
        right: MatchElement<Document>[];
      };
      solution: { pairs: Pair[] };
    }
);
```

Draft saves permit empty prompts/labels, no selected key, empty accepted-answer lists and incomplete matching assignments. They still require valid discriminators, finite bounded arrays, unique IDs, well-formed documents, allowed references and resource ownership. Incomplete is different from malformed: reject an unknown option reference or a mismatched gap mode even during an explicit draft save. Publication errors identify the relevant question/gap/field without losing saved draft work.

### Publication validation and scoring

| Kind              | Configuration / solution invariant                                                                      | Maximum points  | Evaluation                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `SINGLE_CHOICE`   | At least two labeled options; exactly one referenced correct option                                     | 1               | Selected option equals `correctOptionId`                                                             |
| `MULTIPLE_CHOICE` | At least two labeled options; nonempty unique correct-option subset                                     | 1               | Selected set equals the complete correct set, independent of selection order                         |
| `TEXT`            | At least one nonempty accepted answer after normalization                                               | 1               | Normalized input equals one normalized accepted answer                                               |
| `GAPS`            | At least one gap; exactly one prompt node, definition and matching-mode solution per gap                | Number of gaps  | Evaluate each gap independently; `SELECT` uses one correct option, `TEXT` uses accepted alternatives |
| `MATCHING`        | At least two elements per side with equal counts; solution is a complete bijection without repeated IDs | Number of pairs | Evaluate each submitted left-to-right mapping independently                                          |

Publication also requires renderable labels/context, unique IDs, authorized ready media and the configured limits. Require at least two options for single/multiple choice and selectable gaps, at least two matching pairs, and at least one gap in a gap question. These are publication minima, not draft-save minima. A gap prompt can supply its own context; matching does not need a redundant text instruction if its content is clear. Identical visible choice labels within one question are also a publication error, even when their option IDs differ. Drafts preserve these options; show the author which entries to change or remove. Apply this within a single choice list, including one selectable gap, not across unrelated questions/gaps. This is separate from duplicate accepted text answers. Publication also rejects identical visible labels within either matching side, even with distinct IDs. Drafts preserve them and identify the entries to correct. The same label on opposite sides or in unrelated questions is allowed. Rich-label comparison details remain section-10 work.

Apply the agreed maxima: 100 question blocks/test, 20 groups/test, 10 options/choice question or selectable gap, 20 gaps/question, 20 matching pairs/question. Twenty matching pairs are permitted despite the separate ten-option choice limit. A test's maximum is the sum of question maxima; shared material contributes no points. The client cannot set weights, scores or maximum points.

## 5. Proposed answer contract

```ts
type GapAnswer =
  | { gapId: string; mode: "TEXT"; text: string }
  | { gapId: string; mode: "SELECT"; selectedOptionId: string | null };

type QuestionAnswer =
  | {
      questionId: string;
      kind: "SINGLE_CHOICE";
      selectedOptionId: string | null;
    }
  | {
      questionId: string;
      kind: "MULTIPLE_CHOICE";
      selectedOptionIds: string[];
    }
  | { questionId: string; kind: "TEXT"; text: string }
  | { questionId: string; kind: "GAPS"; gaps: GapAnswer[] }
  | {
      questionId: string;
      kind: "MATCHING";
      pairs: { leftId: string; rightId: string }[];
    };

type SubmitAttemptCommand = {
  versionBinding: string;
  operationId: string;
  answers: QuestionAnswer[];
};
```

Submission sends the complete local answer snapshot once. Omitted units and empty values are unanswered; no prior server answer snapshot exists to merge or clear. Create a completed attempt only on successful whole-test submission. Before submission, answers exist only in the current tab: no server answer saves, active-attempt rows, cross-device recovery or learner-save conflicts. Each tab is independent. Opening returns an authorized server-verifiable binding to the displayed immutable content/scoring version without creating an attempt. Submit all current answers and that binding; recheck current access and atomically validate, evaluate, persist the completed attempt/result and minimal operation receipt. Failed submission preserves local answers and creates no partial attempt. Warn before leaving with unsubmitted answers; closing/reloading loses them. Local “Start again” confirms clearing local inputs rather than superseding server state. Retain authenticated results for three days from submission, without renewal on reads/retries. Repeat of the same submit operation cannot create another completion. The former 14-day unfinished retention and one-active-attempt constraints are superseded.

Validate structure and membership before scoring. Reject unknown question/option/gap/element IDs, kind/mode mismatches, duplicate question/gap IDs, duplicate selections, duplicate left mappings or reuse of a matching right element. Repeated visible labels do not justify accepting arbitrary IDs. Missing answers are valid; fabricated references are not silently converted into wrong answers. Reject score, key or owner fields supplied by the learner.

Submit derives principal, content/scoring version and evaluation server-side from the authorized version binding. Retries preserve operation identity and payload; changed payload with the same identity conflicts. Result access and receipt replay enforce authorization and retention.

## 6. Worked examples

The tables render rich-document labels as plain text for readability. JSON blocks are exact proposed `QuestionAnswer` examples, not complete GraphQL requests. Option/element arrays in the player follow the open-page presentation; selecting by array index is never supported. Randomization policy must not encode correct-answer positions and must remain stable within the open page.

### Single choice

Prompt: “I think she ___ win.” Author options: `o1` = “will”, `o2` = “is”, `o3` = “does”. Private solution: `correctOptionId = o1`. The player receives all options with IDs but no solution or explanation.

```json
{ "questionId": "q1", "kind": "SINGLE_CHOICE", "selectedOptionId": "o1" }
```

Result: 1/1; show selected `o1`, correct `o1` and the author's explanation. Null or omission gives 0/1.

### Multiple choice

Prompt: “Select the future forms.” Options: `o4` = “will go”, `o5` = “went”, `o6` = “is going to go”. Private solution: `correctOptionIds = [o4, o6]`. The player is not told how many options are correct.

```json
{
  "questionId": "q2",
  "kind": "MULTIPLE_CHOICE",
  "selectedOptionIds": ["o6", "o4"]
}
```

Result: 1/1. Selecting only `o4`, or selecting all three, gives 0/1 with the complete correct set shown after submission. Duplicate `o4` entries are a validation error, not extra credit or a silently repaired set.

### Text

Prompt: “Write the negative form of do.” Private solution: `acceptedAnswers = ["don't", "do not"]`. The player receives no accepted alternatives.

```json
{ "questionId": "q3", "kind": "TEXT", "text": "  DO NOT  " }
```

Result: 1/1 after case/edge-whitespace normalization. `do  not`, `don’t` and `do not.` give 0/1 unless the author explicitly included those alternatives. Whitespace-only input is unanswered.

### Mixed gaps

Prompt document renders “I [g1] call you [g2] I arrive.” The nodes contain gap IDs only. Configuration: `g1` is `TEXT`; `g2` is `SELECT` with `o7` = “when” and `o8` = “until”. Private solutions: `g1` accepts `["will", "shall"]`; `g2` has correct option `o7`.

```json
{
  "questionId": "q4",
  "kind": "GAPS",
  "gaps": [
    { "gapId": "g1", "mode": "TEXT", "text": "will" },
    { "gapId": "g2", "mode": "SELECT", "selectedOptionId": "o8" }
  ]
}
```

Result: 1/2, with a correct unit for `g1` and an incorrect unit for `g2`; show both solutions after submission. Omit `g2` to leave it unanswered. A choice belonging to another gap is rejected even if its displayed label is identical.

### Matching

| Side                        | IDs and visible labels        |
| --------------------------- | ----------------------------- |
| Left                        | `l1` = “cat”, `l2` = “dog”    |
| Right, example player order | `r8` = “собака”, `r7` = “кіт” |
| Private solution            | `l1 → r7`, `l2 → r8`          |

```json
{
  "questionId": "q5",
  "kind": "MATCHING",
  "pairs": [{ "leftId": "l1", "rightId": "r7" }]
}
```

Result: 1/2; `l2` is unanswered and gives zero. Both collections use independent opaque IDs: no shared pair ID, aligned correct-pair array, foreign-key hint or correctness metadata is sent to the player. Shuffle right-side presentation independently from left-side order and retain that presentation for the attempt. Because there are no extra choices, a wrong assignment may necessarily leave another pair wrong; score each left element, not the matching question all-or-nothing.

Together the five examples earn **5/7**, displayed as **71%**. Skipped units remain in the denominator.

## 7. Text normalization and percentage

Apply the same pinned normalizer to learner input and every accepted alternative. Preserve original strings for author editing and result display. Do not add fuzzy matching, contraction expansion, punctuation removal, internal whitespace collapse or apostrophe replacement. Do not trim/rewrite the saved learner input as an incidental persistence operation.

Agreed v1 normalization: Unicode NFC, then ECMAScript `trim()` and locale-independent `toLowerCase()`, then NFC again. Canonically equivalent composed/decomposed letters compare equally; for example, `\u00e9` and `e\u0301`. Do not use NFKC compatibility folding, remove accents, transliterate or equate visually similar letters from different scripts. Thus plain `e` differs from `é`; punctuation, apostrophe and internal-whitespace differences remain significant. Pin this algorithm to the scoring version and cover Unicode edge cases before shipping the evaluator.

Agreed duplicate policy: explicit draft saves preserve author-entered alternatives; publication rejects blank entries and normalized-equivalent duplicates without silently rewriting authored content. Show the duplicate entries to the author and require correction before publication. `"Will"` and `" will "` are duplicates; so are composed/decomposed versions of the same accepted answer. Compare within one text question's accepted-answer list or one typed gap's list, not across unrelated questions/gaps. Learners still receive no accepted alternatives before submission.

Display a whole percentage rounded to nearest integer, with exact halves rounded up: `floor(100 * earnedPoints / maxPoints + 0.5)`. Store exact integer `earnedPoints` and positive `maxPoints` as the canonical score; percentage is derived consistently. Examples: 2/3 → 67%, 1/8 → 13%, 0/3 → 0%, 3/3 → 100%. Reject zero-maximum publications rather than inventing a 0/0 result. There is no pass threshold, negative marking or configurable question weight in v1.

## 8. Result projection

| Field                                                         | Meaning                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `attemptId`, `testVersionId`, `scoringVersion`, `submittedAt` | Server-derived identity of the completed evaluation                                                           |
| `earnedPoints`, `maxPoints`, `percentage`                     | Exact integer totals and derived whole percentage                                                             |
| `questions[]`                                                 | One entry for every question of the pinned version, in presentation order, including skipped questions        |
| Question `questionId`, `kind`, `answer`, `explanation`        | Frozen submitted answer (or unanswered), discriminator and version-pinned explanation                         |
| Question `earnedPoints`, `maxPoints`, `units[]`               | Aggregate of its units; not a separate weighted score                                                         |
| Unit `status`, `earnedPoints`, `maxPoints`                    | `CORRECT`, `INCORRECT` or `UNANSWERED`; 1 or 0 earned, always 1 maximum                                       |
| Unit identity                                                 | Question ID for single/multiple/text, gap ID for gaps, left-element ID for matching                           |
| Kind-specific correct answer                                  | `correctOptionId`, `correctOptionIds`, `acceptedAnswers`, per-gap typed solution, or correct right-element ID |

Use discriminated result DTOs matching the question kinds, not an unrelated generic object with optional fields for every kind. `UNANSWERED` is a display distinction and always scores zero. Multiple choice contributes one unit for the complete set; no per-option partial scoring. Mixed gaps and matching can have both correct and incorrect units in one question.

Result retrieval returns only the current caller's authorized retained completion. Reference labels/prompts from the pinned version so changed publications do not mislabel answers. Recheck access and the three-day authenticated result deadline on replay; guest results follow the current-page policy. The proposed result contract does not add a history screen or let an author inspect other users' answers.

## 9. Error and verification contracts

Proposed application error reasons: `INVALID_ANSWER`, `INVALID_DRAFT`, `PUBLICATION_INVALID`, `REVISION_CONFLICT`, `OPERATION_CONFLICT`, `OPENING_EXPIRED`, `RESULT_EXPIRED`, and a non-disclosing unavailable-resource reason for denied content. These are proposed Learning reasons, not claims about existing `DomainErrorCode` values. Map them at the transport boundary to stable code, safe message, structured details and request ID; finalize the GraphQL adapter contract separately.

Validation details use question/gap IDs and field paths, not answer keys, raw user text, private resource titles or internal exception messages. An authenticated author can receive publication issues about their own solution fields. A player cannot use error messages to discover correct answers. Infrastructure failure is never converted to an unanswered unit or zero score.

Required future behavior tests (documentation examples are not executable Learning verification):

| Cases                                                            | Expected behavior                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Each kind's draft is incomplete vs structurally malformed        | Save incomplete content; reject invalid types/references; publication reports missing required content                   |
| Each author payload passes through player projection             | No solution/explanation leakage, including nested documents, media metadata and matching IDs/order                       |
| Multiple-choice order, subset, superset, empty, duplicates       | Order-independent exact-set score; zero for omissions; duplicates rejected                                               |
| Text case/edge spaces vs internal spaces/punctuation/apostrophes | Confirmed rules and accepted alternatives applied identically to text questions/gaps                                     |
| Mixed gap modes, repeated/missing nodes, foreign options         | Correct independent units; invalid publication/references rejected                                                       |
| Matching partial response, swapped pairs, repeated right ID      | Per-left scoring; omitted left is zero; invalid reuse rejected                                                           |
| All answers blank                                                | Valid submission, zero earned, full denominator, no missing-answer confirmation                                          |
| Duplicate/copy/reorder                                           | IDs remapped for copies, stable for reorder; no stale solution references                                                |
| Independent tabs and duplicate submit                            | Separate completions per opening; identical-operation retry returns one result without mutable answer sharing            |
| Repeated submit after publication update                         | Same pinned evaluation, subject to current access and expiry                                                             |
| Auth expiry/block/delete between load and submit                 | Access denied; no grade produced through stale permission                                                                |
| Identical visible choice labels with different option IDs        | Draft saves both; publication identifies duplicates in that choice list; the same label in another question is permitted |
| Canonically equivalent accents vs plain letters/confusables      | Composed/decomposed letters match; accent removal and cross-script folding are not performed                             |
| Identical labels within one matching side                        | Draft preserves entries; publication rejects duplicates; opposite sides may share a label                                |
| Repeated accepted answers within a text question or typed gap    | Draft preserves inputs; publication identifies normalized duplicates; unrelated questions may reuse answers              |
| Below/minimum/maximum option, pair and gap counts                | Incomplete drafts save; publication rejects below minima and accepts otherwise valid boundary counts                     |
| Percentage edge values                                           | 2/3 = 67, 1/8 = 13, bounded 0–100, no zero denominator                                                                   |

## 10. Remaining decisions and handoff

O-10 is partially resolved: text normalization, duplicate accepted-answer handling, identical visible choice and matching-side label rejection, publication minima, whole percentages and simple one-to-one matching are confirmed. The shapes and mutation semantics above are a reviewable engineering proposal. Before the corresponding implementation, settle:

1. Visible-label comparison is agreed: compare rendered text while ignoring bold, italic, color and link formatting; ignore leading/trailing whitespace and collapse repeated ordinary spaces. Preserve case and punctuation differences. Canonically equivalent Unicode characters compare equally through NFC. Apply this within each choice list and independently within each matching side; opposite matching sides may share a label. This is distinct from case-insensitive accepted-text-answer normalization. Label fields are text-only with bold/italic/underline marks in v1; final bounded extraction and whitespace edge cases depend on the document schema below.
2. The rich-document node/mark schema and bounds (O-04/O-05), including bounded nesting and field-specific validation of the agreed editor capabilities and gap placement.
3. GraphQL inputs/outputs and error mapping for full answer snapshots, plus remaining activity/capability/cleanup policies in O-01/O-02. Learner answer-save conflicts are removed by submit-only persistence. O-09 copy/removal product choices are resolved in the lifecycle contract.

The [implementation plan](IMPLEMENTATION-PLAN-learning.md) phase 1 remains open. Its [state/operation authorization matrix](STATE-AND-ACCESS-learning.md) now complements this question contract; resolve the remaining choices in both before dependent implementation. Prisma, migrations, dependencies and runtime implementation remain separate work.
