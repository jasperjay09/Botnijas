module.exports = {
  config: {
    name: "bot",//command name 
    version: "1.0",
    author: "akash",
    countDown: 5,
    role: 0,
    shortDescription: "ignore this command",
    longDescription: "ignore this command",
    category: "no prefix",
  },
  onStart: async function () {},
  onChat: async function ({ event, message }) {
    if (event && event.body) {
      const body = event.body.toLowerCase();
      if (
        body === "Aeri?" ||//you can edit this 
        body === "bot" ||
        body === "Kirishima?" ||
        body === "baby" ||
        body === "kirishima" ||
        body === "aeri"
      ) {
        return message.reply(
          "Hi, Im Still Here Pa Namn,Ask Me Anything.",
          event.messageID,
          event.threadID
        );
      }
    }
  },
};
