# graduss: loyihaga QO'SHILMAYDIGAN narsalar

Bu fayl egasi (foydalanuvchi) bilan kelishilgan chegara. Yangi funksiya qo'shishdan oldin shu yerni o'qish shart.
Ro'yxatda yo'q narsa ham so'ralmagan bo'lsa qo'shilmaydi: avval so'raladi.

## Qoralama (avvalgi qarorlardan, tasdiqlanishi kerak)

- [ ] O'yin-kulgi elementlari (gamifikatsiya, ball, nishon, o'yin) yo'q. Tarmoq jiddiy, kasblar uchun.
- [ ] Alohida "kraudfanding bo'limi" yo'q. Kampaniya faqat kanal ichida, kanal egasi ochadi.
- [ ] Haqiqiy to'lov (Payme/Click/Uzum, escrow) yuridik masala aniqlanmaguncha ulanmaydi. Hozir pul DEMO.
- [ ] Prod'ga chiqarish (nginx, sertifikat, deploy) faqat foydalanuvchi so'raganda.

## Foydalanuvchi qo'shadigan taqiqlar

- [x] Story (hikoyalar) YO'Q. (2026-10-01, foydalanuvchi aytdi)
- [x] Like (yoqtirish) YO'Q, emoji-reaksiyalar ham. (2026-10-01)
- [x] "Ulashish" (repost) tugmasi va ulashishlar soni YO'Q (hech narsa qilmas edi); postni chatga yuborish "Yuborish" qoladi (2026-10-01).
- [x] Foydalanuvchi profiliga obuna (user-to-user follow) YO'Q: tugma, "kuzatilmoqda/obunachilar" sonlari, "sizni kuzata boshladi" bildirishnomasi. (2026-10-01)
- [x] Kanalga a'zo bo'lish QOLADI (lenta shu asosda). Kanal A'ZOLARI SONI faqat KANAL EGASIGA ko'rinadi (kanal sahifasida "faqat sizga ko'rinadi"); ro'yxatlarda, qidiruvda va boshqalarga YO'Q. "Obuna bo'ling" undovlari YO'Q. (2026-10-01)
- [x] Kanal egasi ("Egasi: ...") standart KO'RSATILMAYDI; egasi kanalni tahrirlashda "Meni kanal egasi sifatida ko'rsatish" belgisini yoqsa ko'rinadi (`Channel.showOwner`) (2026-10-01).
- [x] Aksent rang tanlagich (Sozlamalar) ISHLAYDI: indigo (standart), zumrad, amber, atirgul, firuza; `data-accent` + app.css `--color-brand-*` ni almashtiradi, brauzerda saqlanadi (2026-10-01).

### Bajarildi (2026-10-01)
Story va Like/reaksiya frontend + backend + bazadan olib tashlandi (migratsiya 0002). FRONTEND prod'da (2026-10-01). BACKEND (route'lar + migratsiya 0002) ataylab chiqarilmagan: foydalanuvchi frontend tugagach oxirida birga ishga tushiradi. Hozirgi prod backend eski, lekin yangi frontend bilan mos.

## Qo'shilishi mumkin, lekin faqat so'rab

(bu yerga yoziladi)

### Backend'da qilinadigan (oxirida, birga ishga tushiriladi)
- migratsiya 0002 (stories, reactions) tayyor.
- Follow: `/api/follow/{id}` route, follows jadvali, bootstrap `followingIds`, `follow` bildirishnoma turi, users.followers/following hisoblari OLIB TASHLANADI.
- Lenta endi a'zo kanallar + o'z postlar (frontend `getFeed`).

