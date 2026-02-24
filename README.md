# ⚡ Simple Base Bot WhatsApp
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![NPM](https://img.shields.io/badge/NPM-enabled-red)
![JavaScript](https://img.shields.io/badge/JavaScript-ESM-yellow)
![Baileys](https://img.shields.io/badge/Baileys-Library-purple)
![Axios](https://img.shields.io/badge/Axios-HTTP-blue)
![Cheerio](https://img.shields.io/badge/Cheerio-Scraping-orange)
---
<p>
  <img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/Runtime-NodeJS-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Baileys-7.0.0--rc.9-25D366?style=for-the-badge"/>
</p>
---
*Base ini dibuat menggunakan NodeJS dengan type case*
- Base ini Cocok untuk di pelajari ataupun untuk dikembangkan
- Menggunakan baileys versi ^7.0.0-rc.9
- Dikembangkan oleh : `—KyynXz (Lexcode)`
- Support run di panel pterodactly dan termux
---
#### Developer : —KyynXzz
#### Whatsapp : [➥ Click Here](https://wa.me/6281239075413)
#### Channel Wa : [➥ Channel](https://whatsapp.com/channel/0029VbC2uly2f3EEsyAGna1d)
#### Telegram : [➥ Click Here](https://t.me/kyynxz31)
#### API's : [➥ Go to API's](https://api.lexcode.biz.id)
#### Website : [➥ Click](https://kyynns.vercel.app)
#### MediaFire : [➥ Download File](https://www.mediafire.com/file/hbjl91voyppzeu9/Simple-Base-Kyynxz.zip/file)
---
## Struktur Folder 📁
```javascript
index.js    => Pairing kode & connect to WhatsApp
handler.js  => Semua fitur type case ada di file `handler.js`
setting.js  => Setting bot seperti owner, nama bot, dan lain lain
feature/..  => Tempat untuk naro scrape, dan dipanggil di handler.js
```
---
## Setting & config bot 🛠️
```bash
Buka file setting.js, kalian bebas setting sesuai kemauan

global.ownerName   => Nama Owner Bot
global.ownerNumber => Nomor Owner Bot (62xxx)
global.botName     => Nama bot nya
global.botVersion  => Versi bot (misal 1.0)
global.footer      => Teks yang muncul dibawah bot (footer)
global.thumbnail   => Thumbnail gambar pada bot
global.prefix      => prefix command bot nya (Contoh : .menu)
global.idchannel   => ganti dengan id channel wa kalian
```
---
## Bagaimana cara menambah fitur?
- Masuk ke file `handler.js` lalu tulis kode berikut, ini akan memunculkan pesan ke WhatsApp
- Note : Ini hanya example, kalian bisa implementasikan fitur kalian sendiri

```javascript
case 'test':
   await lexbot.sendMessage(
     m.chat,
     { text: "Halo ini fitur test" },
     { quoted: m }
   )
   break;
```
---
## ✨ Bot Feature Command

| Command        | Description                          |
|--------------- |--------------------------------------|
| `.menu`        | Menampilkan pesan menu               |
| `.ping`        | Cek kecepatan                        |
| `.runtime`     | Cek berapa lama bot aktif            |
| `.tt`          | Download video TikTok                |
| `.ttstalk`     | Informasi akun TikTok                |
| `.ghstalk`     | Informasi akun GitHub                |
| `.tebakgambar` | Game tebak gambar                    |
| `.spotify`     | Mencari lagu di Spotify              |
| `.mf`          | MediaFire download file              |
---
## Cara Install ⚙️
```bash
pkg install git (jika belum ada git)
git clone https://github.com/RIFKIror/Simple-Base-Bot-WhatsApp.git
cd Simple-Base-Bot-WhatsApp
npm install
node index.js
```
---
## Note (Catatan) 📝
> ➥ Makasih yg udh nyoba base bot saya, sebelumnya maaf bgt kalo ada kode yang masih berantakan atau ada fitur yang error, saya masih belajar buat bot wa, ohh iya jangan lupa star nya ya :v
