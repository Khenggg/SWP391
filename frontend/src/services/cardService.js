import { MOCK_CARDS } from "../constants/mockData";

const STORAGE_KEY = "parking_cards";

const initializeCards = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Lỗi phân tích cú pháp danh sách thẻ", e);
    }
  }
  // Khởi tạo dữ liệu mẫu nếu chưa có
  const seed = MOCK_CARDS.map(c => ({ ...c }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
};

export const cardService = {
  getCards: () => {
    return initializeCards();
  },
  
  getCardByCode: (code) => {
    const cards = initializeCards();
    return cards.find(c => c.code.trim().toUpperCase() === code.trim().toUpperCase()) || null;
  },

  addCard: (code, note = "") => {
    const cards = initializeCards();
    if (cards.some(c => c.code.trim().toUpperCase() === code.trim().toUpperCase())) {
      throw new Error("Mã thẻ này đã tồn tại trên hệ thống!");
    }
    const newCard = {
      id: Date.now(),
      code: code.trim(),
      status: "AVAILABLE",
      note,
      updatedAt: new Date().toISOString(),
      activeSession: null
    };
    const updated = [...cards, newCard];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCard;
  },

  updateCardStatus: (cardId, newStatus) => {
    const cards = initializeCards();
    const index = cards.findIndex(c => c.id === cardId);
    if (index === -1) {
      throw new Error("Không tìm thấy thẻ cần cập nhật!");
    }
    
    if (cards[index].status === "IN_USE" && newStatus !== "IN_USE") {
      throw new Error("Không thể cập nhật trạng thái của thẻ đang sử dụng!");
    }

    cards[index].status = newStatus;
    cards[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return cards[index];
  },

  updateCardSession: (code, activeSession) => {
    const cards = initializeCards();
    const index = cards.findIndex(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (index !== -1) {
      cards[index].activeSession = activeSession;
      cards[index].status = activeSession ? "IN_USE" : "AVAILABLE";
      cards[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }
};