### Interfeys qoidalari
- MEDIA YUBORISH OYNASI (`MediaSendDialog`; biriktirish menyusi → Media → rasm(lar) tanlanadi → oyna; 10 tagacha): izoh maydoni, "⋮" menyusi: Qo'shish · Izohni tepaga chiqarish/pastga tushirish (`Message.captionUp`) · Fayl sifatida yuborish/Rasm sifatida yuborish (asl fayl, har biri alohida fayl xabari; demo 1 MB) · Spoyler yoqish/o'chirish (`Message.spoiler`, bosilguncha xira, qurilmada ochiladi; fayl rejimida yo'q). Bir nechta rasm bitta albom xabari (`Message.images`, imageUrl = birinchisi). Ovozli/doira video xabar: to'lqin, tezlik, bitta ijro (2026-10-02).
- CHATDA QIDIRISH (suhbat sarlavhasidagi lupa): xabar matni/fayl nomi/so'rovnoma savoli bo'yicha; eng yangi moslikdan boshlanadi, "n/m" hisobi, yuqoriga/pastga strelka yoki Enter/Shift+Enter, mos xabarlar halqa bilan belgilanadi; Esc faqat qidiruvni yopadi (suhbatdan chiqarmaydi). Faqat mijozda (2026-10-02).
- KANAL TADBIRLARI (`ChannelEvent`, `EventCard`, `CreateEventDialog`): faqat egasi qo'shadi (nom<=80, tavsif<=300, ixtiyoriy http(s) havola, vaqt kelajakda, bir vaqtda 5 tagacha) va o'chiradi; kanal sahifasida "Hammasi" filtrida kampaniya kartasi tepasida. A'zo/ega "Eslatma qo'yish" bosadi, boshlanishiga 1 soat qolganda bildirishnoma (`type: 'event'`); eslatma qo'yganlar SONI faqat egaga ("faqat sizga ko'rinadi"). Boshlangach 2 soat o'tib kartadan yo'qoladi. Demo rejimda; API rejimda tugma yashirin (backend yo'q) (2026-10-02).
- KANAL STATISTIKASI (egaga "Statistika" tugmasi, `ChannelStatsDialog`): postlar, ko'rishlar, izohlar, so'rovnoma ovozlari, o'rtacha ko'rish/izoh, 7 kunlik post chizig'i, eng ko'p ko'rilgan 3 post. Faqat egaga; like/reyting YO'Q (2026-10-02).
- QORALAMA VA REJALASHTIRISH (`Post.isDraft`, `Post.scheduledAt`, `ScheduledDialog`): composer'da "Rejalashtirish" (vaqt kelajakda) va "Qoralamaga"; chop etilmagan postlar HECH QAYERDA (lenta, kanal, profil, qidiruv, teg, trend) ko'rinmaydi, faqat muallifga "Qoralama va rejalar (N)" oynasida: hozir chop etish, vaqtni o'zgartirish, qoralamaga qaytarish, o'chirish. Vaqti kelganda o'zi chop etiladi (15 s tekshiruv). Barcha ro'yxatlar `isLive` filtridan o'tadi: yangi post ro'yxati qo'shilsa shuni unutma. Postni TAHRIRLASH qoralamada hozircha yo'q. API rejimda tugmalar yashirin (2026-10-02).
- TELEFON SUHBAT QOTIRMASI: suhbat ochiq paytda `html.chat-open` (app.css, faqat <640px) sahifa aylanishini o'chiradi, yozish paneli pastda qotadi; faqat xabarlar ro'yxati aylanadi (`overscroll-contain`). `viewport-fit=cover` + `--safe-b` (iPhone pastki chizig'i; klaviatura ochiqda keyboard.ts 0 qiladi) pastki panel, FAB va yozish panelida. Klaviatura ochilganda pastda turgan bo'lsangiz pastda qolasiz (ResizeObserver). Mobil input shrifti >=16px (iOS yaqinlashtirmasin) (2026-10-02).
- XABAR MENYUSI (xabar ustida o'ng tugma / sensorli ekranda bosib turish; `contextMenu` action, `ui/ContextMenu`, `MessageContextMenu`): Javob berish · Tahrirlash (faqat o'zimniki, matnli) · Matnni nusxalash · Qadash · Uzatish · Tanlash · O'chirish (faqat o'zimniki). Javob iqtibosi pufakda (bosilsa asl xabarga o'tadi), "tahrirlangan" belgisi, qadalgan xabar paneli suhbat tepasida, ko'p tanlash (nusxa/uzatish/o'chirish), uzatilgan xabarda "asl yuboruvchi" yozuvi. Pufakdagi alohida o'chirish tugmasi olib tashlangan (2026-10-02).
- SUHBAT MENYUSI (suhbat ro'yxatida o'ng tugma / bosib turish): O'qilmagan deb belgilash (o'qilmagan bo'lsa "O'qilgan deb belgilash") · Tepaga qadash · Ovozsiz qilish · Arxivlash · Suhbatni o'chirish (tasdiq bilan). Qadalganlar ro'yxat tepasida; ovozsiz suhbat kulrang belgi bilan va pastki panel sonida sanalmaydi; arxiv ro'yxat tepasidagi "Arxiv (N)" qatori orqali; `ChatPrefs` hozircha faqat qurilmada (2026-10-02).
- XABARLAR: rasm yuborish (demo: fayl tanlanadi, 960 px/JPEG ga kichraytiriladi, `lib/image.ts`; API rejimda tugma yashirin — fayl saqlash backendda); O'QILMAGANLAR: suhbat ro'yxatida son belgisi + qalin nom, pastki panel/yon panel "Xabarlar" belgisida o'qilmagan SUHBATLAR soni; suhbat ochilganda o'qilgan (`chatReads`, hozircha mahalliy) (2026-10-02).
- #TEG va @ESLATMA: #teg `/tags/[tag]` sahifasiga olib boradi (Postlar tabi kabi filtr+saralash); matn maydonlarida (post, izoh) yozayotganda "@" dan keyin odamlar, "#" dan keyin mashhur teglar taklif qilinadi (`SuggestTextarea`: strelka/Enter/Tab/Esc, 'fixed' ro'yxat — modal ichida kesilmaydi); izohlarda ham @eslatma/#teg/havola ishlaydi; so'z oxiridagi tinish belgisi havoladan tashqarida (2026-10-02).
- QIDIRUV: Enter yoki natija bosilganda so'rov "Oxirgi qidiruvlar"ga (8 tagacha, qurilmada) yoziladi; bo'sh maydonda ko'rinadi, bittalab yoki "Tozalash" bilan o'chiriladi (2026-10-02).
- ZAMONAVIY QATLAM: postdagi birinchi havola uchun karta (`LinkPreview`: domen+yo'l, yangi oynada, tarmoqdan yuklanmaydi); bildirishnomalar Bugun/Kecha/Shu hafta/Oldinroq bo'yicha guruhlangan; PWA (`manifest.webmanifest`, ikonkalar 192/512/apple-touch, theme-color #3730a3) va ulashish metama'lumotlari (og:image `/og.png`); faqat BITTA favicon (brend, `static/favicon.svg`) — eski megafon `lib/assets/favicon.svg` o'chirilgan, qaytarilmasin; rasmlar `loading=lazy`; sahifalar orasida qisqa View Transition (harakat kamaytirilsa o'chiq) (2026-10-02).
- QULAYLIK (a11y) qoidasi — smoke'da tekshiriladi: har sahifada AYNAN BITTA h1 (ko'rinmas `sr-only` bo'lishi mumkin); nomsiz tugma/havola/maydon YO'Q; ikonli tugmalar kamida 34x34 px (`Button size="icon"` = 40px); profilda ism sarlavhasi h1, yopishqoq panelda esa oddiy matn (2026-10-02).
- PROFIL QO'SHIG'I (`User.music`: nom, ijrochi, havola; `lib/music.ts`, `MusicCard`): alohida karta EMAS — profil MUQOVASI (avatar orqasidagi fon) ustida pastki o'ngda shaffof kapsula (ijro tugmasi + atrofida progress halqasi + nom/ijrochi + ijro paytida to'lqin). Bosilganda ijro etiladi (avtomatik ijro YO'Q, bir vaqtda bitta qo'shiq). Audio fayl havolasi o'sha yerda o'ynaydi; boshqa havola (YouTube, Spotify) "Tinglash" tugmasi bilan yangi oynada. Sozlamalarda "Profil qo'shig'i" bo'limi; bo'sh saqlansa o'chadi; o'z profilida qo'shiq yo'q bo'lsa muqovada "Qo'shiq qo'shish" (2026-10-02). Test qo'shiqlar: Anvar ("Bahor kuyi"), Otabek, Gulchehra.
- KAMPANIYA: kanal sahifasida IXCHAM karta (`CampaignCard`: sarlavha, holat, pog'onali progress, holatga mos bitta xabar, tugma, "Batafsil"); to'liq ma'lumot `/campaigns/[id]` sahifasida: asosiy blok, BOSQICHLAR vaqt chizig'i (hisobot yuborish — egasi, tasdiqlash — donor), DONORLAR ro'yxati. Yuqori panel u yerda yo'q. Qidiruvdagi kampaniya shu sahifaga olib boradi (2026-10-02).
- YO'L-YO'RIQ (onboarding): yangi foydalanuvchi lentada 3 qadamli karta ko'radi (`Onboarding.svelte`, `stores/onboarding.svelte.ts`): profil to'ldirish (bio+joylashuv) · kamida 3 kanalga a'zo bo'lish (tavsiya etilgan kanallar, o'z sohasi birinchi, a'zo bo'lish tugmasi bilan) · birinchi post. Qadamlar avtomatik belgilanadi, pog'onali progress; "Keyinroq" yopadi va eslab qoladi; hammasi bajarilsa yo'qoladi. Yopilgach bo'sh lentada ham tavsiya etilgan kanallar. Demo ro'yxatdan o'tish endi HAQIQATAN yangi bo'sh profil yaratadi (`registerDemoUser`) (2026-10-02).
- Tab select'ida (Postlar, Saqlanganlar) faqat POSTI BOR turlar ko'rsatiladi: rasm bo'lmasa "Rasmlar", GIF bo'lmasa "GIFlar" chiqmaydi; "Hammasi" doim bor. Kategoriya: boshqalarga faqat posti borlari, kanal egasiga bo'shlari ham. Tanlangan tur yo'qolsa (post o'chirilsa/saqlashdan olinsa) "Hammasi" ga qaytadi (2026-10-02).
- "Saqlanganlar" tabining select'ida Saralash YO'Q (faqat filtrlar); Saralash Postlar tabida (kanal va profil) (2026-10-02).
- Post select'ida "Saralash" (sort by) YIG'ILGAN QATOR (Twitterdagidek: bosilganda variantlari ochiladi, ro'yxat ochilganda har safar yig'ilgan, tanlanganda select yopiladi; qatorda joriy tanlov ko'rinadi) (`SORTS`, `sortPosts` — postFilter.ts): Yangilari birinchi (standart) · Eskilari birinchi · Ko'p ko'rilgan · Ko'p izohlangan. Like/reyting bo'yicha saralash YO'Q. Kanalda qadalgan postlar saralashdan qat'i nazar tepada. Postlar va Saqlanganlar tablarining saralashi mustaqil; standartdan farq qilsa tab yonida amber nuqta. Ro'yxat balandligi mavjud joyga moslanadi va ekran ichida qoladi (2026-10-02).
- Xabarlar ro'yxati OXIRGI XABAR VAQTI bo'yicha tartiblanadi (yangi xabar kelgan/yozilgan suhbat tepada) (2026-10-02).
- Tab-ro'yxat ochiq turganda sahifa ARALANMAYDI, aylantirishga urinilsa (g'ildirak yoki >8px surish) ro'yxat YOPILADI; ro'yxatning o'zida aylantirish yopmaydi; tashqarini bosish ham yopadi; ekran pastiga yaqin bo'lsa ro'yxat YUQORIGA ochiladi; uzun bo'lsa ichida aylanadi (2026-10-02).
- Tab-ro'yxat (`PostFilterTab`): nofaol tabni bosish FAQAT shu bo'limga o'tkazadi (ro'yxat ochilmaydi); ro'yxat FAOL tabni qayta bosganda ochiladi. Nofaol tabda chevron xira (2026-10-01).
- Profilda "Saqlanganlar" tabi ham "Postlar" kabi ochiladigan ro'yxat (select): Hammasi · Rasmlar · Videolar · Linklar · GIFlar; Ikkala tabda ham (Postlar, Saqlanganlar) tanlangan filtr NOMI tab yozuvi bo'ladi ("Rasmlar"); "Hammasi" tanlansa asl nomiga qaytadi. "Saqlanganlar" bo'lib qolish ham, "Saqlanganlar · Rasmlar" ham YO'Q. Eski chiplar (Media/So'rovnomalar/Ovozli) va soni olib tashlangan (2026-10-01).
- @username va kanal manzili (@handle) qoidasi (`src/lib/username.ts`, backend `valid_handle`): 3-30 belgi; kichik lotin harf, raqam, nuqta, defis; HARF bilan boshlanadi, harf/raqam bilan tugaydi; nuqta/defis ketma-ket kelmaydi; pastki chiziq (_) YO'Q; band nomlar (admin, settings...). Qabul: kun.uz, kunuz, kun-uz, kun24. Rad: kun_uz, 123uz, kun__uz, kun..uz. Yozishda katta harf kichikka o'tadi, xato sababi darhol ko'rinadi; ro'yxatdan o'tish, kanal yaratish va tahrirlashda amal qiladi. Telegram manzili bu qoidaga kirmaydi (2026-10-01).
- Kanal sahifasida KAMPANIYA kartasi kanal ma'lumotlari panelining ichida EMAS: postlar maydonida (kulrang fonda), post kartalari bilan bir xil kenglikda, ro'yxat tepasida alohida karta bo'lib turadi; faqat "Hammasi" filtrida ko'rinadi. Kampaniyasiz egasi uchun "Kampaniya boshlash" ham shu maydonda (2026-10-01).
- Xabarlar: xabar yozilmagan shaxsiy suhbat ro'yxatda ko'rinmaydi va yozmay chiqilsa mahalliy saqlanmaydi (`discardEmptyChat`); suhbat birinchi xabar bilan paydo bo'ladi. Backend ham shunday: bo'sh suhbat bootstrap'da kelsa ro'yxatga kiritilmaydi (2026-10-01).
- Uzun kanal/muallif nomi (kanal sahifasi, post kartasi, post sarlavhasi): nom bir qatorda qoladi, soha belgisi pastga TUSHMAYDI; sig'masa nom chapdan o'ngga siljib qaytib turadi (`ui/Marquee`); harakatni kamaytirish rejimida "..." bilan kesiladi. Ro'yxatlarda (kanallar, qidiruv) oddiy "..." (2026-10-01).
- Qidiruv (kashf qilish): 4 ta qisqa tab Postlar · Kanallar · Odamlar · Kampaniyalar; filtr chiplari tabga mos (Odamlar: KASB nomi; Kanallar/Kampaniyalar: SOHA nomi; Postlar: chip yo'q). Avatar muqova ustida (`relative z-10`); sozlamalarda yuqori panel yo'q (2026-10-01).
- Lentadagi post kartasi pastki qatori: chapda Izoh tugmasi, o'rtada izoh ticker'i, O'NG BURCHAKDA ko'rishlar soni (ko'z belgisi). Post sahifasida ham ko'rishlar vaqt qatorining o'ngida (2026-10-01).
- Kanal va profilda BITTA "Postlar" tabi (`PostFilterTab`): bosilganda ro'yxat ochiladi: Hammasi · Rasmlar · Videolar · Linklar · GIFlar; kanalda unga qo'shimcha KANAL EGASI yaratgan kategoriyalar (eng ko'pi 8, nomi 24 belgigacha; "Kategoriyalarni boshqarish" faqat egasiga). Egasi post yozayotganda kategoriya tanlaydi (ixtiyoriy); kategoriya o'chirilsa postlar saqlanib qoladi. Tab yozuvi tanlangan filtr nomiga o'zgaradi, sonlar ko'rsatilmaydi. Filtr mantiqi `src/lib/postFilter.ts`; post matnidagi https:// havolalar bosiladigan (2026-10-01).
- Postga rasm YOKI video biriktiriladi (`videoUrl`); composerda "Video" tugmasi, namunaviy roliklar `static/demo/clip-*.webm`. CSP: `media-src 'self' https: blob:` (nginx snippet `graduss-headers.conf`) (2026-10-01).
- Post qadash (pin): faqat KANAL EGASI o'z kanalidagi postni 3 nuqta menyusidan "Kanal tepasiga qadash" qiladi; kanalda eng ko'pi bilan 3 ta; qadalganlar kanal sahifasi tepasida (yangi qadalgani birinchi) va postda "Qadalgan" yozuvi bilan. Lentada tartibi o'zgarmaydi (2026-10-01).
- Kanal sahifasi: kanal ma'lumotlari (muqova, nom, tavsif, kampaniya) OQ PANELDA (yengil soya), postlar tagida kulrang fonda kartalar. "Postlar (N)" kabi og'ir ajratuvchi tasma/yozuv QAYTARILMAYDI (hunuk deb topilgan) (2026-10-01).
- Kanal: "Bu kanalda faqat egasi post joylashi mumkin" kabi izohlar YO'Q (hamma biladi). Belgi: foydalanuvchiga KASB (Siyosatchi), kanalga esa shu kasbning SOHASI (Siyosat, Tibbiyot, Dasturlash...) — `SECTOR_FIELD` / `Badge channel`. Kanal soha belgisi FAQAT kanal ichida (sahifa sarlavhasi va kanal postlari); kanallar ro'yxatida belgi YO'Q (2026-10-01).
- Post izohlari chat uslubida (`CommentList`): o'zimning izohim O'NGDA (brend rangli pufak), boshqalarniki CHAPDA (avatar + ism + kulrang pufak); o'chirish belgisi sensorli ekranda doim ko'rinadi (2026-10-01).
- Lentadagi post kartasi: "Izoh" tugmasi (telefonda faqat belgi+son) yonidagi bo'sh joyda oxirgi 5 izoh navbat bilan almashinib turadi (`CommentTicker`): faqat ekranda ko'rinib turganda, harakat kamaytirilgan rejimda aylanmaydi, bosilsa post ochiladi (2026-10-01).
- Mobil klaviatura: viewport meta `interactive-widget=resizes-content` (Android) + `src/lib/keyboard.ts` (`--kb`, iOS zaxira). Yopishqoq pastki panellar `bottom: var(--kb)`, suhbat balandligi `100dvh - var(--kb)`. Yozish maydoni qo'shilsa shu qoidaga amal qil (2026-10-01).
- Lentadagi post kartasida "Izoh" bosiladigan tugma: post sahifasiga o'tib yozish maydoniga fokus beradi (`?reply=1`). Post sahifasida "Izoh" tugmasi/belgisi YO'Q (pastdagi yozish paneli yetarli) (2026-10-01).
- Post 3 nuqta menyusi (lentada ham, post sahifasida ham): Saqlash, Chatga yuborish, Havolani nusxalash (+ o'z postida Tahrirlash, O'chirish). "Yuborish" va "Saqlash" tugma sifatida YO'Q. Post sahifasida postning tagida tugmalar qatori yo'q; vaqt qatorining o'ng burchagida faqat ko'z belgisi + ko'rishlar soni. Lentadagi kartada faqat "Izoh" tugmasi (chapda) (2026-10-01).
- Post sahifasida izoh yozish maydoni PASTGA mahkamlangan (sticky, qisqa sahifada ham ekran pastida); izohlar eskidan yangiga tepadan pastga; yuborilgach sahifa yangi izohgacha aylanadi (2026-10-01).
- Post kartasi: tepada avatar + (nom+belgi / @handle · vaqt) + menyu; matn, rasm, so'rovnoma avatar OSTIDAN to'liq kenglikda (chap tomonda bo'sh ustun qoldirilmaydi) (2026-10-01).
- Post tagidagi tugmalar qatorida "Saqlash" YO'Q (Izoh, Ulashish, Yuborish qoladi). Saqlash faqat postning 3 nuqta menyusida (`PostMenu`): lentada ham, post sahifasida ham (2026-10-01).
- Post sahifasi: sarlavhada "Post" so'zi YO'Q; orqaga strelkadan keyin post manbai (kanal posti: kanal avatari+nomi+@handle; shaxsiy post: foydalanuvchi) va o'ng tomonda post menyusi. Maqola ichida manba bloki takrorlanmaydi (2026-10-01).
- Telefonda yuqori/pastki panel yashirinadigan sahifalar BITTA joyda: `src/lib/nav.ts` (`hideTopBar`, `hideBottomNav`). Hozir: suhbat ichida ikkalasi; post ichida ikkalasi; kanal ichida faqat yuqori; qidiruvda faqat yuqori. Yangi sahifa qo'shsang shu faylni yangila (2026-10-01).
- Telefonda suhbat (guruh yoki shaxsiy) ICHIDA pastki panel ham yuqori panel ham yo'q: suhbat to'liq ekran (`h-dvh`), faqat o'z sarlavhasi va yozish maydoni (2026-10-01). Kanal ichida pastki panel qoladi (muhokama).
- Profil (telefon): sahifa tepasida panel YO'Q, Sozlamalar tugmasi muqova burchagida. Pastga aylantirganda (sahifadagi ism ko'rinmay qolgach) ism + Sozlamalar paneli chiqadi; TEPAGA aylantirganda ism paneli o'rniga qidiruv/bildirishnoma paneli chiqadi (`MobileTopBar`). Ikkala panel nol balandlikdagi sticky qatlamda (sahifani surmaydi, aks holda aylantirish tebranadi). Kompyuterda faqat ism paneli (2026-10-01).
- Telefonda yuqori panel (logo, qidiruv, bildirishnoma) suhbat yoki kanal ICHIDA ko'rinmaydi, faqat ro'yxatlarda va boshqa sahifalarda; qidiruv sahifasida ham yo'q (o'z maydoni bor) (2026-10-01, `MobileTopBar`).
- Kanal posti KANAL nomidan chiqadi (nomi, @handle, kasb belgisi); muallif profili/ismi postda, post sahifasida, bildirishnomada, ulashish matnida KO'RSATILMAYDI va muallif profilidagi "Postlar"ga kirmaydi (`data.getPostSource`, `getPostsByAuthor`) (2026-10-01). Kanal sahifasidagi "Egasi" ma'lumoti alohida masala.
- Pastki panelda (telefon) Qidiruv va Bildirishnoma BO'LMAYDI (2026-10-01). Ular tepadagi panelda (`MobileTopBar`): chapda logo BELGISI (yozuvsiz, bosilsa lentaga), uning yonida KENG QIDIRUV MAYDONI, o'ngda alohida qo'ng'iroq (2026-10-01). Pastki panel: Bosh sahifa, Xabarlar, Kanallar, Profil.
- Saqlanganlar alohida sahifa EMAS: faqat o'z profilidagi tab (`/profile/<men>?tab=saved`). /bookmarks marshruti o'chirilgan (2026-10-01).
- Bosh sahifada post yozish: pastki o'ngdagi suzuvchi qalamcha tugma (FAB) -> modal (`PostComposer` `onPosted`). Lentada ichki composer YO'Q (2026-10-01). Kanal sahifasida composer avvalgidek ichida.

### Dizayn (brend) qoidalari
- Nom/belgi: "graduss" ~ gradus = pog'ona. Logo: 3 o'suvchi pog'ona + amber qopqoq (`components/brand/Logo.svelte`, `static/favicon.svg`). Megafon (eski "Ovoz") belgisi QAYTARILMAYDI.
- Asosiy rang: chuqur indigo (`--color-brand-*`, app.css), urg'u: amber (faqat pog'ona/logo). Zumrad (eski) faqat semantik "muvaffaqiyat" uchun qoladi.
- Kampaniya progressi bosqichlarga bo'lingan (pog'onali) chiziq.
- Eski "siyosatchilar/fuqarolar" shiori ishlatilmaydi; hozirgi: "Kasbingiz bilan birga, pog'onama-pog'ona."
- Bosh sahifa, Xabarlar, Kanallar sahifalarida tepada "Bosh sahifa/Xabarlar/Kanallar" sarlavha paneli YO'Q (2026-10-01). Pastki o'ngda umumiy qalamcha tugma (`ui/PencilFab.svelte`): post yozish / yangi xabar / kanal yaratish. Xabarlar va Kanallarda u ro'yxat ustuni ichida (`inline`), kompyuterda suhbat ochiq paytda ham ko'rinadi. Mobil balandlik: yuqori panel hisobga olingan (`100dvh-7.8rem`).
- Backend: kanal postlarida `authorId` API javobidan ham yashirilsin (hozir faqat frontend yashiradi).
- Backend: `/api/posts/{id}/share` route, `post_shares` jadvali, bootstrap `shares` hisobi va `sharedIds` olib tashlanadi (Ulashish o'chirildi).
- Backend: channels.show_owner ustuni; a'zolar soni faqat egasi uchun API javobida (boshqalarga berilmasin).
- Backend: posts.pinned_at ustuni, POST /api/posts/{id}/pin (faqat kanal egasi, kanalda 3 tagacha), bootstrap'da pinnedAt.
- Backend: posts.video_url ustuni, POST /api/posts videoUrl qabul qilsin (http/https yoki /demo/ emas, faqat tekshirilgan URL), bootstrap'da videoUrl.
- Backend: channels.categories (id,name; 8 tagacha), posts.category_id, POST/DELETE /api/channels/{id}/categories (faqat egasi); post matnidagi havola/GIF filtri klientda.
- Backend (kodi yozilgan, ISHGA TUSHIRILMAGAN): valid_handle yangi qoida; register/update_me/kanal manzili shu bilan; mention'da nuqta/defis. Mavjud bazadagi eski pastki chiziqli username'lar bor bo'lsa, ishga tushirishdan oldin ko'chirish (migratsiya) kerak.

### Ish tartibi (frontend)
- Frontendni saytga chiqarish FAQAT `cd web && npm run deploy` bilan: build -> `npm run smoke` (66 tekshiruv, haqiqiy brauzer, demo rejim, tashqi tarmoqsiz) -> atomik almashtirish. Smoke yiqilsa deploy qilinmaydi. `install.sh` ishlatilmaydi (backendni ham qayta ishga tushiradi).
- Yangi funksiya yoki qoida qo'shilsa `web/tests/smoke.mjs` ga tekshiruv qo'shiladi (SCOPE.md dagi har bir muhim UI qoidasi uchun).
- `smoke.sh` preview'ni PORT bo'yicha to'xtatadi (`pkill -f` ISHLATILMAYDI).
- Backend: users.music (title<=60, artist<=60, url: http/https; audio fayl yuklash keyinroq), PATCH /api/me da qabul, bootstrap'da berish.
- nginx: graduss.uz.conf'da `location ~* \.wav$` (default_type audio/wav) bor — WAV nginx'ning standart ro'yxatida yo'q. Yangi audio turi qo'shilsa shunga qarang.
- nginx: `location ~* \.webmanifest$` (application/manifest+json) ham graduss.uz.conf'da.
- Backend: messages.image_url (yuklangan fayl), chat_reads (user_id, chat_id, read_at) va bootstrap'da o'qilmagan sonlar; #teg indeksi (posts.content bo'yicha GIN/trgm) va /api/users/suggest.

## Backend eslatmalari (2026-10-02, UI bosqichi)
- `campaign_comments` jadvali kerak (id, campaign_id, author_id, content, created_at); API: POST /api/campaigns/:id/comments, DELETE /api/campaign-comments/:id.
- `channels.banner` (gradient klass satri) va `channels.avatar` tahriri.
- Qo'ng'iroq (ovozli/video) hozir faqat DEMO oyna; haqiqiysi WebRTC + signaling serverini talab qiladi. Guruhda qo'ng'iroq yo'q.

## Backend eslatmalari (2026-10-02, xabar/suhbat menyusi)
- messages: `reply_to_id`, `forwarded_from`, `edited_at`, `pinned_at` ustunlari; bootstrap'da berish.
- `PATCH /api/messages/:id` ({content}, faqat muallif), `POST /api/messages/:id/pin` ({pinned}), POST /api/chats/:id/messages `replyToId`/`forwardedFrom` qabul qilsin.
- `DELETE /api/chats/:id` (suhbat va xabarlarni o'chirish). Qadash/ovozsiz/arxiv/o'qilmagan keyinroq chat_prefs (user_id, chat_id, ...) jadvaliga.
- Shu route'lar yo'q paytda API rejimda tahrir/qadash/suhbat o'chirish xato toast beradi.
- messages.images (json/array), messages.spoiler, messages.caption_up; bir nechta rasm uchun yuklash (fayl saqlash) route'i.
- Xabar o'qildi belgisi: bootstrap'da `peerReads` ({chatId: suhbatdoshlar oxirgi o'qigan vaqti}, guruhda kamida bittasi); o'qiganda server yangilasin. Hozir demo: setTimeout bilan 3.5 s (shaxsiy) / 6 s (guruh). Belgi: mening xabarimda vaqt o'ngida 1 ptichka (yuborildi), o'qilsa 2 ta ko'k (2026-10-02).
- messages.sticker (matn, emoji). Mini-pleyer, stiker/GIF yuborish, Esc qoidasi (suhbatda Esc -> /chats) frontend'da (2026-10-02).

## Backend eslatmalari (2026-10-02, tadbir/reja/statistika)
- posts: `scheduled_at` (timestamptz null), `is_draft` (bool); barcha o'qish so'rovlarida `NOT is_draft AND (scheduled_at IS NULL OR scheduled_at <= now())` (muallifga o'z qoralamasi/rejasi bootstrap'da alohida). `POST /api/posts` scheduledAt/isDraft qabul qilsin; `POST /api/posts/:id/publish`, `POST /api/posts/:id/schedule` ({scheduledAt|null}). Server vaqti kelgan postni chop etadi (cron/tick) va kanal a'zolariga 'channel' bildirishnomasi.
- `channel_events` (id, channel_id, title, description, starts_at, link, created_at) va `event_reminders` (event_id, user_id); `POST /api/channels/:id/events` (faqat ega, 5 tagacha), `DELETE /api/events/:id`, `POST /api/events/:id/remind` ({on}). Bootstrap: tadbirlar + mening eslatmalarim; `reminderIds` soni faqat egaga. Bildirishnoma `event` turi + `event_id` ustuni; 1 soat oldin server yuboradi (hozir mijoz demo'da yuboradi).
- Statistika hozir mijozda bootstrap'dagi postlardan hisoblanadi; ko'rishlar soni to'g'riligi uchun serverda `views` allaqachon bor. Kunlik ko'rishlar kerak bo'lsa `post_views_daily` jadvali.
