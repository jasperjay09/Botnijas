const fs = require("fs-extra");
const path = __dirname + "/cache/autoseen.json";

// যদি ফাইল না থাকে, বানানো হবে
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({ status: true }, null, 2));
}

module.exports = {
  config: {
    name: "autoseen",
    version: "2.0",
    author: "jass",
    countDown: 0,
    role: 0,
    shortDescription: "Automatic Seen System",
    longDescription: "The bot will automatically see all new messages.",
    category: "system",
    guide: {
      en: "{pn} on/off",
    },
  },

  onStart: async function ({ message, args }) {
    const data = JSON.parse(fs.readFileSync(path));
    if (!args[0]) {
      return message.reply(`📄 Autoseen current status: ${data.status ? "✅ on" : "❌ off"}`);
    }

    if (args[0].toLowerCase() === "on") {
      data.status = true;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply("✅ Autoseen Starting now!");
    } else if (args[0].toLowerCase() === "off") {
      data.status = false;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply("❌ Autoseen Stop now!");
    } else {
      return message.reply("⚠️ use: autoseen on / off");
    }
  },

  // মেসেজ দেখলেই seen করবে (যদি চালু থাকে)
  onChat: async function ({ event, api }) {
    try {
      const data = JSON.parse(fs.readFileSync(path));
      if (data.status === true) {
        api.markAsReadAll();
      }
    } catch (e) {
      console.error(e);
    }
  },
};       fs.writeFileSync(pathFile, 'false');
       api.sendMessage('The autoseen function has been disabled for new messages.', event.threadID, event.messageID);
     } else {
       api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
     }
   }
   catch(e) {
     console.log(e);
   }
}
};
