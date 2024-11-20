//пароль админа
const ADMIN_ADD_PASSWORD = "12345";

const { Composer, Markup } = require("telegraf");
const Telegraf = require("telegraf");
const { Keyboard } = require("telegram-keyboard");

const botCfg = require("./src/botConfig.json");
const txt = require("./src/langRu_RU.json");
const Application = require("./src/a/Application");

const DS = require("./src/dataStorage");
const LOG = require("./src/LOG");

let bot;

let ds = new DS(
  "db\\db.json",
  "db\\admin.json",
  "db\\copywriters.json",
  "db\\topics.json",
  "db\\messagesLog.json",
  "db\\vacanciesLog.json",
  "db\\userInqueryLog.json",
  "db\\userTechInfo.json",
  "db\\userSuggestionsLog.json",
  dbIsReadyCb
);

function dbIsReadyCb() {
  bot = new Telegraf(botCfg.BOT_TOKEN);

  //bot.catch((err) => { LOG.log('err:', err) })

  let app = new Application(botCfg, bot, ds, txt, ADMIN_ADD_PASSWORD);
  app.startup();
}

//ctx.replyWithHTML
