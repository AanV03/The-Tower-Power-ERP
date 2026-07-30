import mongoose, { Schema } from "mongoose";

const actorSchema = new Schema(
  {
    type: { type: String, required: true },
    id: { type: String, required: true },
    email: { type: String },
    role: { type: String },
  },
  { _id: false },
);

const entityRefSchema = new Schema(
  {
    type: { type: String, required: true },
    id: { type: String, required: true },
  },
  { _id: false },
);

const scopeSchema = new Schema(
  {
    type: { type: String, required: true },
    branchId: { type: String },
  },
  { _id: false },
);

const periodSchema = new Schema(
  {
    granularity: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false },
);

const auditEventSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String },
    actor: { type: actorSchema, required: true },
    action: { type: String, required: true },
    entity: { type: entityRefSchema, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    idempotencyKey: { type: String },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { collection: "audit_events" },
);

auditEventSchema.index({ tenantId: 1, createdAt: -1 });
auditEventSchema.index({ tenantId: 1, "entity.type": 1, "entity.id": 1 });
auditEventSchema.index({ tenantId: 1, action: 1 });
auditEventSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

const tenantBrandingConfigSchema = new Schema(
  {
    tenantId: { type: String, required: true, unique: true },
    version: { type: Number, required: true, default: 1 },
    domain: {
      customDomain: { type: String },
      verified: { type: Boolean, default: false },
    },
    theme: { type: Schema.Types.Mixed, required: true },
    modules: { type: Schema.Types.Mixed, required: true },
    legal: { type: Schema.Types.Mixed },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "tenant_branding_configs" },
);

tenantBrandingConfigSchema.index(
  { "domain.customDomain": 1 },
  { unique: true, sparse: true },
);

const crmProfileSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    memberId: { type: String },
    leadId: { type: String },
    lifecycleStage: { type: String, required: true },
    segments: [{ type: String }],
    scores: { type: Schema.Types.Mixed },
    preferences: { type: Schema.Types.Mixed },
    lastActivity: { type: Schema.Types.Mixed },
    campaignHistory: [{ type: Schema.Types.Mixed }],
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "crm_profiles" },
);

crmProfileSchema.index({ tenantId: 1, memberId: 1 }, { unique: true, sparse: true });
crmProfileSchema.index({ tenantId: 1, lifecycleStage: 1 });
crmProfileSchema.index({ tenantId: 1, segments: 1 });
crmProfileSchema.index({ tenantId: 1, "scores.churnRisk": -1 });

const accessTelemetryEventSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, required: true },
    deviceId: { type: String, required: true },
    memberId: { type: String },
    eventType: { type: String, required: true },
    method: { type: String, required: true },
    latencyMs: { type: Number },
    decision: {
      allowed: { type: Boolean, required: true },
      reason: { type: String },
    },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { collection: "access_telemetry_events" },
);

accessTelemetryEventSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
accessTelemetryEventSchema.index({ tenantId: 1, memberId: 1, createdAt: -1 });
accessTelemetryEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

const analyticsSnapshotSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    scope: { type: scopeSchema, required: true },
    period: { type: periodSchema, required: true },
    metrics: { type: Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { collection: "analytics_snapshots" },
);

analyticsSnapshotSchema.index({ tenantId: 1, "period.date": -1 });
analyticsSnapshotSchema.index({ tenantId: 1, "scope.branchId": 1, "period.date": -1 });
analyticsSnapshotSchema.index(
  { tenantId: 1, "scope.type": 1, "scope.branchId": 1, "period.granularity": 1, "period.date": 1 },
  { unique: true },
);

const integrationEventLogSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    externalEventId: { type: String, required: true },
    eventType: { type: String, required: true },
    status: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    receivedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { collection: "integration_event_logs" },
);

integrationEventLogSchema.index(
  { tenantId: 1, provider: 1, externalEventId: 1 },
  { unique: true },
);
integrationEventLogSchema.index({ tenantId: 1, receivedAt: -1 });

const maintenanceTicketSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    assetId: { type: String },
    assetName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
      default: "OPEN",
    },
    priority: {
      type: String,
      required: true,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    reportedByUserId: { type: String, required: true },
    assignedToUserId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    resolvedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "maintenance_tickets" },
);

maintenanceTicketSchema.index({ tenantId: 1, branchId: 1, status: 1, priority: 1 });
maintenanceTicketSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
maintenanceTicketSchema.index({ tenantId: 1, assetId: 1, createdAt: -1 });

const memberMeasurementSchema = new Schema(
  {
    measuredAt: { type: Date, required: true },
    weight: { type: Number },
    bodyFat: { type: Number },
    muscleMass: { type: Number },
  },
  { _id: false },
);

const memberProgressSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    measurements: { type: [memberMeasurementSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "member_progress" },
);

memberProgressSchema.index({ tenantId: 1, memberId: 1 }, { unique: true });

const memberPointsLedgerSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    memberId: { type: String, required: true, index: true },
    sourceEventId: { type: String },
    points: { type: Number, required: true, min: -10_000, max: 10_000 },
    reason: { type: String, required: true },
    occurredAt: { type: Date, default: Date.now, immutable: true },
  },
  { collection: "member_points_ledger" },
);

memberPointsLedgerSchema.index({ tenantId: 1, memberId: 1, occurredAt: -1 });
memberPointsLedgerSchema.index(
  { tenantId: 1, sourceEventId: 1 },
  { unique: true, sparse: true },
);

const memberGroupSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    memberIds: { type: [String], default: [] },
    createdByMemberId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "member_groups" },
);

memberGroupSchema.index({ tenantId: 1, name: 1 }, { unique: true });
memberGroupSchema.index({ tenantId: 1, memberIds: 1 });

export const AuditEvent =
  mongoose.models.AuditEvent ?? mongoose.model("AuditEvent", auditEventSchema);

export const TenantBrandingConfig =
  mongoose.models.TenantBrandingConfig ??
  mongoose.model("TenantBrandingConfig", tenantBrandingConfigSchema);

export const CrmProfile =
  mongoose.models.CrmProfile ?? mongoose.model("CrmProfile", crmProfileSchema);

export const AccessTelemetryEvent =
  mongoose.models.AccessTelemetryEvent ??
  mongoose.model("AccessTelemetryEvent", accessTelemetryEventSchema);

export const AnalyticsSnapshot =
  mongoose.models.AnalyticsSnapshot ??
  mongoose.model("AnalyticsSnapshot", analyticsSnapshotSchema);

export const IntegrationEventLog =
  mongoose.models.IntegrationEventLog ??
  mongoose.model("IntegrationEventLog", integrationEventLogSchema);

export const MaintenanceTicket =
  mongoose.models.MaintenanceTicket ??
  mongoose.model("MaintenanceTicket", maintenanceTicketSchema);

export const MemberProgress =
  mongoose.models.MemberProgress ??
  mongoose.model("MemberProgress", memberProgressSchema);

export const MemberPointsLedger =
  mongoose.models.MemberPointsLedger ??
  mongoose.model("MemberPointsLedger", memberPointsLedgerSchema);

export const MemberGroup =
  mongoose.models.MemberGroup ??
  mongoose.model("MemberGroup", memberGroupSchema);
