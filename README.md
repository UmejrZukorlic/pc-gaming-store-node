# PC Gaming Store API — Node.js + MongoDB Atlas

Ovo je backend konverzija originalnog Laravel projekta u **Node.js + Express + Mongoose**. Zadržane su postojeće API funkcije: registracija/prijava, pregled igara, porudžbine kupca i administratorsko upravljanje igrama i porudžbinama.

> Napomena: originalni `resources/views/welcome.blade.php` je samo podrazumevana Laravel welcome stranica, a ne gotov frontend prodavnice. Ovaj projekat zato konvertuje backend/API. Postojeći ili novi React/Next.js frontend može da poziva ove API rute.

## 1. Šta je potrebno

- Node.js 18 ili noviji i npm
- MongoDB Atlas nalog i cluster

## 2. Pokretanje projekta na Windowsu

U terminalu otvori folder `pc-gaming-store-node` i pokreni:

```bash
npm install
```

Kopiraj `.env.example` u `.env` (PowerShell):

```powershell
Copy-Item .env.example .env
```

Zatim otvori `.env` i popuni `MONGODB_URI` i `JWT_SECRET` prema uputstvu ispod.

Pokretanje u development režimu:

```bash
npm run dev
```

Ili standardno:

```bash
npm start
```

API će biti dostupan na `http://localhost:5000/api`. Provera servera: `http://localhost:5000/api/health`.

## 3. Povezivanje sa MongoDB Atlas

