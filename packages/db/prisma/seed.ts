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
  const defaultAvatarConfig = {
    characterId: 'student',
    hairStyle: 'short',
    hairColor: 'default',
    outfitStyle: 'casual',
    outfitColor: 'electricBlue',
    accessory: 'backpack'
  };

  const user = await prisma.user.upsert({
    where: { email: 'user@ecotransit.vn' },
    update: {
      emailVerified: true,
      avatarConfig: defaultAvatarConfig,
    },
    create: {
      email: 'user@ecotransit.vn',
      passwordHash,
      role: 'USER',
      pointsBalanceCache: 150,
      emailVerified: true,
      avatarConfig: defaultAvatarConfig,
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
      stationId: stations[0].id,
      slug: 'cho-ben-thanh-market',
      name: 'Chợ Bến Thành',
      category: 'shopping',
      lat: 10.772085976675005,
      lng: 106.69830647715145,
      address: 'Khu vực đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Biểu tượng sống động lâu đời của Sài Gòn, nằm ngay trung tâm Quận 1 và kết nối trực tiếp tuyến Metro số 1.',
      description: `Giữa lòng Thành phố Hồ Chí Minh sôi động, Chợ Bến Thành từ lâu đã trở thành một biểu tượng không thể bỏ qua đối với bất kỳ du khách nào ghé thăm Sài Gòn. Nằm ngay Quận 1 và kết nối trực tiếp với tuyến Metro số 1, khu chợ sở hữu vị trí thuận tiện để bắt đầu hành trình khám phá thành phố.

Nguồn gốc của Chợ Bến Thành bắt đầu từ đầu thế kỷ 19 ven sông Bến Nghé. Tên gọi "Bến Thành" xuất phát từ vị trí của chợ gần bến sông và thành Gia Định thời bấy giờ. Đến đầu thế kỷ 20, ngôi chợ mới quy mô hơn được xây dựng từ năm 1912 đến 1914 với kiến trúc cổ điển châu Âu kết hợp hài hòa phong cách Việt Nam, nổi bật với tháp đồng hồ ba mặt ở cổng chính hướng Nam.

Chợ có hình dáng chữ nhật với bốn cửa lớn hướng ra các con đường huyết mạch: Cửa Nam trên đường Lê Lợi, Cửa Bắc trên đường Lê Thánh Tôn, Cửa Đông trên đường Phan Bội Châu, và Cửa Tây trên đường Phan Chu Trinh. Bên trong được bố trí hơn 1.500 gian hàng với khu thực phẩm tươi sống, đồ khô gia vị, thời trang vải vóc, thủ công mỹ nghệ và ẩm thực dân dã sầm uất.

Hãy sắp xếp thời gian đi chợ hợp lý: Buổi sáng từ 08:00 - 10:30 là thời điểm lý tưởng khi các gian hàng đã mở cửa đầy đủ nhưng chưa quá đông đúc. Buổi tối từ 18:00 - 22:00 là không khí chợ đêm sôi động. Chú ý bảo quản tư trang cá nhân khi tham quan.`,
      district: 'Quận 1',
      walkingMinutes: 2,
      distanceMeters: 120,
      priceLevel: 2,
      tags: ["shopping","tourism","cultural","metro1"],
      highlights: ["Tháp đồng hồ 3 mặt biểu tượng","Hơn 1.500 gian hàng đa dạng","Khu ẩm thực chợ đêm nhộn nhịp","Kết nối trực tiếp Ga Bến Thành"],
      featured: true,
      imageUrl: '/images/places/cho_ben_thanh_main.png',
      isPublished: true,
    },
    {
      stationId: stations[1].id,
      slug: 'pho-di-bo-nguyen-hue',
      name: 'Phố đi bộ Nguyễn Huệ',
      category: 'attraction',
      lat: 10.774077946585011,
      lng: 106.70365554473017,
      address: 'Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Nhịp sống trẻ trung tại lòng thành phố, quảng trường đi bộ lát đá granite hiện đại dài hơn 670m.',
      description: `Nằm ngay trung tâm Quận 1, Phố đi bộ Nguyễn Huệ là một trong những không gian công cộng nổi bật nhất của Thành phố Hồ Chí Minh. Con đường rộng lớn với chiều dài hơn 670m và rộng 64m thoáng đãng được xem như "trái tim mở" của Sài Gòn.

Trước đây, con đường này từng là một kênh đào dưới thời Pháp thuộc, sau đó được lấp lại thành đại lộ Charner và đổi tên thành đường Nguyễn Huệ vào năm 1956. Năm 2015, nơi đây được cải tạo thành quảng trường đi bộ hiện đại đầu tiên của Việt Nam với bề mặt lát đá granite, hệ thống đài phun nước và cây xanh rợp bóng.

Nổi bật tại đây là các hoạt động biểu diễn nghệ thuật đường phố acoustic, nhảy hiện đại, giao lưu văn hóa và Đường hoa Nguyễn Huệ dịp Tết Nguyên Đán. Ngoài ra, khám phá Chung cư 42 Nguyễn Huệ (The Café Apartment) mang nét kiến trúc vintage ngắm nhìn toàn cảnh phố đi bộ là trải nghiệm không thể bỏ qua.`,
      district: 'Quận 1',
      walkingMinutes: 3,
      distanceMeters: 180,
      priceLevel: 1,
      tags: ["attraction","walkway","checkin","nightlife"],
      highlights: ["Quảng trường lát đá granite 670m","Chung cư 42 Nguyễn Huệ Vintage","Đường hoa Tết rực rỡ","Trình diễn đài phun nước & âm nhạc"],
      featured: true,
      imageUrl: '/images/places/pho_di_bo_nguyen_hue_main.png',
      isPublished: true,
    },
    {
      stationId: stations[2].id,
      slug: 'ben-bach-dang',
      name: 'Bến Bạch Đằng',
      category: 'attraction',
      lat: 10.775593169523622,
      lng: 106.70710899090712,
      address: '2 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Không gian công cộng ven sông Sài Gòn ngợp gió, kết nối trải nghiệm buýt đường sông Waterbus và tượng Trần Hưng Đạo.',
      description: `Bến Bạch Đằng là một trong những không gian công cộng nổi bật của trung tâm Quận 1 nằm ven sông Sài Gòn. Đây là điểm đến lý tưởng để dạo bộ, hóng gió, ngắm cảnh, check-in và thư giãn.

Bến Bạch Đằng gắn liền với các chiến thắng lịch sử trên sông Bạch Đằng (năm 938 do Ngô Quyền chỉ huy, năm 981 do Lê Hoàn lãnh đạo và năm 1288 do Hưng Đạo Đại Vương Trần Quốc Tuấn chỉ huy). Công viên Bạch Đằng khánh thành năm 2022 trở thành lá phổi xanh ven sông đẹp bậc nhất.

Trải nghiệm không thể bỏ qua: Dạo bộ công viên dài 1.300m, đi xe buýt đường sông Saigon Waterbus (15.000đ/lượt) ngắm thành phố từ góc nhìn độc đáo, chiêm bái Tượng Đức Thánh Trần Hưng Đạo tại Công trường Mê Linh và thưởng thức cà phê Waterbiz Coffee ngắm màn hình LED rực rỡ về đêm.`,
      district: 'Quận 1',
      walkingMinutes: 5,
      distanceMeters: 300,
      priceLevel: 1,
      tags: ["attraction","riverview","waterbus","history"],
      highlights: ["Công viên ven sông 1.300m","Trạm Saigon Waterbus hiện đại","Tượng Đức Thánh Trần Hưng Đạo","Ngắm hoàng hôn & sông Sài Gòn"],
      featured: true,
      imageUrl: '/images/places/ben_bach_dang_main.png',
      isPublished: true,
    },
    {
      stationId: stations[1].id,
      slug: 'toa-nha-bitexco',
      name: 'Tòa nhà Bitexco Financial Tower',
      category: 'attraction',
      lat: 10.771927724897115,
      lng: 106.70440808222999,
      address: '2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Tòa tháp 68 tầng lấy cảm hứng từ búp sen vươn nở, biểu tượng kiến trúc hiện đại với đài quan sát Saigon Skydeck.',
      description: `Bitexco Financial Tower là hình ảnh thanh thoát dễ nhận ra giữa đường chân trời trung tâm TP.HCM. Lấy cảm hứng từ dáng búp sen đang vươn nở, tòa tháp mang vẻ mềm mại hiếm có giữa chất liệu kính thép đương đại.

Với chiều cao 262,5m và 68 tầng nổi, thiết kế bởi Carlos Zapata Studio gây ấn tượng mạnh bởi sân đậu trực thăng treo "lơ lửng" tầng 52. Bên trong tích hợp Trung tâm thương mại Icon68 (thời sáng Adidas, Mango, Charles & Keith, rạp phim BHD Star Cineplex, ẩm thực Hoàng Yến Buffet Premier, Nokando Sushi, Starbucks Reserve Mixology).

Đặc biệt, đài quan sát Saigon Skydeck ở tầng 49 mở ra tầm nhìn 360 độ toàn cảnh Sài Gòn từ độ cao gần 180m với hệ thống kính thiên văn hiện đại và không gian trưng bày Áo dài truyền thống.`,
      district: 'Quận 1',
      walkingMinutes: 5,
      distanceMeters: 350,
      priceLevel: 3,
      tags: ["attraction","skydeck","landmark","shopping"],
      highlights: ["Đài quan sát Saigon Skydeck 360°","Sân đậu trực thăng lơ lửng tầng 52","TTTM Icon68 & Rạp phim BHD","Kiến trúc búp sen độc bản"],
      featured: true,
      imageUrl: '/images/places/bitexco_tower_main.png',
      isPublished: true,
    },
    {
      stationId: stations[0].id,
      slug: 'cong-vien-giot-nuoc',
      name: 'Công viên Giọt Nước',
      category: 'attraction',
      lat: 10.766558881849644,
      lng: 106.67785695461878,
      address: '1 Lý Thái Tổ, Phường 1, Quận 10, TP. Hồ Chí Minh',
      shortDescription: 'Không gian tưởng niệm nhân văn sâu sắc với mảng xanh tươi mát và trình diễn nhạc nước nghệ thuật hàng ngày.',
      description: `Công viên Giọt Nước là điểm đến tĩnh lặng mang ý nghĩa nhân văn sâu sắc tại khu vực ngã 7 Lý Thái Tổ, nơi lưu giữ ký ức và tạo không gian sinh hoạt xanh cho cộng đồng cư dân đô thị.

Công viên nổi bật với thiết kế biểu tượng Giọt Nước và quảng trường trình diễn nhạc nước nghệ thuật miễn phí hàng ngày (khung giờ 17:00 - 17:30 và 20:00 - 20:30). Mảng xanh cây cổ thụ và đường dạo bộ thoáng đãng thích hợp cho các hoạt động thể thao nhẹ nhàng và dạo mát thư giãn.`,
      district: 'Quận 10',
      walkingMinutes: 8,
      distanceMeters: 550,
      priceLevel: 1,
      tags: ["attraction","park","fountain","peaceful"],
      highlights: ["Trình diễn nhạc nước nghệ thuật","Không gian cây xanh yên bình","Ý nghĩa lịch sử nhân văn","Vào cửa tự do 24/7"],
      featured: false,
      imageUrl: '/images/places/giot_nuoc_park_main.png',
      isPublished: true,
    },
    {
      stationId: stations[7].id,
      slug: 'daddy-cool-cong-vien-anh-sang',
      name: 'Daddy Cool – Công viên Ánh Sáng (City Park)',
      category: 'attraction',
      lat: 10.798453160645815,
      lng: 106.77214229884025,
      address: 'The Global City, Đỗ Xuân Hợp, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Tổ hợp giải trí City Park với kênh nhạc nước quy mô lớn nhất Đông Nam Á, đường đua Go-Kart và lễ hội ánh sáng đêm.',
      description: `Nằm trong đại đô thị The Global City, Công viên Ánh Sáng và khu giải trí City Park (Daddy Cool) là siêu điểm đến giải trí công nghệ cao mới nổi bật nhất khu Đông TP.HCM, kết nối nhanh chóng từ các nhà ga Metro Tuyến 1 (An Phú, Rạch Chiếc).

Nơi đây sở hữu Vịnh Tình Yêu với kênh nhạc nước dài 2km trình diễn hiệu ứng laser & lửa lớn nhất Đông Nam Á; Đường đua xe Go-Kart tích hợp công nghệ cảm ứng thời gian thực; Khu ẩm thực bia thủ công & đồ nướng ngoài trời Daddy Cool năng động; Công viên diều và thảm cỏ dã ngoại rộng hàng ngàn mét vuông phục vụ lễ hội âm nhạc đêm.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 6,
      distanceMeters: 400,
      priceLevel: 2,
      tags: ["attraction","entertainment","lightpark","gokart"],
      highlights: ["Kênh nhạc nước lớn nhất ĐNÁ","Đường đua xe Go-Kart công nghệ","Ẩm thực nướng ngoài trời Daddy Cool","Không gian lễ hội ánh sáng"],
      featured: true,
      imageUrl: '/images/places/daddy_cool_main.png',
      isPublished: true,
    },
    {
      stationId: stations[0].id,
      slug: 'bao-tang-my-thuat-tphcm',
      name: 'Bảo tàng Mỹ thuật Thành phố Hồ Chí Minh',
      category: 'attraction',
      lat: 10.7699,
      lng: 106.6993,
      address: '97 Phó Đức Chính, Phường Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Tòa dinh thự cổ kính phong cách Art Deco kết hợp kiến trúc Pháp - Á Đông, nơi lưu giữ hơn 22.000 tác phẩm nghệ thuật vô giá.',
      description: `Bảo tàng Mỹ thuật TP.HCM từng là dinh thự của thương gia người Hoa giàu có bậc nhất Sài Gòn xưa - Chú Hỏa (Hứa Bon Hòa). Tòa nhà được xây dựng vào thập niên 1920 theo phong cách Art Deco hòa quyện với đường nét kiến trúc Á Đông thanh lịch.

Nơi đây trưng bày hơn 22.000 hiện vật nghệ thuật hội họa, điêu khắc qua các thời kỳ lịch sử Việt Nam, nổi bật với kiệt tác "Vườn xuân Trung Nam Bắc" của danh họa Nguyễn Gia Trí (Bảo vật Quốc gia). Ngoài ra, cầu thang xoắn ốc cổ kính và các ô cửa kính màu hoa văn Pháp làm nên góc check-in nghệ thuật hàng đầu Sài Thành.`,
      district: 'Quận 1',
      walkingMinutes: 4,
      distanceMeters: 250,
      priceLevel: 1,
      tags: ["attraction","museum","art","architecture"],
      highlights: ["Bảo vật Quốc gia Vườn xuân Trung Nam Bắc","Kiến trúc biệt thự Art Deco cổ kính","Thang máy cổ xưa độc đáo","Cách Ga Bến Thành 250m"],
      featured: true,
      imageUrl: '/images/places/cho_ben_thanh_arch.png',
      isPublished: true,
    },
    {
      stationId: stations[5].id,
      slug: 'slay-concept-thao-dien',
      name: 'Slay Concept Studio & Cafe',
      category: 'cafe',
      lat: 10.8062,
      lng: 106.7325,
      address: '212 Nguyễn Văn Hưởng, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Tổ hợp Cafe & Concept Studio phong cách Minimalism sang chảnh, không gian ngập ánh sáng tự nhiên cho giới trẻ.',
      description: `Nằm tại tâm điểm bán đảo Thảo Điền ngợp màu xanh, Slay Concept là quán cà phê tích hợp Studio chụp ảnh mang ngôn ngữ thiết kế tối giản Hàn Quốc sang trọng. Với tone màu kem beige dịu mắt và nội thất thiết kế đương đại, nơi đây thu hút đông đảo tín đồ mê chụp ảnh sống ảo.

Menu phục vụ các món Cold Brew tuyển chọn, trà trái cây nhiệt đới tươi mát và bánh ngọt chuẩn vị Pháp. Không gian yên tĩnh phù hợp cho học tập, gặp gỡ đối tác hoặc thư giãn cuối tuần.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 5,
      distanceMeters: 380,
      priceLevel: 2,
      tags: ["cafe","study/work friendly","photo","thaodien"],
      highlights: ["Góc sống ảo phong cách Minimalism","Trà trái cây tươi & Cà phê Specialty","Không gian yên tĩnh nhiều ổ cắm","Gần Ga Thảo Điền"],
      featured: false,
      imageUrl: '/images/places/lusine_thao_dien.webp',
      isPublished: true,
    },
    {
      stationId: stations[10].id,
      slug: 'van-phuc-city',
      name: 'Khu đô thị Vạn Phúc City',
      category: 'attraction',
      lat: 10.8355,
      lng: 106.7188,
      address: 'Quốc lộ 13, Phường Hiệp Bình Phước, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Đại đô thị sinh thái ven sông Sài Gòn với hồ Đại Nhật, công viên Ocean World và quảng trường nhạc nước 16ha.',
      description: `Vạn Phúc City được ví như một bán đảo xanh mát bao bọc bởi 3 mặt sông Sài Gòn tại Thủ Đức. Điểm nhấn trung tâm là Hồ Đại Nhật rộng 16ha kết nối Công viên ven sông The Long Park dài 3,4km – dài nhất TP.HCM.

Tại quảng trường trung tâm, du khách có thể thưởng thức màn trình diễn nhạc nước kết hợp màn chiếu ánh sáng laser trên mặt nước rộng lớn, dạo bộ ngắm tháp đồng hồ và thưởng thức ẩm thực tại tuyến phố thương mại sầm uất.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 7,
      distanceMeters: 450,
      priceLevel: 1,
      tags: ["attraction","park","waterfront","fountain"],
      highlights: ["Hồ sinh thái Đại Nhật 16ha","Công viên ven sông 3,4km dài nhất","Quảng trường nhạc nước ánh sáng","Tổ hợp ẩm thực đường phố"],
      featured: true,
      imageUrl: '/images/places/daddy_cool_main.png',
      isPublished: true,
    },
    {
      stationId: stations[0].id,
      slug: 'bao-tang-y-hoc-co-truyen-fito',
      name: 'Bảo tàng Y học Cổ truyền Việt Nam (FITO)',
      category: 'attraction',
      lat: 10.7765,
      lng: 106.6715,
      address: '41 Hoàng Dư Khương, Phường 12, Quận 10, TP. Hồ Chí Minh',
      shortDescription: 'Bảo tàng tư nhân 6 tầng độc đáo bằng gỗ chạm khắc hoa văn cổ, bảo tồn hơn 3.000 hiện vật y học cổ truyền Đông Y.',
      description: `FITO Museum là bảo tàng y học cổ truyền tư nhân đầu tiên tại Việt Nam, gồm 6 tầng với 18 phòng trưng bày tái hiện không gian nhà thuốc Đông Y từ thế kỷ 17. Toàn bộ nội thất được dựng bằng gỗ quý chạm khắc công phu theo kiến trúc tháp Chàm và nhà rường Huế.

Du khách được tận mắt chiêm ngưỡng các dụng cụ bào chế thuốc cổ xưa, bộ sưu tập ấm sắc thuốc bằng gốm sứ đa dạng, tìm hiểu các bài thuốc dân gian của Hải Thượng Lãn Ông và trải nghiệm dùng thử trà thảo dược thanh nhiệt.`,
      district: 'Quận 10',
      walkingMinutes: 9,
      distanceMeters: 600,
      priceLevel: 2,
      tags: ["attraction","museum","heritage","medicine"],
      highlights: ["Kiến trúc nhà gỗ 6 tầng cổ kính","Hơn 3.000 hiện vật Đông Y quý hiếm","Thưởng thức trà thảo dược miễn phí","Không gian trải nghiệm văn hóa"],
      featured: false,
      imageUrl: '/images/places/cho_ben_thanh_history.png',
      isPublished: true,
    },
    {
      stationId: stations[1].id,
      slug: 'buu-dien-thanh-pho-hcm',
      name: 'Bưu điện Thành phố Hồ Chí Minh',
      category: 'attraction',
      lat: 10.7798,
      lng: 106.6998,
      address: '2 Công xã Paris, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Công trình kiến trúc Phục Hưng Châu Âu lẫy lừng xây dựng từ 1886, công trình bưu chính biểu tượng của Sài Gòn.',
      description: `Nằm đối diện Nhà thờ Đức Bà, Bưu điện Thành phố Hồ Chí Minh được thiết kế bởi kiến trúc sư vĩ đại Gustave Eiffel kết hợp với Foulhoux. Xây dựng trong khoảng năm 1886 – 1891, công trình mang phong cách Châu Âu cổ điển kết hợp mái vòm kính kim loại uốn cong lộng lẫy.

Bên trong là vòm trần cao vút mạ vàng, bản đồ lịch sử Sài Gòn cổ được vẽ tay trên tường và các quầy điện thoại gỗ cổ xưa. Du khách có thể gửi bưu thiếp lưu niệm về tận quê nhà và mua quà lưu niệm thủ công mỹ nghệ tinh xảo.`,
      district: 'Quận 1',
      walkingMinutes: 4,
      distanceMeters: 280,
      priceLevel: 1,
      tags: ["attraction","landmark","history","architecture"],
      highlights: ["Kiến trúc mái vòm kính Eiffel","Bản đồ vẽ tay Sài Gòn cổ xưa","Đối diện Nhà thờ Đức Bà","Vào cửa tham quan tự do"],
      featured: true,
      imageUrl: '/images/places/pho_di_bo_nguyen_hue_history.png',
      isPublished: true,
    },
    {
      stationId: stations[0].id,
      slug: 'dinh-doc-lap-saigon',
      name: 'Dinh Độc Lập (Dinh Thống Nhất)',
      category: 'attraction',
      lat: 10.7769,
      lng: 106.6953,
      address: '135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Di tích lịch sử Quốc gia đặc biệt, công trình kiến trúc hiện đại độc bản của KTS Ngô Kế Thừa chứng kiến mốc son 30/04/1975.',
      description: `Dinh Độc Lập rộng hơn 12ha xanh rợp bóng cây cổ thụ giữa trung tâm Quận 1. Thiết kế bởi KTS Ngô Kế Thừa theo hình chữ "CÁT" mang triết lý phong thủy Phương Đông, tòa dinh thự từng là đại bản doanh chính trị thời kỳ chiến tranh.

Du khách có thể tham quan các phòng khánh tiết lộng lẫy, phòng họp Hội đồng Bộ trưởng, hầm chỉ huy quân sự kiên cố ngầm dưới lòng đất và ngắm nhìn chiếc xe tăng 390 lịch sử ghi dấu ngày giải phóng miền Nam 30/4/1975.`,
      district: 'Quận 1',
      walkingMinutes: 6,
      distanceMeters: 420,
      priceLevel: 1,
      tags: ["attraction","history","landmark","park"],
      highlights: ["Khu di tích Lịch sử Quốc gia đặc biệt","Hầm chỉ huy quân sự dưới lòng đất","Chiếc xe tăng lịch sử 390","Công viên xanh 12ha ngợp mát"],
      featured: true,
      imageUrl: '/images/places/cho_ben_thanh_main.png',
      isPublished: true,
    },
    {
      stationId: stations[11].id,
      slug: 'bao-tang-ao-dai-vietnam',
      name: 'Bảo tàng Áo Dài Việt Nam',
      category: 'attraction',
      lat: 10.8288,
      lng: 106.8455,
      address: '206/19/30 Long Thuận, Phường Long Phước, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Bảo tàng sinh thái miệt vườn miền Tây duyên dáng của NTK Sĩ Hoàng, nơi tôn vinh nét đẹp Áo dài qua các thời kỳ.',
      description: `Sáng lập bởi nhà thiết kế Sĩ Hoàng, Bảo tàng Áo Dài trải rộng trên thảm xanh rợp bóng dừa, ao sen và nhà gỗ cổ Nam Bộ. Nơi đây lưu giữ hàng trăm mẫu áo dài từ thời xa xưa, áo dài của các nữ anh hùng lịch sử, nghệ sĩ nhân dân nổi tiếng và các bộ sưu tập đoạt giải quốc tế.

Du khách được trải nghiệm mặc áo dài chụp ảnh tại bến thuyền gỗ thô sơ, chèo thuyền trên rạch nước miệt vườn và tự tay vẽ hoa văn lên áo dài lưu niệm.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 8,
      distanceMeters: 500,
      priceLevel: 1,
      tags: ["attraction","museum","aodai","culture"],
      highlights: ["Không gian sinh thái miệt vườn Nam Bộ","Bộ sưu tập Áo dài lịch sử vô giá","Dịch vụ thuê Áo dài chụp ảnh","Gần Ga Khu Công nghệ cao"],
      featured: false,
      imageUrl: '/images/places/pho_di_bo_nguyen_hue_spring.png',
      isPublished: true,
    },
    {
      stationId: stations[13].id,
      slug: 'den-hung-thu-duc',
      name: 'Khu Đền Quốc Tổ Hùng Vương (Đền Hùng)',
      category: 'attraction',
      lat: 10.8755,
      lng: 106.8188,
      address: 'Công viên Lịch sử Văn hóa Dân tộc, Phường Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Công trình tưởng niệm Quốc Tổ thiêng liêng trên đồi cao ngợp màu xanh, điểm hội tụ tâm linh người phương Nam.',
      description: `Tọa lạc trên ngọn đồi cao thuộc Công viên Lịch sử Văn hóa Dân tộc, Đền Quốc Tổ Hùng Vương được thiết kế theo lối kiến trúc truyền thống uy nghiêm. Lối lên đền gồm 107 bậc đá uốn lượn qua các tầng tượng trưng cho sự gắn kết dân tộc.

Nhà bái đường uy nghi trưng bày trống đồng Đông Sơn, bánh chưng bánh giầy khổng lồ mô phỏng và lư hương rồng mạ vàng. Đây là trung tâm diễn ra Giỗ Tổ Hùng Vương (10/3 âm lịch) thu hút hàng vạn đồng bào dâng hương.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 7,
      distanceMeters: 450,
      priceLevel: 1,
      tags: ["attraction","temple","history","spiritual"],
      highlights: ["Tượng đài Quốc Tổ Hùng Vương uy nghiêm","107 bậc đá công phu uốn lượn","Không gian cây xanh thanh tĩnh","Đối diện Ga Bến xe Miền Đông mới"],
      featured: false,
      imageUrl: '/images/places/ben_bach_dang_main.png',
      isPublished: true,
    },
    {
      stationId: stations[0].id,
      slug: 'khu-du-lich-cuchi-fosaco',
      name: 'Khu du lịch Sinh thái Dân tộc Tây Nguyên Fosaco',
      category: 'attraction',
      lat: 11.0255,
      lng: 106.5188,
      address: 'Ấp Ngã Tư, Xã Nhuận Đức, Huyện Củ Chi, TP. Hồ Chí Minh',
      shortDescription: 'Làng sinh thái văn hóa Tây Nguyên thu nhỏ giữa lòng Củ Chi với nhà rông, điệu múa cồng chiêng và ẩm thực cơm lam.',
      description: `Fosaco được ví như một "Tây Nguyên thu nhỏ" nằm yên bình giữa rừng cây xanh mát tại Củ Chi. Điểm đặc sắc là quần thể kiến trúc nhà rông gầm cao, nhà dài dệt thổ cẩm của đồng bào M'Nông, Mạ, Ê Đê.

Du khách tới đây được thưởng thức vũ điệu cồng chiêng bên lửa trại, thưởng thức thịt nướng ống tre, cơm lam thơm lừng và trải nghiệm cưỡi ngựa ngắm cảnh hồ sinh thái.`,
      district: 'Huyện Củ Chi',
      walkingMinutes: 12,
      distanceMeters: 800,
      priceLevel: 2,
      tags: ["attraction","ecotourism","culture","cuchi"],
      highlights: ["Nhà rông Tây Nguyên nguyên bản","Biểu diễn cồng chiêng & Đốt lửa trại","Ẩm thực Cơm lam & Gà nướng","Không gian dã ngoại ngoài trời"],
      featured: false,
      imageUrl: '/images/places/thao_dien_garden.webp',
      isPublished: true,
    },
    {
      stationId: stations[4].id,
      slug: 'sunny-farm-saigon',
      name: 'Sunny Farm Sài Gòn',
      category: 'attraction',
      lat: 10.8255,
      lng: 106.7088,
      address: '173/1 Bình Lợi, Phường 13, Quận Bình Thạnh, TP. Hồ Chí Minh',
      shortDescription: 'Nông trại cừu ven sông phong cách Đà Lạt giữa lòng Sài Gòn với nấc thang lên thiên đường và quán cafe hoàng hôn.',
      description: `Sunny Farm mang không khí mộng mơ của Đà Lạt về với Sài Gòn năng động. Điểm nhấn hot nhất là đồng cỏ xanh với bầy cừu trắng muốt thân thiện cho du khách vuốt ve và chụp ảnh.

Ngoài ra, quán sở hữu "Nấc thang lên thiên đường" view trọn hoàng hôn ven sông, nhà gỗ hoa mười giờ rực rỡ và khu BBQ nướng ngoài trời thoáng đãng buổi tối.`,
      district: 'Quận Bình Thạnh',
      walkingMinutes: 6,
      distanceMeters: 400,
      priceLevel: 2,
      tags: ["attraction","farm","dalatstyle","sunset"],
      highlights: ["Trại cừu trắng thân thiện","Nấc thang lên thiên đường Check-in","View ngắm hoàng hôn sông đẹp","Gần Ga Tân Cảng"],
      featured: true,
      imageUrl: '/images/places/lusine_thao_dien.webp',
      isPublished: true,
    },
    {
      stationId: stations[12].id,
      slug: 'suoi-tien-theme-park',
      name: 'Khu du lịch Văn hóa Suối Tiên',
      category: 'attraction',
      lat: 10.8588,
      lng: 106.803,
      address: '120 Xa lộ Hà Nội, Phường Tân Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Công viên giải trí chủ đề văn hóa thần thoại lớn nhất Nam Bộ, kết nối trực tiếp ga Metro Tuyến 1.',
      description: `Suối Tiên là công viên giải trí chủ đề văn hóa huyền thoại lâu đời bậc nhất Việt Nam với diện tích rộng hơn 105ha. Các công trình được thiết kế mô phỏng các mốc lịch sử và truyền thuyết như Sơn Tinh Thủy Tinh, Lạc Long Quân - Âu Cơ.

Nổi bật là Biển Tiên Đồng - Ngọc Nữ (biển nhân tạo nước mặn đầu tiên tại Việt Nam), Tàu lượn siêu tốc 1,2km, Thủy cung dưới lòng đất và Vương quốc cá sấu với hơn 25.000 con.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 3,
      distanceMeters: 180,
      priceLevel: 2,
      tags: ["attraction","themepark","family","metro1"],
      highlights: ["Biển nhân tạo Tiên Đồng Ngọc Nữ","Kết nối thẳng Ga Metro Suối Tiên","Tàu lượn siêu tốc cảm giác mạnh","Lễ hội Trái cây Mùa hè"],
      featured: true,
      imageUrl: '/images/places/suoi_tien.webp',
      isPublished: true,
    },
    {
      stationId: stations[2].id,
      slug: 'cong-vien-bo-song-thu-duc',
      name: 'Công viên Bờ sông Thủ Đức (Thủ Thiêm)',
      category: 'attraction',
      lat: 10.7788,
      lng: 106.7099,
      address: 'Đường Trần Bạch Đằng, Phường Thủ Thiêm, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Công viên ven sông 20ha hiện đại bậc nhất view ôm trọn Landmark 81 và chuỗi cao ốc trung tâm Quận 1.',
      description: `Công viên Bờ sông Thủ Đức rộng gần 20ha kéo dài từ chân cầu Ba Son đến dốc cầu Thủ Thiêm 1. Đây là không gian xanh đa chức năng mới hiện đại bậc nhất dành cho cư dân và du khách.

Điểm nhấn là Cánh đồng hoa hướng dương rộng lớn, chuỗi mảng xanh dạo bộ ngợp gió, cầu đi bộ ngắm cảnh sông Sài Gòn rực rỡ ánh đèn đêm và khu ẩm thực container sôi động.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 5,
      distanceMeters: 350,
      priceLevel: 1,
      tags: ["attraction","park","sunflower","skyline"],
      highlights: ["Cánh đồng hoa hướng dương","View Landmark 81 & Skyline Quận 1","Kết nối qua Cầu Ba Son","Không gian dạo bộ ngợp gió"],
      featured: true,
      imageUrl: '/images/places/ben_bach_dang_main.png',
      isPublished: true,
    },
    {
      stationId: stations[2].id,
      slug: 'bai-tha-dieu-thu-thiem',
      name: 'Bãi thả diều Thủ Thiêm',
      category: 'attraction',
      lat: 10.7725,
      lng: 106.7125,
      address: 'Khu đô thị mới Thủ Thiêm (gần chân cầu Ba Son), TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Bãi cỏ xanh lộng gió rợp trời diều ngộ nghĩnh mỗi chiều hoàng hôn, điểm hẹn thư giãn yêu thích của giới trẻ.',
      description: `Bãi thả diều Thủ Thiêm là khoảng thảm cỏ tự nhiên lộng gió nằm sát bờ sông Sài Gòn. Mỗi chiều từ 16h00, hàng trăm chiếc diều đủ hình dáng cá voi, đại bàng, siêu nhân rực rỡ bay lượn trên bầu trời.

Nơi đây thu hút gia đình và bạn trẻ đến ngắm hoàng hôn buông xuống phía sau các tòa cao ốc Quận 1, thưởng thức cá viên chiên và trà chanh lề đường ngợp gió.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 7,
      distanceMeters: 450,
      priceLevel: 1,
      tags: ["attraction","kite","chill","sunset"],
      highlights: ["Hàng trăm chiếc diều rực rỡ","Không gian lộng gió mát mẻ","View ngắm hoàng hôn lãng mạn","Đi bộ ngắn từ Ga Ba Son"],
      featured: false,
      imageUrl: '/images/places/giot_nuoc_park_main.png',
      isPublished: true,
    },
    {
      stationId: stations[12].id,
      slug: 'cuc-phuong-expo-saigon',
      name: 'Triển lãm Sinh thái Cúc Phương TP.HCM',
      category: 'attraction',
      lat: 10.8622,
      lng: 106.8088,
      address: 'Khu Bảo tồn Sinh thái Suối Tiên, Xa lộ Hà Nội, TP. Thủ Đức, TP. Hồ Chí Minh',
      shortDescription: 'Không gian trải nghiệm giáo dục môi trường tái hiện hệ sinh thái rừng mưa nhiệt đới Vườn Quốc gia Cúc Phương.',
      description: `Không gian trưng bày triển lãm mô phỏng lại những nét đặc trưng độc đáo của rừng nguyên sinh Cúc Phương với bộ sưu tập tiêu bản bướm rừng rực rỡ, cây cổ thụ nghìn năm tuổi và các chương trình giáo dục bảo tồn thiên nhiên.

Du khách trẻ em và học sinh được tham gia các buổi workshop tìm hiểu về thế giới động thực vật hoang dã, trồng cây mầm bảo vệ Trái Đất và lan tỏa thông điệp sống xanh.`,
      district: 'Thành phố Thủ Đức',
      walkingMinutes: 5,
      distanceMeters: 320,
      priceLevel: 1,
      tags: ["attraction","nature","education","greenlife"],
      highlights: ["Mô hình rừng mưa nhiệt đới","Bộ sưu tập bướm rừng phong phú","Workshop giáo dục bảo vệ môi trường","Gần Ga Suối Tiên"],
      featured: false,
      imageUrl: '/images/places/suoi_tien.webp',
      isPublished: true,
    },
    {
      stationId: stations[1].id,
      slug: 'union-square-shopping-mall',
      name: 'Trung tâm thương mại Union Square',
      category: 'shopping',
      lat: 10.776,
      lng: 106.7022,
      address: '171 Đồng Khởi & 116 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      shortDescription: 'Thiên đường mua sắm xa xỉ kiến trúc Pháp cổ tráng lệ, điểm hẹn thời trang cao cấp ngay trên phố đi bộ.',
      description: `Union Square sở hữu vị trí vàng đắc địa nhất Sài Gòn với 4 mặt tiền ôm trọn Đồng Khởi, Nguyễn Huệ, Lê Lợi và Lê Thánh Tôn. Tòa nhà mang phong cách kiến trúc Pháp cổ điển sang trọng và đẳng cấp.

Bên trong quy tụ các thương hiệu thời trang xa xỉ hàng đầu thế giới như Hermès, Chanel, Dior, Louis Vuitton cùng chuỗi nhà hàng fine-dining Pháp và quán cafe ngoài trời ngắm trọn Nhà hát Lớn.`,
      district: 'Quận 1',
      walkingMinutes: 1,
      distanceMeters: 50,
      priceLevel: 3,
      tags: ["shopping","luxury","fashion","landmark"],
      highlights: ["Kết nối trực tiếp Lối ra Ga Nhà hát TP","Quy tụ thương hiệu xa xỉ thế giới","Kiến trúc Pháp tráng lệ 4 mặt tiền","Nhà hàng Fine-Dining đẳng cấp"],
      featured: true,
      imageUrl: '/images/places/nha_hat.webp',
      isPublished: true,
    }
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
