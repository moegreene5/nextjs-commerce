export const productSegments = {
  comingSoon: "LBAFBCEbnHAB0zmNCFUY",
  newArrivals: "Oozlq3Ubuk4vNXbAT2HY",
  bestSellers: "ts7fbbfTM1wDkf6eG4n2",
};

export type Segment = keyof typeof productSegments;

export const FREE_SHIPPING_THRESHOLD = 100_000;
