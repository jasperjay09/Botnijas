const axios = require("axios");

module.exports = {
  config: {
    name: "tiktok",
    version: "1.0.0",
    author: "April Manalo",
    role: 0,
    category: "media",
    guide: "tiktok <keywords>",
    cooldown: 5
  },

  onStart: async function ({ api, event, args }) {
    let loadingMsg;

    try {
      const keywords = args.join(" ").trim();

      if (!keywords) {
        return api.sendMessage(
          "⚠️ Please provide search keywords.\nExample: -tiktok dance challenge",
          event.threadID,
          String(event.messageID)
        );
      }

      loadingMsg = await api.sendMessage(
        `🔎 Searching TikTok for: "${keywords}"...`,
        event.threadID
      );

      const res = await axios.get(
        "https://norch-project.gleeze.com/api/tiktok",
        {
          params: { keywords },
          timeout: 15000
        }
      );

      const data = res.data;

      if (!data || data.success !== true || !data.play) {
        throw new Error("Invalid TikTok API response");
      }

      const videoStream = await axios({
        url: data.play,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      const caption =
        `🎵 TIKTOK VIDEO\n\n` +
        `📝 Title: ${data.title || "Unknown"}\n` +
        `⏱ Duration: ${data.duration || "?"}s\n` +
        `🆔 Video ID: ${data.video_id || "N/A"}\n\n` +
        `✨ Requested via GoatBot V2`;

      await api.sendMessage(
        {
          body: caption,
          attachment: videoStream.data
        },
        event.threadID
      );

      if (loadingMsg?.messageID) {
        api.unsendMessage(loadingMsg.messageID);
      }

    } catch (err) {
      console.error("[TIKTOK ERROR]", err?.message || err);

      api.sendMessage(
        "❌ Failed to fetch TikTok video. Try different keywords.",
        event.threadID,
        String(event.messageID)
      );

      if (loadingMsg?.messageID) {
        api.unsendMessage(loadingMsg.messageID);
      }
    }
  }
};
