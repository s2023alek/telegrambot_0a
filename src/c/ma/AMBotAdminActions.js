const Lib0 = require("../../lib/Lib0");
const AM = require("./AM");

module.exports = class AMBotAdminActions extends AM {
  constructor() {
    super("AMBotAdminActions");
  }

  notify(eventId, details) {
    switch (eventId) {
      case AMBotAdminActions.ID_ACTION_REGISTER_BOT_ACTIONS:
        this.registerActions();
        break;
    }
  }

  registerActions() {
    let bot = this.get_ae().get_bot();
    let txt = this.get_ae().get_txt();
    let ds = this.get_ae().get_ds();

    bot.action("cpShowAboutInfo", (ctx) => {
      let u = Lib0.processCtxBotActionButtonCallback(ctx, ds);
      if (u == null) return;

      let cpAboutText = ds.getCopywriterAboutText(u.get_fromUserID());
      if (cpAboutText) {
        ctx.reply(txt.yourAboutInfo.split("%info%").join(cpAboutText));
      } else {
        ctx.reply(txt.yourAboutInfoIsEmpty);
      }
    });
  }

  getAutoSubscribeEvents(envName) {
    return [AMBotAdminActions.ID_ACTION_REGISTER_BOT_ACTIONS];
  }

  static NAME = "AMBotAdminActions";
  static ID_ACTION_REGISTER_BOT_ACTIONS =
    AMBotAdminActions.NAME + "ID_ACTION_REGISTER_BOT_ACTIONS";
};
