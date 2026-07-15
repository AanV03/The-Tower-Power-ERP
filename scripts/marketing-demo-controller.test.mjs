import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createCampaignDraft,
  filterMarketingCampaigns,
  markMemberContacted,
  toggleCampaignStatus,
} from "../app/[locale]/(dashboard)/marketing/components/demo-controller.ts";

const campaigns = [
  {
    id: "cmp-1",
    name: "Renovacion anual",
    channel: "email",
    status: "active",
    segment: "Activos",
    sent: 1200,
    openRate: 63,
    clickRate: 21,
    conversion: 8,
    sparkline: [20, 32, 44],
  },
  {
    id: "cmp-2",
    name: "Recuperacion inactivos",
    channel: "sms",
    status: "paused",
    segment: "Inactivos 21d",
    sent: 300,
    openRate: 0,
    clickRate: 18,
    conversion: 5,
    sparkline: [12, 16, 22],
  },
];

const members = [
  {
    id: "member-1",
    name: "Ana Lopez",
    plan: "Mensual",
    lastVisit: "hace 24 dias",
    daysInactive: 24,
    churnScore: 86,
    risk: "high",
    contacted: false,
  },
  {
    id: "member-2",
    name: "Luis Perez",
    plan: "Anual",
    lastVisit: "hace 8 dias",
    daysInactive: 8,
    churnScore: 32,
    risk: "low",
    contacted: true,
  },
];

test("filters campaigns by query, status and channel without mutating the source", () => {
  const result = filterMarketingCampaigns(campaigns, {
    query: "inactivos",
    status: "paused",
    channel: "sms",
  });

  assert.deepEqual(result.map((campaign) => campaign.id), ["cmp-2"]);
  assert.equal(campaigns.length, 2);
});

test("toggleCampaignStatus only toggles active and paused campaigns", () => {
  const paused = toggleCampaignStatus(campaigns, "cmp-1");
  const active = toggleCampaignStatus(campaigns, "cmp-2");

  assert.equal(paused.find((campaign) => campaign.id === "cmp-1")?.status, "paused");
  assert.equal(active.find((campaign) => campaign.id === "cmp-2")?.status, "active");
  assert.equal(campaigns[0].status, "active");
});

test("markMemberContacted updates one member and returns intervention progress", () => {
  const result = markMemberContacted(members, "member-1");

  assert.equal(result.members[0].contacted, true);
  assert.equal(result.contactedCount, 2);
  assert.equal(result.totalCount, 2);
  assert.equal(members[0].contacted, false);
});

test("createCampaignDraft uses a selected audience segment as default context", () => {
  const draft = createCampaignDraft("Inactivos 21d");

  assert.equal(draft.segment, "Inactivos 21d");
  assert.equal(draft.channel, "email");
  assert.equal(draft.name, "");
});
