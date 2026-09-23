ALTER TABLE "match_sessions"
ADD COLUMN "penaltyCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "match_session_attempts" (
  "sessionId" TEXT NOT NULL,
  "attemptId" UUID NOT NULL,
  "payloadHash" VARCHAR(64) NOT NULL,
  "isCorrect" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "match_session_attempts_pkey" PRIMARY KEY ("sessionId", "attemptId"),
  CONSTRAINT "match_session_attempts_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "match_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
