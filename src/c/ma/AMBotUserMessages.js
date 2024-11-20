const Cast = require("../../Cast");
const AM = require("./AM");
const AMBotEvents = require("./AMBotEvents");
const DUChatAction = require("../../d/DUChatAction");
const AMBotUserActions = require("./AMBotUserActions");
const AMBotCommands = require("./AMBotCommands");
const LOG = require("../../LOG");

module.exports = class AMBotUserMessages extends AM {
  constructor() {
    super("AMBotUserMessages");
  }

  notify(eventId, details) {
    let ds = this.get_ae().get_ds();
    let m;
    switch (eventId) {
      case AMBotEvents.ID_EVENT_NEW_MESSAGE:
        m = Cast.toDUChatMessage(details);
        //ds.storeMessage(m.get_message())

        if (
          this.get_ae().get_duApp().get_idNextAction(m.get_fromChatID()) !=
          DUChatAction.ID_ACTION_NONE
        ) {
          this.processUserTextFeedback(m);
          return;
        }
        //detect commands:
        let msg = m.get_message().text;
        let cmd;
        if (msg.indexOf("!") == 0 || msg.indexOf("/") == 0) {
          cmd = msg.substring(1);
          cmd =
            cmd.indexOf(" ") == -1 ? cmd : cmd.substring(0, cmd.indexOf(" "));
        } else {
          /*if (!ctx.message.hasOwnProperty('left_chat_participant')) {
                        tgEventNewMessage(ctx)
                    }*/
          cmd = DUChatAction.ID_ACTION_NONE;
        }

        if (cmd != DUChatAction.ID_ACTION_NONE) {
          this.get_ae().notifyAgents(
            AMBotCommands.ID_A_PROCESS_COMMAND,
            details
          );
        } // else if (!m.get_inGroupChat() && !ds.tiUsersFirstPMMsgProcessed(m.get_fromUserID())) {
        // bot private chat:

        /*let m = txt.areYouCP.replace("%userName%", fromUserFN);
                bot.telegram.sendMessage(ctx.chat.id, m, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {text: txt.buttonYes, callback_data: 'iamcp'},
                                {text: txt.buttonNo, callback_data: 'iamnotcp'}
                            ]
                        ]
                    }
                })
                this.showHelloPMMsg(m.get_ctx())
                ds.tiUsersFirstPMMsgProcessed(m.get_fromUserID(), true)
            }*/

        break;

      case AMBotEvents.ID_EVENT_NEW_USER:
        m = Cast.toDUChatMessage(details);
        if (m.get_inGroupChat()) {
          let msg = this.get_ae()
            .get_txt()
            .newUserMessage.replace("%userName%", m.get_fromUserFN());
          this.get_ae().get_bot().telegram.sendMessage(m.get_chat().id, msg);
        } else {
          this.showHelloPMMsg(m.get_ctx());
        }
        break;

      case AMBotUserMessages.ID_ACTION_SHOW_HELLO_MSG:
        this.showHelloPMMsg(details);
        break;
    }
  }

  //todo
  processUserTextFeedback(a) {
    let txt = this.get_ae().get_txt();
    let ds = this.get_ae().get_ds();
    let m = Cast.toDUChatMessage(a);
    let ctx = m.get_ctx();

    switch (this.get_ae().get_duApp().get_idNextAction(m.get_fromChatID())) {
      case DUChatAction.ID_ACTION_USER_TOLD_ABOUT_ITSELF:
        if (
          this.get_ae()
            .get_duApp()
            .waitingForUserFeedbackTextId(m.get_fromChatID()) ==
          m.get_fromUserID()
        ) {
          this.get_ae().notifyAgents(
            AMBotUserActions.ID_ACTION_COPYWRITER_TOLD_ABOUT_ITSELF,
            ctx
          );
        }
        break;

      case DUChatAction.ID_ACTION_USER_TOLD_ABOUT_WHAT_IT_WANTS:
        if (
          this.get_ae()
            .get_duApp()
            .waitingForUserFeedbackTextId(m.get_fromChatID()) ==
          m.get_fromUserID()
        ) {
          this.get_ae().notifyAgents(
            AMBotUserActions.ID_ACTION_USER_TOLD_ABOUT_WHAT_IT_WANTS,
            ctx
          );
        }
        break;

      case DUChatAction.ID_ACTION_USER_SET_CP_TOPICS:
        let msg = m.get_message().text;
        if (
          this.get_ae()
            .get_duApp()
            .waitingForUserFeedbackTextId(m.get_fromChatID()) ==
          m.get_fromUserID()
        ) {
          let tl = msg.split(",");
          let tt;
          let rt = [];
          let ttt = [];
          for (const it in tl) {
            tt = ds.getTopicById(tl[it]);
            if (tt) {
              ttt.push(tt.title);
              rt.push(tt.title);
            }
          }
          ds.setTopicsCopywriter(ttt, ctx.message.from);
          if (ttt.length > 0) {
            ctx.reply(
              m.get_fromUserFN() +
                txt.yourTopics0 +
                rt.join("\n> ") +
                txt.yourTopics1
            );
          } else {
            ctx.reply(m.get_fromUserFN() + txt.yourTopicsNoTopics);
          }
        }
        break;
    }
    this.get_ae()
      .get_duApp()
      .set_idNextAction(m.get_fromChatID(), DUChatAction.ID_ACTION_NONE);
  }

  showHelloPMMsg(ctx) {
    let m = this.get_ae()
      .get_txt()
      .pleaseChoose.split("%name%")
      .join(ctx.message.from.first_name);
    this.get_ae()
      .get_bot()
      .telegram.sendMessage(ctx.chat.id, m, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: this.get_ae().get_txt().buttonYes,
                callback_data: "iamcp",
              },
              {
                text: this.get_ae().get_txt().buttonNo,
                callback_data: "lookingforcp",
              },
            ],
          ],
        },
      });
  }

  getAutoSubscribeEvents(envName) {
    return [
      ,
      AMBotEvents.ID_EVENT_NEW_MESSAGE,
      AMBotEvents.ID_EVENT_NEW_USER,
      AMBotUserMessages.ID_ACTION_SHOW_HELLO_MSG,
    ];
  }

  static NAME = "AMBotUserMessages";

  /**
   * ctx
   */
  static ID_ACTION_SHOW_HELLO_MSG =
    AMBotUserMessages.NAME + "ID_ACTION_SHOW_HELLO_MSG";
};
