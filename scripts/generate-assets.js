const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

async function createColorImage(width, height, color, outputPath) {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const image = new Jimp({ width, height, color });
    await image.write(outputPath);
    console.log(`Created: ${outputPath}`);
  } catch (err) {
    console.error(`Failed to create ${outputPath}:`, err);
  }
}

function createTinyWebP(outputPath) {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // 1x1 transparent pixel webp base64
    const webpBase64 = 'UklGRkAAAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMwAgI=';
    const buffer = Buffer.from(webpBase64, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created WebP: ${outputPath}`);
  } catch (err) {
    console.error(`Failed to create WebP ${outputPath}:`, err);
  }
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const webPublicDir = path.join(rootDir, 'apps', 'web', 'public');
  const uploadsDir = path.join(rootDir, 'uploads');

  console.log('Generating placeholder static assets...');

  // 1. Voucher placeholders
  const vouchers = [
    { name: 'highlands.png', color: 0x8C1D40FF },
    { name: 'phuclong.png', color: 0x025930FF },
    { name: 'metro.png', color: 0x0066FFFF },
    { name: 'vinbus.png', color: 0x005BAAFF },
    { name: 'gigamall.png', color: 0xE30613FF },
    { name: 'phuongnam.png', color: 0x8B2635FF },
    { name: 'starbucks.png', color: 0x00704AFF },
    { name: 'eco_holder.png', color: 0x10B981FF },
    { name: 'mug.png', color: 0x059669FF },
    { name: 'damsen.png', color: 0x00A896FF }
  ];

  for (const v of vouchers) {
    const outputPath = path.join(webPublicDir, 'images', 'vouchers', v.name);
    await createColorImage(300, 180, v.color, outputPath);
  }

  // 2. Place placeholders (webp)
  const places = [
    'dong_khoi_cafe.webp',
    'bep_me_in.webp',
    'cho_ben_thanh.webp',
    'highlands_nhahat.webp',
    'nha_hat.webp',
    'the_workshop.webp',
    'buu_dien_bason.webp',
    'thao_dien_garden.webp',
    'lusine_thao_dien.webp',
    'suoi_tien.webp'
  ];

  for (const p of places) {
    const outputPath = path.join(webPublicDir, 'images', 'places', p);
    createTinyWebP(outputPath);
  }

  // 3. Ticket placeholder
  const ticketPlaceholderPath = path.join(webPublicDir, 'images', 'ticket-placeholder.png');
  await createColorImage(300, 200, 0xE2E8F0FF, ticketPlaceholderPath);

  // 4. Verified ticket paths
  // Frontend public uploads
  const frontendVerifiedTicketPath1 = path.join(webPublicDir, 'uploads', 'verified_ticket.png');
  const frontendVerifiedTicketPath2 = path.join(webPublicDir, 'uploads', 'verified-ticket.png');
  await createColorImage(600, 400, 0x10B981FF, frontendVerifiedTicketPath1);
  await createColorImage(600, 400, 0x10B981FF, frontendVerifiedTicketPath2);

  // Backend upload dir file (so res.sendFile works)
  const backendVerifiedTicketPath = path.join(uploadsDir, 'verified_ticket.jpg');
  await createColorImage(600, 400, 0x10B981FF, backendVerifiedTicketPath);

  console.log('All static placeholders generated successfully.');
}

main().catch(console.error);
