import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  console.log('Cleaning up existing data...');
  await prisma.voucherRedemption.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.pointsLedger.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.uGCReview.deleteMany();
  await prisma.place.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.routeEdge.deleteMany();
  await prisma.routeLine.deleteMany();
  await prisma.station.deleteMany();
  await prisma.userWallet.deleteMany();

  // Hash passwords
  const passwordHash = await argon2.hash('User@123456');
  const moderatorHash = await argon2.hash('Moderator@123456');
  const adminHash = await argon2.hash('Admin@123456');

  // 1. Seed Users
  console.log('Seeding Users...');
  const user = await prisma.user.upsert({
    where: { email: 'user@ecotransit.vn' },
    update: {
      emailVerified: true,
    },
    create: {
      email: 'user@ecotransit.vn',
      passwordHash,
      role: 'USER',
      pointsBalanceCache: 150, // 100 (ticket) + 50 (quiz) + 200 (bonus) - 200 (redeem) = 150
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'moderator@ecotransit.vn' },
    update: {
      emailVerified: true,
    },
    create: {
      email: 'moderator@ecotransit.vn',
      passwordHash: moderatorHash,
      role: 'MODERATOR',
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@ecotransit.vn' },
    update: {
      emailVerified: true,
    },
    create: {
      email: 'admin@ecotransit.vn',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Seed wallets for users
  console.log('Seeding User Wallets...');
  const moderator = await prisma.user.findUnique({ where: { email: 'moderator@ecotransit.vn' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@ecotransit.vn' } });

  await prisma.userWallet.upsert({
    where: { userId: user.id },
    update: {
      balance: 150,
      lifetimeEarned: 350,
      lifetimeSpent: 200,
      publicLeaderboardAlias: 'Hành khách xanh 151',
    },
    create: {
      userId: user.id,
      balance: 150,
      lifetimeEarned: 350,
      lifetimeSpent: 200,
      publicLeaderboardAlias: 'Hành khách xanh 151',
    },
  });

  if (moderator) {
    await prisma.userWallet.upsert({
      where: { userId: moderator.id },
      update: {
        publicLeaderboardAlias: 'Kiểm duyệt viên xanh',
      },
      create: {
        userId: moderator.id,
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
        publicLeaderboardAlias: 'Kiểm duyệt viên xanh',
      },
    });
  }

  if (admin) {
    await prisma.userWallet.upsert({
      where: { userId: admin.id },
      update: {
        publicLeaderboardAlias: 'Đại sứ xanh tối cao',
      },
      create: {
        userId: admin.id,
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
        publicLeaderboardAlias: 'Đại sứ xanh tối cao',
      },
    });
  }

  // 2. Seed Stations (14 Stations of Metro Line 1)
  console.log('Seeding Stations...');
  const stationData = [
    { name: 'Bến Thành', lineName: 'Metro Tuyến 1', orderNumber: 1, lat: 10.7712, lng: 106.6976, description: 'Ga trung tâm kết nối các tuyến metro tương lai', facilities: 'Wifi,Nhà vệ sinh,Thang máy,ATM' },
    { name: 'Nhà hát Thành phố', lineName: 'Metro Tuyến 1', orderNumber: 2, lat: 10.7760, lng: 106.7031, description: 'Ga ngầm phục vụ khu vực du lịch trung tâm quận 1', facilities: 'Wifi,Nhà vệ sinh,Thang máy' },
    { name: 'Ba Son', lineName: 'Metro Tuyến 1', orderNumber: 3, lat: 10.7818, lng: 106.7091, description: 'Ga ngầm ven sông Sài Gòn, khu đô thị Ba Son', facilities: 'Wifi,Nhà vệ sinh,Thang máy' },
    { name: 'Văn Thánh', lineName: 'Metro Tuyến 1', orderNumber: 4, lat: 10.7963, lng: 106.7175, description: 'Ga trên cao gần khu du lịch Văn Thánh', facilities: 'Nhà vệ sinh,Thang máy' },
    { name: 'Tân Cảng', lineName: 'Metro Tuyến 1', orderNumber: 5, lat: 10.7981, lng: 106.7214, description: 'Ga trên cao kết nối Landmark 81 và Vinhomes', facilities: 'ATM,Wifi,Nhà vệ sinh,Thang máy,Bãi đỗ xe' },
    { name: 'Thảo Điền', lineName: 'Metro Tuyến 1', orderNumber: 6, lat: 10.8018, lng: 106.7351, description: 'Ga trên cao phục vụ khu đô thị ngoại quốc Thảo Điền', facilities: 'ATM,Nhà vệ sinh,Thang máy,Bãi đỗ xe' },
    { name: 'An Phú', lineName: 'Metro Tuyến 1', orderNumber: 7, lat: 10.8016, lng: 106.7412, description: 'Ga trên cao gần trung tâm thương mại Estella', facilities: 'Nhà vệ sinh,Thang máy' },
    { name: 'Rạch Chiếc', lineName: 'Metro Tuyến 1', orderNumber: 8, lat: 10.8037, lng: 106.7570, description: 'Ga trên cao gần khu liên hợp thể thao Rạch Chiếc', facilities: 'Nhà vệ sinh,Thang máy' },
    { name: 'Phước Long', lineName: 'Metro Tuyến 1', orderNumber: 9, lat: 10.8143, lng: 106.7667, description: 'Ga trên cao phục vụ cư dân quận 9 cũ', facilities: 'Nhà vệ sinh,Thang máy' },
    { name: 'Bình Thái', lineName: 'Metro Tuyến 1', orderNumber: 10, lat: 10.8252, lng: 106.7725, description: 'Ga trên cao tại ngã tư Bình Thái', facilities: 'Nhà vệ sinh,Thang máy,Bãi đỗ xe' },
    { name: 'Thủ Đức', lineName: 'Metro Tuyến 1', orderNumber: 11, lat: 10.8354, lng: 106.7779, description: 'Ga trên cao trung tâm thành phố Thủ Đức', facilities: 'ATM,Nhà vệ sinh,Thang máy,Bãi đỗ xe' },
    { name: 'Khu Công nghệ cao', lineName: 'Metro Tuyến 1', orderNumber: 12, lat: 10.8465, lng: 106.7869, description: 'Ga phục vụ sinh viên và kỹ sư khu công nghệ cao', facilities: 'Wifi,Nhà vệ sinh,Thang máy' },
    { name: 'Suối Tiên', lineName: 'Metro Tuyến 1', orderNumber: 13, lat: 10.8584, lng: 106.8025, description: 'Ga trên cao đối diện khu du lịch Suối Tiên', facilities: 'ATM,Nhà vệ sinh,Thang máy' },
    { name: 'Bến xe Miền Đông mới', lineName: 'Metro Tuyến 1', orderNumber: 14, lat: 10.8752, lng: 106.8123, description: 'Ga cuối kết nối bến xe liên tỉnh Miền Đông mới', facilities: 'Wifi,Nhà vệ sinh,Thang máy,ATM,Bãi đỗ xe' },
  ];

  const stations: any[] = [];
  for (const s of stationData) {
    const createdStation = await prisma.station.create({ data: s });
    stations.push(createdStation);
  }

  // 3. Seed Route Lines (Metro Line 1 and a Sample Bus Line)
  console.log('Seeding Route Lines...');
  const metro1Line = await prisma.routeLine.create({
    data: {
      name: 'Metro Tuyến Số 1 Bến Thành - Suối Tiên',
      code: 'METRO1',
      mode: 'metro',
      fareBase: 15000,
      color: '#06A77D',
      active: true,
    },
  });

  await prisma.routeLine.create({
    data: {
      name: 'Tuyến Xe Buýt số 19: Bến Thành - ĐHQG',
      code: 'BUS19',
      mode: 'bus',
      fareBase: 7000,
      color: '#38BDF8',
      active: true,
    },
  });

  // 4. Seed Route Stops & Route Edges
  console.log('Seeding Stops and Edges for Routing Graph...');
  // Metro Stops
  for (let i = 0; i < stations.length; i++) {
    await prisma.routeStop.create({
      data: {
        lineId: metro1Line.id,
        stationId: stations[i].id,
        orderIndex: i + 1,
      },
    });
  }

  // Metro Edges (interconnecting adjacent stations bidirectionally)
  for (let i = 0; i < stations.length - 1; i++) {
    const stA = stations[i];
    const stB = stations[i + 1];

    // Forward edge A -> B
    await prisma.routeEdge.create({
      data: {
        fromStationId: stA.id,
        toStationId: stB.id,
        mode: 'metro',
        distanceMeters: 1200 + i * 100,
        durationMinutes: 2,
        fareEstimate: 0, // Calculated dynamically relative to legs
        active: true,
      },
    });

    // Backward edge B -> A
    await prisma.routeEdge.create({
      data: {
        fromStationId: stB.id,
        toStationId: stA.id,
        mode: 'metro',
        distanceMeters: 1200 + i * 100,
        durationMinutes: 2,
        fareEstimate: 0,
        active: true,
      },
    });
  }

  // Seed some bus connector edges for Bus 19 near Bến Thành and Thảo Điền
  // e.g., Bus 19 connects Bến Thành -> Thảo Điền in 20 mins
  await prisma.routeEdge.create({
    data: {
      fromStationId: stations[0].id, // Bến Thành
      toStationId: stations[5].id,   // Thảo Điền
      mode: 'bus',
      distanceMeters: 6200,
      durationMinutes: 20,
      fareEstimate: 7000,
      active: true,
    },
  });
  await prisma.routeEdge.create({
    data: {
      fromStationId: stations[5].id, // Thảo Điền
      toStationId: stations[0].id,   // Bến Thành
      mode: 'bus',
      distanceMeters: 6200,
      durationMinutes: 20,
      fareEstimate: 7000,
      active: true,
    },
  });

  // 5. Seed POIs (Places near stations)
  console.log('Seeding POIs...');
  const placesData = [
    {
      stationId: stations[0].id, // Bến Thành
      slug: 'dong-khoi-cafe',
      name: 'Đồng Khởi Cafe',
      category: 'cafe',
      lat: 10.7715,
      lng: 106.6980,
      address: 'Đồng Khởi, Quận 1',
      shortDescription: 'Quán cafe yên tĩnh mang đậm hơi thở Sài Gòn xưa.',
      description: 'Nằm ẩn mình trong khu phố trung tâm, Đồng Khởi Cafe mang lại trải nghiệm hoài cổ, thích hợp để thư giãn sau chuyến đi tàu điện nhanh.',
      district: 'Quận 1',
      walkingMinutes: 3,
      distanceMeters: 200,
      priceLevel: 2,
      tags: ['cafe', 'chill', 'view-dep'],
      highlights: ['View ôm trọn vòng xoay', 'Cà phê trứng béo ngậy', 'Nhạc Trịnh du dương'],
      featured: true,
      imageUrl: '/images/places/dong_khoi_cafe.webp',
      isPublished: true,
    },
    {
      stationId: stations[0].id, // Bến Thành
      slug: 'bep-me-in-ben-thanh',
      name: 'Bếp Mẹ Ỉn - Bến Thành',
      category: 'food',
      lat: 10.7720,
      lng: 106.6970,
      address: 'Lê Thánh Tôn, Quận 1',
      shortDescription: 'Món ăn gia đình chuẩn vị Bắc - Trung - Nam độc đáo.',
      description: 'Nhà hàng nhỏ nổi tiếng phục vụ cơm niêu, bánh xèo giòn tan và cơm gia đình ấm áp, đạt chứng nhận Michelin Bib Gourmand.',
      district: 'Quận 1',
      walkingMinutes: 4,
      distanceMeters: 280,
      priceLevel: 2,
      tags: ['food', 'michelin', 'vietnam'],
      highlights: ['Bánh xèo giòn rụm', 'Cơm chiên trái dừa', 'Không gian ấm cúng'],
      featured: true,
      imageUrl: '/images/places/bep_me_in.webp',
      isPublished: true,
    },
    {
      stationId: stations[0].id, // Bến Thành
      slug: 'cho-ben-thanh-market',
      name: 'Chợ Bến Thành',
      category: 'shopping',
      lat: 10.7718,
      lng: 106.6983,
      address: 'Chợ Bến Thành, Quận 1',
      shortDescription: 'Biểu tượng văn hóa lịch sử lâu đời và mua sắm nhộn nhịp.',
      description: 'Địa điểm không thể bỏ qua đối với khách du lịch khi đi metro vào trung tâm, nổi tiếng với ẩm thực chợ phong phú.',
      district: 'Quận 1',
      walkingMinutes: 2,
      distanceMeters: 120,
      priceLevel: 2,
      tags: ['shopping', 'tourism', 'cultural'],
      highlights: ['Quà lưu niệm độc đáo', 'Trái cây nhiệt đới tươi', 'Kiến trúc cổ xưa'],
      featured: false,
      imageUrl: '/images/places/cho_ben_thanh.webp',
      isPublished: true,
    },
    {
      stationId: stations[1].id, // Nhà hát Thành phố
      slug: 'highlands-nhahathanhpho',
      name: 'Highlands Coffee Nhà hát',
      category: 'cafe',
      lat: 10.7762,
      lng: 106.7035,
      address: 'Ga Nhà hát Thành phố',
      shortDescription: 'Thưởng thức cà phê Highlands ngắm nhìn Nhà hát tráng lệ.',
      description: 'Quán cafe tiện lợi nằm ngay lối ra của ga metro Nhà hát Thành phố, lý tưởng cho một buổi sáng nhanh gọn, sảng khoái.',
      district: 'Quận 1',
      walkingMinutes: 1,
      distanceMeters: 50,
      priceLevel: 2,
      tags: ['cafe', 'convenient', 'view-dep'],
      highlights: ['View Nhà Hát Lớn', 'Phục vụ cực nhanh', 'Đồ uống đa dạng'],
      featured: false,
      imageUrl: '/images/places/highlands_nhahat.webp',
      isPublished: true,
    },
    {
      stationId: stations[1].id, // Nhà hát Thành phố
      slug: 'nha-hat-thanh-pho-op',
      name: 'Nhà hát Thành phố',
      category: 'attraction',
      lat: 10.7765,
      lng: 106.7030,
      address: 'Công trường Lam Sơn, Quận 1',
      shortDescription: 'Biểu tượng kiến trúc Gothic Pháp lãng mạn giữa lòng đô thị.',
      description: 'Nhà hát lớn cổ kính, nơi diễn ra các buổi hòa nhạc hàn lâm và các show diễn xiếc tre nghệ thuật đặc trưng như À Ố Show.',
      district: 'Quận 1',
      walkingMinutes: 1,
      distanceMeters: 60,
      priceLevel: 1,
      tags: ['attraction', 'art', 'checkin'],
      highlights: ['Kiến trúc Pháp tinh tế', 'Vị trí đắc địa nhất', 'Địa điểm chụp ảnh cưới đẹp'],
      featured: true,
      imageUrl: '/images/places/nha_hat.webp',
      isPublished: true,
    },
    {
      stationId: stations[2].id, // Ba Son
      slug: 'the-workshop-coffee-workspace',
      name: 'The Workshop Specialty Coffee',
      category: 'study/work friendly',
      lat: 10.7820,
      lng: 106.7088,
      address: 'Ngô Đức Kế, Quận 1',
      shortDescription: 'Không gian làm việc yên tĩnh lý tưởng kết hợp cà phê specialty tuyển chọn.',
      description: 'Nổi tiếng là quán cafe phong cách công nghiệp đầu tiên phục vụ cafe thủ công chất lượng cao, có bàn dài phục vụ làm việc nhóm.',
      district: 'Quận 1',
      walkingMinutes: 6,
      distanceMeters: 450,
      priceLevel: 3,
      tags: ['study/work friendly', 'specialty', 'silent'],
      highlights: ['Cà phê Specialty hảo hạng', 'Không gian làm việc chuyên nghiệp', 'Wifi siêu tốc độ'],
      featured: true,
      imageUrl: '/images/places/the_workshop.webp',
      isPublished: true,
    },
    {
      stationId: stations[2].id, // Ba Son
      slug: 'buu-dien-bason-service',
      name: 'Bưu điện Ba Son Premium',
      category: 'service',
      lat: 10.7810,
      lng: 106.7095,
      address: 'Ga Ba Son',
      shortDescription: 'Dịch vụ bưu chính công cộng tiện lợi ngay tại nhà ga.',
      description: 'Điểm giao dịch bưu chính tự động và quầy thông tin hỗ trợ hành khách gửi thư từ, hành lý ký gửi nhanh.',
      district: 'Quận 1',
      walkingMinutes: 2,
      distanceMeters: 100,
      priceLevel: 1,
      tags: ['service', 'shipping', 'convenient'],
      highlights: ['Gửi đồ nhanh liên tỉnh', 'Tích hợp rút tiền ATM', 'Hỗ trợ bản đồ giấy du lịch'],
      featured: false,
      imageUrl: '/images/places/buu_dien_bason.webp',
      isPublished: true,
    },
    {
      stationId: stations[5].id, // Thảo Điền
      slug: 'thao-dien-garden-rest',
      name: 'Thảo Điền Garden Restaurant',
      category: 'food',
      lat: 10.8020,
      lng: 106.7355,
      address: 'Thảo Điền, Quận 2',
      shortDescription: 'Biệt thự sân vườn phục vụ ẩm thực Á - Âu sang trọng.',
      description: 'Không gian ngập tràn cây xanh mát mẻ thích hợp cho các buổi họp mặt gia đình hoặc hẹn hò lãng mạn tách biệt hoàn toàn khỏi tiếng ồn đô thị.',
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 3,
      distanceMeters: 200,
      priceLevel: 3,
      tags: ['food', 'garden', 'dinner'],
      highlights: ['Không gian vườn yên bình', 'Bò bít tết hảo hạng', 'Danh sách rượu vang phong phú'],
      featured: true,
      imageUrl: '/images/places/thao_dien_garden.webp',
      isPublished: true,
    },
    {
      stationId: stations[5].id, // Thảo Điền
      slug: 'lusine-thao-dien-boutique',
      name: 'L’Usine Thảo Điền',
      category: 'cafe',
      lat: 10.8025,
      lng: 106.7360,
      address: 'Thảo Điền, Quận 2',
      shortDescription: 'Cafe bistro kết hợp shop thời trang nghệ thuật sang trọng.',
      description: 'Quán cafe mang phong cách Pháp thanh lịch, thu hút đông đảo khách nước ngoài và giới trẻ nhờ thực đơn Brunch vô cùng phong phú.',
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 4,
      distanceMeters: 250,
      priceLevel: 3,
      tags: ['cafe', 'brunch', 'shopping'],
      highlights: ['Bánh sừng bò nướng mới', 'Góc sống ảo đậm chất Pháp', 'Trang trí nghệ thuật'],
      featured: false,
      imageUrl: '/images/places/lusine_thao_dien.webp',
      isPublished: true,
    },
    {
      stationId: stations[12].id, // Suối Tiên
      slug: 'suoi-tien-theme-park-poi',
      name: 'Khu du lịch Văn hóa Suối Tiên',
      category: 'attraction',
      lat: 10.8588,
      lng: 106.8030,
      address: 'Xa lộ Hà Nội, Thủ Đức',
      shortDescription: 'Công viên giải trí chủ đề văn hóa Phật giáo lớn nhất Sài Gòn.',
      description: 'Với hồ bơi nhân tạo khổng lồ, các trò chơi cảm giác mạnh phiêu lưu và các công trình mô phỏng truyền thuyết Sơn Tinh - Thủy Tinh huyền thoại.',
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 5,
      distanceMeters: 350,
      priceLevel: 2,
      tags: ['attraction', 'family', 'adventure'],
      highlights: ['Biển Tiên Đồng nhân tạo', 'Tàu lượn siêu tốc', 'Lễ hội trái cây mùa hè'],
      featured: true,
      imageUrl: '/images/places/suoi_tien.webp',
      isPublished: true,
    },
  ];

  const createdPlaces: any[] = [];
  for (const p of placesData) {
    const createdPlace = await prisma.place.create({ data: p });
    createdPlaces.push(createdPlace);
  }

  // 6. Seed Vouchers
  console.log('Seeding Vouchers...');
  const highlands = await prisma.voucher.create({
    data: {
      name: 'Voucher Highlands Coffee 19,000 VND (Mốc 6 Vé)',
      cost: 60,
      quantity: 50,
      status: 'active',
      encryptedCodes: 'HL-20K-ABCD123,HL-20K-EFGH456,HL-20K-IJKL789',
      
      slug: 'highlands-20k',
      description: 'Đổi 60 điểm (tương đương 6 vé xanh) lấy mã ưu đãi giảm giá 19,000 VND áp dụng tại toàn hệ thống Highlands Coffee.',
      brandName: 'Highlands Coffee',
      category: 'drink',
      pointsCost: 60,
      stockTotal: 50,
      stockRemaining: 50,
      perUserLimit: 3,
      terms: 'Áp dụng cho mọi đồ uống. Không cộng dồn với khuyến mãi khác.',
      imageUrl: '/images/vouchers/highlands.png',
      isActive: true,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
    } as any, // Cast as any because dynamic TS compilation might not register Prisma types immediately
  });

  await prisma.voucher.create({
    data: {
      name: 'Voucher Phúc Long 30,000 VND (Mốc 9 Vé - Ưu Đãi Lớn)',
      cost: 90,
      quantity: 30,
      status: 'active',
      encryptedCodes: 'PL-30K-QWER123,PL-30K-ASDF456',

      slug: 'phuclong-30k',
      description: 'Mã giảm giá trà sữa hoặc đồ uống Phúc Long trị giá 30,000 VND (mốc 90 điểm) cho hành trình xanh năng động.',
      brandName: 'Phúc Long',
      category: 'drink',
      pointsCost: 90,
      stockTotal: 30,
      stockRemaining: 30,
      perUserLimit: 2,
      terms: 'Hạn dùng trong vòng 30 ngày kể từ ngày đổi. Chỉ áp dụng mua trực tiếp tại quầy.',
      imageUrl: '/images/vouchers/phuclong.png',
      isActive: true,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
    } as any,
  });

  // Transit voucher (Mốc 3 vé)
  await prisma.voucher.create({
    data: {
      name: 'Vé Metro Chặng Đơn 6,000 VND (Mốc 3 Vé)',
      cost: 30,
      quantity: 100,
      status: 'active',
      encryptedCodes: 'METRO-RT-111,METRO-RT-222,METRO-RT-333',
      slug: 'metro-roundtrip',
      description: 'Lướt khỏi khói xe, chạm Metro xanh 1 chặng trị giá 6,000 VND (mốc 30 điểm).',
      brandName: 'HCMC Metro',
      category: 'transit',
      pointsCost: 30,
      stockTotal: 100,
      stockRemaining: 100,
      perUserLimit: 5,
      terms: 'Vé có giá trị trong ngày đổi. Xuất trình mã tại ga để nhận vé token.',
      imageUrl: '/images/vouchers/metro.png',
      isActive: true,
    } as any,
  });

  // E-bus voucher (Mốc 3 vé)
  await prisma.voucher.create({
    data: {
      name: 'Voucher VinBus 6,000 VND (Mốc 3 Vé)',
      cost: 30,
      quantity: 200,
      status: 'active',
      encryptedCodes: 'VINBUS-ECO-01,VINBUS-ECO-02',
      slug: 'vinbus-eco',
      description: 'Một chuyến đi xanh êm ái cùng xe buýt điện VinBus thông minh chặng 6,000 VND (mốc 30 điểm).',
      brandName: 'VinBus',
      category: 'transit',
      pointsCost: 30,
      stockTotal: 200,
      stockRemaining: 200,
      perUserLimit: 10,
      terms: 'Áp dụng cho các tuyến xe buýt điện nội thành TP.HCM.',
      imageUrl: '/images/vouchers/vinbus.png',
      isActive: true,
    } as any,
  });

  // Special Annual Voucher (Mốc 99 Vé)
  await prisma.voucher.create({
    data: {
      name: 'Thẻ Năm Metro / Quà Đặc Biệt (Mốc 99 Vé)',
      cost: 990,
      quantity: 5,
      status: 'active',
      encryptedCodes: 'METRO-YEAR-01,METRO-YEAR-02',
      slug: 'metro-annual-special',
      description: 'Đặc quyền di chuyển Metro miễn phí cả năm dành cho Đại sứ Xanh xuất sắc nhất (mốc 990 điểm).',
      brandName: 'HCMC Metro',
      category: 'transit',
      pointsCost: 990,
      stockTotal: 5,
      stockRemaining: 5,
      perUserLimit: 1,
      terms: 'Áp dụng cho cả năm 2026. Nhận thẻ vật lý tại Ga Bến Thành.',
      imageUrl: '/images/vouchers/metro.png',
      isActive: true,
    } as any,
  });

  // Shopping voucher
  await prisma.voucher.create({
    data: {
      name: 'Voucher GigaMall Shopping 50K',
      cost: 500,
      quantity: 15,
      status: 'active',
      encryptedCodes: 'GIGA-50K-X1Y2Z3',
      slug: 'gigamall-50k',
      description: 'Voucher mua sắm tiêu dùng hữu cơ hoặc bất kỳ dịch vụ nào tại GigaMall Thủ Đức.',
      brandName: 'GigaMall',
      category: 'shopping',
      pointsCost: 500,
      stockTotal: 15,
      stockRemaining: 15,
      perUserLimit: 1,
      terms: 'Áp dụng cho các đơn hàng từ 200,000 VND trở lên tại siêu thị đối tác GigaMall.',
      imageUrl: '/images/vouchers/gigamall.png',
      isActive: true,
    } as any,
  });

  // Study / Bookstore voucher
  await prisma.voucher.create({
    data: {
      name: 'Voucher Phương Nam Book 20K',
      cost: 150,
      quantity: 40,
      status: 'active',
      encryptedCodes: 'PNS-20K-999',
      slug: 'phuongnam-20k',
      description: 'Mua sắm sách, văn phòng phẩm bảo vệ môi trường tại hệ thống Nhà sách Phương Nam.',
      brandName: 'Phương Nam Book',
      category: 'study',
      pointsCost: 150,
      stockTotal: 40,
      stockRemaining: 40,
      perUserLimit: 2,
      terms: 'Áp dụng mua sách hoặc đồ dùng học tập tại nhà ga/cửa hàng Phương Nam.',
      imageUrl: '/images/vouchers/phuongnam.png',
      isActive: true,
    } as any,
  });

  // Expired voucher
  await prisma.voucher.create({
    data: {
      name: 'Starbucks Premium Special Treat',
      cost: 600,
      quantity: 10,
      status: 'expired',
      encryptedCodes: 'SB-EXP-001',
      slug: 'starbucks-premium',
      description: 'Đặc quyền thưởng thức đồ uống Starbucks đặc biệt tự chọn.',
      brandName: 'Starbucks',
      category: 'drink',
      pointsCost: 600,
      stockTotal: 10,
      stockRemaining: 0,
      perUserLimit: 1,
      terms: 'Đã hết hạn vào ngày 01/01/2026.',
      imageUrl: '/images/vouchers/starbucks.png',
      isActive: true,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2026-01-01'),
    } as any,
  });

  // Out-of-stock voucher
  await prisma.voucher.create({
    data: {
      name: 'Eco Cup Holder Quai Vải',
      cost: 100,
      quantity: 50,
      status: 'sold_out',
      encryptedCodes: 'ECO-HOLDER-SOLD',
      slug: 'eco-cup-holder',
      description: 'Quai vải treo ly tiện lợi tái sử dụng, giúp giảm thiểu rác thải nhựa.',
      brandName: 'GreenLife',
      category: 'shopping',
      pointsCost: 100,
      stockTotal: 50,
      stockRemaining: 0,
      perUserLimit: 1,
      terms: 'Tặng kèm tại trạm đổi điểm. Đã hết hàng trong kho.',
      imageUrl: '/images/vouchers/eco_holder.png',
      isActive: true,
    } as any,
  });

  // Inactive voucher
  await prisma.voucher.create({
    data: {
      name: 'Ly Giữ Nhiệt Lướt Khói Chạm Xanh',
      cost: 400,
      quantity: 10,
      status: 'draft',
      encryptedCodes: 'MUG-INACTIVE',
      slug: 'luot-khoi-mug',
      description: 'Ly sứ giữ nhiệt in logo campaign độc quyền cho chiến dịch di chuyển xanh.',
      brandName: 'EcoTransit Project',
      category: 'shopping',
      pointsCost: 400,
      stockTotal: 10,
      stockRemaining: 10,
      perUserLimit: 1,
      terms: 'Quà tặng lưu niệm bản đặc biệt. Hiện chưa mở đổi.',
      imageUrl: '/images/vouchers/mug.png',
      isActive: false,
    } as any,
  });

  // Experience voucher
  await prisma.voucher.create({
    data: {
      name: 'Vé Trải Nghiệm Công Viên Đầm Sen',
      cost: 800,
      quantity: 8,
      status: 'active',
      encryptedCodes: 'DAMSEN-EXP-888',
      slug: 'damsen-experience',
      description: 'Chạm vào thiên nhiên mát mẻ và tận hưởng ngày cuối tuần thư giãn tại Đầm Sen.',
      brandName: 'Đầm Sen Theme Park',
      category: 'experience',
      pointsCost: 800,
      stockTotal: 8,
      stockRemaining: 8,
      perUserLimit: 1,
      terms: 'Vé vào cổng trọn gói cho 1 người lớn. Hạn sử dụng 3 tháng kể từ ngày đổi.',
      imageUrl: '/images/vouchers/damsen.png',
      isActive: true,
    } as any,
  });

  // 7. Seed Tickets in various states
  console.log('Seeding Tickets...');
  const base64Placeholder = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMwAgI=/SymmetricThumbnailPlaceholder';

  const t1 = await prisma.ticket.create({
    data: {
      userId: user.id,
      ocrText: 'METRO LINE 1 - DATE: 2026-06-10 - FARE: 15000',
      status: 'verified',
      confidenceScore: 0.95,
      tripDate: new Date('2026-06-10'),
      base64DataFallback: base64Placeholder,
      imageUrl: '/uploads/verified_ticket.png',
      imagePath: path.resolve(process.cwd(), '../../uploads/verified_ticket.jpg'),
      pointsLedgerId: 'ledger-t1-id',
      type: 'metro',
      stationId: stations[0].id,
      routeLabel: 'Metro Tuyến 1',
      originalFileName: 'metro_ticket_benthanh.png',
      mimeType: 'image/png',
      sizeBytes: 120500,
      ocrStatus: 'mocked',
    },
  });

  await prisma.ticket.create({
    data: {
      userId: user.id,
      ocrText: 'BUS TICKETS - DATE: 2026-06-15',
      status: 'pending',
      base64DataFallback: base64Placeholder,
      type: 'bus',
      routeLabel: 'Bus 19',
      originalFileName: 'bus_ticket_19.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 98000,
      ocrStatus: 'mocked',
    },
  });

  await prisma.ticket.create({
    data: {
      userId: user.id,
      ocrText: 'TICKET DETAILS UNREADABLE',
      status: 'manual_review',
      base64DataFallback: base64Placeholder,
      type: 'other',
      originalFileName: 'blurry_ticket.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 150000,
      ocrStatus: 'failed',
    },
  });

  await prisma.ticket.create({
    data: {
      userId: user.id,
      ocrText: 'DUPLICATE CHECKS FAILED',
      status: 'rejected',
      base64DataFallback: base64Placeholder,
      type: 'metro',
      originalFileName: 'duplicate_metro.png',
      mimeType: 'image/png',
      sizeBytes: 120500,
      ocrStatus: 'mocked',
      reviewNote: 'Vé đã được đăng tải trước đó.',
    },
  });

  // 8. Seed Points Ledger Entries (Append-Only)
  console.log('Seeding Points Ledger...');
  // Initial Sign-Up Bonus
  await prisma.pointsLedger.create({
    data: {
      id: 'ledger-bonus-id',
      userId: user.id,
      delta: 200,
      balanceAfter: 200,
      sourceType: 'bonus',
      idempotencyKey: 'idemp-bonus-user',
      eventType: 'bonus',
    },
  });

  // Ticket reward
  await prisma.pointsLedger.create({
    data: {
      id: 'ledger-t1-id',
      userId: user.id,
      delta: 100,
      balanceAfter: 300,
      sourceType: 'ticket',
      sourceId: t1.id,
      idempotencyKey: `idemp-ticket-${t1.id}`,
      eventType: 'ticket_approved',
    },
  });

  // Quiz reward
  await prisma.pointsLedger.create({
    data: {
      id: 'ledger-quiz-id',
      userId: user.id,
      delta: 50,
      balanceAfter: 350,
      sourceType: 'quiz',
      idempotencyKey: 'idemp-quiz-user',
      eventType: 'quiz_reward',
    },
  });

  // Voucher redemption (Highlands Coffee)
  await prisma.pointsLedger.create({
    data: {
      id: 'ledger-redeem-id',
      userId: user.id,
      delta: -200,
      balanceAfter: 150,
      sourceType: 'voucher_redemption',
      sourceId: 'seed-redemption-id',
      idempotencyKey: `idemp-redeem-${highlands.id}`,
      eventType: 'voucher_redeemed',
    },
  });

  // 9. Seed Voucher Redemption
  console.log('Seeding Redemptions...');
  await prisma.voucherRedemption.create({
    data: {
      id: 'seed-redemption-id',
      userId: user.id,
      voucherId: highlands.id,
      code: 'HL-20K-ABCD123',
      idempotencyKey: `idemp-redemp-record-${highlands.id}`,
      status: 'active',
      pointsSpent: 200,
      metadata: { brandName: 'Highlands Coffee' } as any,
    },
  });

  // 10. Seed Guides / Articles
  console.log('Seeding Guides...');
  const guidesData = [
    {
      slug: 'huong-dan-metro-tuyen-1',
      title: 'Hướng dẫn đi Metro Tuyến 1 siêu chi tiết từ A-Z',
      excerpt: 'Bỏ túi ngay cẩm nang đi tàu điện Metro số 1 lần đầu: cách mua vé, đi qua cổng soát vé và lưu ý di chuyển xanh.',
      content: 'Chào mừng bạn đến với tuyến Metro số 1 Bến Thành - Suối Tiên, cột mốc xanh trong hành trình hiện đại hóa giao thông công cộng của TP.HCM. Để chuyến đi của bạn thật suôn sẻ, hãy làm theo các bước sau:\n\n1. **Mua vé**: Bạn có thể mua vé lẻ dạng token tròn tại máy bán vé tự động bằng tiền mặt (mệnh giá dưới 100.000đ) hoặc mua trực tiếp tại quầy.\n2. **Qua cổng soát vé**: Chạm nhẹ vé token lên vòng cảm biến ở cổng barrier để mở lối đi.\n3. **Lên ke ga**: Theo dõi bảng chỉ dẫn hướng tàu chạy (hướng Suối Tiên hoặc Bến Thành) để lên đúng tầng ke ga.\n4. **Lưu ý an toàn**: Đứng sau vạch màu vàng khi chờ tàu, nhường khách xuống tàu trước rồi mới bước lên tàu.\n\nHãy trải nghiệm ngay phương thức di chuyển xanh mát, hands-free và an tâm tuyệt đối này nhé!',
      tags: ['metro', 'hướng dẫn', 'di chuyển xanh'],
      relatedStationId: stations[0].id, // Bến Thành
      isPublished: true,
    },
    {
      slug: 'am-thuc-ga-nha-hat-city',
      title: 'Khám phá ẩm thực quanh ga Nhà hát Thành phố',
      excerpt: 'Điểm danh những quán cafe nghệ thuật và nhà hàng chuẩn vị truyền thống chỉ cách lối ra ga vài bước đi bộ.',
      content: 'Ga Nhà hát Thành phố tọa lạc ngay trái tim Quận 1 sầm uất. Không cần lo khói bụi hay kẹt xe, bạn chỉ cần bước ra khỏi ga là cả một thiên đường ẩm thực đang chờ đợi:\n\n- **Cà phê chung cư**: Các quán cafe ẩn mình trong các tòa nhà cổ trên đường Lý Tự Trọng mang phong cách retro mộc mạc.\n- **Bánh mì đệ nhất**: Thưởng thức những ổ bánh mì giòn tan ngập tràn pate thơm lừng đặc trưng Sài Gòn.\n- **Ẩm thực đường phố**: Dạo quanh trục đường Nguyễn Huệ để nhâm nhi ly trà dâu mát lạnh và bánh tráng trộn.\n\nĐi bộ nhẹ nhàng sau chuyến đi metro chính là cách vừa bảo vệ môi trường vừa rèn luyện sức khỏe tuyệt vời!',
      tags: ['ẩm thực', 'nhà hát', 'đi bộ', 'smart-spending'],
      relatedStationId: stations[1].id, // Nhà hát
      isPublished: true,
    },
    {
      slug: 'mot-ngay-stress-less-thao-dien',
      title: 'Một ngày stress-less thảnh thơi tại Thảo Điền',
      excerpt: 'Đi tàu metro thẳng tiến ga Thảo Điền để tận hưởng một ngày cuối tuần thư giãn, thưởng thức brunch phong cách Tây.',
      content: 'Thảo Điền là điểm hẹn hoàn hảo cho một ngày nghỉ thảnh thơi. Rời xa những con phố chật hẹp đầy khói bụi, hãy đi tàu điện đến ga Thảo Điền và bắt đầu hành trình:\n\n- **9:00 AM**: Thưởng thức brunch tại L’Usine Thảo Điền với bánh sừng bò nóng hổi và nước ép trái cây tươi mát.\n- **1:00 PM**: Ghé thăm các boutique art shop để tìm kiếm đồ lưu niệm thủ công tinh xảo của các nghệ sĩ bản địa.\n- **5:00 PM**: Dùng bữa tối lãng mạn tại Thảo Điền Garden Restaurant dưới ánh nến và tán cây xanh rì.\n\nHành trình xanh, sống lành mạnh và nạp đầy năng lượng cho tuần mới!',
      tags: ['thảo điền', 'thư giãn', 'cuối tuần', 'stress-less'],
      relatedStationId: stations[5].id, // Thảo Điền
      isPublished: true,
    },
    {
      slug: 'suoi-tien-khong-khoi-xe-la-gi',
      title: 'Oanh tạc Suối Tiên cực mát không lo khói bụi',
      excerpt: 'Bí quyết ghé thăm khu du lịch Suối Tiên bằng tàu metro cực kỳ mát mẻ, văn minh và tiết kiệm thời gian.',
      content: 'Đường Xa lộ Hà Nội vào giờ cao điểm nắng nóng luôn là nỗi ác mộng của hành khách đi xe máy. Nhưng giờ đây, bạn có thể đi chơi Suối Tiên cực kỳ thảnh thơi:\n\n1. Bước lên tàu điện mát lạnh từ ga trung tâm Bến Thành.\n2. Ngắm nhìn thành phố qua ô cửa kính lớn trong vòng 20 phút.\n3. Xuống ga Suối Tiên, đi qua cầu vượt đi bộ trực tiếp kết nối thẳng vào cổng khu du lịch.\n\nGiải pháp hoàn hảo cho các gia đình có trẻ nhỏ đi chơi cuối tuần: không khói bụi, không kẹt xe, tha hồ vui chơi!',
      tags: ['suối tiên', 'vui chơi', 'gia đình', 'di chuyển xanh'],
      relatedStationId: stations[12].id, // Suối Tiên
      isPublished: true,
    },
    {
      slug: 'lien-ket-metro-va-bus-dien',
      title: 'Bí kíp kết hợp Metro và Xe Buýt Điện VinBus',
      excerpt: 'Bí quyết thiết lập lộ trình xanh kết hợp giữa metro đường sắt và bus điện thông minh phủ sóng khắp thành phố.',
      content: 'Để hành trình di chuyển xanh của bạn trở nên toàn diện và tiện lợi nhất, hãy kết hợp tàu điện Metro số 1 cùng hệ thống xe buýt điện thông minh VinBus. Xe buýt điện không tiếng ồn, không phát thải và luôn có điều hòa mát lạnh sẽ đón bạn từ các ngõ ngách khu dân cư đưa thẳng đến ga tàu điện gần nhất. Việc mua vé liên thông cũng đang được nghiên cứu thử nghiệm để tiết kiệm chi phí tối đa cho người dân học tập và làm việc hàng ngày.',
      tags: ['bus điện', 'metro', 'smart-spending', 'tiện ích'],
      relatedStationId: stations[0].id, // Bến Thành
      isPublished: true,
    },
    {
      slug: 'chuyen-di-cam-hung-green-living',
      title: 'Học cách sống xanh bắt đầu từ thói quen đi lại',
      excerpt: 'Mỗi chuyến đi bằng phương tiện công cộng là một đóng góp thiết thực cho lá phổi xanh của thành phố.',
      content: 'Sống xanh không phải là điều gì to tát, nó bắt đầu từ việc lựa chọn phương tiện di chuyển hàng ngày. Thay vì chọn xe máy cá nhân, hãy thử đi tàu điện Metro số 1 hoặc đi bộ qua các con phố đi bộ. Bạn sẽ thấy thành phố ở một góc nhìn mới: thong thả hơn, sạch sẽ hơn và tràn đầy năng lượng tươi mới.',
      tags: ['sống xanh', 'cảm hứng', 'green-living'],
      isPublished: true,
    },
    {
      slug: 'guide-chua-xuat-ban',
      title: 'Bài viết hướng dẫn bí mật (Nháp)',
      excerpt: 'Cẩm nang nháp chưa được xuất bản công khai.',
      content: 'Nội dung bài viết nháp này không được xuất hiện ở giao diện người dùng công khai hoặc API ngoài.',
      tags: ['nháp', 'private'],
      isPublished: false,
    }
  ];

  for (const g of guidesData) {
    await prisma.guide.create({ data: g });
  }

  // 11. Seed UGC Reviews
  console.log('Seeding Reviews...');
  // Reviews for Stations
  await prisma.uGCReview.create({
    data: {
      userId: user.id,
      stationId: stations[0].id, // Bến Thành
      displayName: 'Khánh An',
      rating: 5,
      content: 'Ga Bến Thành cực kỳ rộng và mát mẻ. Thiết kế tinh tế, kết nối rất nhiều lối ra thuận tiện đi tham quan quận 1.',
      status: 'approved',
    },
  });

  await prisma.uGCReview.create({
    data: {
      userId: user.id,
      stationId: stations[5].id, // Thảo Điền
      displayName: 'Minh Huy',
      rating: 4,
      content: 'Bên ngoài ga Thảo Điền nhiều quán cafe xinh xắn. Khách nước ngoài đi tàu xuống đây ăn uống rất sầm uất.',
      status: 'approved',
    },
  });

  await prisma.uGCReview.create({
    data: {
      userId: user.id,
      stationId: stations[12].id, // Suối Tiên
      displayName: 'Thùy Dương',
      rating: 3,
      content: 'Trạm này vào giờ cao điểm hơi đông. Hy vọng có thêm thùng rác và máy bán nước tự động.',
      status: 'pending', // Pending review to test visibility
    },
  });

  // Reviews for Places
  const placeDongKhoi = createdPlaces.find(p => p.slug === 'dong-khoi-cafe');
  if (placeDongKhoi) {
    await prisma.uGCReview.create({
      data: {
        userId: user.id,
        placeId: placeDongKhoi.id,
        displayName: 'Ngọc Trinh',
        rating: 5,
        content: 'Cà phê trứng ở đây ngon xuất sắc, vị béo bùi không bị tanh. Không gian thì yên tĩnh đậm chất Sài Gòn xưa.',
        status: 'approved',
      },
    });

    await prisma.uGCReview.create({
      data: {
        userId: user.id,
        placeId: placeDongKhoi.id,
        displayName: 'Thành Long',
        rating: 2,
        content: 'Chỗ này giá hơi cao so với mặt bằng chung, phục vụ hơi chậm vào giờ đông khách.',
        status: 'pending', // Pending
      },
    });

    await prisma.uGCReview.create({
      data: {
        userId: user.id,
        placeId: placeDongKhoi.id,
        displayName: 'Phát Nguyễn',
        rating: 1,
        content: 'Bản đồ chỉ sai đường, chỗ này bán đồ ăn không ngon và thái độ phục vụ rất tệ hại.',
        status: 'rejected',
        moderationNote: 'Nội dung phản cảm, thô tục.',
        moderatorNote: 'Nội dung phản cảm, thô tục.',
        reviewedAt: new Date(),
        reviewedById: admin?.id || null,
      },
    });
  }

  const placeLusine = createdPlaces.find(p => p.slug === 'lusine-thao-dien-boutique');
  if (placeLusine) {
    await prisma.uGCReview.create({
      data: {
        userId: user.id,
        placeId: placeLusine.id,
        displayName: 'Alex Smith',
        rating: 5,
        content: 'Great avocado toast and excellent coffee selection! Very friendly staff and cozy seating outside.',
        status: 'approved',
      },
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
