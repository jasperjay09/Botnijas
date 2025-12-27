const axios = require("axios");

/**
 * 🔴 ROOT FIX
 * GoatBot V2 DOES NOT auto-create onReply map
 */
if (!global.GoatBot.onReply) {
  global.GoatBot.onReply = new Map();
}

module.exports = {
  config: {
    name: "music",
    version: "2.3.0",
    author: "April Manalo (YT Search + YTMP3)",
    role: 0,
    category: "music",
    guide: "-music <song name>"
  },

  // ===================== START COMMAND =====================
  onStart: async function ({ api, event, args }) {
    const { threadID, senderID } = event;
    const query = args.join(" ").trim();

    try {
      if (!query) {
        return api.sendMessage(
          "⚠️ Usage: -music <song name>\nExample: -music hiling mark carpio",
          threadID
        );
      }

      await api.sendMessage("🔎 Searching music on YouTube...", threadID);

      // 🔍 YOUTUBE SEARCH
      const searchRes = await axios.get(
        "https://norch-project.gleeze.com/api/youtube",
        { params: { q: query } }
      );

      const results = searchRes.data?.results;
      if (!results || !results.length) {
        return api.sendMessage("❌ No results found.", threadID);
      }

      // 🎵 TOP 5 RESULTS
      const topResults = results.slice(0, 5);
      let msg = "🎵 Select a song to download:\n\n";

      topResults.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n`;
        msg += `📺 ${v.channel}\n`;
        msg += `⏱ ${v.duration}\n\n`;
      });

      msg += "💬 Reply with the number (1-5).";

      api.sendMessage(msg, threadID, (err, info) => {
        if (err) return console.error(err);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "music",
          messageID: info.messageID,
          author: senderID,
          results: topResults
        });
      });

    } catch (err) {
      console.error("[MUSIC ERROR]", err);
      api.sendMessage("❌ Error while searching. Try again later.", threadID);
    }
  },

  // ===================== HANDLE REPLY =====================
  onReply: async function ({ api, event, Reply }) {
    const { threadID, body, senderID } = event;
    const { author, results, messageID } = Reply;

    if (senderID !== author) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > results.length) {
      return api.sendMessage(
        `⚠️ Invalid choice. Reply 1-${results.length} only.`,
        threadID
      );
    }

    const video = results[choice - 1];

    // 🧹 Remove menu
    try {
      api.unsendMessage(messageID);
    } catch (_) {}

    try {
      await api.sendMessage(
        `✅ Selected:\n🎧 ${video.title}\n⬇️ Downloading audio...`,
        threadID
      );

      // ⬇️ YTMP3
      const dlRes = await axios.get(
        "https://norch-project.gleeze.com/api/ytmp3",
        { params: { url: video.url } }
      );

      const data = dlRes.data?.result;
      if (!data || !data.downloadUrl) {
        return api.sendMessage("❌ Failed to get MP3 link.", threadID);
      }

      // 🖼 COVER
      if (data.cover) {
        await api.sendMessage(
          {
            body: `🎵 ${data.title}\n⏱ ${data.duration}\n🎼 ${data.quality}kbps`,
            attachment: await global.utils.getStreamFromURL(data.cover)
          },
          threadID
        );
      }

      // 🎶 AUDIO
      await api.sendMessage(
        {
          body: "📁 Here is your audio:",
          attachment: await global.utils.getStreamFromURL(data.downloadUrl)
        },
        threadID
      );

      await api.sendMessage("✅ Download complete! 🎉", threadID);

    } catch (err) {
      console.error("[MUSIC DL ERROR]", err);
      api.sendMessage("❌ Error while downloading.", threadID);
    }

    global.GoatBot.onReply.delete(messageID);
  }
};
