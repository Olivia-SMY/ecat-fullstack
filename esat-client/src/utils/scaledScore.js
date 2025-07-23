// raw score → scaled score 映射表
const rawToScaled = {
  0: 1.0, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2,
  5: 1.9, 6: 2.4, 7: 2.9, 8: 3.4, 9: 3.9,
  10: 4.3, 11: 4.8, 12: 5.3, 13: 5.7, 14: 6.3,
  15: 6.8, 16: 7.4, 17: 8.2, 18: 9.0, 19: 9.0, 20: 9.0,
};

/**
 * 将原始分数换算为标准分
 * @param {number} raw 原始得分（0-20）
 * @returns {number|null} 标准分
 */
export function getScaledScore(raw) {
  return rawToScaled[raw] ?? null;
}
