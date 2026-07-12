import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Security | Gerpy ERP",
  description: "Security practices for the Gerpy ERP platform.",
};

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="// TRUST"
      title="Security"
      updatedAt="July 11, 2026"
      intro="Gerpy ERP is designed for operational teams that depend on reliable access, controlled permissions, and accountable data handling."
      sections={[
        {
          title: "Access controls",
          copy: "The platform is built around authenticated access, role-aware workflows, branch scope, and administrative controls for managing team permissions.",
        },
        {
          title: "Data protection",
          copy: "We use reasonable technical and organizational safeguards to protect platform data from unauthorized access, alteration, disclosure, or destruction.",
        },
        {
          title: "Operational monitoring",
          copy: "System activity, errors, and security-relevant events may be monitored to maintain reliability, investigate issues, and protect customer workspaces.",
        },
        {
          title: "Vendor management",
          copy: "Service providers are selected for the operational functions they support, such as hosting, payments, messaging, analytics, and infrastructure security.",
        },
        {
          title: "Reporting issues",
          copy: "If you believe you have found a security issue, contact the Gerpy ERP team with enough detail to reproduce and investigate the report responsibly.",
        },
      ]}
    />
  );
}
