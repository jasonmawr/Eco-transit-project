import crypto from 'crypto';

export async function createWalletWithUniqueAlias(
  tx: any,
  userId: string
) {
  let publicLeaderboardAlias = '';
  let attempts = 0;
  
  while (attempts < 10) {
    const randNum = Math.floor(100000 + Math.random() * 900000);
    publicLeaderboardAlias = `Hành khách xanh ${randNum}`;
    
    // Check if alias is unique
    const existing = await tx.userWallet.findUnique({
      where: { publicLeaderboardAlias }
    });
    
    if (!existing) {
      break;
    }
    
    attempts++;
  }
  
  // Safe fallback if loop hits limits
  if (attempts >= 10) {
    publicLeaderboardAlias = `Hành khách xanh ${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  return await tx.userWallet.create({
    data: {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      publicLeaderboardAlias,
    },
  });
}
