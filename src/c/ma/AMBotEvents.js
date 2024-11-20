const AM = require("./AM");
const DUChatMessage = require("../../d/DUChatMessage");
const LOG = require("../../LOG");

module.exports = class AMBotEvents extends AM {
  constructor() {
    super("AMBotEvents");
  }

  notify(eventId, details) {
    switch (eventId) {
      case AMBotEvents.ID_ACTION_PREPARE_BOT:
        this.get_ae()
          .get_bot()
          .on("message", (ctx) => {
            if (ctx && ctx.message && ctx.message.from) {
              let m = new DUChatMessage(
                ctx,
                ctx.message,
                ctx.message.chat,
                ctx.message.from,
                ctx.message.chat.id == this.get_ae().get_ds().get_botChatId()
              );
              if (ctx.message.new_chat_member != null && m.get_inGroupChat()) {
                this.get_ae().notifyAgents(AMBotEvents.ID_EVENT_NEW_USER, m);
              } else if (ctx.message.text != null) {
                this.get_ae().notifyAgents(AMBotEvents.ID_EVENT_NEW_MESSAGE, m);
              }
            }
          });

        break;
    }
  }

  getAutoSubscribeEvents(envName) {
    return [
      AMBotEvents.ID_ACTION_PREPARE_BOT,
      AMBotEvents.ID_EVENT_NEW_MESSAGE,
      AMBotEvents.ID_EVENT_NEW_USER,
    ];
  }

  static NAME = "AMBotEvents";

  static ID_ACTION_PREPARE_BOT = AMBotEvents.NAME + "ID_ACTION_PREPARE_BOT";

  /**
   * DUChatMessage
   */
  static ID_EVENT_NEW_USER = AMBotEvents.NAME + "ID_EVENT_NEW_USER";
  /**
   * DUChatMessage
   */
  static ID_EVENT_NEW_MESSAGE = AMBotEvents.NAME + "ID_EVENT_NEW_MESSAGE";
};
