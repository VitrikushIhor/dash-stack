-- REVIEW ONLY. Refuses to remove nonempty Learning tables.
BEGIN ISOLATION LEVEL READ COMMITTED;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
-- Keep concurrent writes out between the emptiness checks and DROP.
LOCK TABLE
  "learning_media_assets",
  "learning_media_uses",
  "learning_moderation_cases",
  "learning_moderation_evidence",
  "learning_operation_receipts",
  "learning_test_attempts",
  "learning_test_draft_groups",
  "learning_test_draft_questions",
  "learning_test_drafts",
  "learning_test_lineage",
  "learning_test_openings",
  "learning_test_restrictions",
  "learning_test_version_groups",
  "learning_test_version_questions",
  "learning_test_versions",
  "learning_tests",
  "learning_topic_draft_exercises",
  "learning_topic_drafts",
  "learning_topic_restrictions",
  "learning_topic_version_exercises",
  "learning_topic_versions",
  "learning_topics",
  "platform_audit_events",
  "platform_bootstrap",
  "platform_role_assignments"
IN ACCESS EXCLUSIVE MODE;

DO $guard$
DECLARE proposal_table text; has_rows boolean;
BEGIN
  FOREACH proposal_table IN ARRAY ARRAY['learning_test_lineage','learning_topics','learning_tests','learning_test_drafts','learning_test_versions','learning_topic_drafts','learning_topic_versions','learning_test_draft_groups','learning_test_draft_questions','learning_test_version_groups','learning_test_version_questions','learning_topic_draft_exercises','learning_topic_version_exercises','learning_test_openings','learning_test_attempts','learning_operation_receipts','learning_media_assets','learning_media_uses','platform_role_assignments','platform_bootstrap','learning_moderation_cases','learning_test_restrictions','learning_topic_restrictions','platform_audit_events','learning_moderation_evidence'] LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I LIMIT 1)', proposal_table) INTO has_rows;
    IF has_rows THEN RAISE EXCEPTION 'Refusing populated-table rollback: %', proposal_table; END IF;
  END LOOP;
END $guard$;
DROP TABLE "learning_moderation_evidence", "platform_audit_events", "learning_topic_restrictions", "learning_test_restrictions", "learning_moderation_cases", "platform_bootstrap", "platform_role_assignments", "learning_media_uses", "learning_media_assets", "learning_operation_receipts", "learning_test_attempts", "learning_test_openings", "learning_topic_version_exercises", "learning_topic_draft_exercises", "learning_test_version_questions", "learning_test_version_groups", "learning_test_draft_questions", "learning_test_draft_groups", "learning_topic_versions", "learning_topic_drafts", "learning_test_versions", "learning_test_drafts", "learning_tests", "learning_topics", "learning_test_lineage";
COMMIT;
