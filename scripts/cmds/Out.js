module.exports = {
  config: {
    name: "out",
    version: "2.0",
    author: "MOHAMMAD AKASH",
    countDown: 5,
    role: 2,
    shortDescription: "remove the bot to the current gc",
    longDescription: "This command is used to remove the bot from the current or a specific group.",
    category: "owner",
    guide: {
      en: "{pn} [threadID (optional)]",
    },
  },

  onStart: async function ({ api, event, args }) {
    const botID = api.getCurrentUserID();
    const targetThread = args[0] || event.threadID;

    try {
      await api.sendMessage("babye pina alis ako ni jass di na na awa sakin🥺", targetThread);
      await api.removeUserFromGroup(botID, targetThread);
    } catch (error) {
      console.error(error);
      return api.sendMessage("si jass lang pwede mag pa alis sakin or baka mag ka error lng", event.threadID);
    }
  },
};
