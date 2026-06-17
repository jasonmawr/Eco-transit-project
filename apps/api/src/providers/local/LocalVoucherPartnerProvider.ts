import { VoucherPartnerProvider } from '@ecotransit/shared';

export class LocalVoucherPartnerProvider implements VoucherPartnerProvider {
  async redeemPartnerVoucher(voucherId: string, userId: string): Promise<{ code: string; partnerReference: string }> {
    console.log(`LocalVoucherPartnerProvider: Redeeming partner voucher: ${voucherId} for user: ${userId}`);
    const randomCode = `PARTNER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return {
      code: randomCode,
      partnerReference: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
  }
}
