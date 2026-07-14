import type {
  CampaignDraft,
  CampaignFilterState,
  MarketingCampaign,
  MemberAtRisk,
} from "./types";

export function createCampaignDraft(segment = ""): CampaignDraft {
  return {
    name: "",
    channel: "email",
    segment,
    content: "",
  };
}

export function filterMarketingCampaigns(
  campaigns: MarketingCampaign[],
  filters: CampaignFilterState,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return campaigns.filter((campaign) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [campaign.name, campaign.segment, campaign.channel]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesChannel = filters.channel === "all" || campaign.channel === filters.channel;
    const matchesStatus = filters.status === "all" || campaign.status === filters.status;

    return matchesQuery && matchesChannel && matchesStatus;
  });
}

export function toggleCampaignStatus(campaigns: MarketingCampaign[], campaignId: string) {
  return campaigns.map((campaign) => {
    if (campaign.id !== campaignId) {
      return campaign;
    }

    if (campaign.status === "active") {
      return { ...campaign, status: "paused" as const };
    }

    if (campaign.status === "paused") {
      return { ...campaign, status: "active" as const };
    }

    return campaign;
  });
}

export function addDemoCampaign(campaigns: MarketingCampaign[], draft: CampaignDraft) {
  const createdCampaign: MarketingCampaign = {
    id: `cmp-demo-${campaigns.length + 1}`,
    name: draft.name,
    channel: draft.channel,
    status: "draft",
    segment: draft.segment || "Todos los miembros",
    sent: 0,
    openRate: 0,
    clickRate: 0,
    conversion: 0,
    sparkline: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  return [createdCampaign, ...campaigns];
}

export function markMemberContacted(members: MemberAtRisk[], memberId: string) {
  const updatedMembers = members.map((member) =>
    member.id === memberId ? { ...member, contacted: true } : member,
  );

  return {
    members: updatedMembers,
    contactedCount: updatedMembers.filter((member) => member.contacted).length,
    totalCount: updatedMembers.length,
  };
}
