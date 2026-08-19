import type { Metadata } from "next";
import { PolicyPage, PolicyLink } from "@/components/PolicyPage";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of Sunk — how we provide the service and what's expected of you.",
};

const sections = [
  {
    id: "agreement",
    title: "Agreement to terms",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          These Terms of Service ("Terms") form a legal agreement between you
          and {BRAND.name}, Inc. ("Sunk," "we," or "us") for your access to and
          use of the Sunk app, website, and related services (the "Service").
          By creating an account or using the Service, you agree to these Terms.
          If you do not agree, do not use the Service.
        </p>
      </div>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          You must be at least 13 years old to use the Service. If you are under
          18, you represent that you have a parent or guardian who has reviewed
          and agreed to these Terms on your behalf.
        </p>
      </div>
    ),
  },
  {
    id: "account",
    title: "Your account",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          You are responsible for keeping your account password secure and for
          all activity that occurs under your account. You must notify us
          immediately of any unauthorized use. We are not liable for any loss
          caused by your failure to protect your password.
        </p>
      </div>
    ),
  },
  {
    id: "permitted-use",
    title: "Permitted use",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Access or attempt to access another user's data without permission.</li>
          <li>Use the Service to import data you do not have authorization to access.</li>
          <li>Reverse engineer, scrape, or abuse the Service.</li>
          <li>Use the Service for any unlawful purpose.</li>
        </ul>
        <p>
          The Service is a personal finance tool. Do not rely on it for
          financial, investment, or tax advice.
        </p>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "Third-party platforms & data",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          Sunk integrates with gaming platforms (Steam, Xbox, PlayStation,
          Roblox, Epic, etc.) and reads your purchase history via their
          official APIs. We are not responsible for the availability, accuracy,
          or content of third-party platforms. Your use of those platforms is
          governed by their own terms.
        </p>
      </div>
    ),
  },
  {
    id: "paid-services",
    title: "Paid services & billing",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          Some features require a paid subscription ({BRAND.name} Premium). By
          subscribing, you authorize us to charge the payment method you
          provide. Subscriptions renew automatically until canceled. See our{" "}
          <PolicyLink href="/refund">Refund Policy</PolicyLink> for refund
          terms.
        </p>
      </div>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          The Service is provided "as is" and "as available" without warranties
          of any kind. We do not guarantee that the Service will be uninterrupted
          or error-free, nor do we warrant that your data will be preserved
          indefinitely. We are not liable for any indirect, incidental, special,
          or consequential damages.
        </p>
      </div>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          We may suspend or terminate your access to the Service at any time,
          with or without cause or notice. Upon termination, your license to
          use the Service ends, but these Terms remain in effect.
        </p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          We may update these Terms from time to time. We'll post the updated
          version here and update the "Last updated" date. Your continued use of
          the Service after changes means you accept the new terms.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-muted">
        <p>
          Questions? Email us at{" "}
          <a
            href="mailto:legal@sunk.app"
            className="text-primary underline underline-offset-2"
          >
            legal@sunk.app
          </a>
          .
        </p>
      </div>
    ),
  },
];

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      lastUpdated="August 2026"
      sections={sections}
    />
  );
}
