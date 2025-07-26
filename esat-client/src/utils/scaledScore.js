// esat-client/src/utils/scaledScore.js

// 2016 Section 1 Part A conversion table
const engaa2016s1a = [
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.5, 1.9, 2.3, 2.8, 3.2, 3.6, 4.0, 4.4, 4.9, 5.4, 5.9, 6.4, 7.0, 7.7, 8.4, 9.0, 9.0, 9.0, 9.0
];

// 2016 Section 1 Part B conversion table
const engaa2016s1b = [
  1.0, 1.0, 1.0, 1.0, 1.6, 2.3, 3.0, 3.5, 4.0, 4.5, 4.9, 5.3, 5.8, 6.2, 6.6, 7.0, 7.4, 7.9, 8.3, 8.8, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0
];

// 根据 examId/source 返回对应的表
export function getScaledScore(raw, examSource) {
  if (examSource === 'eng_2016_s1a') {
    return engaa2016s1a[raw] ?? 1.0;
  }
  if (examSource === 'eng_2016_s1b') {
    return engaa2016s1b[raw] ?? 1.0;
  }
  // 其他卷的查表...
  // 默认线性
  return Math.max(1, Math.min(9, raw));
}
