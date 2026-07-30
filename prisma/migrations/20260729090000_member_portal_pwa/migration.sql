CREATE TYPE "ClassBookingStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'ATTENDED',
  'CANCELLED'
);

ALTER TABLE "tenants" ADD COLUMN "slug" TEXT;

UPDATE "tenants"
SET "slug" = 'tenant-' || lower(regexp_replace("id", '[^a-zA-Z0-9]', '', 'g'))
WHERE "slug" IS NULL;

ALTER TABLE "tenants" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "tenant_memberships" ADD COLUMN "memberId" TEXT;

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "members_tenantId_id_key" ON "members"("tenantId", "id");
CREATE UNIQUE INDEX "tenant_memberships_tenantId_memberId_key"
  ON "tenant_memberships"("tenantId", "memberId");

ALTER TABLE "members" DROP CONSTRAINT "members_branchId_fkey";

ALTER TABLE "members"
  ADD CONSTRAINT "members_tenantId_branchId_fkey"
  FOREIGN KEY ("tenantId", "branchId")
  REFERENCES "branches"("tenantId", "id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "tenant_memberships"
  ADD CONSTRAINT "tenant_memberships_tenantId_memberId_fkey"
  FOREIGN KEY ("tenantId", "memberId")
  REFERENCES "members"("tenantId", "id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

CREATE TABLE "workout_plans" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "schedule" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workout_plan_exercises" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "workoutPlanId" TEXT NOT NULL,
  "exerciseName" TEXT NOT NULL,
  "series" INTEGER NOT NULL,
  "reps" TEXT NOT NULL,
  "weight" TEXT,
  "restSeconds" INTEGER,
  "notes" TEXT,
  CONSTRAINT "workout_plan_exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "class_sessions" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "trainer" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "class_sessions_capacity_check" CHECK ("capacity" > 0),
  CONSTRAINT "class_sessions_time_check" CHECK ("endTime" > "startTime")
);

CREATE TABLE "class_bookings" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "classSessionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "status" "ClassBookingStatus" NOT NULL DEFAULT 'CONFIRMED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "class_bookings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "member_portal_settings" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
  "reminders" BOOLEAN NOT NULL DEFAULT true,
  "darkMode" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "member_portal_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workout_plans_tenantId_id_key"
  ON "workout_plans"("tenantId", "id");
CREATE INDEX "workout_plans_tenantId_memberId_idx"
  ON "workout_plans"("tenantId", "memberId");
CREATE INDEX "workout_plan_exercises_tenantId_workoutPlanId_idx"
  ON "workout_plan_exercises"("tenantId", "workoutPlanId");
CREATE UNIQUE INDEX "class_sessions_tenantId_id_key"
  ON "class_sessions"("tenantId", "id");
CREATE INDEX "class_sessions_tenantId_branchId_startTime_idx"
  ON "class_sessions"("tenantId", "branchId", "startTime");
CREATE UNIQUE INDEX "class_bookings_tenantId_classSessionId_memberId_key"
  ON "class_bookings"("tenantId", "classSessionId", "memberId");
CREATE INDEX "class_bookings_tenantId_memberId_status_idx"
  ON "class_bookings"("tenantId", "memberId", "status");
CREATE UNIQUE INDEX "member_portal_settings_tenantId_membershipId_key"
  ON "member_portal_settings"("tenantId", "membershipId");
CREATE INDEX "member_portal_settings_tenantId_membershipId_idx"
  ON "member_portal_settings"("tenantId", "membershipId");

ALTER TABLE "workout_plans"
  ADD CONSTRAINT "workout_plans_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workout_plans"
  ADD CONSTRAINT "workout_plans_tenantId_memberId_fkey"
  FOREIGN KEY ("tenantId", "memberId") REFERENCES "members"("tenantId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workout_plan_exercises"
  ADD CONSTRAINT "workout_plan_exercises_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workout_plan_exercises"
  ADD CONSTRAINT "workout_plan_exercises_tenantId_workoutPlanId_fkey"
  FOREIGN KEY ("tenantId", "workoutPlanId")
  REFERENCES "workout_plans"("tenantId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_sessions"
  ADD CONSTRAINT "class_sessions_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "class_sessions"
  ADD CONSTRAINT "class_sessions_tenantId_branchId_fkey"
  FOREIGN KEY ("tenantId", "branchId") REFERENCES "branches"("tenantId", "id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "class_bookings"
  ADD CONSTRAINT "class_bookings_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "class_bookings"
  ADD CONSTRAINT "class_bookings_tenantId_classSessionId_fkey"
  FOREIGN KEY ("tenantId", "classSessionId")
  REFERENCES "class_sessions"("tenantId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "class_bookings"
  ADD CONSTRAINT "class_bookings_tenantId_memberId_fkey"
  FOREIGN KEY ("tenantId", "memberId") REFERENCES "members"("tenantId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "member_portal_settings"
  ADD CONSTRAINT "member_portal_settings_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_portal_settings"
  ADD CONSTRAINT "member_portal_settings_tenantId_membershipId_fkey"
  FOREIGN KEY ("tenantId", "membershipId")
  REFERENCES "tenant_memberships"("tenantId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE;
