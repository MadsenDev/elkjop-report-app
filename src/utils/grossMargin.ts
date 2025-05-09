export function calculateGrossMargin(costPrice: number, newPrice: number): {
    gm: number;
    gmPercent: number;
  } {
    const priceExVat = newPrice / 1.25;
    const gm = priceExVat - costPrice;
    const gmPercent = (gm / (gm + costPrice)) * 100;
    return {
      gm: parseFloat(gm.toFixed(2)),
      gmPercent: parseFloat(gmPercent.toFixed(2))
    };
  }