import axios from "axios";
import * as cheerio from "cheerio";

export async function ttdownV2(url) {
  try {
    if (!url) throw new Error("Link nya mana jir?");
    if (!/tiktok\.com/i.test(url)) throw new Error("URL TikTok tidak valid jir");

    const { data: homeHtml, headers: homeHeaders } = await axios.get(
      "https://musicaldown.com/en",
      {
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36",
          referer: "https://musicaldown.com/",
        },
        timeout: 60000,
      }
    );

    const cookie = homeHeaders["set-cookie"]
      ? homeHeaders["set-cookie"].map((c) => c.split(";")[0]).join("; ")
      : "";

    const $ = cheerio.load(homeHtml);

    const formData = {};
    $("#submit-form input").each((_, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value");
      if (name) formData[name] = value || "";
    });

    const urlKey = Object.keys(formData).find((k) => !formData[k]);
    if (urlKey) formData[urlKey] = url;

    const payload = new URLSearchParams(formData).toString();

    const { data: resultHtml } = await axios.post(
      "https://musicaldown.com/download",
      payload,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie,
          origin: "https://musicaldown.com",
          referer: "https://musicaldown.com/",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36",
        },
        timeout: 60000,
      }
    );

    const $$ = cheerio.load(resultHtml);

    const title = $$(".video-desc").text().trim() || "TikTok Video";
    const username = $$(".video-author b").text().trim() || "Unknown";

    const downloads = [];
    $$("a.download").each((_, el) => {
      const btn = $$(el);

      downloads.push({
        type: btn.attr("data-event")?.replace("_download_click", "") || null,
        quality: btn.text().trim() || null,
        url: btn.attr("href") || null,
      });
    });

    return {
      success: true,
      result: {
        title,
        author: username,
      },
      downloads: downloads.filter((x) => x.url),
    };
  } catch (err) {
    return {
      success: false,
      message: "Gagal download TikTok jir",
      error: err?.response?.data?.message || err.message,
    };
  }
}
