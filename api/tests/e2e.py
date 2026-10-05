#!/usr/bin/env python3
"""API integratsiya testi: ishlayotgan graduss-api + Postgres konteyneriga qarshi.
Ishga tushirish: python3 tests/e2e.py  (API http://127.0.0.1:8095, konteyner graduss-postgres)
Har ishga tushirishda noyob foydalanuvchi nomlari ishlatiladi, baza tozalanmaydi."""
import http.cookiejar, json, subprocess, sys, urllib.error, urllib.request, uuid

BASE = "http://127.0.0.1:8095"
SUFFIX = uuid.uuid4().hex[:6]
fails = []


def check(name, cond, extra=""):
    print(("OK   " if cond else "FAIL ") + name + (f"  [{extra}]" if not cond and extra else ""))
    if not cond:
        fails.append(name)


class Client:
    def __init__(self):
        self.jar = http.cookiejar.CookieJar()
        self.op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))

    def call(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(BASE + path, data=data, method=method)
        if data is not None:
            req.add_header("content-type", "application/json")
        try:
            r = self.op.open(req)
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None)
        except urllib.error.HTTPError as e:
            raw = e.read()
            try:
                return e.code, json.loads(raw)
            except Exception:
                return e.code, raw.decode()


def sql(q):
    out = subprocess.run(["docker", "exec", "graduss-postgres", "psql", "-U", "graduss", "-d", "graduss", "-tAc", q],
                         capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(out.stderr)
    return out.stdout.strip()


def uid():
    return str(uuid.uuid4())


def reg(c, name, username, sector="Dasturchi", pw="parol-12345"):
    return c.call("POST", "/api/auth/register",
                  {"name": name, "username": username, "email": f"{username}@test.uz", "password": pw, "sector": sector})


alice, bob, carol, anon = Client(), Client(), Client(), Client()
ua, ub, uc = f"alice-{SUFFIX}", f"bob-{SUFFIX}", f"carol-{SUFFIX}"

# ---- auth ----
check("bootstrap anonim 401", anon.call("GET", "/api/bootstrap")[0] == 401)
s, _ = reg(anon, "Alice", ua, pw="short")
check("qisqa parol 400", s == 400)
s, _ = reg(anon, "Alice", ua, sector="Yo'q kasb")
check("noma'lum kasb 400", s == 400)
s, _ = reg(anon, "Alice", "a b")
check("noto'g'ri username 400", s == 400)
for bad_name in ["kun_uz", "123uz", "kun__uz", "kun..uz", "ab"]:
    s, _ = reg(anon, "Alice", bad_name)
    check(f"username {bad_name!r} rad etiladi 400", s == 400)
for good_name in [f"kun.{SUFFIX}", f"kun-{SUFFIX}"]:
    s, _ = reg(Client(), "Kun Uz", good_name)
    check(f"username {good_name!r} qabul qilinadi 201", s == 201)
s, _ = reg(alice, "Alice A", ua)
check("register alice 201", s == 201)
s, _ = reg(bob, "Bob B", ub, sector="Dizayner")
check("register bob 201", s == 201)
s, _ = reg(carol, "Carol C", uc, sector="Shifokor")
check("register carol 201", s == 201)
s, _ = reg(Client(), "Dup", ua.upper())
check("username katta-kichik harf farqsiz band 409", s == 409)
s, _ = Client().call("POST", "/api/auth/login", {"identifier": ua, "password": "xato-parol-1"})
check("noto'g'ri parol 401", s == 401)
s, _ = Client().call("POST", "/api/auth/login", {"identifier": "yoq_odam", "password": "xato-parol-1"})
check("noma'lum foydalanuvchi 401", s == 401)
a2 = Client()
s, _ = a2.call("POST", "/api/auth/login", {"identifier": f"{ua}@test.uz", "password": "parol-12345"})
check("email bilan login", s == 200)

s, boot = alice.call("GET", "/api/bootstrap")
check("bootstrap: me birinchi", s == 200 and boot["users"][0]["username"] == ua and boot["me"]["username"] == ua)
check("bootstrap: email/parol chiqmaydi", "email" not in json.dumps(boot) and "password" not in json.dumps(boot))
me_a = boot["me"]["id"]
me_b = bob.call("GET", "/api/bootstrap")[1]["me"]["id"]
me_c = carol.call("GET", "/api/bootstrap")[1]["me"]["id"]

# ---- kanal, post, bildirishnoma ----
cid = uid()
s, _ = alice.call("POST", "/api/channels", {"id": cid, "name": "Test kanal", "handle": f"kanal-{SUFFIX}",
                                            "description": "Sinov uchun kanal tavsifi", "sector": "Dasturchi"})
check("kanal yaratish", s == 201)
s, _ = bob.call("POST", "/api/channels", {"id": uid(), "name": "Boshqa", "handle": f"KANAL-{SUFFIX}".lower(),
                                          "description": "Bir xil manzil sinovi"})
check("band handle 409", s == 409)
s, _ = bob.call("POST", "/api/channels", {"id": uid(), "name": "Qisqa", "handle": "ab", "description": "yetarli uzun tavsif"})
check("qisqa handle 400", s == 400)
check("bob kanalga qo'shiladi", bob.call("POST", f"/api/channels/{cid}/join", {"on": True})[0] == 204)
s, _ = alice.call("POST", f"/api/channels/{cid}/join", {"on": False})
check("egasi a'zolikdan chiqa olmaydi 400", s == 400)
pid = uid()
s, _ = bob.call("POST", "/api/posts", {"id": uid(), "content": "kanalga yozish", "channelId": cid})
check("a'zo kanalga post yoza olmaydi 403", s == 403)
s, _ = alice.call("POST", "/api/posts", {"id": pid, "content": f"Salom @{ub}! kanal posti", "channelId": cid})
check("egasi kanalga post yozadi", s == 201)
s, _ = alice.call("POST", "/api/posts", {"id": uid(), "content": "x" * 1001})
check("1001 belgi 400", s == 400)
s, _ = alice.call("POST", "/api/posts", {"id": uid(), "content": ""})
check("bo'sh post 400", s == 400)
s, _ = alice.call("POST", "/api/posts", {"id": uid(), "content": "rasm", "mediaUrl": "javascript:alert(1)"})
check("javascript: rasm havolasi rad", s == 400)
ppoll = uid()
s, _ = alice.call("POST", "/api/posts", {"id": ppoll, "content": "So'rov", "poll": {"id": "x", "question": "Qaysi?",
                  "options": [{"id": "o1", "text": "A", "votes": ["hack"]}, {"id": "o2", "text": "B", "votes": []}]}})
check("so'rovnoma post", s == 201)

bb = bob.call("GET", "/api/bootstrap")[1]
types = sorted(n["type"] for n in bb["notifications"])
check("bob: kanal + mention bildirishnomasi", types == ["channel", "mention"], str(types))
check("bob ko'radigan post: poll votes tozalangan", any(p["id"] == ppoll and p["poll"]["options"][0]["votes"] == [] for p in bb["posts"]))

# ---- izoh, reaksiya, ovoz, ulashish, saqlash, kuzatish ----
cmid = uid()
check("bob izoh qoldiradi", bob.call("POST", f"/api/posts/{pid}/comments", {"id": cmid, "content": "zo'r!"})[0] == 201)
ba = alice.call("GET", "/api/bootstrap")[1]
check("alice: comment bildirishnomasi", any(n["type"] == "comment" for n in ba["notifications"]))
check("post.comments hisobi 1", next(p for p in ba["posts"] if p["id"] == pid)["comments"] == 1)
check("carol boshqa izohni o'chira olmaydi 403", carol.call("DELETE", f"/api/comments/{cmid}")[0] == 403)
check("ovoz berish", bob.call("POST", f"/api/posts/{ppoll}/vote", {"optionId": "o2"})[0] == 204)
check("noto'g'ri variant 400", bob.call("POST", f"/api/posts/{ppoll}/vote", {"optionId": "zz"})[0] == 400)
bob.call("POST", f"/api/posts/{ppoll}/vote", {"optionId": "o1"})
r = bob.call("GET", "/api/bootstrap")[1]
pl = next(p for p in r["posts"] if p["id"] == ppoll)["poll"]["options"]
check("ovoz almashtirish: faqat o1 da", pl[0]["votes"] == [me_b] and pl[1]["votes"] == [])
check("postda poll yo'q bo'lsa 400", bob.call("POST", f"/api/posts/{pid}/vote", {"optionId": "o1"})[0] == 400)
bob.call("POST", f"/api/posts/{pid}/share", {"on": True})
bob.call("POST", f"/api/posts/{pid}/bookmark", {"on": True})
r = bob.call("GET", "/api/bootstrap")[1]
check("share + bookmark", r["sharedIds"] == [pid] and r["bookmarkedIds"] == [pid]
      and next(p for p in r["posts"] if p["id"] == pid)["shares"] == 1)
check("bob alice'ni kuzatadi", bob.call("POST", f"/api/follow/{me_a}", {"on": True})[0] == 204)
check("o'zini kuzatib bo'lmaydi", bob.call("POST", f"/api/follow/{me_b}", {"on": True})[0] == 400)
r = alice.call("GET", "/api/bootstrap")[1]
check("followers=1 + follow bildirishnomasi", r["me"]["followers"] == 1 and any(n["type"] == "follow" for n in r["notifications"]))
bob.call("POST", f"/api/follow/{me_a}", {"on": True})
check("qayta follow takroriy bildirishnoma yaratmaydi",
      sum(1 for n in alice.call("GET", "/api/bootstrap")[1]["notifications"] if n["type"] == "follow") == 1)
check("bob alice postini o'chira olmaydi 403", bob.call("DELETE", f"/api/posts/{pid}")[0] == 403)
check("bob alice postini tahrirlay olmaydi 403", bob.call("PATCH", f"/api/posts/{pid}", {"content": "hack"})[0] == 403)
check("alice tahrirlaydi", alice.call("PATCH", f"/api/posts/{pid}", {"content": "tahrirlangan"})[0] == 204)
check("views +1", bob.call("POST", f"/api/posts/{pid}/view")[0] == 204)
check("read-all", alice.call("POST", "/api/notifications/read-all")[0] == 204
      and all(n["read"] for n in alice.call("GET", "/api/bootstrap")[1]["notifications"]))

# ---- profil, portfolio ----
check("profil yangilash", alice.call("PATCH", "/api/me", {"bio": "Men dasturchi", "website": "https://alice.uz", "telegram": "@alice_t"})[0] == 204)
me = alice.call("GET", "/api/bootstrap")[1]["me"]
check("profil: bio, website, telegram @ siz", me["bio"] == "Men dasturchi" and me["website"] == "https://alice.uz" and me["telegram"] == "alice_t")
check("website '' bilan tozalanadi", alice.call("PATCH", "/api/me", {"website": ""})[0] == 204
      and "website" not in alice.call("GET", "/api/bootstrap")[1]["me"])
check("javascript: website rad", alice.call("PATCH", "/api/me", {"website": "javascript:x"})[0] == 400)
check("band username 409", alice.call("PATCH", "/api/me", {"username": ub})[0] == 409)
check("noto'g'ri avatar rang 400", alice.call("PATCH", "/api/me", {"avatar": "red"})[0] == 400)
pf = uid()
check("portfolio qo'shish", alice.call("POST", "/api/me/portfolio", {"id": pf, "title": "Loyiha", "description": "tavsif", "url": "https://x.uz"})[0] == 204)
check("portfolio url javascript: rad", alice.call("POST", "/api/me/portfolio", {"id": uid(), "title": "Loyiha", "description": "", "url": "javascript:1"})[0] == 400)
check("portfolio ko'rinadi", alice.call("GET", "/api/bootstrap")[1]["me"]["portfolio"][0]["id"] == pf)
alice.call("DELETE", f"/api/me/portfolio/{pf}")
check("portfolio o'chirildi", alice.call("GET", "/api/bootstrap")[1]["me"]["portfolio"] == [])

# ---- suhbat ----
chat = uid()
s, res = bob.call("POST", "/api/chats", {"id": chat, "otherUserId": me_a})
check("chat ochish", s == 200 and res["id"] == chat)
s, res = alice.call("POST", "/api/chats", {"id": uid(), "otherUserId": me_b})
check("mavjud chat qayta ochilmaydi (bir xil id)", s == 200 and res["id"] == chat)
mid = uid()
check("bob xabar yuboradi", bob.call("POST", f"/api/chats/{chat}/messages", {"id": mid, "content": "salom"})[0] == 201)
check("carol begona chatga yoza olmaydi 403", carol.call("POST", f"/api/chats/{chat}/messages", {"id": uid(), "content": "hack"})[0] == 403)
ra = alice.call("GET", "/api/bootstrap")[1]
check("alice xabarni ko'radi", any(m["id"] == mid for m in ra["messages"]) and any(c["id"] == chat for c in ra["chats"]))
rc = carol.call("GET", "/api/bootstrap")[1]
check("carol begona chat/xabarni ko'rmaydi", rc["chats"] == [] and rc["messages"] == [])
check("alice bob xabarini o'chira olmaydi 403", alice.call("DELETE", f"/api/messages/{mid}")[0] == 403)
check("bob o'z xabarini o'chiradi", bob.call("DELETE", f"/api/messages/{mid}")[0] == 204)

# ---- kampaniya ----
def new_campaign(c, channel, goal=100_000, days=1, ms=None):
    return c.call("POST", f"/api/channels/{channel}/campaigns", {
        "id": uid(), "title": "Coworking", "summary": "tavsif", "goal": goal, "days": days,
        "milestones": ms or [{"title": "Birinchi", "percent": 50}, {"title": "Ikkinchi", "percent": 50}]})


s, _ = new_campaign(bob, cid)
check("kampaniyani faqat kanal egasi ochadi 403", s == 403)
s, _ = new_campaign(alice, cid, ms=[{"title": "A", "percent": 60}, {"title": "B", "percent": 30}])
check("foizlar 100 emas 400", s == 400)
s, _ = new_campaign(alice, cid, days=91)
check("91 kun 400", s == 400)
s, _ = new_campaign(alice, cid, goal=10)
check("juda kichik maqsad 400", s == 400)
camp = uid()
s, _ = alice.call("POST", f"/api/channels/{cid}/campaigns", {"id": camp, "title": "Coworking", "summary": "tavsif", "goal": 100_000, "days": 1,
                  "milestones": [{"title": "Birinchi", "percent": 50}, {"title": "Ikkinchi", "percent": 50}]})
check("kampaniya ochildi", s == 201)
s, _ = new_campaign(alice, cid)
check("faol kampaniya bor: ikkinchisi 409", s == 409)
s, _ = alice.call("POST", f"/api/campaigns/{camp}/pledge", {"id": uid(), "amount": 5000})
check("ega o'z kampaniyasiga pul qo'sha olmaydi 400", s == 400)
check("999 so'm 400", bob.call("POST", f"/api/campaigns/{camp}/pledge", {"id": uid(), "amount": 999})[0] == 400)
check("manfiy summa 400", bob.call("POST", f"/api/campaigns/{camp}/pledge", {"id": uid(), "amount": -5000})[0] == 400)
check("bob 60 000 qo'shadi", bob.call("POST", f"/api/campaigns/{camp}/pledge", {"id": uid(), "amount": 60_000})[0] == 201)
check("carol 40 000 qo'shadi", carol.call("POST", f"/api/campaigns/{camp}/pledge", {"id": uid(), "amount": 40_000})[0] == 201)
check("faol fazada hisobot 400", alice.call("POST", f"/api/campaigns/{camp}/report", {"report": "tayyor"})[0] == 400)
check("faol fazada tasdiq 400", bob.call("POST", f"/api/campaigns/{camp}/approve")[0] == 400)
kc = next(k for k in alice.call("GET", "/api/bootstrap")[1]["campaigns"] if k["id"] == camp)
check("kampaniya JSON: 2 pledge, goal", len(kc["pledges"]) == 2 and kc["goal"] == 100_000 and kc["milestones"][0]["status"] == "locked")
sql(f"UPDATE campaigns SET deadline = now() - interval '1 minute' WHERE id = '{camp}'")
check("muddat o'tgach pledge 400", bob.call("POST", f"/api/campaigns/{camp}/pledge", {"id": uid(), "amount": 5000})[0] == 400)
check("bob (ega emas) hisobot yubora olmaydi 403", bob.call("POST", f"/api/campaigns/{camp}/report", {"report": "x"})[0] == 403)
check("bo'sh hisobot 400", alice.call("POST", f"/api/campaigns/{camp}/report", {"report": "  "})[0] == 400)
check("alice hisobot yuboradi", alice.call("POST", f"/api/campaigns/{camp}/report", {"report": "Birinchi bosqich bajarildi"})[0] == 204)
check("ikkinchi marta hisobot 400", alice.call("POST", f"/api/campaigns/{camp}/report", {"report": "yana"})[0] == 400)
check("donor bo'lmagan tasdiqlay olmaydi 400", alice.call("POST", f"/api/campaigns/{camp}/approve")[0] == 400)
check("bob tasdiqlaydi (1/2 yetarli emas)", bob.call("POST", f"/api/campaigns/{camp}/approve")[0] == 204)
check("bob qayta tasdiqlay olmaydi 400", bob.call("POST", f"/api/campaigns/{camp}/approve")[0] == 400)
kc = next(k for k in alice.call("GET", "/api/bootstrap")[1]["campaigns"] if k["id"] == camp)
check("yarmi: hali voting", kc["milestones"][0]["status"] == "voting" and kc["milestones"][0]["approvals"] == [me_b])
check("carol tasdiqlaydi -> released", carol.call("POST", f"/api/campaigns/{camp}/approve")[0] == 204)
kc = next(k for k in alice.call("GET", "/api/bootstrap")[1]["campaigns"] if k["id"] == camp)
check("1-bosqich released", kc["milestones"][0]["status"] == "released" and kc["milestones"][1]["status"] == "locked")
check("yakunlanmagan kampaniya: yangisi 409", new_campaign(alice, cid)[0] == 409)
alice.call("POST", f"/api/campaigns/{camp}/report", {"report": "Ikkinchi bosqich"})
bob.call("POST", f"/api/campaigns/{camp}/approve")
carol.call("POST", f"/api/campaigns/{camp}/approve")
kc = next(k for k in alice.call("GET", "/api/bootstrap")[1]["campaigns"] if k["id"] == camp)
check("barcha bosqich released", all(m["status"] == "released" for m in kc["milestones"]))
check("yakunlangach yangi kampaniya ruxsat", new_campaign(alice, cid)[0] == 201)

# muvaffaqiyatsiz kampaniya: maqsad yig'ilmagan
cid2 = uid()
alice.call("POST", "/api/channels", {"id": cid2, "name": "Ikkinchi kanal", "handle": f"ikkinchi-{SUFFIX}", "description": "Ikkinchi sinov kanali"})
k2 = uid()
alice.call("POST", f"/api/channels/{cid2}/campaigns", {"id": k2, "title": "Yig'ilmaydi", "summary": "", "goal": 500_000, "days": 1,
           "milestones": [{"title": "Hammasi", "percent": 100}]})
bob.call("POST", f"/api/campaigns/{k2}/pledge", {"id": uid(), "amount": 10_000})
sql(f"UPDATE campaigns SET deadline = now() - interval '1 minute' WHERE id = '{k2}'")
check("yig'ilmagan: hisobot 400", alice.call("POST", f"/api/campaigns/{k2}/report", {"report": "x"})[0] == 400)
check("yig'ilmagan: tasdiq 400", bob.call("POST", f"/api/campaigns/{k2}/approve")[0] == 400)
check("yig'ilmaganidan keyin yangi kampaniya ruxsat", new_campaign(alice, cid2)[0] == 201)

# ---- logout ----
check("logout", alice.call("POST", "/api/auth/logout")[0] == 204)
check("logoutdan keyin 401", alice.call("GET", "/api/bootstrap")[0] == 401)
check("boshqa sessiya ishlayapti", a2.call("GET", "/api/bootstrap")[0] == 200)

print(f"\n{'HAMMASI O`TDI' if not fails else str(len(fails)) + ' TA XATO: ' + ', '.join(fails)}")
sys.exit(1 if fails else 0)
