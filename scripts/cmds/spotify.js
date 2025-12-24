const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    version: "1.0.0",
    author: "April Manalo",
    role: 0,
    category: "music",
    guide: "spotify <song name>"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage(
        "⚠️ Usage: spotify <song name>",
        threadID,
        messageID
      );
    }

    // ✅ SAFETY INIT (ROOT FIX)
    if (!global.client.handleReply) {
      global.client.handleReply = [];
    }

    try {
      await api.sendMessage("🔎 Searching Spotify...", threadID, messageID);

      const res = await axios.get(
        "https://norch-project.gleeze.com/api/spotify",
        { params: { q: query }, timeout: 15000 }
      );

      const songs = Array.isArray(res.data?.results)
        ? res.data.results.slice(0, 5)
        : [];

      if (songs.length === 0) {
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }

      let msg = "🎧 Spotify Results:\n\n";
      songs.forEach((s, i) => {
        msg += `${i + 1}. ${s.title}\n👤 ${s.artist}\n⏱ ${s.duration}\n\n`;
      });
      msg += "👉 Reply with number (1–5)";

      const sent = await api.sendMessage(msg, threadID);

      // ✅ REGISTER HANDLE REPLY (FIXED)
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: sent.messageID,
        author: senderID,
        songs
      });

    } catch (err) {
      console.error("[SPOTIFY SEARCH ERROR]", err.message);
      return api.sendMessage(
        "❌ Failed to search Spotify.",
        threadID,
        messageID
      );
    }
  },

  onReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;

    if (senderID !== handleReply.author) return;

    const index = parseInt(body);
    if (isNaN(index) || index < 1 || index > handleReply.songs.length) {
      return api.sendMessage(
        "❌ Invalid choice number.",
        threadID,
        messageID
      );
    }

    const song = handleReply.songs[index - 1];

    try {
      // ✅ UNSEND CHOICES (IMPORTANT UX FIX)
      await api.unsendMessage(handleReply.messageID);

      await api.sendMessage(
        `⬇️ Downloading:\n🎵 ${song.title}\n👤 ${song.artist}`,
        threadID
      );

      // ✅ CALL DOWNLOADER API (CORRECT STRUCTURE)
      const dl = await axios.get(
        "https://norch-project.gleeze.com/api/spotify-dl-v2",
        {
          params: { url: song.spotify_url },
          timeout: 20000
        }
      );

      const data = dl.data;

      if (!data?.success || !data.trackData?.length) {
        throw new Error("Downloader failed");
      }

      const track = data.trackData[0];

      await api.sendMessage(
        {
          body: `✅ Downloaded:\n🎵 ${track.name}\n👤 ${track.artists}`,
          attachment: await global.utils.getStreamFromURL(track.download_url)
        },
        threadID
      );

      // ✅ CLEAN HANDLE REPLY
      global.client.handleReply =
        global.client.handleReply.filter(
          r => r.messageID !== handleReply.messageID
        );

    } catch (err) {
      console.error("[SPOTIFY DL ERROR]", err.message);
      return api.sendMessage(
        "❌ Failed to download song.",
        threadID,
        messageID
      );
    }
  }
};
