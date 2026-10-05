# Ovoz — Loyiha funksiyalari

Stack: SvelteKit 2 + Svelte 5 (runes), TailwindCSS 4, TypeScript, Lucide ikonkalar.
Holat: barcha ma'lumot **mock/client-side** (`src/lib/mock/*` — boshlang'ich seed, `src/lib/stores/data.svelte.ts` — yagona reaktiv manba), lekin foydalanuvchi harakatlari (post/izoh/xabar/follow/join/share/**profil tahriri**/**yaratilgan kanal va chat**) `localStorage`ga saqlanadi — F5 bosilsa yo'qolmaydi (backend/DB baribir yo'q, faqat shu brauzerda). `users` va `chats` endi `posts`/`comments` kabi to'liq reaktiv va persisted — ilgari statik mock edi, shu sabab profilni tahrirlash yoki yangi chat ochish ishlamas edi. Login — demo (istalgan ma'lumot bilan kirish mumkin), Register — kiritilgan ism/username haqiqiy profilga aylanadi.

## ✅ Tayyor funksiyalar

### Autentifikatsiya (demo)
- [x] Login sahifasi (`/login`) — istalgan login/parol bilan kirish, client-side validatsiya (uzunlik/format) va yuklanish holati bilan
- [x] Register sahifasi (`/register`) — kiritilgan ism va foydalanuvchi nomi haqiqatan ham profilga yoziladi (`data.updateProfile`), username boshqa foydalanuvchilar bilan to'qnashmasligi tekshiriladi
- [x] Chiqish (logout) — `/settings` sahifasi orqali
- [x] Himoyalangan route'lar — login qilmagan foydalanuvchi `/login`ga yo'naltiriladi

### Sozlamalar
- [x] `/settings` sahifasi — sidebar'dagi avatar qatoridagi `...` tugmasi orqali ochiladi
- [x] Hisob bo'limi — profilga havola
- [x] **Profilni tahrirlash** — ism, bio, joylashuv va avatar rangi o'zgartiriladi, hamma joyda (postlar, izohlar, profil, xabarlar) darhol aks etadi
- [x] Ko'rinish bo'limi — mavzu tanlash (Yorug' / Qorong'i / Tizim)
- [x] Hisob boshqaruvi — Chiqish tugmasi

### Lenta (Feed)
- [x] Bosh sahifa — **faqat kuzatilayotgan foydalanuvchilarning postlari** (ilgari "follow" funksiyasi lentaga ta'sir qilmasdi, hammani ko'rsatardi). Tab yo'q, ortiqcha tanlov yo'q.
- [x] Post yozish (composer, 1000 belgi limit — professional uzunlik, limit yaqinlashganda hisoblagich ko'rinadi)
- [x] Postni ochish (batafsil sahifa `/post/[id]`)
- [x] Post tahrirlash — faqat o'z posti, `...` menyu orqali, "tahrirlangan" belgisi bilan
- [x] Post o'chirish (faqat o'z posti, `...` menyu orqali)
- [x] Post havolasini nusxalash

### Post interaksiyalari
- [x] Izoh qoldirish, izohlar ro'yxati va o'z izohini o'chirish
- [x] Ulashish/repost (bosilganda shares soni +1/-1, holat saqlanadi)
- [x] Havolani nusxalash — post `...` menyusi orqali
- [x] Yuborish — postni suhbatlaringizdan biriga xabar sifatida yuboradi (`SendPostDialog`)
- [x] Bookmark/saqlash — `/bookmarks` sahifasida ro'yxati, nav'da alohida bo'lim
- [x] Ko'rishlar soni (`views`) — post ochilganda oshadi (`data.incrementView`)
- [x] Post/izoh o'chirish — tasdiqlash oynasi orqali (`ConfirmDialog`, danger variant), boshqa destruktiv amallar bilan bir xil naqsh
- [x] Post kartalari — ko'tarilgan karta dizayni (soya, yumaloq burchak), amal qatori matnli tugmalar bilan (Izoh / Ulashish / Saqlash / Yuborish)

