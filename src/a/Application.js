const AEApp = require("../ae/AEApp");
const AMBotEvents = require("../c/ma/AMBotEvents");
const AMBotAdminActions = require("../c/ma/AMBotAdminActions");
const AMBotUserActions = require("../c/ma/AMBotUserActions");
const AMBotCommands = require("../c/ma/AMBotCommands");
const AMBotUserMessages = require("../c/ma/AMBotUserMessages");

class Application {
  botCfg;
  /**
   * {AEApp}
   */
  ae;

  /**
   *
   * @param {Telegraf} bot
   * @param {DS} ds
   * @param {txt} txt
   */
  constructor(botCfg, bot, ds, txt, adminAddPassword) {
    this.botCfg = botCfg;
    this.ae = new AEApp("ae", bot, ds, txt, adminAddPassword);
    //this.ae.setLoggingEnabled(true)//debug
  }

  startup() {
    this.ae.addAgent(new AMBotEvents());
    this.ae.addAgent(new AMBotAdminActions());
    this.ae.addAgent(new AMBotUserActions());
    this.ae.addAgent(new AMBotCommands());
    this.ae.addAgent(new AMBotUserMessages());

    this.ae.notifyAgents(AMBotEvents.ID_ACTION_PREPARE_BOT);
    this.ae.notifyAgents(AMBotUserActions.ID_ACTION_REGISTER_BOT_ACTIONS);
    this.ae.notifyAgents(AMBotAdminActions.ID_ACTION_REGISTER_BOT_ACTIONS);

    this.ae.get_bot().launch();
  }
}

module.exports = Application;
