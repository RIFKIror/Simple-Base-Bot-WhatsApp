// tofigure (Scrape by NEKOLABS)
import axios from "axios";
import crypto from "crypto";

class AuthGenerator {
  static #PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDa2oPxMZe71V4dw2r8rHWt59gH
W5INRmlhepe6GUanrHykqKdlIB4kcJiu8dHC/FJeppOXVoKz82pvwZCmSUrF/1yr
rnmUDjqUefDu8myjhcbio6CnG5TtQfwN2pz3g6yHkLgp8cFfyPSWwyOCMMMsTU9s
snOjvdDb4wiZI8x3UwIDAQAB
-----END PUBLIC KEY-----`;

  static #S = "NHGNy5YFz7HeFb";

  constructor(appId) {
    this.appId = appId;
  }

  aesEncrypt(data, key, iv) {
    const cipher = crypto.createCipheriv(
      "aes-128-cbc",
      Buffer.from(key),
      Buffer.from(iv)
    );
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  generateRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes)
      .map((b) => chars[b % chars.length])
      .join("");
  }

  generate() {
    const t = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID();
    const tempAesKey = this.generateRandomString(16);

    const encryptedData = crypto.publicEncrypt(
      {
        key: AuthGenerator.#PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(tempAesKey)
    );

    const secret_key = encryptedData.toString("base64");
    const dataToSign = `${this.appId}:${AuthGenerator.#S}:${t}:${nonce}:${secret_key}`;
    const sign = this.aesEncrypt(dataToSign, tempAesKey, tempAesKey);

    return {
      app_id: this.appId,
      t,
      nonce,
      sign,
      secret_key,
    };
  }
}

export async function toFigure(buffer, prompt) {
  const auth = new AuthGenerator("ai_df");
  const authData = auth.generate();
  const userId = auth.generateRandomString(64).toLowerCase();

  const instance = axios.create({
    baseURL: "https://apiv1.deepfakemaker.io/api",
    params: authData,
    headers: {
      "Content-Type": "application/json",
      Referer: "https://deepfakemaker.io/nano-banana-ai/",
    },
  });

  const file = await instance
    .post("/user/v2/upload-sign", {
      filename: auth.generateRandomString(32) + ".jpg",
      hash: crypto.createHash("sha256").update(buffer).digest("hex"),
      user_id: userId,
    })
    .then((res) => res.data);

  await axios.put(file.data.url, buffer, {
    headers: {
      "content-type": "image/jpeg",
      "content-length": buffer.length,
    },
  });

  // create task
  const task = await instance
    .post("/replicate/v1/free/nano/banana/task", {
      prompt,
      platform: "nano_banana",
      images: [
        "https://cdn.deepfakemaker.io/" + file.data.object_name,
      ],
      output_format: "png",
      user_id: userId,
    })
    .then((res) => res.data);

  const resultUrl = await new Promise((resolve, reject) => {
    let retry = 20;

    const interval = setInterval(async () => {
      const check = await instance
        .get("/replicate/v1/free/nano/banana/task", {
          params: { user_id: userId, ...task.data },
        })
        .then((res) => res.data);

      if (check.msg === "success") {
        clearInterval(interval);
        resolve(check.data.generate_url);
      }

      if (--retry <= 0) {
        clearInterval(interval);
        reject(new Error("Task timeout"));
      }
    }, 2500);
  });

  const finalBuffer = await axios.get(resultUrl, { responseType: "arraybuffer" })
    .then((res) => Buffer.from(res.data));

  return finalBuffer;
  }
      
