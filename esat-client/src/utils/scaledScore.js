// esat-client/src/utils/scaledScore.js

// 根据 examId/source 返回对应的表
export function getScaledScore(raw, examSource) {
  // 其他卷的查表...
  // 默认线性
  return Math.max(1, Math.min(9, raw));
}
