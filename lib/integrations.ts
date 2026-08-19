export type Integration = {
  id: string;
  name: string;
  /** One-line description injected into the AI system prompt for context. */
  blurb: string;
  /** Simple Icons slug, used for the logo: https://cdn.simpleicons.org/{slug} */
  slug: string;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    blurb: "Stripe - payments, checkout, and subscription billing.",
    slug: "stripe",
  },
  {
    id: "shopify",
    name: "Shopify",
    blurb: "Shopify - ecommerce storefront, products, and order management.",
    slug: "shopify",
  },
  {
    id: "gmail",
    name: "Gmail",
    blurb: "Gmail - transactional email and inbox automation.",
    slug: "gmail",
  },
  {
    id: "slack",
    name: "Slack",
    blurb: "Slack - team notifications and workflow alerts.",
    slug: "slack",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    blurb: "Google Sheets - lightweight data storage, logging, and reporting.",
    slug: "googlesheets",
  },
];

const INTEGRATIONS_BY_ID = new Map(INTEGRATIONS.map((i) => [i.id, i]));

/** Filters a list of ids down to known integrations, dropping anything unrecognized. */
export function resolveIntegrations(ids: string[]): Integration[] {
  const seen = new Set<string>();
  const resolved: Integration[] = [];
  for (const id of ids) {
    const integration = INTEGRATIONS_BY_ID.get(id);
    if (integration && !seen.has(id)) {
      seen.add(id);
      resolved.push(integration);
    }
  }
  return resolved;
}
