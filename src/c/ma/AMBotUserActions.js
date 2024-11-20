const Application = require("../../a/Application");
const DUChatAction = require("../../d/DUChatAction");
const Lib0 = require("../../lib/Lib0");
const AM = require("./AM");
const LOG = require("../../LOG");

module.exports = class AMBotUserActions extends AM {
  constructor() {
    super("AMBotUserActions");
  }

  notify(eventId, details) {
    let txt = this.get_ae().get_txt();
    let ds = this.get_ae().get_ds();
    let ctx = details;

    switch (eventId) {
      case AMBotUserActions.ID_ACTION_REGISTER_BOT_ACTIONS:
        this.registerActions();
        break;

      case AMBotUserActions.ID_ACTION_COPYWRITER_TOLD_ABOUT_ITSELF:
        /*if (ctx.message.text == "отмена") {
          ctx.reply(txt.actionCancelled);
          break;
        }*/
        ds.setCopywriterAboutText(ctx.message.from, ctx.message.text);
        ctx.reply(txt.yourFeedbackAdded);
        break;

      case AMBotUserActions.ID_ACTION_USER_TOLD_ABOUT_WHAT_IT_WANTS:
        ds.setUserToldWhatItWantsText(ctx.message.from, ctx.message.text);
        ctx.reply(txt.yourFeedbackAdded);
        break;

      case AMBotUserActions.ID_ACTION_COPYWRITER_SELECT_TOPICS:
        this.showCPSelectedTopics(details);
        break;

      case AMBotUserActions.ID_ACTION_SHOW_CP_BY_TOPIC_LIST:
        this.action_lookingforcp(
          this.get_ae().get_bot(),
          details,
          this.get_ae().get_txt()
        );
        break;
    }
  }

  showCPSelectedTopics(ctx) {
    let txt = this.get_ae().get_txt();
    let topics = this.get_ae().get_topics();
    let bot = this.get_ae().get_bot();
    let ds = this.get_ae().get_ds();
    let u = Lib0.processCtxBotActionButtonCallback(ctx, ds);
    if (u == null) u = Lib0.processCtxBotMessage(ctx, ds);
    if (u == null) return;

    let th = [];
    let t;
    let ut = ds.getTopicsByUserId(u.get_fromUserID());

    function topicPresent(t) {
      for (const i in ut) {
        //LOG.log(t.id + '==' + ut[i].id + (t.id == ut[i].id))
        if (t.id == ut[i].id) {
          return true;
        }
      }
      return false;
    }
    for (const i in topics) {
      t = topics[i];
      let buttonTitle = t.title;
      if (topicPresent(t)) {
        buttonTitle = buttonTitle + txt.chosen;
      } else {
        buttonTitle = buttonTitle + txt.notChosen;
      }
      th.push([{ text: buttonTitle, callback_data: "cpToggleTopic-" + t.id }]);
    }
    th.push([
      { text: txt.buttonCloseReady, callback_data: "cpToggleTopicClose" },
    ]);

    bot.telegram.sendMessage(ctx.chat.id, txt.whatSubjectsAreYouWorkingWith2, {
      reply_markup: {
        inline_keyboard: th,
      },
    });
  }

  userActionToggleTopicClose(ctx) {
    try {
      ctx.deleteMessage();
    } catch (e) {}
  }

  userActionToggleTopic(actionTitle, ctx) {
    try {
      ctx.deleteMessage();
    } catch (e) {}

    let ds = this.get_ae().get_ds();
    let topicId = parseInt(actionTitle.substring(actionTitle.indexOf("-") + 1));
    //LOG.log('topicId:' + topicId)

    let u = Lib0.processCtxBotActionButtonCallback(ctx, ds);
    if (u == null) return;

    ds.toggleTopicCopywriter(topicId, u.get_fromUser());
    this.showCPSelectedTopics(ctx);
  }

  /**
   * NOT USED
   * @param {DUChatAction} u
   */
  actionShowTopicsList(ctx, topics, txt, u) {
    let ds = this.get_ae().get_ds();

    let th = [];
    let t;
    let ut =
      ctx.message == null ? [] : ds.getTopicsByUserId(u.get_fromUserID());

    function topicPresent(t) {
      for (const i in ut) {
        //LOG.log(t.id + '=='+ ut[i].id + (t.id == ut[i].id))
        if (t.id == ut[i].id) {
          return true;
        }
      }
      return false;
    }

    for (const i in topics) {
      t = topics[i];
      th[i] = t.title + " - " + t.id;
      if (topicPresent(t)) {
        th[i] = txt.youAreSubscribed + "" + th[i];
      }
      //LOG.log(th[i])
    }

    ctx.reply(
      txt.whatSubjectsAreYouWorkingWith.split("%list%").join(th.join("\n"))
    );
    this.get_ae()
      .get_duApp()
      .set_idNextAction(
        u.get_fromChatID(),
        DUChatAction.ID_ACTION_USER_SET_CP_TOPICS
      );
    this.get_ae()
      .get_duApp()
      .waitingForUserFeedbackTextId(u.get_fromChatID(), u.get_fromUserID());
  }

  registerActions() {
    let bot = this.get_ae().get_bot();
    let txt = this.get_ae().get_txt();
    let ds = this.get_ae().get_ds();

    let topics = this.get_ae().get_topics();
    for (const i in topics) {
      let t = topics[i];
      let actionTitle = "cpToggleTopic-" + t.id;
      bot.action(actionTitle, (ctx) => {
        this.userActionToggleTopic(actionTitle, ctx);
      });
    }

    bot.action("cpToggleTopicClose", (ctx) => {
      this.userActionToggleTopicClose(ctx);
    });

    bot.action("iamcp", (ctx) => {
      let m = txt.pleaseChoose1;
      bot.telegram.sendMessage(ctx.chat.id, m, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: txt.buttonSetUserAboutInfo,
                callback_data: "cpSetAboutInfo",
              },
            ],
            [
              {
                text: txt.buttonShowUserAboutInfo,
                callback_data: "cpShowAboutInfo",
              },
            ],
            [{ text: txt.buttonSetTopics, callback_data: "cpSetTopics" }],
            [{ text: txt.buttonShowTopics, callback_data: "cpShowTopics" }],
          ],
        },
      });
    });

    bot.action("cpShowTopics", (ctx) => {
      let u = Lib0.processCtxBotActionButtonCallback(ctx, ds);
      if (u == null) return;

      let tl = ds.getCpTopicsIDList(u.get_fromUserID());
      //LOG.log('tl:')
      //LOG.log(tl)
      let tt;
      let rt = [];
      let ttt = [];
      if (tl.length > 0) {
        for (const it in tl) {
          tt = ds.getTopicById(tl[it]);
          //LOG.log('tt:')
          //LOG.log(tt)
          if (tt) {
            ttt.push(tt.title);
            rt.push(tt.title);
          }
        }
      }
      if (ttt.length > 0) {
        ctx.reply(
          u.get_fromUserFN() +
            txt.yourTopics0 +
            rt.join("\n> ") +
            txt.yourTopics1
        );
      } else {
        ctx.reply(u.get_fromUserFN() + txt.yourTopicsNoTopics);
      }
    });

    bot.action("cpSetTopics", (ctx) => {
      this.get_ae().notifyAgents(
        AMBotUserActions.ID_ACTION_COPYWRITER_SELECT_TOPICS,
        ctx
      );

      //let u = Lib0.processCtxBotActionButtonCallback(ctx, ds)
      //if (u == null) return

      //this.actionShowTopicsList(ctx, topics, txt, u)
    });

    bot.action("cpSetAboutInfo", (ctx) => {
      let u = Lib0.processCtxBotActionButtonCallback(ctx, ds);
      if (u == null) return;

      this.get_ae()
        .get_duApp()
        .set_idNextAction(
          u.get_fromChatID(),
          DUChatAction.ID_ACTION_USER_TOLD_ABOUT_ITSELF
        );
      this.get_ae()
        .get_duApp()
        .waitingForUserFeedbackTextId(u.get_fromChatID(), u.get_fromUserID());
      //LOG.log('WAITING FOR USER:'+waitingForUserTellingAboutItselfId)
      let aboutInfo = this.get_ae()
        .get_ds()
        .getCopywriterAboutText(u.get_fromUserID());
      ctx.reply(txt.tellAboutYourself.split("%info%").join(aboutInfo));
    });

    bot.action("iamnotcp", (ctx) => {
      let u = Lib0.processCtxBotActionButtonCallback(ctx, ds);
      if (u == null) return;

      ctx.reply(txt.msgIamOther);
      this.get_ae()
        .get_duApp()
        .set_idNextAction(
          u.get_fromChatID(),
          DUChatAction.ID_ACTION_USER_TOLD_ABOUT_WHAT_IT_WANTS
        );
      this.get_ae()
        .get_duApp()
        .waitingForUserFeedbackTextId(u.get_fromChatID(), u.get_fromUserID());
    });

    for (const ia in topics) {
      let ta = topics[ia];
      this.inlineKeyboardTopics.push([
        { text: ta.title, callback_data: "t" + ta.id },
      ]);
    }
    this.inlineKeyboardTopics.push([
      { text: txt.buttonCloseReady, callback_data: "cpToggleTopicClose" },
    ]);

    bot.action("lookingforcp", (ctx) => {
      this.action_lookingforcp(bot, ctx, txt);
    });

    bot.action("notlookingforcp", (ctx) => {
      ctx.reply(txt.afterTellAboutYourself);
    });

    bot.action("lookingforother", (ctx) => {
      ctx.reply(txt.afterTellAboutYourself);
    });

    for (const ia in topics) {
      let ta = topics[ia];
      bot.action("t" + ta.id, (ctx) => {
        let cpl = ds.getCopyWritersByTopicId(ta.id);
        let cp = ds.getCopywriters();

        if (cpl.length < 1) {
          ctx.reply(
            txt.noCopywritersByThisTopicPresent.split("%topic%").join(ta.title)
          );
        } else {
          let rescp = [];
          for (let i in cpl) {
            let cpun = cpl[i];
            for (let ii in cp) {
              let copywriter = cp[ii];
              if (copywriter.username == cpun) {
                rescp.push(copywriter);
              }
            }
          }

          let ms = cp.length < 1 ? txt.listIsEmpty : "";
          for (let i in rescp) {
            let c = rescp[i];
            let un = c.username == null ? "" : "@" + c.username;
            if (c.username) {
              ms =
                ms +
                txt.copywriter +
                un +
                "\n" +
                txt.copywriterInfo +
                "\n" +
                c.about +
                "\n---------------\n";
            }
          }

          ctx.reply(txt.copywritersBySubject + ' "' + ta.title + '":\n' + ms);
        }
      });
    }
  }

  inlineKeyboardTopics = [];

  action_lookingforcp(bot, ctx, txt) {
    bot.telegram.sendMessage(ctx.chat.id, txt.msgIamCustomer, {
      reply_markup: { inline_keyboard: this.inlineKeyboardTopics },
    });
  }

  getAutoSubscribeEvents(envName) {
    return [
      AMBotUserActions.ID_ACTION_COPYWRITER_TOLD_ABOUT_ITSELF,
      AMBotUserActions.ID_ACTION_USER_TOLD_ABOUT_WHAT_IT_WANTS,
      AMBotUserActions.ID_ACTION_REGISTER_BOT_ACTIONS,
      AMBotUserActions.ID_ACTION_COPYWRITER_SELECT_TOPICS,
      AMBotUserActions.ID_ACTION_SHOW_CP_BY_TOPIC_LIST,
    ];
  }

  static NAME = "AMBotUserActions";

  /**
   * ctx
   */
  static ID_ACTION_COPYWRITER_SELECT_TOPICS =
    AMBotUserActions.NAME + "ID_ACTION_COPYWRITER_SELECT_TOPICS";
  /**
   * ctx
   */
  static ID_ACTION_COPYWRITER_TOLD_ABOUT_ITSELF =
    AMBotUserActions.NAME + "ID_ACTION_COPYWRITER_TOLD_ABOUT_ITSELF";
  /**
   * ctx
   */
  static ID_ACTION_USER_TOLD_ABOUT_WHAT_IT_WANTS =
    AMBotUserActions.NAME + "ID_ACTION_USER_TOLD_ABOUT_WHAT_IT_WANTS";
  /**
   * ctx
   */
  static ID_ACTION_SHOW_CP_BY_TOPIC_LIST =
    AMBotUserActions.NAME + "ID_ACTION_SHOW_CP_BY_TOPIC_LIST";

  static ID_ACTION_REGISTER_BOT_ACTIONS =
    AMBotUserActions.NAME + "ID_ACTION_REGISTER_BOT_ACTIONS";
};
