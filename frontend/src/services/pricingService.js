import { MOCK_PRICING_RULES } from "../constants/mockData";

const STORAGE_KEY = "parking_pricing_rules";

const initializeRules = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Lỗi phân tích cú pháp biểu phí", e);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PRICING_RULES));
  return MOCK_PRICING_RULES;
};

export const pricingService = {
  getPricingRules: () => {
    return initializeRules();
  },

  updatePricingRule: (ruleId, updatedData) => {
    const rules = initializeRules();
    const index = rules.findIndex(r => r.id === ruleId);
    if (index === -1) {
      throw new Error("Không tìm thấy cấu hình giá tương ứng!");
    }
    rules[index] = {
      ...rules[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    return rules[index];
  },

  addPricingRule: (ruleData) => {
    const rules = initializeRules();
    const newRule = {
      id: Date.now(),
      ...ruleData,
      updatedAt: new Date().toISOString()
    };
    const updated = [...rules, newRule];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRule;
  },

  savePricingRules: (rules) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  }
};
