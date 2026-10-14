-- REVIEW PROPOSAL ONLY; not a deployed migration.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- CreateTable
CREATE TABLE "learning_test_lineage" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "root_id" TEXT NOT NULL,
    "tree_revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_test_lineage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_topics" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "current_version_id" TEXT,
    "access_revision" INTEGER NOT NULL DEFAULT 0,
    "page_open_count" BIGINT NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "learning_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_tests" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT,
    "visibility" TEXT,
    "current_version_id" TEXT,
    "access_revision" INTEGER NOT NULL DEFAULT 0,
    "page_open_count" BIGINT NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "topic_id" TEXT,
    "lineage_id" TEXT NOT NULL,

    CONSTRAINT "learning_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_test_drafts" (
    "test_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "english_level" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learning_test_drafts_pkey" PRIMARY KEY ("test_id")
);

-- CreateTable
CREATE TABLE "learning_test_versions" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "english_level" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoring_version" INTEGER NOT NULL,
    "max_points" INTEGER NOT NULL,

    CONSTRAINT "learning_test_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_topic_drafts" (
    "topic_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "english_level" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "materials" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learning_topic_drafts_pkey" PRIMARY KEY ("topic_id")
);

-- CreateTable
CREATE TABLE "learning_topic_versions" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "english_level" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "materials" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_topic_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_test_draft_groups" (
    "test_id" TEXT NOT NULL,
    "group_key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "instruction" JSONB NOT NULL,
    "material" JSONB NOT NULL,

    CONSTRAINT "learning_test_draft_groups_pkey" PRIMARY KEY ("test_id","group_key")
);

-- CreateTable
CREATE TABLE "learning_test_draft_questions" (
    "test_id" TEXT NOT NULL,
    "question_key" TEXT NOT NULL,
    "group_key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "prompt" JSONB NOT NULL,
    "configuration" JSONB NOT NULL,
    "solution" JSONB NOT NULL,
    "explanation" JSONB NOT NULL,

    CONSTRAINT "learning_test_draft_questions_pkey" PRIMARY KEY ("test_id","question_key")
);

-- CreateTable
CREATE TABLE "learning_test_version_groups" (
    "version_id" TEXT NOT NULL,
    "group_key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "instruction" JSONB NOT NULL,
    "material" JSONB NOT NULL,

    CONSTRAINT "learning_test_version_groups_pkey" PRIMARY KEY ("version_id","group_key")
);

-- CreateTable
CREATE TABLE "learning_test_version_questions" (
    "version_id" TEXT NOT NULL,
    "question_key" TEXT NOT NULL,
    "group_key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "prompt" JSONB NOT NULL,
    "configuration" JSONB NOT NULL,
    "solution" JSONB NOT NULL,
    "explanation" JSONB NOT NULL,
    "max_points" INTEGER NOT NULL,

    CONSTRAINT "learning_test_version_questions_pkey" PRIMARY KEY ("version_id","question_key")
);

-- CreateTable
CREATE TABLE "learning_topic_draft_exercises" (
    "topic_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "learning_topic_draft_exercises_pkey" PRIMARY KEY ("topic_id","test_id")
);

-- CreateTable
CREATE TABLE "learning_topic_version_exercises" (
    "topic_version_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "test_version_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "learning_topic_version_exercises_pkey" PRIMARY KEY ("topic_version_id","test_id")
);

