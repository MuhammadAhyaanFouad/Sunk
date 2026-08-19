import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Sunk's refund policy for Premium subscriptions — full refunds within the first 7 days.",
};

const sections = [
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          You are eligible for a full refund of your Sunk Premium subscription
          if you request one within 7 days (168 hours) of the original purchase
          date. Refunds are issued at the original payment method.
        </p>
      </div>
    ),
  },
  {
    id: "how-to-request",
    title: "How to request a refund",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>To request a refund, contact us at </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Email: support@sunk.app</li>
          <li>In-app: Settings → Billing → Contact support</li>
        </ul>
        <p>
          Please include your account email and the transaction details. We will
          process your request within 5–10 business days and notify you by email
          once the refund is issued.
        </p>
      </div>
    ),
  },
  {
    id: "exceptions",
    title: "Exceptions",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          Refunds are not available for partial-month subscriptions, add-ons
          purchased through third-party stores (e.g., Apple App Store, Google
          Play), or any amount under $1. Requests made more than 7 days after
          purchase are not eligible for a refund, but we are always happy to
          help if you reach out.
        </p>
      </div>
    ),
  },
  {
    id: "free-trial",
    title: "Free trial",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          If you signed up via a free trial, you will not be charged if you
          cancel before the trial ends. If you are charged, our standard 7-day
          refund policy applies.
        </p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          We may update this Refund Policy from time to time. Changes apply to
          purchases made after the policy update takes effect. The version
          posted here is the current policy.
        </p>
      </div>
    ),
  },
];

export default function RefundPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      lastUpdated="August 2026"
      sections={sections}
    />
  );
}