### Kanallar (Telegram-uslub: broadcast, faqat egasi yozadi)
- [x] 2-panel: desktop'da ro'yxat (chapda) + tanlangan kanal (o'ngda) yonma-yon, mobil'da bitta panel (drill-down)
- [x] Ro'yxatda **faqat a'zo bo'lgan kanallar** ko'rinadi (tavsiya/boshqa kanallar yo'q — yangi kanal qidiruv orqali topiladi)
- [x] **Kanal yaratish** — sarlavhadagi `+` tugmasi, nom/manzil/tavsif validatsiyasi bilan (`CreateChannelDialog`), yaratuvchi avtomatik egasi va a'zosi bo'ladi
- [x] Kanal sahifasi (`/channels/[id]`) — tavsif, a'zolar soni, egasi
- [x] A'zo bo'lish — faqat kanal sahifasida, tasdiqlash oynasi orqali (`ConfirmDialog`)
- [x] A'zolikdan chiqish — banner'dagi `...` menyu orqali (to'g'ridan-to'g'ri tugma emas)
- [x] Kanalga post yozish — **faqat kanal egasi** (a'zolar faqat o'qiydi)
- [x] Kanal ichidagi postlar ro'yxati

### Xabarlar (Chat)
- [x] 2-panel: desktop'da suhbatlar ro'yxati (chapda) + tanlangan suhbat (o'ngda) yonma-yon, mobil'da bitta panel (drill-down)
- [x] **Yangi xabar** — sarlavhadagi qalam tugmasi orqali istalgan foydalanuvchiga suhbat boshlanadi (`NewChatDialog`, mavjud suhbat bo'lsa o'shani ochadi)
- [x] Profil sahifasidan **"Xabar yozish"** tugmasi — to'g'ridan-to'g'ri o'sha odam bilan suhbatga o'tadi
- [x] Shaxsiy va guruh chatlar (guruh muhokamalari shu yerda — alohida "Guruhlar" bo'limi yo'q)
- [x] Suhbat sahifasi (`/chats/[id]`) — xabar tarixi, avtomatik pastga scroll
- [x] Xabar yuborish, o'z xabarini o'chirish (tasdiqlash oynasi orqali)
- [x] Guruh chat — **a'zolar ro'yxati** (header `...` menyu → "A'zolarni ko'rish", profilga havola bilan) va **guruhdan chiqish** (tasdiqlash oynasi orqali, kanaldan chiqish bilan bir xil naqsh). Chiqilgan/chatga a'zo bo'lmagan suhbatlar ro'yxatda ko'rinmaydi (`data.leaveChat`, `getChatParticipants`)

### Bildirishnomalar
- [x] Bildirishnomalar ro'yxati (`/notifications`) — izoh, follow, kanal post, mention turlari
- [x] O'qilgan/o'qilmagan holat, sidebar'da badge counter
- [x] Sahifaga kirganda avtomatik "o'qilgan" belgilash

### Profil
- [x] Foydalanuvchi profili (`/profile/[username]`) — bio, joylashuv, qo'shilgan sana, followers/following
- [x] Kuzatish / kuzatishni bekor qilish (follow/unfollow)
- [x] Foydalanuvchi postlari ro'yxati

### Qidiruv / Kashf qilish
- [x] Global qidiruv (`/search?q=`) — foydalanuvchi, post, kanal bo'yicha, o'zining qidiruv inputi bilan
- [x] Kirish nuqtasi — Bosh sahifa/Kanallar/Bildirishnomalar/Xabarlar header'ida qidiruv ikonkasi (alohida nav bo'lim emas)
- [x] **Kashf qilish** — so'z kiritilmagan holatda `/search` sahifasida: **ommabop postlar** (views/comments/shares og'irligi bo'yicha), **tavsiya etilgan odamlar** (hali kuzatilmagan, followers bo'yicha, ro'yxatdan "Kuzatish" bilan bevosita), **ommabop kanallar** (hali a'zo bo'linmagan, memberCount bo'yicha) — (`data.getTrendingPosts/getSuggestedUsers/getPopularChannels`)

### Navigatsiya / UI
- [x] Markazlashgan, chegaralangan shell (`max-w-6xl`) — `main` ichki qo'shimcha cheklovsiz, mavjud butun kenglikni ishlatadi (barcha bo'limda bir xil formula: wrapper − sidebar), shu sabab bo'limlar orasida o'tganda hech narsa siljimaydi, bo'sh joy qolmaydi, Xabarlar/Kanallar ham keng joy oladi. Login/register sahifasi to'liq ekranga moslashgan (50/50 split)
- [x] Desktop sidebar (icon-only tor va keng rejim), viewport pastiga qadalgan (sticky)
- [x] Mobil pastki navigatsiya (`sm:hidden`)
- [x] Avatar/Profil qatorida `...` menyu — Sozlamalar
- [x] Dark mode (localStorage'da saqlanadi, tizim mavzusiga moslashadi, FOUC yo'q) — `theme.svelte.ts`, sozlamalarda Yorug'/Qorong'i/Tizim tanlash
- [x] Premium vizual sayqal — card shadow/ring tokenlari (`--shadow-card`, `--shadow-pop`), glass (blur) header'lar, gradient avatar/banner, buttonlarda micro-interaction (press scale, hover shadow), composer'da circular belgi-sanog'i
- [x] Bir xil **bo'sh holat** dizayni (`EmptyState`) — barcha ro'yxat/topilmadi holatlarida icon+matn, ilgari ba'zi joyda umuman ko'rinmasdi (izohlar, xabarlar)
- [x] Animatsiyalar — markaziy dialoglar (`Modal`: backdrop fade + panel scale-in), dropdown menyular (scale-in), ro'yxatga qo'shilgan post/izoh/xabar (fly-in)