-- CreateTable
CREATE TABLE "learning_test_openings" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "test_version_id" TEXT NOT NULL,
    "user_id" TEXT,
    "principal_kind" TEXT NOT NULL,
    "principal_key" TEXT NOT NULL,
    "guest_secret_hash" TEXT,
    "presentation_seed" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "learning_test_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_test_attempts" (
    "id" TEXT NOT NULL,
    "opening_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "test_version_id" TEXT NOT NULL,
    "user_id" TEXT,
    "principal_kind" TEXT NOT NULL,
    "principal_key" TEXT NOT NULL,
    "guest_result_secret_hash" TEXT,
    "answers" JSONB NOT NULL,
    "presentation" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "erased_at" TIMESTAMPTZ(3),

    CONSTRAINT "learning_test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_operation_receipts" (
    "id" TEXT NOT NULL,
    "principal_key" TEXT NOT NULL,
    "operation_name" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "payload_hash" TEXT NOT NULL,
    "outcome" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learning_operation_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_media_assets" (
    "id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "uploader_user_id" TEXT,
    "mime_type" TEXT NOT NULL,
    "byte_size" BIGINT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletion_claimed_at" TIMESTAMPTZ(3),
    "lease_expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "learning_media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_media_uses" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "test_draft_id" TEXT,
    "test_version_id" TEXT,
    "topic_draft_id" TEXT,
    "topic_version_id" TEXT,

    CONSTRAINT "learning_media_uses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_role_assignments" (
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assigned_by_user_id" TEXT,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revision" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "platform_role_assignments_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "platform_bootstrap" (
    "key" TEXT NOT NULL,
    "selected_account_key" TEXT NOT NULL,
    "completed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_bootstrap_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "learning_moderation_cases" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "root_lineage_id" TEXT,
    "topic_id" TEXT,
    "reason" TEXT NOT NULL,
    "opened_by_user_id" TEXT,
    "opened_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scope_revision" INTEGER,
    "state" TEXT NOT NULL DEFAULT 'OPEN',
    "closed_at" TIMESTAMPTZ(3),
    "evidence_expires_at" TIMESTAMPTZ(3),

    CONSTRAINT "learning_moderation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_test_restrictions" (
    "case_id" TEXT NOT NULL,
    "lineage_id" TEXT NOT NULL,
    "applied_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lifted_at" TIMESTAMPTZ(3),
    "lifted_by_user_id" TEXT,
    "lift_reason" TEXT,

    CONSTRAINT "learning_test_restrictions_pkey" PRIMARY KEY ("case_id","lineage_id")
);

-- CreateTable
CREATE TABLE "learning_topic_restrictions" (
    "case_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "applied_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lifted_at" TIMESTAMPTZ(3),
    "lifted_by_user_id" TEXT,
    "lift_reason" TEXT,

    CONSTRAINT "learning_topic_restrictions_pkey" PRIMARY KEY ("case_id","topic_id")
);

-- CreateTable
CREATE TABLE "platform_audit_events" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_key" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_kind" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "platform_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_moderation_evidence" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "test_version_id" TEXT,
    "topic_version_id" TEXT,
    "retained_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_moderation_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_test_lineage_parent_id_id_idx" ON "learning_test_lineage"("parent_id", "id");

-- CreateIndex
CREATE INDEX "learning_test_lineage_root_id_id_idx" ON "learning_test_lineage"("root_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_test_lineage_id_root_id_key" ON "learning_test_lineage"("id", "root_id");

-- CreateIndex
CREATE INDEX "learning_topics_owner_user_id_updated_at_id_idx" ON "learning_topics"("owner_user_id", "updated_at", "id");

-- CreateIndex
CREATE INDEX "learning_topics_published_at_id_idx" ON "learning_topics"("published_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_topics_id_owner_user_id_key" ON "learning_topics"("id", "owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_tests_lineage_id_key" ON "learning_tests"("lineage_id");

-- CreateIndex
CREATE INDEX "learning_tests_owner_user_id_updated_at_id_idx" ON "learning_tests"("owner_user_id", "updated_at", "id");

-- CreateIndex
CREATE INDEX "learning_tests_published_at_id_idx" ON "learning_tests"("published_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_tests_id_owner_user_id_key" ON "learning_tests"("id", "owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_tests_topic_id_id_key" ON "learning_tests"("topic_id", "id");

-- CreateIndex
CREATE INDEX "learning_test_versions_test_id_idx" ON "learning_test_versions"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_test_versions_test_id_version_number_key" ON "learning_test_versions"("test_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "learning_test_versions_test_id_id_key" ON "learning_test_versions"("test_id", "id");

-- CreateIndex
CREATE INDEX "learning_topic_versions_topic_id_idx" ON "learning_topic_versions"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_topic_versions_topic_id_version_number_key" ON "learning_topic_versions"("topic_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "learning_topic_versions_topic_id_id_key" ON "learning_topic_versions"("topic_id", "id");

-- CreateIndex
ALTER TABLE "learning_test_draft_groups" ADD CONSTRAINT "learning_test_draft_groups_test_id_position_key" UNIQUE ("test_id", "position") DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
ALTER TABLE "learning_test_draft_questions" ADD CONSTRAINT "learning_test_draft_questions_test_id_group_key_position_key" UNIQUE ("test_id", "group_key", "position") DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
ALTER TABLE "learning_test_version_groups" ADD CONSTRAINT "learning_test_version_groups_version_id_position_key" UNIQUE ("version_id", "position") DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
ALTER TABLE "learning_test_version_questions" ADD CONSTRAINT "learning_test_version_questions_version_id_group_key_positi_key" UNIQUE ("version_id", "group_key", "position") DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
CREATE UNIQUE INDEX "learning_topic_draft_exercises_test_id_key" ON "learning_topic_draft_exercises"("test_id");

-- CreateIndex
ALTER TABLE "learning_topic_draft_exercises" ADD CONSTRAINT "learning_topic_draft_exercises_topic_id_position_key" UNIQUE ("topic_id", "position") DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
CREATE INDEX "learning_topic_version_exercises_test_version_id_idx" ON "learning_topic_version_exercises"("test_version_id");

-- CreateIndex
ALTER TABLE "learning_topic_version_exercises" ADD CONSTRAINT "learning_topic_version_exercises_topic_version_id_position_key" UNIQUE ("topic_version_id", "position") DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
CREATE UNIQUE INDEX "learning_test_openings_guest_secret_hash_key" ON "learning_test_openings"("guest_secret_hash");
CREATE UNIQUE INDEX "learning_opening_principal_identity_key" ON "learning_test_openings"("id", "principal_kind", "principal_key");

-- CreateIndex
CREATE INDEX "learning_test_openings_expires_at_id_idx" ON "learning_test_openings"("expires_at", "id");

-- CreateIndex
CREATE INDEX "learning_test_openings_test_version_id_idx" ON "learning_test_openings"("test_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_test_attempts_opening_id_key" ON "learning_test_attempts"("opening_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_test_attempts_guest_result_secret_hash_key" ON "learning_test_attempts"("guest_result_secret_hash");

-- CreateIndex
CREATE INDEX "learning_test_attempts_user_id_test_id_submitted_at_id_idx" ON "learning_test_attempts"("user_id", "test_id", "submitted_at", "id");

-- CreateIndex
CREATE INDEX "learning_test_attempts_expires_at_id_idx" ON "learning_test_attempts"("expires_at", "id");

-- CreateIndex
CREATE INDEX "learning_test_attempts_test_version_id_idx" ON "learning_test_attempts"("test_version_id");

-- CreateIndex
CREATE INDEX "learning_operation_receipts_expires_at_id_idx" ON "learning_operation_receipts"("expires_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_operation_receipts_principal_key_operation_name_op_key" ON "learning_operation_receipts"("principal_key", "operation_name", "operation_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_media_assets_storage_key_key" ON "learning_media_assets"("storage_key");

-- CreateIndex
CREATE INDEX "learning_media_assets_state_lease_expires_at_id_idx" ON "learning_media_assets"("state", "lease_expires_at", "id");

-- CreateIndex
CREATE INDEX "learning_media_uses_test_draft_id_idx" ON "learning_media_uses"("test_draft_id");

-- CreateIndex
CREATE INDEX "learning_media_uses_test_version_id_idx" ON "learning_media_uses"("test_version_id");

-- CreateIndex
CREATE INDEX "learning_media_uses_topic_draft_id_idx" ON "learning_media_uses"("topic_draft_id");

-- CreateIndex
CREATE INDEX "learning_media_uses_topic_version_id_idx" ON "learning_media_uses"("topic_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_media_uses_asset_id_test_draft_id_key" ON "learning_media_uses"("asset_id", "test_draft_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_media_uses_asset_id_test_version_id_key" ON "learning_media_uses"("asset_id", "test_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_media_uses_asset_id_topic_draft_id_key" ON "learning_media_uses"("asset_id", "topic_draft_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_media_uses_asset_id_topic_version_id_key" ON "learning_media_uses"("asset_id", "topic_version_id");

-- CreateIndex
CREATE INDEX "learning_moderation_cases_state_evidence_expires_at_id_idx" ON "learning_moderation_cases"("state", "evidence_expires_at", "id");

-- CreateIndex
CREATE INDEX "learning_test_restrictions_lineage_id_lifted_at_idx" ON "learning_test_restrictions"("lineage_id", "lifted_at");

-- CreateIndex
CREATE INDEX "learning_topic_restrictions_topic_id_lifted_at_idx" ON "learning_topic_restrictions"("topic_id", "lifted_at");

-- CreateIndex
CREATE INDEX "platform_audit_events_expires_at_id_idx" ON "platform_audit_events"("expires_at", "id");

-- CreateIndex
CREATE INDEX "platform_audit_events_target_kind_target_id_occurred_at_idx" ON "platform_audit_events"("target_kind", "target_id", "occurred_at");

-- CreateIndex
CREATE INDEX "learning_moderation_evidence_test_version_id_idx" ON "learning_moderation_evidence"("test_version_id");

-- CreateIndex
CREATE INDEX "learning_moderation_evidence_topic_version_id_idx" ON "learning_moderation_evidence"("topic_version_id");

-- AddForeignKey
ALTER TABLE "learning_test_lineage" ADD CONSTRAINT "learning_test_lineage_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "learning_test_lineage"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_lineage" ADD CONSTRAINT "learning_test_lineage_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "learning_test_lineage"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_lineage_id_fkey" FOREIGN KEY ("lineage_id") REFERENCES "learning_test_lineage"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_drafts" ADD CONSTRAINT "learning_test_drafts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "learning_tests"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_versions" ADD CONSTRAINT "learning_test_versions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "learning_tests"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_drafts" ADD CONSTRAINT "learning_topic_drafts_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_versions" ADD CONSTRAINT "learning_topic_versions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_draft_groups" ADD CONSTRAINT "learning_test_draft_groups_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "learning_test_drafts"("test_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_draft_questions" ADD CONSTRAINT "learning_test_draft_questions_test_id_group_key_fkey" FOREIGN KEY ("test_id", "group_key") REFERENCES "learning_test_draft_groups"("test_id", "group_key") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_version_groups" ADD CONSTRAINT "learning_test_version_groups_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "learning_test_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_version_questions" ADD CONSTRAINT "learning_test_version_questions_version_id_group_key_fkey" FOREIGN KEY ("version_id", "group_key") REFERENCES "learning_test_version_groups"("version_id", "group_key") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_draft_exercises" ADD CONSTRAINT "learning_topic_draft_exercises_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topic_drafts"("topic_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_draft_exercises" ADD CONSTRAINT "learning_topic_draft_exercises_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "learning_tests"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_version_exercises" ADD CONSTRAINT "learning_topic_version_exercises_topic_version_id_fkey" FOREIGN KEY ("topic_version_id") REFERENCES "learning_topic_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_version_exercises" ADD CONSTRAINT "learning_topic_version_exercises_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "learning_test_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_openings" ADD CONSTRAINT "learning_test_openings_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "learning_tests"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_openings" ADD CONSTRAINT "learning_test_openings_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "learning_test_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_openings" ADD CONSTRAINT "learning_test_openings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_test_attempts_opening_id_fkey" FOREIGN KEY ("opening_id") REFERENCES "learning_test_openings"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_test_attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "learning_tests"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_test_attempts_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "learning_test_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_test_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_media_assets" ADD CONSTRAINT "learning_media_assets_uploader_user_id_fkey" FOREIGN KEY ("uploader_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_media_uses" ADD CONSTRAINT "learning_media_uses_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "learning_media_assets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_media_uses" ADD CONSTRAINT "learning_media_uses_test_draft_id_fkey" FOREIGN KEY ("test_draft_id") REFERENCES "learning_test_drafts"("test_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_media_uses" ADD CONSTRAINT "learning_media_uses_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "learning_test_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_media_uses" ADD CONSTRAINT "learning_media_uses_topic_draft_id_fkey" FOREIGN KEY ("topic_draft_id") REFERENCES "learning_topic_drafts"("topic_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_media_uses" ADD CONSTRAINT "learning_media_uses_topic_version_id_fkey" FOREIGN KEY ("topic_version_id") REFERENCES "learning_topic_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "platform_role_assignments" ADD CONSTRAINT "platform_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "platform_role_assignments" ADD CONSTRAINT "platform_role_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_moderation_cases" ADD CONSTRAINT "learning_moderation_cases_root_lineage_id_fkey" FOREIGN KEY ("root_lineage_id") REFERENCES "learning_test_lineage"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_moderation_cases" ADD CONSTRAINT "learning_moderation_cases_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_moderation_cases" ADD CONSTRAINT "learning_moderation_cases_opened_by_user_id_fkey" FOREIGN KEY ("opened_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_restrictions" ADD CONSTRAINT "learning_test_restrictions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "learning_moderation_cases"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_restrictions" ADD CONSTRAINT "learning_test_restrictions_lineage_id_fkey" FOREIGN KEY ("lineage_id") REFERENCES "learning_test_lineage"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_test_restrictions" ADD CONSTRAINT "learning_test_restrictions_lifted_by_user_id_fkey" FOREIGN KEY ("lifted_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_restrictions" ADD CONSTRAINT "learning_topic_restrictions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "learning_moderation_cases"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_restrictions" ADD CONSTRAINT "learning_topic_restrictions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "learning_topics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_topic_restrictions" ADD CONSTRAINT "learning_topic_restrictions_lifted_by_user_id_fkey" FOREIGN KEY ("lifted_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "platform_audit_events" ADD CONSTRAINT "platform_audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_moderation_evidence" ADD CONSTRAINT "learning_moderation_evidence_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "learning_moderation_cases"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_moderation_evidence" ADD CONSTRAINT "learning_moderation_evidence_test_version_id_fkey" FOREIGN KEY ("test_version_id") REFERENCES "learning_test_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "learning_moderation_evidence" ADD CONSTRAINT "learning_moderation_evidence_topic_version_id_fkey" FOREIGN KEY ("topic_version_id") REFERENCES "learning_topic_versions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- SQL-managed invariants (Prisma cannot express CHECK/deferrable semantics).
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_owner_ck" CHECK (owner_user_id IS NOT NULL OR deleted_at IS NOT NULL);
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_access_ck" CHECK (access_revision >= 0 AND page_open_count >= 0);
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_visibility_ck" CHECK (visibility IN ('PRIVATE','UNLISTED','PUBLIC') OR visibility IS NULL);
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_owner_ck" CHECK (owner_user_id IS NOT NULL OR deleted_at IS NOT NULL);
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_access_ck" CHECK (access_revision >= 0 AND page_open_count >= 0);
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_visibility_ck" CHECK (visibility IN ('PRIVATE','UNLISTED','PUBLIC'));
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_current_version_fk" FOREIGN KEY (id, current_version_id) REFERENCES "learning_test_versions" (test_id, id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_test_drafts" ADD CONSTRAINT "learning_test_drafts_schema_ck" CHECK (schema_version > 0);
ALTER TABLE "learning_test_drafts" ADD CONSTRAINT "learning_test_drafts_level_ck" CHECK (english_level IS NULL OR english_level IN ('A1','A2','B1','B2','C1','C2'));
ALTER TABLE "learning_test_versions" ADD CONSTRAINT "learning_test_versions_schema_ck" CHECK (schema_version > 0);
ALTER TABLE "learning_test_versions" ADD CONSTRAINT "learning_test_versions_level_ck" CHECK (english_level IS NULL OR english_level IN ('A1','A2','B1','B2','C1','C2'));
ALTER TABLE "learning_test_drafts" ADD CONSTRAINT "learning_test_draft_revision_ck" CHECK (revision >= 0);
ALTER TABLE "learning_test_versions" ADD CONSTRAINT "learning_test_version_number_ck" CHECK (version_number > 0);
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_current_version_fk" FOREIGN KEY (id, current_version_id) REFERENCES "learning_topic_versions" (topic_id, id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_topic_drafts" ADD CONSTRAINT "learning_topic_drafts_schema_ck" CHECK (schema_version > 0);
ALTER TABLE "learning_topic_drafts" ADD CONSTRAINT "learning_topic_drafts_level_ck" CHECK (english_level IS NULL OR english_level IN ('A1','A2','B1','B2','C1','C2'));
ALTER TABLE "learning_topic_versions" ADD CONSTRAINT "learning_topic_versions_schema_ck" CHECK (schema_version > 0);
ALTER TABLE "learning_topic_versions" ADD CONSTRAINT "learning_topic_versions_level_ck" CHECK (english_level IS NULL OR english_level IN ('A1','A2','B1','B2','C1','C2'));
ALTER TABLE "learning_topic_drafts" ADD CONSTRAINT "learning_topic_draft_revision_ck" CHECK (revision >= 0);
ALTER TABLE "learning_topic_versions" ADD CONSTRAINT "learning_topic_version_number_ck" CHECK (version_number > 0);
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_embedding_ck" CHECK ((topic_id IS NULL) = (visibility IS NOT NULL));
ALTER TABLE "learning_tests" ADD CONSTRAINT "learning_tests_topic_owner_fk" FOREIGN KEY (topic_id, owner_user_id) REFERENCES "learning_topics" (id, owner_user_id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_topic_draft_exercises" ADD CONSTRAINT "learning_draft_membership_fk" FOREIGN KEY (topic_id, test_id) REFERENCES "learning_tests" (topic_id, id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_topic_version_exercises" ADD CONSTRAINT "learning_topic_exercise_version_fk" FOREIGN KEY (test_id, test_version_id) REFERENCES "learning_test_versions" (test_id, id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_test_openings" ADD CONSTRAINT "learning_test_openings_version_membership_fk" FOREIGN KEY (test_id, test_version_id) REFERENCES "learning_test_versions" (test_id, id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_test_attempts_version_membership_fk" FOREIGN KEY (test_id, test_version_id) REFERENCES "learning_test_versions" (test_id, id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE learning_test_openings ADD CONSTRAINT learning_opening_identity_unique UNIQUE (id, test_id, test_version_id);
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_attempt_opening_version_fk" FOREIGN KEY (opening_id, test_id, test_version_id) REFERENCES "learning_test_openings" (id, test_id, test_version_id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_attempt_opening_principal_fk" FOREIGN KEY (opening_id, principal_kind, principal_key) REFERENCES "learning_test_openings" (id, principal_kind, principal_key) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_test_lineage" ADD CONSTRAINT "learning_lineage_parent_root_fk" FOREIGN KEY (parent_id, root_id) REFERENCES "learning_test_lineage" (id, root_id) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "learning_test_lineage" ADD CONSTRAINT "learning_lineage_root_ck" CHECK (tree_revision >= 0 AND ((parent_id IS NULL AND root_id = id) OR (parent_id IS NOT NULL AND parent_id <> id AND root_id <> id)));
ALTER TABLE "learning_test_draft_questions" ADD CONSTRAINT "learning_test_draft_questions_kind_ck" CHECK (kind IN ('SINGLE_CHOICE','MULTIPLE_CHOICE','TEXT','GAPS','MATCHING'));
ALTER TABLE "learning_test_version_questions" ADD CONSTRAINT "learning_test_version_questions_kind_ck" CHECK (kind IN ('SINGLE_CHOICE','MULTIPLE_CHOICE','TEXT','GAPS','MATCHING'));
ALTER TABLE "learning_test_draft_groups" ADD CONSTRAINT "learning_test_draft_groups_position_ck" CHECK (position >= 0);
ALTER TABLE "learning_test_draft_questions" ADD CONSTRAINT "learning_test_draft_questions_position_ck" CHECK (position >= 0);
ALTER TABLE "learning_test_version_groups" ADD CONSTRAINT "learning_test_version_groups_position_ck" CHECK (position >= 0);
ALTER TABLE "learning_test_version_questions" ADD CONSTRAINT "learning_test_version_questions_position_ck" CHECK (position >= 0);
ALTER TABLE "learning_topic_draft_exercises" ADD CONSTRAINT "learning_topic_draft_exercises_position_ck" CHECK (position >= 0);
ALTER TABLE "learning_topic_version_exercises" ADD CONSTRAINT "learning_topic_version_exercises_position_ck" CHECK (position >= 0);
ALTER TABLE "learning_test_versions" ADD CONSTRAINT "learning_test_version_points_ck" CHECK (scoring_version > 0 AND max_points > 0);
ALTER TABLE "learning_test_version_questions" ADD CONSTRAINT "learning_version_question_points_ck" CHECK (max_points > 0);
ALTER TABLE "learning_test_openings" ADD CONSTRAINT "learning_opening_principal_ck" CHECK ((principal_kind = 'USER' AND guest_secret_hash IS NULL AND (user_id IS NOT NULL OR revoked_at IS NOT NULL)) OR (principal_kind = 'GUEST' AND user_id IS NULL AND guest_secret_hash IS NOT NULL));
ALTER TABLE "learning_test_openings" ADD CONSTRAINT "learning_opening_expiry_ck" CHECK (expires_at = created_at + interval '24 hours');
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_attempt_principal_ck" CHECK ((principal_kind = 'USER' AND guest_result_secret_hash IS NULL AND (user_id IS NOT NULL OR erased_at IS NOT NULL)) OR (principal_kind = 'GUEST' AND user_id IS NULL AND guest_result_secret_hash IS NOT NULL));
ALTER TABLE "learning_test_attempts" ADD CONSTRAINT "learning_attempt_expiry_ck" CHECK ((principal_kind = 'USER' AND expires_at = submitted_at + interval '3 days') OR (principal_kind = 'GUEST' AND expires_at = submitted_at + interval '24 hours'));
ALTER TABLE "learning_operation_receipts" ADD CONSTRAINT "learning_receipt_expiry_ck" CHECK (expires_at = created_at + interval '12 hours');
ALTER TABLE "learning_media_assets" ADD CONSTRAINT "learning_asset_ck" CHECK (state IN ('UPLOADING','READY','DELETING') AND mime_type IN ('image/jpeg','image/png','image/webp') AND byte_size > 0 AND byte_size <= 5242880 AND width BETWEEN 1 AND 4096 AND height BETWEEN 1 AND 4096 AND width::bigint * height::bigint <= 16000000);
ALTER TABLE "learning_media_uses" ADD CONSTRAINT "learning_asset_one_parent_ck" CHECK (num_nonnulls(test_draft_id, test_version_id, topic_draft_id, topic_version_id) = 1);
ALTER TABLE "platform_role_assignments" ADD CONSTRAINT "platform_role_ck" CHECK (role IN ('MODERATOR','SENIOR_MODERATOR','PLATFORM_ADMIN') AND revision >= 0);
ALTER TABLE "platform_bootstrap" ADD CONSTRAINT "platform_bootstrap_singleton_ck" CHECK (key = 'FIRST_PLATFORM_ADMIN');
ALTER TABLE "learning_moderation_cases" ADD CONSTRAINT "learning_case_scope_ck" CHECK ((scope IN ('TEST','TEST_LINEAGE') AND root_lineage_id IS NOT NULL AND topic_id IS NULL) OR (scope = 'TOPIC' AND topic_id IS NOT NULL AND root_lineage_id IS NULL));
ALTER TABLE "learning_moderation_cases" ADD CONSTRAINT "learning_case_state_ck" CHECK ((state = 'OPEN' AND closed_at IS NULL) OR (state = 'CLOSED' AND closed_at IS NOT NULL));
ALTER TABLE "learning_moderation_evidence" ADD CONSTRAINT "learning_evidence_one_version_ck" CHECK (num_nonnulls(test_version_id, topic_version_id) = 1);
CREATE INDEX learning_tests_public_catalog_idx ON learning_tests (published_at DESC, id) WHERE visibility = 'PUBLIC' AND current_version_id IS NOT NULL AND deleted_at IS NULL AND topic_id IS NULL;
CREATE INDEX learning_topics_public_catalog_idx ON learning_topics (published_at DESC, id) WHERE visibility = 'PUBLIC' AND current_version_id IS NOT NULL AND deleted_at IS NULL;
COMMIT;
