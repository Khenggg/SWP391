export const exitMockData = {
  sessionCasual: {
    sessionId: 1234,
    sessionCode: "SS-20260701-A123",
    cardCode: "TH-00112345",
    plateNumber: "30F-123.45",
    entryTime: new Date(Date.now() - 3 * 3600000).toISOString(),
    customerType: "CASUAL",
    paymentStatus: "PENDING",
    vehicleTypeId: 1,
    floorId: 2,
    areaId: 3,
    slotId: 4,
    monthlyPassId: null,
    reservationId: null
  },
  
  sessionMonthly: {
    sessionId: 1235,
    sessionCode: "SS-20260701-A124",
    cardCode: "TH-MONTHLY",
    plateNumber: "29A-999.99",
    entryTime: new Date(Date.now() - 5 * 3600000).toISOString(),
    customerType: "MONTHLY",
    paymentStatus: "PAID",
    vehicleTypeId: 2,
    floorId: 1,
    areaId: 1,
    slotId: 1,
    monthlyPassId: 99,
    reservationId: null
  },
  
  feeCalculation: {
    sessionId: 1234,
    entryTime: new Date(Date.now() - 3 * 3600000).toISOString(),
    exitTime: new Date().toISOString(),
    amount: 50000,
    lostCardFee: 0,
    totalAmount: 50000,
    breakdown: [
      {
        timeFrame: "DAY",
        blocks: 3,
        unitPrice: 20000,
        amount: 50000
      }
    ]
  },

  cashPayment: {
    paymentId: 9991,
    sessionId: 1234,
    amount: 50000,
    totalAmount: 50000,
    status: "PAID",
    paidAt: new Date().toISOString()
  },

  onlinePayment: {
    paymentId: 9992,
    sessionId: 1234,
    amount: 50000,
    totalAmount: 50000,
    paymentUrl: "https://pay.payos.vn/checkout-mock-url",
    expiredAt: new Date(Date.now() + 15 * 60000).toISOString()
  },

  exitResponse: {
    sessionId: 1234,
    sessionCode: "SS-20260701-A123",
    status: "COMPLETED",
    exitTime: new Date().toISOString(),
    amount: 50000,
    lostCardFee: 0,
    totalAmount: 50000,
    paymentStatus: "PAID",
    receiptCode: "REC-20260701-ABCDEF"
  }
};
