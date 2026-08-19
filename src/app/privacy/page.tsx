import type { Metadata } from "next";
import { PolicyPage, PolicyLink } from "@/components/PolicyPage";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Sunk collects, uses, and protects your data — and what we never touch.",
};

const sections = [
  {
    id: "info-we-collect",
    title: "Information we collect",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          When you connect a gaming platform, we receive read-only access to your
          purchase history, library, and basic account profile (such as your
          username and country). We do <strong>not</strong> receive or store
          your platform passwords, payment card details, or session credentials.
        </p>
        <p>
          We also collect the information you enter directly: your email address,
          profile name, and any purchases or goals you add manually.
        </p>
      </div>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>We use your data to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Aggregate and display your lifetime spend, library value, and insights.</li>
          <li>Generate personalized roasts, budgets, and Wrapped summaries.</li>
          <li>Improve our product, detect fraud, and communicate updates.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "data-storage-security",
    title: "Data storage & security",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          Your data is encrypted in transit (HTTPS) and at rest. It lives in a
          managed database with strict access controls and per-account row-level
          security (RLS), so your information is never visible to other users.
        </p>
        <p>
          We retain the minimum data needed to provide the service. You can
          export or delete your account at any time via{" "}
          <PolicyLink href="/app/settings">Settings</PolicyLink>.
        </p>
      </div>
    ),
  },
  {
    id: "sharing",
    title: "When we share data",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          We do not sell or rent your data. We may share anonymized, aggregated
          statistics (never tied to you personally) for benchmarking or research.
          We engage service providers (hosting, analytics) under confidentiality
          obligations and never allow them to use your data for their own
          marketing.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & tracking",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          We use essential cookies to keep you signed in and remember your
          preferences. Analytics cookies help us understand how the site is used.
          You can disable cookies in your browser, though this may limit
          functionality.
        </p>
      </div>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          You may request a copy of your data, correct inaccuracies, or delete
          your account at any time. Contact us at{" "}
          <a
            href="mailto:privacy@sunk.app"
            className="text-primary underline underline-offset-2"
          >
            privacy@sunk.app
          </a>
          . We will respond within 30 days. You also have the right to lodge a
          complaint with your local data-protection authority.
        </p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      lastUpdated="August 2026"
      sections={sections}
    />
  );
}
