export const cosineSimilarity = (
  vecA: number[],
  vecB: number[],
  precision: number = 6,
): number => {
  const len = vecA.length;
  if (len !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  // Handle zero-length vectors
  if (len === 0) {
    return 0; // Or 1.0 depending on convention. Returning 0 matches original behavior for zero magnitudes.
  }

  let dotProduct = 0;
  let sumSqA = 0;
  let sumSqB = 0;

  // Single pass to calculate dot product and sum of squares
  for (let i = 0; i < len; i++) {
    const a = vecA[i]!;
    const b = vecB[i]!; // No need for undefined check due to length check above
    dotProduct += a * b;
    sumSqA += a * a;
    sumSqB += b * b;
  }

  // Check for zero magnitude vectors AFTER the loop
  // This avoids unnecessary Math.sqrt calls if a vector is all zeros
  if (sumSqA === 0 || sumSqB === 0) {
    return 0;
  }

  const magnitudeA = Math.sqrt(sumSqA);
  const magnitudeB = Math.sqrt(sumSqB);

  const similarity = dotProduct / (magnitudeA * magnitudeB);

  // Apply precision numerically (generally faster than toFixed/parseFloat)
  const factor = Math.pow(10, precision);
  return Math.round(similarity * factor) / factor;
};
