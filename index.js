process.on("uncaughtException", (err) => console.log("Uncaught Exception:", err));
process.on("unhandledRejection", (err) => console.log("Unhandled Rejection:", err));

import "./setting.js";

import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  jidDecode,
  downloadContentFromMessage
} from "baileys";

import readline from "readline";
import pino from "pino";

import handler from "./handler.js";

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

function getMessageText(m) {
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    m.message?.documentMessage?.caption ||
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ""
  );
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const lexbot = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  if (!lexbot.authState.creds.registered) {
    const IsiNomor = await question("Nomor (62xxx): ");
    let code = await lexbot.requestPairingCode(IsiNomor.trim());
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log("\nKode Pairing:\n", code, "\n");
  }

  lexbot.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log("[ LEXBOT ] : KONEKSI TERPUTUS");

      if (shouldReconnect) {
        console.log("[ LEXBOT ] : MEMPERBARUI KONEKSI...\n");
        connectToWhatsApp();
      }
    }

    if (connection === "open") {
      console.log("[ LEXBOT ] : KONEKSI TERHUBUNG\n");

      await lexbot.sendMessage(`${global.ownerNumber}@s.whatsapp.net`, {
        text: "KONEKSI BERHASIL\n\n© LexBot Simple Base"
      });
    }
  });

  lexbot.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    }
    return jid;
  };

  lexbot.ev.on("creds.update", saveCreds);

  // FIX SPAM PROTOCOL MESSAGE
  lexbot.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m) return;
      if (!m.message) return;
      if (m.key && m.key.remoteJid === "status@broadcast") return;

      const type = Object.keys(m.message)[0];

      if (type === "protocolMessage") return;
      if (type === "senderKeyDistributionMessage") return;
      if (type === "messageContextInfo") return;

      m.chat = m.key.remoteJid;
      m.isGroup = m.chat.endsWith("@g.us");
      m.sender = lexbot.decodeJid(m.isGroup ? m.key.participant : m.key.remoteJid);

      if (m.key.fromMe) return;
      
      m.reply = (text) => lexbot.sendMessage(m.chat, { text }, { quoted: m });

      if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
     const ctx = m.message.extendedTextMessage.contextInfo;
     const quotedMsg = ctx.quotedMessage;
     const type = Object.keys(quotedMsg)[0];

  m.quoted = {
    type,
    key: {
      remoteJid: m.chat,
      fromMe: ctx.participant === lexbot.user.id,
      id: ctx.stanzaId,
      participant: ctx.participant
    },
    sender: lexbot.decodeJid(ctx.participant),
    message: quotedMsg,
    mimetype:
      quotedMsg?.imageMessage?.mimetype ||
      quotedMsg?.videoMessage?.mimetype ||
      quotedMsg?.documentMessage?.mimetype ||
      null,

    download: async () => {
      const msgType = type.replace("Message", "");
      const stream = await downloadContentFromMessage(
        quotedMsg[type],
        msgType
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      return buffer;
      }
    };
  }
      
      const text = getMessageText(m)?.trim();

      if (!text || text.trim() === "") return;

      console.log(
  `\n[ MESSAGE ]` +
  `\nFROM     : ${m.sender}` +
  `\nCHAT     : ${m.chat}` +
  `\nIS GROUP : ${m.isGroup}` +
  `\nTYPE     : ${type}` +
  `\nFROM ME  : ${m.key.fromMe}` +
  `\nTEXT     : ${text}\n`
);
      
  await handler(lexbot, m);
  } catch (err) {
    console.log("Error messages.upsert:", err);
   }
 });
}

connectToWhatsApp();
