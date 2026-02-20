import axios from "axios";
import { ttdownV2 } from "./feature/tiktokdl.js";

const tebakGambarDB = new Map();

export default async function handler(lexbot, m) {
  try {
    const body =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      "";

    const prefix = global.prefix || ".";
    const isCmd = body.startsWith(prefix);

    const command = isCmd
      ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase()
      : "";

    const args = isCmd ? body.trim().split(/ +/).slice(1) : [];
    const text = args.join(" ");

    if (!isCmd) return;

    function normalizeText(text = "") {
      return text
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[^a-z0-9\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
     }

   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    switch (command) {
      case "menu": {
        const thumb = await axios.get(global.thumbnail, {
          responseType: "arraybuffer",
        });

     const now = new Date()
     const tanggal = now.toLocaleDateString("id-ID", {
       weekday: "long",
       year: "numeric",
       month: "long",
       day: "numeric",
     });

     const waktu = now.toLocaleTimeString("id-ID", {
       timeZone: "Asia/Jakarta",
       hour: "2-digit",
       minute: "2-digit",
       second: "2-digit",
     });

       const username = m.pushName || m.name || "Unknown";

       const menuText = `
┏━━〔 ${global.botName} 〕━━⬣
┃ ❏ User      : ${username}
┃ ❏ Owner   : ${global.ownerName}
┃ ❏ Prefix     : ${prefix}
┃ ❏ Version : ${global.botVersion}
┃ ❏ Date      : ${tanggal}
┃ ❏ Waktu   : ${waktu} WIB
┗━━━━━━━━━━━━⬣

❏ ALL MENU BOT
➥ ${prefix}ping
➥ ${prefix}runtime
➥ ${prefix}owner
➥ ${prefix}tt <link>
➥ ${prefix}ttstalk <username>
➥ ${prefix}ghstalk <github_user>
➥ ${prefix}tebakgambar

${global.footer}`.trim(); 

        await lexbot.sendMessage(
          m.chat,
          {
            image: Buffer.from(thumb.data),
            caption: menuText,
            contextInfo: {
              forwardingScore: 999,
              mentionedJid: [m.sender],
              forwardedNewsletterMessageInfo: {
         	 newsletterName: "—kyynxz | LexCodeAPI",
         	 newsletterJid: "120363424411396051@newsletter"
               },
              isForwarded: true,
            },
          },
          { quoted: m }
        );
      }
      break;

      case "ping": {
        const start = Date.now();

        const msg = await lexbot.sendMessage(
          m.chat,
          { text: "Testing ping..." },
          { quoted: m }
        );

        const ping = Date.now() - start;

        await lexbot.sendMessage(
          m.chat,
          { text: `Pong!\nSpeed: ${ping} ms` },
          { quoted: msg }
        );
      }
      break;

      case "runtime": {
  const uptime = process.uptime();

  const days = Math.floor(uptime / (3600 * 24));
  const hours = Math.floor((uptime % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const runtimeText = `
⌛ *BOT RUNTIME*

Bot sudah aktif selama:
${days} hari ${hours} jam ${minutes} menit ${seconds} detik`.trim();

  const thumb = await axios.get(global.thumbnail, {
    responseType: "arraybuffer",
  });

  await lexbot.sendMessage(
    m.chat,
    {
      text: runtimeText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
   	 newsletterName: "⚡ LexBot Runtime Status",
   	 newsletterJid: "120363424411396051@newsletter"
        },
      },
    },
    { quoted: m }
  );
}
break;

      case "owner": {
        await lexbot.sendMessage(
          m.chat,
          {
            contacts: {
              displayName: global.ownerName,
              contacts: [
                {
                  vcard: `BEGIN:VCARD
VERSION:3.0
FN:${global.ownerName}
TEL;type=CELL;type=VOICE;waid=${global.ownerNumber}:${global.ownerNumber}
END:VCARD`,
                },
              ],
            },
          },
          { quoted: m }
        );
      }
      break;

  case "tt": {
    try {
      if (!text) {
      return lexbot.sendMessage(
        m.chat,
        { text: `Contoh:\n${prefix}tt https://vt.tiktok.com/xxxxxx` },
        { quoted: m }
      );
    }

    if (!/tiktok\.com|vt\.tiktok\.com/i.test(text)) {
      return lexbot.sendMessage(
        m.chat,
        { text: "❌ Link vidio tidak valid" },
        { quoted: m }
      );
    }

    await lexbot.sendMessage(
      m.chat,
      { text: "⏳ Lagi ngambil data TikTok..." },
      { quoted: m }
    );

    const data = await ttdownV2(text);

    if (!data.success) {
      return lexbot.sendMessage(
        m.chat,
        { text: `❌ Error\n\n${data.error}` },
        { quoted: m }
      );
    }

    if (!data.downloads || data.downloads.length < 1) {
      return lexbot.sendMessage(
        m.chat,
        { text: "❌ Link download tidak ditemukan" },
        { quoted: m }
      );
    }

    const video = data.downloads.find((x) =>
      /video/i.test(x.type || "") || /mp4/i.test(x.quality || "")
    );

    const audio = data.downloads.find((x) =>
      /audio/i.test(x.type || "") || /mp3/i.test(x.quality || "")
    );

    if (!video?.url) {
      return lexbot.sendMessage(
        m.chat,
        { text: "❌ Gagal dapet link video" },
        { quoted: m }
      );
    }

    const vidRes = await axios.get(video.url, {
      responseType: "arraybuffer",
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    await lexbot.sendMessage(
      m.chat,
      {
        video: Buffer.from(vidRes.data),
        caption:
          `🎥 *TIKTOK DOWNLOADER*\n\n` +
          `• Title : ${data.result.title}\n` +
          `• Author : ${data.result.author}\n` +
          `• Quality : ${video.quality || "Unknown"}\n\n` +
          `${global.footer}`,
      },
      { quoted: m }
    );

    if (audio?.url) {
      const audRes = await axios.get(audio.url, {
        responseType: "arraybuffer",
        timeout: 60000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      await lexbot.sendMessage(
        m.chat,
        {
          audio: Buffer.from(audRes.data),
          mimetype: "audio/mpeg",
          ptt: false,
        },
        { quoted: m }
      );
    }

  } catch (err) {
    console.log("Error TikTok Case:", err);

    return lexbot.sendMessage(
      m.chat,
      { text: "❌ Yh error bete gw\n\n" + err.message },
      { quoted: m }
    );
  }
}
break;

 case "ttstalk":
 case "tiktokstalk": {
  try {
    if (!text) {
      return lexbot.sendMessage(
        m.chat,
        { text: `Contoh:\n${prefix}ttstalk xyyzn_505` },
        { quoted: m }
      );
    }

    const username = text.replace("@", "").trim();

    await lexbot.sendMessage(
      m.chat,
      { text: "⏳ Lagi cari akun TikTok..." },
      { quoted: m }
    );

    const apiUrl = `https://api.lexcode.biz.id/api/stalker/tiktok?username=${encodeURIComponent(username)}`;

    const { data } = await axios.get(apiUrl, {
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!data.success) {
      return lexbot.sendMessage(
        m.chat,
        { text: `❌ Gagal stalk TikTok\n\n${data.message || "Unknown Error"}` },
        { quoted: m }
      );
    }

    const res = data.result;

    const verified = res.verified ? "Ya" : "Tidak";
    const priv = res.privateAccount ? "Ya" : "Tidak";

    const createdAt = res.createdAt
      ? new Date(res.createdAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      : "Tidak diketahui";

    const caption = `
🔍 *TIKTOK STALKER*

• Username : ${res.username}
• Nickname : ${res.nickname}
• Verified : ${verified}
• Private : ${priv}
• Dibuat : ${createdAt}

📊 *STATISTICS*
• Followers : ${res.stats.followers}
• Following : ${res.stats.following}
• Likes : ${res.stats.likes}
• Videos : ${res.stats.videos}
• Friends : ${res.stats.friends}

🔗 Profile:
${res.profileUrl}

${global.footer}
    `.trim();

    let thumbBuffer = null;
    if (res.avatar?.thumb) {
      const thumb = await axios.get(res.avatar.thumb, {
        responseType: "arraybuffer",
        timeout: 60000
      });
      thumbBuffer = Buffer.from(thumb.data);
    }

   const thumb = await axios.get(global.thumbnail, {
          responseType: "arraybuffer",
        });

    await lexbot.sendMessage(
      m.chat,
      {
        image: Buffer.from(thumb.data),
        caption: caption,
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true,
          mentionedJid: [m.sender],
          forwardedNewsletterMessageInfo: {
           newsletterName: "TikTok Stalker",
           newsletterJid: "120363424411396051@newsletter"
          },
        },
      },
      { quoted: m }
    );

  } catch (err) {
    console.log("Error ttstalk:", err);

    return lexbot.sendMessage(
      m.chat,
      { text: "❌ Error\n\n" + err.message },
      { quoted: m }
    );
  }
}
break;

  case "ghstalk":
case "githubstalk": {
  try {
    if (!text) {
      return lexbot.sendMessage(
        m.chat,
        { text: `Contoh:\n${prefix}ghstalk RIFKIror` },
        { quoted: m }
      );
    }

    const username = text.trim();

    await lexbot.sendMessage(
      m.chat,
      { text: "⏳ Lagi cari akun GitHub..." },
      { quoted: m }
    );

    const apiUrl = `https://api.lexcode.biz.id/api/stalker/github?username=${encodeURIComponent(username)}`;

    const { data } = await axios.get(apiUrl, {
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!data.success) {
      return lexbot.sendMessage(
        m.chat,
        { text: `❌ Gagal stalk GitHub\n\n${data.message || "Unknown Error"}` },
        { quoted: m }
      );
    }

    const res = data.result;
    const acc = res.account;
    const stats = res.statistics;
    const meta = res.metadata;

    const joinedAt = meta.joinedAt
      ? new Date(meta.joinedAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      : "Tidak diketahui";

    const lastUpdate = meta.lastUpdate
      ? new Date(meta.lastUpdate).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      : "Tidak diketahui";

    const caption = `
*GITHUB STALKER*

• Username : ${acc.username}
• Name : ${acc.displayName}
• Type : ${acc.accountType}
• Admin : ${acc.isAdmin ? "Ya" : "Tidak"}

📌 *BIO*
${acc.about || "-"}

📊 *STATISTICS*
• Repositories : ${stats.repositories}
• Gists : ${stats.gists}
• Followers : ${stats.followers}
• Following : ${stats.following}

🕒 *INFO*
• Joined : ${joinedAt}
• Last Update : ${lastUpdate}

🔗 Profile:
${acc.profileUrl}

${global.footer}
    `.trim();

    let thumbBuffer = null;
    if (acc.avatar) {
      const thumb = await axios.get(acc.avatar, {
        responseType: "arraybuffer",
        timeout: 60000
      });
      thumbBuffer = Buffer.from(thumb.data);
    }

    const thumb = await axios.get(global.thumbnail, {
          responseType: "arraybuffer",
        })

    await lexbot.sendMessage(
      m.chat,
      {
        image: Buffer.from(thumb.data),
        text: caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          mentionedJid: [m.sender],
         forwardedNewsletterMessageInfo: {
           newsletterName: "Github Stalker",
           newsletterJid: "120363399579049501@newsletter"
          },
        },
      },
      { quoted: m }
    );

  } catch (err) {
    console.log("Error ghstalk:", err);

    return lexbot.sendMessage(
      m.chat,
      { text: "❌ Yhh github stalk error\n\n" + err.message },
      { quoted: m }
    );
  }
}
break;

   case "tebakgambar": {
  if (tebakGambarDB.has(m.chat)) {
    return lexbot.sendMessage(
      m.chat,
      { text: `❌ Kamu masih memiliki soal yg belum dijawab\n\nJawab pake:\n• ${prefix}jawab <jawaban>\n\nAtau:\n• ${prefix}nyerah\n• ${prefix}reset` },
      { quoted: m }
    );
  }

  await lexbot.sendMessage(
    m.chat,
    { text: "⏳ Mengambil soal tebak gambar..." },
    { quoted: m }
  );

  let data;
  try {
    const res = await axios.get("https://api.baguss.xyz/api/game/tebakgambar");
    data = res.data;
  } catch (e) {
    return lexbot.sendMessage(
      m.chat,
      { text: "❌ Error, gagal ambil soal" },
      { quoted: m }
    );
  }

  if (!data?.status) {
    return lexbot.sendMessage(
      m.chat,
      { text: "❌ Soal tidak tersedia" },
      { quoted: m }
    );
  }

  const jawaban = data.jawaban || "";
  const imgUrl = data.img;

  if (!jawaban || !imgUrl) {
    return lexbot.sendMessage(
      m.chat,
      { text: "❌ Soal tidak valid" },
      { quoted: m }
    );
  }

  const jumlahHuruf = jawaban.replace(/\s+/g, "").length;

  tebakGambarDB.set(m.chat, {
    answer: jawaban,
    img: imgUrl,
    createdAt: Date.now(),
  });

  const thumb = await axios.get(global.thumbnail, { responseType: "arraybuffer" });
  const img = await axios.get(imgUrl, { responseType: "arraybuffer" });

  const caption = `
*𝙏𝙀𝘽𝘼𝙆 𝙂𝘼𝙈𝘽𝘼𝙍*

❏ Jawaban terdiri dari *${jumlahHuruf} huruf*

Cara jawab:
• ${prefix}jawab <jawaban>

Command:
• ${prefix}nyerah | Menyerah dan liat jawaban
• ${prefix}reset  | reset soal

${global.footer}
  `.trim();

  await lexbot.sendMessage(
    m.chat,
    {
      image: Buffer.from(img.data),
      caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
        newsletterName: "Tebak Gambar — Game",
        newsletterJid: "120363424411396051@newsletter"
        },
      },
    },
    { quoted: m }
  );
}
break;

case "jawab": {
  const sesi = tebakGambarDB.get(m.chat);

  if (!sesi) {
    return lexbot.sendMessage(
      m.chat,
      { text: `❌ Tidak ada soal tersedia\n\nKetik ${prefix}tebakgambar` },
      { quoted: m }
    );
  }

  if (!text) {
    return lexbot.sendMessage(
      m.chat,
      { text: `❌ Masukin jawaban nya\n\nContoh:\n${prefix}jawab KUDA UNGGULAN` },
      { quoted: m }
    );
  }

  const userAnswer = text.toLowerCase().replace(/[^a-z0-9]/gi, "");
  const correctAnswer = sesi.answer.toLowerCase().replace(/[^a-z0-9]/gi, "");

  if (userAnswer === correctAnswer) {
    tebakGambarDB.delete(m.chat);

    return lexbot.sendMessage(
      m.chat,
      { text: `🎉 *JAWABAN KAMU BENAR*\n\n✅ Jawabannya:\n*${sesi.answer}*\n\nKetik ${prefix}tebakgambar untuk soal baru.` },
      { quoted: m }
    );
  } else {
    return lexbot.sendMessage(
      m.chat,
      { text: "❌ YAHAHAHAH SALAH JAWABANNYA" },
      { quoted: m }
    );
  }
}
break;

case "nyerah": {
  const sesi = tebakGambarDB.get(m.chat);

  if (!sesi) {
    return lexbot.sendMessage(
      m.chat,
      { text: `❌ Soal tidak tersedia\n\nKetik ${prefix}tebakgambar dulu` },
      { quoted: m }
    );
  }

  tebakGambarDB.delete(m.chat);

  await lexbot.sendMessage(
    m.chat,
    { text: `Yhh Lu Nyerah\n\n✅ Jawaban yang bener:\n➥ *${sesi.answer}*\n\nKetik ${prefix}tebakgambar buat soal baru.` },
    { quoted: m }
  );
}
break;

case "reset": {
  if (!tebakGambarDB.has(m.chat)) {
    return lexbot.sendMessage(
      m.chat,
      { text: `❌ Tidak ada soal tersedia\n\nKetik ${prefix}tebakgambar dulu` },
      { quoted: m }
    );
  }

  tebakGambarDB.delete(m.chat);

  await lexbot.sendMessage(
    m.chat,
    { text: `✅ Soal berhasil direset\n\nKetik ${prefix}tebakgambar untuk main lagi` },
    { quoted: m }
  );
}
break;

    case "spotify": {
  try {
    if (!text) {
      return lexbot.sendMessage(
        m.chat,
        { text: `❌ Masukkan query lagu.\n\nContoh:\n${prefix}spotify I bet on losing dogs` },
        { quoted: m }
      );
    }

    const endpoint = `https://api.lexcode.biz.id/api/search/spotify?q=${encodeURIComponent(text)}`;
    const res = await axios.get(endpoint, {
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!res.data || !res.data.success) {
      return lexbot.sendMessage(
        m.chat,
        { text: "❌ Gagal mengambil data Spotify." },
        { quoted: m }
      );
    }

    const tracks = res.data.tracks;
    if (!tracks || tracks.length < 1) {
      return lexbot.sendMessage(
        m.chat,
        { text: "❌ Lagu tidak ditemukan." },
        { quoted: m }
      );
    }

    const track = tracks[0];

    const caption = `*❏ SPOTIFY SEARCH ❑*\n\n` +
      `➥ *Title:* ${track.title}\n` +
      `➥ *Artist:* ${track.artist}\n` +
      `➥ *Album:* ${track.album}\n` +
      `➥ *Duration:* ${track.duration}\n` +
      `➥ *Link:* ${track.spotifyUrl}`;

    let thumbBuffer = null;

    if (track.thumbnail) {
      const thumbRes = await axios.get(track.thumbnail, {
        responseType: "arraybuffer",
        timeout: 60000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      thumbBuffer = Buffer.from(thumbRes.data);
    }

    if (thumbBuffer) {
      await lexbot.sendMessage(
        m.chat,
        {
          image: thumbBuffer,
          caption: caption,
          contextInfo: {
           forwardingScore: 9999,
           isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363424411396051@newsletter", 
            newsletterName: `${track.title}`,
            serverMessageId: 1
           }
         }
        },
        { quoted: m }
      );
    } else {
      await lexbot.sendMessage(
        m.chat,
        { text: caption },
        { quoted: m }
      );
    }

  } catch (err) {
    console.log("ERROR SPOTIFY SEARCH:", err);
    return lexbot.sendMessage(
      m.chat,
      { text: "❌ Error saat mengambil data Spotify." },
      { quoted: m }
    );
  }
}
break;

    case "mf": {
  try {
    if (!text) {
      return sock.sendMessage(
        m.chat,
        { text: `❌ Masukkan URL MediaFire.\n\nContoh:\n${prefix}mf https://www.mediafire.com/file/xxxxx/file` },
        { quoted: m }
      );
    }

    const res = await axios.get(`https://api.lexcode.biz.id/api/dwn/mediafire?url=${encodeURIComponent(text)}`, {
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!res.data || !res.data.success) {
      return sock.sendMessage(
        m.chat,
        { text: "❌ Gagal mengambil data MediaFire." },
        { quoted: m }
      );
    }

    const fileData = res.data.data;
    if (!fileData?.downloadUrl) {
      return sock.sendMessage(
        m.chat,
        { text: "❌ Download URL tidak ditemukan." },
        { quoted: m }
      );
    }

 const msgTextMf =
 `*MEDIAFIRE DOWNLOADER
 
 *Name*   : ${fileData.name}
 *Size*   : ${fileData.size}
 *Type*   : ${fileData.type}
 *Upload* : ${fileData.uploadedAt}`;

    await sock.sendMessage(
  m.chat,
  {
    text: msgTextMf,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363424411396051@newsletter",
        newsletterName: "MediaFire Downloader",
        serverMessageId: 1
      }
    }
  },
  { quoted: m }
);

    const fileRes = await axios.get(fileData.downloadUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const fileBuffer = Buffer.from(fileRes.data);
    const urlName = fileData.downloadUrl.split("/").pop();
    const fileName = urlName || `${fileData.name}.zip`;

    await sock.sendMessage(
      m.chat,
      {
        document: fileBuffer,
        mimetype: "application/zip",
        fileName: fileName,
        caption: "*File berhasil di download*"
      },
      { quoted: m }
    );

  } catch (err) {
    console.log("MEDIAFIRE ERROR:", err);
    return sock.sendMessage(
      m.chat,
      { text: "❌ Terjadi kesalahan saat mendownload file." },
      { quoted: m }
    );
  }
}
break;

      default: {
        await lexbot.sendMessage(
          m.chat,
          { text: "Command tidak ditemukan." },
          { quoted: m }
        );
      }
      break;
    }
  } catch (err) {
    console.log("Error handler:", err);
  }
}
