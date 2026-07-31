/**
 * mockStorage.js - Helper lưu trữ dữ liệu mock vào localStorage để tránh mất dữ liệu khi F5
 */

export const getMockData = (key, defaultData) => {
  try {
    const data = localStorage.getItem(`mock_db_${key}`);
    if (!data) {
      localStorage.setItem(`mock_db_${key}`, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(data);
    if (key === "slots" && Array.isArray(parsed) && parsed.length < 50) {
      localStorage.setItem(`mock_db_${key}`, JSON.stringify(defaultData));
      return defaultData;
    }
    return parsed;
  } catch (error) {
    console.error(`Error reading mock data for key "${key}":`, error);
    return defaultData;
  }
};

export const saveMockData = (key, data) => {
  try {
    localStorage.setItem(`mock_db_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing mock data for key "${key}":`, error);
  }
};

export const clearMockStorage = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("mock_db_"))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Error clearing mock storage:", error);
  }
};