### Premium & Yangi Qo'shilgan Funksiyalar 🌟
- [x] **Stories (Hikoyalar / Statuslar)** — Feed sahifasida 24 soatlik hikoyalar qatori (`StoriesBar`), taymer va progress bar bilan to'liq ekranli ko'rish modali (`StoryViewerModal`), tomoshabinlar (viewers) soni va yangi story yaratish modali (`CreateStoryDialog`)
- [x] **Postlarda Media / Rasm Biriktirish** — Post yaratishda rasm URL qo'shish va tayyor namuna rasmlar tanlovi, postda rasm ko'rinishi va bosinganda to'liq ekranda kattalashtirish (`ImageLightboxModal`)
- [x] **So'rovnomalar (Polls)** — Composer'da savol va 2-4 ta variantli so'rovnoma tuzish (`PollWidget`), postda interaktiv ovoz berish, real-vaqt animatsiyali foizlar ko'rinishi
- [x] **Emoji Reactionlar** — Post pastida ❤️, 🔥, 😂, 😮, 😢, 👍 emoji reaksiyalar tanlash popover paneli (`ReactionPicker`) va reaksiyalar soni nishonlari (badge)
- [x] **#hashtag va @mention Havolalar** — Post matnidagi `#hashtag`lar avtomatik ko'k havola bo'lib tegishli qidiruvga yo'naltiradi, `@username`lar esa foydalanuvchi profiliga olib boradi (`PostContent`)
- [x] **Toast Bildirishnoma Tizimi** — Ulashish, saqlash, ovoz berish va post joylashda chiroyli animatsiyali va oynali (glassmorphism) Toast habarlari (`ToastContainer`)
- [x] **Composer Qoralama (Draft)** — Yozilayotgan post matni `localStorage`da avto-saqlanadi va sahifa qayta yuklanganda tiklanadi
- [x] **Kanal Tahrirlash** — Kanal egasi uchun nom, handle va tavsifni tahrirlash dialogi (`EditChannelDialog`)
- [x] **Jonli Qidiruv (Live Search)** — `/search` sahifasida har bir harf kiritilganda azoniy va jonli filtrlanuvchi qidiruv

---
*Yangi funksiya qo'shilganda yoki bosqich yakunlanganda shu faylni yangilab boring.*

### Yangi (2026-10-02)
- [x] Chatda qidirish (lupa, n/m hisobi, strelkalar/Enter), Esc faqat qidiruvni yopadi
- [x] Kanal tadbirlari: egasi qo'shadi, a'zolar eslatma qo'yadi, 1 soat oldin bildirishnoma
- [x] Kanal statistikasi (faqat egaga): postlar, ko'rishlar, izohlar, 7 kunlik chiziq, eng ko'p ko'rilgan postlar
- [x] Postni qoralamaga saqlash va rejalashtirish ("Qoralama va rejalar" oynasi)