1. Otvori [MongoDB Atlas](https://cloud.mongodb.com/) i napravi projekat i cluster (možeš izabrati besplatan tier ako ti je dostupan).
2. U Atlas projektu otvori **Security → Database & Network Access** (nazivi stavki mogu se malo razlikovati).
3. U **Database Access** napravi Database User. Zapamti username i password. To su kredencijali za bazu, nisu isti kao Atlas nalog kojim se prijavljuješ na sajt.
4. U **Network Access** dodaj svoju trenutnu javnu IP adresu (**Add Current IP Address**). Za lokalni razvoj je bolje dozvoliti samo svoju IP adresu nego `0.0.0.0/0`.
5. Otvori **Database → Clusters**, klikni **Connect → Drivers**, izaberi Node.js i kopiraj connection string.
6. U `.env` fajlu zameni primer sa svojim stringom. Primer izgleda ovako:

```env
MONGODB_URI=mongodb+srv://DB_USER:DB_PASSWORD@cluster0.xxxxx.mongodb.net/pc_gaming_store?retryWrites=true&w=majority
```

Zameni `DB_USER`, `DB_PASSWORD` i adresu klastera stvarnim podacima iz Atlasa. Ako lozinka sadrži specijalne znakove kao `@`, `#`, `/`, `:` ili `%`, moraš ih URL-enkodirati (npr. `@` postaje `%40`). Naziv baze `pc_gaming_store` može ostati ovakav; MongoDB će je kreirati kada se upišu prvi podaci.

7. U `.env` postavi i dugačak, nasumičan JWT ključ, na primer:

```env
JWT_SECRET=ovde_stavi_dugacak_nasumican_niz_od_najmanje_32_karaktera
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:3000
```

8. Sačuvaj `.env` i pokreni `npm run dev`. Ako je veza uspešna, terminal prikazuje `MongoDB connected...` i `API running...`.

**Važno:** Ne šalji `.env`, MongoDB lozinku ili JWT secret na GitHub i ne stavljaj ih u frontend kod. `.env` je već dodat u `.gitignore`.

## 4. Kreiranje administratora

Registracija preko API-ja namerno uvek kreira običnog korisnika (`is_admin: false`). Da napraviš admin nalog:

1. Popuni `ADMIN_NAME`, `ADMIN_EMAIL` i `ADMIN_PASSWORD` u `.env`.
2. Pokreni:

```bash
npm run seed:admin
```

Skripta kreira admina ili postojeći nalog sa tim emailom pretvara u admin nalog i postavlja mu lozinku iz `.env`. Nemoj koristiti slabu ili javno poznatu lozinku.

## 5. API rute

Sve rute imaju prefiks `/api`. Zaštićene rute zahtevaju HTTP header:

```http
Authorization: Bearer TVOJ_JWT_TOKEN
```

| Metod | Ruta | Pristup | Opis |
|---|---|---|---|
| GET | `/api/health` | Javno | Provera servera |
| POST | `/api/register` | Javno | Registracija |
| POST | `/api/login` | Javno | Prijava i dobijanje tokena |
| GET | `/api/games` | Javno | Sve igre |
| GET | `/api/games/:id` | Javno | Jedna igra |
| POST | `/api/logout` | Ulogovan | Odjava (frontend briše token) |
| GET | `/api/me` | Ulogovan | Trenutni korisnik |
| GET | `/api/orders` | Ulogovan | Porudžbine trenutnog korisnika |
| POST | `/api/orders` | Ulogovan | Kreiranje porudžbine |
| GET | `/api/orders/:id` | Vlasnik porudžbine | Detalji porudžbine |
| POST | `/api/admin/games` | Admin | Dodavanje igre |
| PUT | `/api/admin/games/:id` | Admin | Izmena igre |
| DELETE | `/api/admin/games/:id` | Admin | Brisanje igre |
| GET | `/api/admin/orders` | Admin | Sve porudžbine |
| PATCH | `/api/admin/orders/:id/status` | Admin | Promena statusa |

### Primeri JSON zahteva

Registracija (`POST /api/register`):

```json
{
  "name": "Marko Markovic",
  "email": "marko@example.com",
  "password": "StrongPass123",
  "password_confirmation": "StrongPass123"
}
```

Prijava (`POST /api/login`):

```json
{ "email": "marko@example.com", "password": "StrongPass123" }
```

Dodavanje igre (`POST /api/admin/games`):

```json
{
  "title": "Cyberpunk 2077",
  "description": "Open-world RPG game",
  "price": 49.99,
  "genre": "RPG",
  "platform": "PC",
  "stock": 20,
  "image_url": "https://example.com/cyberpunk.jpg"
}
```

Kreiranje porudžbine (`POST /api/orders`):

```json
{
  "items": [
    { "game_id": "MONGODB_GAME_OBJECT_ID", "quantity": 2 }
  ]
}
```

Promena statusa (`PATCH /api/admin/orders/ORDER_ID/status`):

```json
{ "status": "processing" }
```

Dozvoljeni statusi su `pending`, `processing`, `completed`, `cancelled`.

## 6. Povezivanje frontenda

Frontend (React/Next.js ili običan JavaScript) šalje HTTP zahteve na `http://localhost:5000/api`. Posle login/register poziva sačuvaj dobijeni `token` i šalji ga u `Authorization: Bearer ...` headeru za zaštićene rute. U produkciji token čuvaj pažljivo (po mogućnosti u HttpOnly Secure cookie-ju uz odgovarajuću CSRF zaštitu; izbegavaj dugotrajno čuvanje osetljivih tokena u localStorage).

Primer `fetch` poziva:

```js
const response = await fetch('http://localhost:5000/api/games');
const games = await response.json();
```

Zaštićen poziv:

```js
const response = await fetch('http://localhost:5000/api/orders', {
  headers: { Authorization: `Bearer ${token}` }
});
const orders = await response.json();
```

Ako frontend radi na drugom portu/domen-u, promeni `CLIENT_URL` u `.env`.

## 7. Važne razlike u odnosu na Laravel

- Laravel Sanctum tokeni zamenjeni su JWT bearer tokenima. Logout endpoint vraća potvrdu, a klijent uklanja token; JWT sam po sebi ostaje validan do isteka. Za trenutno opozivanje tokena potreban je dodatni token blacklist ili session sistem.
- SQL tabele `users`, `games`, `orders`, `order_items` zamenjene su MongoDB kolekcijama `users`, `games`, `orders`.
- Stavke porudžbine su ugrađene u Order dokument i čuvaju kopiju naziva/cene igre u trenutku kupovine.
- Kreiranje porudžbine koristi MongoDB transakciju da se promene zaliha i porudžbina potvrde zajedno. Zato koristi Atlas cluster koji podržava transakcije (replica set/sharded cluster).
- Originalna Laravel welcome stranica nije bila funkcionalna prodavnica; frontend nije automatski konvertovan u React.
