import type { Post } from '$lib/types';

export const posts: Post[] = [
	{
		id: 'p1',
		authorId: 'u1',
		content:
			"Bugun shahar kengashida yangi maktab qurilishi loyihasi muhokama qilindi. 2027-yilga qadar 12 ta yangi maktab ochiladi. @ustoz.gulnora bilan bu bo'yicha maslahatlashamiz. Fikringizni yozing — #Talim va #Maktablar rivoji uchun qaysi tumanga birinchi navbatda maktab kerak?",
		createdAt: '2026-08-31T09:12:00',
		comments: 58,
		views: 540,
		mediaUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
		poll: {
			id: 'poll_p1',
			question: 'Qaysi tumanga eng avvalo yangi maktab qurilishi kerak?',
			options: [
				{ id: 'opt_1', text: 'Chilonzor tumani', votes: ['u2', 'u3', 'u4'] },
				{ id: 'opt_2', text: 'Yunusobod tumani', votes: ['u5', 'u6'] },
				{ id: 'opt_3', text: 'Yashnobod tumani', votes: ['u7'] },
				{ id: 'opt_4', text: 'Sergeli tumani', votes: ['u8', 'u1'] }
			]
		}
	},
	{
		id: 'p2',
		authorId: 'u2',
		content:
			"Yurak-qon tomir kasalliklari yoshlar orasida ortib bormoqda. Asosiy sabab — harakatsizlik va noto'g'ri ovqatlanish. Haftada kamida 150 daqiqa jismoniy faollik tavsiya etiladi. #Soglik #Salomatlik #Profilaktika",
		createdAt: '2026-08-31T07:45:00',
		comments: 134,
		views: 5397,
		mediaUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80'
	},
	{
		id: 'p3',
		authorId: 'u4',
		content:
			"Kichik biznes uchun soliq yengilliklari bo'yicha yangi dastur e'lon qilindi. Ariza topshirish muddati 15-oktabrgacha. Batafsil ma'lumot uchun tumandagi tadbirkorlik markaziga murojaat qiling. #Tadbirkorlik #Biznes",
		createdAt: '2026-08-30T18:20:00',
		comments: 89,
		views: 3727
	},
	{
		id: 'p4',
		authorId: 'u3',
		content:
			"Yangi ko'cha yoritish loyihasi quyosh panellari asosida ishlaydi. Bu yiliga taxminan 40% energiya tejamkorligini beradi. Loyiha 3 tumanda sinov rejimida ishga tushirildi. @anvarov qo'llab-quvvatlagani uchun rahmat! #Ekologiya #Muhandislik",
		createdAt: '2026-08-30T15:03:00',
		comments: 34,
		views: 1593,
		mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80'
	},
	{
		id: 'p5',
		authorId: 'u5',
		content:
			"Fuqarolarning murojaat huquqi haqida bilasizmi? Har bir davlat organi 15 ish kuni ichida javob berishi shart. Agar bu amalga oshmasa, shikoyat qilish yo'llari haqida thread yozaman. #Huquq #Shaffoflik",
		createdAt: '2026-08-30T11:11:00',
		comments: 267,
		views: 11051
	},
	{
		id: 'p6',
		authorId: 'u7',
		content:
			"Tekshiruv: o'tgan yili ajratilgan yo'l ta'mirlash byudjetining 30% i hali sarflanmagan. To'liq hisobot va manbalar bilan maqola tez orada saytda. @j.rustamov bilan vaziyatni o'rganyapmiz. #Jurnalistika #Surishtiruv",
		createdAt: '2026-08-29T20:47:00',
		comments: 512,
		views: 22873
	},
	{
		id: 'p7',
		authorId: 'u6',
		content:
			"Raqamli savodxonlik darslari endi barcha maktablarda majburiy fan sifatida kiritildi. Ota-onalar uchun ham bepul kurslar tashkil etilmoqda. #Talim #Maktab",
		createdAt: '2026-08-29T14:30:00',
		comments: 76,
		views: 2519
	},
	{
		id: 'p8',
		authorId: 'u8',
		content:
			"Xivada 'Shahar va San'at' festivali boshlandi. Mahalliy rassomlar ishlari 2 hafta davomida ochiq maydonlarda namoyish etiladi. Kirish bepul. #Sanat #Festival #Xiva",
		createdAt: '2026-08-29T10:05:00',
		comments: 41,
		views: 1414,
		mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80'
	},
	{
		id: 'p9',
		authorId: 'u1',
		content:
			"Ochiq eshiklar kuni — har oyning birinchi juma kuni fuqarolar men bilan bevosita uchrashishi mumkin. Navbat oldindan ro'yxatdan o'tish orqali beriladi. #Muloqot",
		createdAt: '2026-08-28T16:40:00',
		comments: 112,
		views: 2236
	},
	{
		id: 'p10',
		authorId: 'u2',
		content:
			"Bepul tibbiy ko'rik dasturi shu hafta boshlandi. 40 yoshdan oshgan barcha fuqarolar tuman poliklinikasida ro'yxatdan o'tishi mumkin. #Tibbiyot #Salomatlik",
		createdAt: '2026-08-28T08:15:00',
		comments: 203,
		views: 16448
	},
	{
		id: 'p11',
		categoryId: "hisobotlar",
		pinnedAt: '2026-09-01T09:00:00',
		authorId: 'u1',
		content:
			"Shahar kengashi yig'ilishida byudjet ijrosi haqida hisobot berdik. Batafsil ma'lumotlar kanalimizda. #Hisobot",
		createdAt: '2026-08-27T12:00:00',
		comments: 30,
		views: 463,
		channelId: 'c1'
	},
	{
		id: 'p12',
		authorId: 'u2',
		content:
			"Qishki gripp mavsumiga tayyorgarlik: emlash punktlari ish jadvali e'lon qilindi. #Profilaktika",
		createdAt: '2026-08-26T09:30:00',
		comments: 22,
		views: 1028,
		channelId: 'c2'
	},
	{
		id: 'p13',
		authorId: 'u3',
		content:
			"5-mahallada ko'cha yoritilmayapti, uch oydan beri murojaat qilamiz. Kim yana shu muammoga duch kelgan? #Mahalla #Infratuzilma",
		createdAt: '2026-08-25T19:10:00',
		comments: 47,
		views: 890
	},
	{
		id: 'p14',
		authorId: 'u6',
		content:
			"Ertangi ota-onalar yig'ilishi soat 17:00 da, maktab aktlar zalida bo'ladi. Barchani kutamiz. #Maktab",
		createdAt: '2026-08-25T14:00:00',
		comments: 15,
		views: 320
	},
	// --- kengaytirilgan mock (2026-10-01) ---
	{
		id: "p15",
		categoryId: "maslahat",
		authorId: "u11",
		content: "Go'da context.Context ni noto'g'ri ishlatish eng ko'p uchraydigan xatolardan biri: uni struct ichida saqlamang, birinchi argument sifatida uzating va bekor qilishni doim tekshiring. Bu goroutine sizib ketishining oldini oladi. #golang #backend",
		createdAt: "2026-10-01T08:40",
		comments: 2,
		views: 1840,
		channelId: "c6"
	},
	{
		id: "p16",
		authorId: "u13",
		content: "Sentabr oyi bo'yicha qisqa sharh: iste'mol narxlari o'sishi sekinlashdi, ammo oziq-ovqat guruhida mavsumiy bosim saqlanmoqda. To'liq jadval va metodologiya kanalda. #inflyatsiya #iqtisod https://stat.uz/uz/",
		createdAt: "2026-10-01T07:15",
		comments: 2,
		views: 3260,
		channelId: "c9"
	},
	{
		id: "p17",
		authorId: "u10",
		content: "Davlat xizmatlari interfeyslarida eng katta muammo shakl uzunligi emas, balki foydalanuvchi qaysi bosqichda ekanini bilmasligi. Oddiy progress ko'rsatkichi va aniq xato xabarlari to'ldirish muvaffaqiyatini sezilarli oshiradi. #UX #dizayn",
		createdAt: "2026-09-30T19:30",
		comments: 2,
		views: 2410,
		channelId: "c7"
	},
	{
		id: "p18",
		authorId: "u16",
		content: "Bolada harorat 38 dan oshganda har doim antibiotik kerak emas. Avval sababni aniqlash muhim: virusli infeksiyalarda antibiotik yordam bermaydi. Ota-onalar uchun qachon shifokorga zudlik bilan murojaat qilish kerakligi ro'yxati kanalda. #pediatriya #bolalarsalomatligi",
		createdAt: "2026-09-30T16:10",
		comments: 2,
		views: 5120,
		channelId: "c17"
	},
	{
		id: "p19",
		authorId: "u26",
		content: "Mahallamizda ko'cha yoritgichlarini almashtirish ishi yakunlandi: 42 ta yangi LED chiroq o'rnatildi. Xarajat hisoboti va pudratchi shartnomasi nusxasi mahalla kanalida ochiq. Kamchilik ko'rsangiz yozing. #mahalla #shaffoflik",
		createdAt: "2026-09-30T12:00",
		comments: 2,
		views: 1980,
		channelId: "c16"
	},
	{
		id: "p20",
		authorId: "u12",
		content: "Samarqand Eski shahar uylarini tiklashda eng qimmat narsa material emas, balki ustalarning yo'qolib borayotgan bilimi. Yog'och naqshli ustunlarni qayta yasay oladigan ustalar soni o'nlab qoldi. Bu bilimni hujjatlashtirish kerak. #meros #me'morlik",
		createdAt: "2026-09-29T18:45",
		comments: 2,
		views: 2670,
		channelId: "c8"
	},
	{
		id: "p21",
		authorId: "u22",
		content: "Rust'da borrow checker bilan kurashishning eng yaxshi usuli: ma'lumotlar egaligini avval qog'ozga chizish. Kod yozishdan oldin kim nimani egallashini aniqlasangiz, kompilyator xatolari ikki baravar kamayadi. #rust #dasturlash",
		createdAt: "2026-09-29T14:20",
		comments: 1,
		views: 1520
	},
	{
		id: "p22",
		categoryId: "jarayon",
		videoUrl: '/demo/clip-1.webm',
		pinnedAt: '2026-09-30T10:00:00',
		authorId: "u15",
		content: "Orol bo'yi hunarmandlari haqidagi filmning birinchi kesilgan versiyasi tayyor. 62 daqiqa, 14 ta intervyu. Eng qiyin qism: odamlar kamerani unutib, tabiiy gaplashguncha kutish. Maslahat uchun kanalga yozing. #hujjatlikino #OrolBoyi",
		createdAt: "2026-09-29T10:05",
		comments: 1,
		views: 2210,
		channelId: "c12"
	},
	{
		id: "p23",
		authorId: "u19",
		content: "Mehnat shartnomasi bekor qilinganda xodim nimaga haqli? Kompensatsiya, foydalanilmagan ta'til puli va ish haqining oxirgi hisob-kitobi 3 ish kuni ichida to'lanishi shart. Bu qoidani ko'p ish beruvchilar bilmaydi. #mehnathuquqi #huquq",
		createdAt: "2026-09-28T17:30",
		comments: 2,
		views: 4380,
		channelId: "c4"
	},
	{
		id: "p24",
		mediaUrl: '/demo/anim-1.gif',
		authorId: "u17",
		content: "Kasr bilan ishlashni o'rgatishning eng samarali yo'li: avval pitsa yoki non kabi bo'laklarga bo'linadigan real narsalar, so'ng chiziq ustida. Mavhum qoida o'quvchi uchun ma'noga ega bo'lmaguncha yodlash foyda bermaydi. #matematika #metodika",
		createdAt: "2026-09-28T11:15",
		comments: 1,
		views: 1670,
		channelId: "c10"
	},
	{
		id: "p25",
		authorId: "u18",
		content: "Navoiyda 100 MVt quyosh stansiyasi tarmoqqa ulanishida asosiy qiyinchilik quvvat emas, balki tarmoq barqarorligi: kun davomida ishlab chiqarish keskin o'zgaradi. Akkumulyator va tezkor regulyatsiya birgalikda hal qiladi. #energetika #quyosh",
		createdAt: "2026-09-28T09:20",
		comments: 2,
		views: 1930,
		channelId: "c11"
	},
	{
		id: "p26",
		videoUrl: '/demo/clip-3.webm',
		pinnedAt: '2026-09-28T10:00:00',
		authorId: "u14",
		content: "Dutorning ikki ipi bilan zamonaviy aranjirovka qilish qiziq cheklov: har bir nota ahamiyatga ega bo'lib qoladi. Yangi yozuv uchun elektron bas bilan sinab ko'rdim, natija ajoyib chiqdi. Taqdimot kanalda. #dutor #musiqa",
		createdAt: "2026-09-27T20:00",
		comments: 0,
		views: 1340,
		channelId: "c13"
	},
	{
		id: "p27",
		authorId: "u21",
		content: "Tomchilatib sug'orishga o'tgan issiqxonamizda suv sarfi 55 foizga kamaydi, hosil esa 18 foizga oshdi. Boshlang'ich xarajat 14 oyda qoplandi. Hisob-kitob jadvalini kanalga qo'shdim. #agro #suvtejash",
		createdAt: "2026-09-27T15:40",
		comments: 2,
		views: 2780,
		channelId: "c15"
	},
	{
		id: "p28",
		authorId: "u25",
		content: "Shaxsiy moliyada eng oddiy qoida: daromadning kamida 10 foizini tegishli xarajatlardan oldin chetga qo'ying. Qoldiqdan jamg'arish deyarli hech qachon ishlamaydi. #shaxsiymoliya #jamgarma",
		createdAt: "2026-09-27T13:00",
		comments: 1,
		views: 3540,
		channelId: "c9"
	},
	{
		id: "p29",
		authorId: "u20",
		content: "Xorazmda yozgi suv tanqisligi bo'yicha tekshiruvim: uch tumanda kanal tozalash ishlari rejadan 4 oy kech qolgan. Hujjatlar va intervyular kanalda. Rasmiy javobni kutyapman. #suvxojaligi #tekshiruv https://stat.uz",
		createdAt: "2026-09-26T18:10",
		comments: 2,
		views: 2890,
		channelId: "c18"
	},
	{
		id: "p30",
		authorId: "u24",
		content: "Strategiya o'yinimiz prototipida Buyuk Ipak yo'li savdo mexanikasi ishlayapti. Eng qiyin masala: tarixiy to'g'rilik bilan o'yin muvozanatini saqlash. Testchi kerak, yozing. #gamedev #strategiya",
		createdAt: "2026-09-26T16:25",
		comments: 0,
		views: 1120
	},
	{
		id: "p31",
		authorId: "u27",
		content: "Piyodalar zonasi savdoni kamaytirmaydi, aksincha oshiradi: bir qancha shaharlar tajribasida do'konlar tushumi 15-30 foizga o'sgan. Muhimi, avtomobil yo'li va transport vositalari uchun alternativa tayyor bo'lishi. #shaharsozlik #piyodalar",
		createdAt: "2026-09-26T10:30",
		comments: 2,
		views: 2340
	},
	{
		id: "p32",
		authorId: "u28",
		content: "Sport jarohatidan keyin tez qaytishning eng katta xatosi: og'riq yo'qolganda to'liq yukka o'tish. Bo'g'im funksiyasi og'riqdan keyin ham 3-4 hafta tiklanadi. Bosqichma-bosqich yuk dasturi kerak. #ortopediya #sport",
		createdAt: "2026-09-25T17:00",
		comments: 1,
		views: 2060
	},
	{
		id: "p33",
		authorId: "u29",
		content: "Maktabda raqamli darslik joriy qilish texnologiyadan oldin o'qituvchi tayyorgarligi masalasi. Planshet berilgan, lekin o'qituvchi uni dars rejasiga qanday kiritishni bilmaydi. Qisqa amaliy treninglar zarur. #taolim #raqamli",
		createdAt: "2026-09-25T12:40",
		comments: 1,
		views: 1790
	},
	{
		id: "p34",
		videoUrl: '/demo/clip-2.webm',
		authorId: "u30",
		content: "Motion dizaynda eng ko'p qilinadigan xato: hamma narsani animatsiya qilish. Foydalanuvchi diqqatini bitta elementga qarating, qolgani statik tursin. Oddiy 200ms ease-out ko'p murakkab effektdan yaxshi ishlaydi. #motion #dizayn",
		createdAt: "2026-09-24T19:05",
		comments: 1,
		views: 2480,
		channelId: "c7"
	},
	{
		id: "p35",
		mediaUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
		authorId: "u23",
		content: "Rishton sirining rangi pechdagi haroratga va mis oksidining miqdoriga bog'liq. Ustozim aytganidek: rang yozilmaydi, pechda tug'iladi. Yangi o'quvchilar uchun amaliy dars rejasi kanalda. #kulolchilik #hunarmandchilik",
		createdAt: "2026-09-24T11:20",
		comments: 1,
		views: 1560,
		channelId: "c14"
	},
	{
		id: "p36",
		authorId: "u1",
		content: "Viloyatda texnik kollejlar uchun ustoz-amaliyotchi dasturi ishga tushadi: soha mutaxassislari haftasiga 4 soat dars beradi. Ro'yxatdan o'tish shartlari tez orada e'lon qilinadi. #taolim #kasbtalim",
		createdAt: "2026-09-23T15:00",
		comments: 2,
		views: 3120
	},
	{
		id: "p37",
		authorId: "u2",
		content: "Yuqori qon bosimi ko'pincha belgisiz kechadi. 40 yoshdan keyin yiliga kamida bir marta o'lchash va tuz iste'molini kamaytirish eng sodda profilaktika. #kardiologiya #profilaktika",
		createdAt: "2026-09-23T09:30",
		comments: 1,
		views: 3980
	},
	{
		id: "p38",
		categoryId: "savol",
		authorId: "u11",
		content: "Haftalik savol: kichik jamoada mikroservis yoki modulli monolit? Mening tajribam: 10 kishidan kam jamoada monolit tezroq va arzonroq. Siz nima tanlagansiz?",
		createdAt: "2026-09-22T17:15",
		comments: 1,
		views: 2210,
		channelId: "c6",
		poll: { id: "p38_poll", question: "Sizning jamoangiz uchun qaysi arxitektura mosroq?", options: [{ id: "p38_o1", text: "Modulli monolit", votes: ["u22", "u24", "u10", "u3"] },{ id: "p38_o2", text: "Mikroservislar", votes: ["u9", "u29"] },{ id: "p38_o3", text: "Hali aniq emas", votes: ["u20", "u25", "u18"] }] }
	},
	{
		id: "p39",
		authorId: "u13",
		content: "So'rovnoma: kichik biznes uchun hozirgi eng katta to'siq nima deb o'ylaysiz?",
		createdAt: "2026-09-22T12:00",
		comments: 2,
		views: 2640,
		channelId: "c9",
		poll: { id: "p39_poll", question: "Kichik biznes uchun asosiy to'siq?", options: [{ id: "p39_o1", text: "Moliyalashtirishga kirish", votes: ["u4", "u21", "u25", "u1", "u19"] },{ id: "p39_o2", text: "Soliq hisoboti murakkabligi", votes: ["u5", "u26", "u12"] },{ id: "p39_o3", text: "Malakali kadr yetishmasligi", votes: ["u3", "u6", "u17", "u29"] },{ id: "p39_o4", text: "Bozorga kirish", votes: ["u15"] }] }
	},
	{
		id: "p40",
		authorId: "u3",
		content: "Ko'prik inspektsiyasida dron ishlatish tekshiruv vaqtini 3 kundan 4 soatgacha qisqartirdi va xodimlar uchun xavfni kamaytirdi. Ma'lumotlar tahlili uchun yaxshi dastur kerak. #muhandislik #dron",
		createdAt: "2026-09-21T14:10",
		comments: 0,
		views: 1470
	},
	{
		id: "p41",
		authorId: "u4",
		content: "Birinchi mijozni topish: startapchilarning ko'pchiligi mahsulotni mukammallashtirishga oylar sarflaydi. Mening tavsiyam: ishlaydigan eng sodda variantni 5 ta real mijozga ko'rsating va ular nima so'rashini tinglang. #startap #mahsulot",
		createdAt: "2026-09-21T10:45",
		comments: 1,
		views: 3050,
		channelId: "c3"
	},
	{
		id: "p42",
		authorId: "u7",
		content: "Faktchekking qoidasi: biror raqamni takrorlashdan oldin asl manbani toping. Ko'p 'statistika' uch marta ko'chirilgach asl ma'nosini yo'qotadi. #mediasavodxonlik",
		createdAt: "2026-09-20T16:20",
		comments: 1,
		views: 2560
	},
	{
		id: "p43",
		authorId: "u8",
		content: "Yangi akvarel seriyam 'Bozor ertalabi' ustida ishlayapman: Chorsu rastalaridagi ranglar va ritm. Har bir rasmga bir soat: tezlik chizmaning sifatini cheklaydi, lekin jonini beradi. #akvarel #san'at",
		createdAt: "2026-09-20T11:00",
		comments: 0,
		views: 1880
	},
	{
		id: "p44",
		authorId: "u5",
		content: "Ijara shartnomasini imzolashdan oldin tekshiring: ta'mir kimning hisobidan, depozit qachon qaytariladi, narxni o'zgartirish tartibi. Og'zaki kelishuv sudda isbotlash qiyin. #huquq #ijara",
		createdAt: "2026-09-19T15:35",
		comments: 1,
		views: 3610,
		channelId: "c4"
	},
	{
		id: "p45",
		authorId: "u6",
		content: "O'quvchi xatosiga munosabat: 'noto'g'ri' demang, 'keling, birga qaraymiz' deng. Yondashuv o'zgarganda o'quvchilar xatoni yashirmay, so'rashni boshlaydi. #pedagogika",
		createdAt: "2026-09-19T09:00",
		comments: 1,
		views: 2790
	},
	{
		id: "p46",
		authorId: "u9",
		content: "Indie o'yin uchun Steam sahifasi va treyler o'yin tayyor bo'lishidan oldin ham kerak: istaklar ro'yxati qo'shilishi chiqishdan oldingi eng muhim ko'rsatkich. Treylerning dastlabki 5 soniyasi hal qiladi. #indiedev",
		createdAt: "2026-09-18T18:30",
		comments: 0,
		views: 1720,
		channelId: "c5"
	},
	{
		id: "p47",
		categoryId: "moliya",
		mediaUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1000&q=80',
		authorId: "u15",
		content: "Hujjatli film uchun mablag' topishning uch yo'li: grant, jamoaviy yig'im va hamkor tashkilot. Har birining shartlari va qaysi biri qaysi bosqichga mos kelishi kanalda alohida yozma qo'llanmada. #kino #moliyalashtirish",
		createdAt: "2026-09-18T12:15",
		comments: 0,
		views: 1980,
		channelId: "c12"
	},
	{
		id: "p48",
		authorId: "u10",
		content: "Portfolio ko'rib chiqishda ishga oluvchilar 3 ta loyiha ko'radi, 10 ta emas. Har bir loyihada muammo, sizning rolingiz va natija bo'lishi kerak. Chiroyli skrinshotlar yetarli emas. #portfolio #dizayner",
		createdAt: "2026-09-17T14:40",
		comments: 1,
		views: 3340,
		channelId: "c7"
	},
	{
		id: "p49",
		authorId: "u21",
		content: "Issiqxonada pomidor kasalliklarining 70 foizi havo aylanishining yetishmasligidan. Shamollatish oynalarini erta ertalab ochish va sug'orishni ertalabga ko'chirish eng arzon profilaktika. #agro #issiqxona",
		createdAt: "2026-09-17T08:30",
		comments: 1,
		views: 2390,
		channelId: "c15"
	},
	{
		id: "p50",
		mediaUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1000&q=80',
		authorId: "u12",
		content: "Ixcham turar-joy loyihasi: 38 kv.m maydonda bir xonali kvartira. Asosiy g'oya: harakatlanuvchi devor, yashash va ishlash zonalarini kun davomida almashtiradi. Chizmalar kanalda. #arxitektura #ixchamuy",
		createdAt: "2026-09-16T16:50",
		comments: 2,
		views: 2120,
		channelId: "c8"
	},
	{
		id: "p51",
		categoryId: "maslahat",
		authorId: "u22",
		content: "Ochiq kodli loyihaga birinchi hissa qo'shish uchun 'good first issue' belgisini qidiring. Hujjatdagi xato yoki test qo'shish ham haqiqiy hissa hisoblanadi. #opensource https://opensource.guide/uz/",
		createdAt: "2026-09-16T11:25",
		comments: 0,
		views: 1430,
		channelId: "c6"
	},
	{
		id: "p52",
		authorId: "u19",
		content: "Shaxsiy ma'lumotlarni himoya qilish qonuni bo'yicha: kompaniya sizdan ma'lumot to'plash uchun rozilik so'rashi, maqsadini aytishi va o'chirishni talab qilish huquqini berishi shart. #ma'lumothimoyasi",
		createdAt: "2026-09-15T13:10",
		comments: 1,
		views: 2970,
		channelId: "c4"
	},
	{
		id: "p53",
		authorId: "u25",
		content: "Kredit olishdan oldin 'umumiy qiymat'ni hisoblang, faqat oylik to'lovni emas. Foiz, komissiya va sug'urta qo'shilganda summa 25-40 foizga oshishi mumkin. Hisoblash jadvalini ulashaman. #kredit #moliya",
		createdAt: "2026-09-14T10:30",
		comments: 1,
		views: 3480,
		channelId: "c9"
	},
	{
		id: "p54",
		authorId: "u26",
		content: "Mahalla yig'ilishida suv ta'minoti masalasi muhokama qilindi. Qaror: nasos stansiyasini ta'mirlash uchun uch pudratchidan taklif olinadi, tanlov natijasi bu kanalda e'lon qilinadi. #mahalla",
		createdAt: "2026-09-13T17:20",
		comments: 0,
		views: 1650,
		channelId: "c16"
	},
	{
		id: "p55",
		authorId: "u27",
		content: "Toshkentda yangi velosiped yo'laklari shahar markazi bilan chekka tumanlarni bog'lamasa, faqat dam olish uchun bo'lib qoladi. Marshrutlar kundalik yo'l uchun ishlashi kerak. #shaharsozlik #velosiped",
		createdAt: "2026-09-12T15:00",
		comments: 1,
		views: 2260,
		channelId: "c8"
	},
	{
		id: "p56",
		authorId: "u16",
		content: "Emlash jadvalini kechiktirish kerakmi? Yengil shamollash bo'lsa, ko'p hollarda emlash mumkin; yuqori harorat bo'lsa kechiktiriladi. Har bir holatda shifokor bilan maslahatlashing. #emlash #pediatriya",
		createdAt: "2026-09-11T09:45",
		comments: 1,
		views: 4120,
		channelId: "c17"
	},
	{
		id: "p57",
		authorId: "u29",
		content: "O'qituvchi uchun eng yaxshi raqamli vosita murakkab platforma emas, balki dars rejasini tez moslashtiradigan oddiy hujjat va ulashish tizimi. Murakkablik odatda ishlatilmay qoladi. #taolim",
		createdAt: "2026-09-10T11:30",
		comments: 0,
		views: 1380
	},
	{
		id: "p58",
		authorId: "u14",
		content: "Yangi yozuv uchun studiya vaqti kerak: 6 soatlik sessiya, 3 ijrochi. Mablag' yig'ish ochiq kampaniya sifatida kanalda e'lon qilinadi, hisobot bosqichlar bilan. #musiqa #studiya",
		createdAt: "2026-09-09T19:20",
		comments: 0,
		views: 1250,
		channelId: "c13"
	},
	{
		id: "p59",
		authorId: "u20",
		content: "Maqola yozishda manbani ochiq ko'rsatish o'quvchi ishonchini oshiradi, hatto manba noqulay bo'lsa ham. Anonim manbaga faqat xavfsizlik zarur bo'lganda murojaat qiling. #jurnalistika #etika",
		createdAt: "2026-09-08T14:00",
		comments: 0,
		views: 1760,
		channelId: "c18"
	},
	{
		id: "p60",
		mediaUrl: '/demo/anim-2.gif',
		authorId: "u24",
		content: "O'yin muvozanatini sinash uchun hisob-kitob jadvallaridan oldin kichik prototipni 5 ta odamga o'ynatish yaxshiroq. Odamlar nimada qiynalishini kuzatish raqamlardan ko'proq narsa beradi. #gamedev #prototip",
		createdAt: "2026-09-06T16:30",
		comments: 0,
		views: 1340,
		channelId: "c5"
	}
];


export function getPostsByAuthor(authorId: string): Post[] {
	return posts.filter((p) => p.authorId === authorId);
}

export function getPost(id: string): Post | undefined {
	return posts.find((p) => p.id === id);
}

export function getPostsByChannel(channelId: string): Post[] {
	return posts.filter((p) => p.channelId === channelId);
}

