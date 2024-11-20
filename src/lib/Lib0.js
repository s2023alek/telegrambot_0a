const DUChatAction = require("../d/DUChatAction");
const LOG = require("../LOG");

module.exports = class Lib0 {
  /**
   * @returns {DUChatAction}
   */
  static processCtxBotActionButtonCallback(ctx, ds) {
    //LOG.log(ctx.update.callback_query.from, true)
    if (
      ctx &&
      ctx.update &&
      ctx.update.callback_query &&
      ctx.update.callback_query.from
    ) {
      return new DUChatAction(
        ctx,
        ctx.update.callback_query.message.chat,
        ctx.update.callback_query.from,
        ctx.update.callback_query.message.chat.id == ds.get_botChatId()
      );
    }

    return null;
  }

  static processCtxBotMessage(ctx, ds) {
    if (ctx && ctx.message && ctx.message.from) {
      let m = new DUChatAction(
        ctx,
        ctx.message.chat,
        ctx.message.from,
        ctx.message.chat.id == ds.get_botChatId()
      );
      return m;
    }
    return null;
  }
};
