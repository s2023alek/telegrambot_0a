const AgentEnvironment = require("../agentenv/AgentEnvironment");
const Telegraf = require("telegraf");
const DS = require("../dataStorage");
const txt = require("../langRu_RU.json");
const DUApp = require("../d/DUApp");

module.exports = class AEApp extends AgentEnvironment {
  constructor(name, bot, ds, txt, adminAddPassword) {
    super(name);
    this.bot = bot;
    this.ds = ds;
    this.txt = txt;
    this.adminAddPassword = adminAddPassword;
    this.duApp = new DUApp();
  }

  adminAddPassword;
  get_adminAddPassword = () => this.adminAddPassword;
  duApp;
  /**
   *
   * @returns {DUApp}
   */
  get_duApp = () => this.duApp;

  bot;
  /**
   *
   * @returns {Telegraf}
   */
  get_bot = () => this.bot;
  ds;
  /**
   *
   * @returns {DS}
   */
  get_ds = () => this.ds;
  txt;
  /**
   *
   * @returns {txt}
   */
  get_txt = () => this.txt;
  /**
   *
   * @returns {[]}
   */
  get_topics = () => this.ds.getTopics();
};
