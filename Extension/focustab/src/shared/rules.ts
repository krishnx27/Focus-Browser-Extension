export const RULE_ID_START = 1000;
export const RULE_ID_MAX = 1049;
export const MAX_DOMAINS = RULE_ID_MAX - RULE_ID_START + 1;

export function generateBlockRules(domains: string[]): chrome.declarativeNetRequest.Rule[] {
  return domains.slice(0, MAX_DOMAINS).map((domain, i) => ({
    id: RULE_ID_START + i,
    priority: 1,
    action: {
      type: 'redirect' as chrome.declarativeNetRequest.RuleActionType,
      redirect: { extensionPath: `/blocked.html?url=${encodeURIComponent(domain)}` },
    },
    condition: {
      requestDomains: [domain],
      resourceTypes: ['main_frame' as chrome.declarativeNetRequest.ResourceType],
    },
  }));
}

export function getAllFocusTabRuleIds(): number[] {
  const ids: number[] = [];
  for (let i = RULE_ID_START; i <= RULE_ID_MAX; i++) ids.push(i);
  return ids;
}
