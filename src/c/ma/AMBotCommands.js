const DUChatMessage = require("../../d/DUChatMessage");
const AM = require("./AM");
const AMBotEvents = require("./AMBotEvents");
const LOG = require("../../LOG");
const DUChatAction = require("../../d/DUChatAction");
const AMBotUserActions = require("../ma/AMBotUserActions");

module.exports = class AMBotCommands extends AM {
  constructor() {
    super("AMBotCommands");
  }

  notify(eventId, details) {
    switch (eventId) {
      case AMBotCommands.ID_A_PROCESS_COMMAND:
        this.processCommand(details);
        break;
    }
  }

  /**
   *
   * @param {DUChatMessage} m
   */
  processCommand(m) {
    let topics = this.get_ae().get_topics();
    let bot = this.get_ae().get_bot();
    let txt = this.get_ae().get_txt();
    let ds = this.get_ae().get_ds();
    let ctx = m.get_ctx();

    let msg = m.get_message().text;
    if (msg.indexOf("@Sokrat2021Bot") != -1) {
      msg = msg.substring(0, msg.indexOf("@Sokrat2021Bot"));
    }
    msg = msg.substring();

    let cmd;
    cmd = msg.substring(1);
    cmd = cmd.indexOf(" ") == -1 ? cmd : cmd.substring(0, cmd.indexOf(" "));

    switch (cmd) {
      //case /start
      case "start":
        this.get_ae().notifyAgents(AMBotEvents.ID_EVENT_NEW_USER, m);
        /*
                let msg5 = txt.pleaseChoose
                bot.telegram.sendMessage(ctx.chat.id, msg5, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: txt.buttonSearchingForJob, callback_data: 'iamcp' },
                                { text: txt.buttonSearchingForCp, callback_data: 'lookingforcp' }
                            ],
                            [
                                { text: txt.buttonSearchingForOther, callback_data: 'lookingforother' }
                            ]
                        ]
                    }
                })
                ds.tiUsersFirstPMMsgProcessed(m.get_fromUserID(), true)
                */
        break;

      //case "!about":
      case txt.COMMAND_saveAboutText:
      case txt.COMMAND_saveAboutText1:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        this.get_ae()
          .get_duApp()
          .set_idNextAction(
            m.get_fromChatID(),
            DUChatAction.ID_ACTION_USER_TOLD_ABOUT_ITSELF
          );
        this.get_ae()
          .get_duApp()
          .waitingForUserFeedbackTextId(m.get_fromChatID(), m.get_fromUserID());
        //LOG.log('WAITING FOR USER:'+waitingForUserTellingAboutItselfId)
        let aboutInfo = this.get_ae()
          .get_ds()
          .getCopywriterAboutText(m.get_fromUserID());
        ctx.reply(txt.tellAboutYourself.split("%info%").join(aboutInfo));
        break;

      //case "!окп":
      case txt.COMMAND_listAboutMsgs:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        if (ds.isAdmin(m.get_fromUserID())) {
          let cp = ds.getCopywriters();
          var ms = cp.length < 1 ? txt.listIsEmpty : null;
          for (let i in cp) {
            let c = cp[i];
            let fn = c.first_name == null ? "" : c.first_name;
            let ln = c.last_name == null ? "" : " " + c.last_name;
            let un = c.username == null ? "" : " @" + c.username;
            ms = ms + fn + ln + un + "\n" + c.about + "\n---------------\n";
          }
        }
        ctx.reply(ds.isAdmin(m.get_fromUserID()) ? ms : txt.noYouAreNotAdmin);
        break;

      //обращения
      case txt.COMMAND_listInqueryMsgs:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        if (ds.isAdmin(m.get_fromUserID())) {
          let cp = ds.getUserInqueries();
          var ms = cp.length < 1 ? txt.listIsEmpty : null;
          for (let i in cp) {
            let c = cp[i];
            let fn = c.first_name == null ? "" : c.first_name;
            let ln = c.last_name == null ? "" : " " + c.last_name;
            let un = c.username == null ? "" : " @" + c.username;
            ms =
              ms + fn + ln + un + "\n" + c.userInquery + "\n---------------\n";
          }
        }
        ctx.reply(ds.isAdmin(m.get_fromUserID()) ? ms : txt.noYouAreNotAdmin);
        break;

      //case "!помощь":
      case txt.COMMAND_userHelp:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        ctx.reply(txt.userHelp.join(""));
        break;

      //case "!сократ":
      case txt.COMMAND_socrat:
      case txt.COMMAND_socrat1:
      case txt.COMMAND_socrat2:
      case txt.COMMAND_socrat3:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        ctx.reply(txt.userHelp.join(""));
        //ctx.reply(txt.botWelcome.split("%name%").join(m.get_fromUserFN()))
        break;

      //case "!этотчат":
      case txt.COMMAND_setChat:
        if (!ds.isAdmin(m.get_fromUserID())) {
          ctx.reply(txt.noYouAreNotAdmin);
        } else {
          ds.set_botChatId(ctx.message.chat.id);
          ctx.reply(txt.chatSet.split("%id%").join(ctx.message.chat.id));
        }
        break;

      //case "!админ":
      case txt.COMMAND_adminHelp:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        ctx.reply(
          ds.isAdmin(m.get_fromUserID())
            ? txt.adminHelp.join("\n")
            : txt.noYouAreNotAdmin
        );
        break;

      //case "!яадмин?":
      case txt.COMMAND_checkUserIsAdmin:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        ctx.reply(
          ds.isAdmin(m.get_fromUserID())
            ? txt.yesYouAreAdmin
            : txt.noYouAreNotAdmin
        );
        break;

      // "!яадмин 12dSADadS_3"
      //case "!яадмин":
      case txt.COMMAND_setUserAdmin:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        let cmds2 = msg.split(" ");
        if (cmds2[1] == this.get_ae().get_adminAddPassword()) {
          ds.addAdmin(m.get_fromUserID());
          ctx.reply(txt.setAdminSuccess);
        } else {
          ctx.reply(txt.setAdminWrongPassword);
        }
        break;

      //"/Search"
      case txt.COMMAND_search:
      case txt.COMMAND_search1:
        this.get_ae().notifyAgents(
          AMBotUserActions.ID_ACTION_SHOW_CP_BY_TOPIC_LIST,
          ctx
        );
        break;

      //case "!правила":
      case txt.COMMAND_chatRules:
      case txt.COMMAND_chatRules1:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        ctx.reply(txt.chatRules.join(""));
        break;

      //case "!старт":
      case txt.COMMAND_start:
        this.get_ae().notifyAgents(AMBotEvents.ID_EVENT_NEW_USER, m);
        break;

      //case "!мои.темы":
      case txt.COMMAND_myTopics:
      case txt.COMMAND_myTopics1:
        this.get_ae().notifyAgents(
          AMBotUserActions.ID_ACTION_COPYWRITER_SELECT_TOPICS,
          ctx
        );
        /*if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break

                let cmds = msg.split(' ')
                if (cmds.length < 2) {
                    let tl = []
                    for (const ia in topics) {
                        let ta = topics[ia]
                        for (const iu in ta.users) {
                            let u = ta.users[iu]
                            if (u.id == m.get_fromUserID()) {
                                tl.push(ta.title)
                                break
                            }
                        }
                    }
                    if (tl.length > 0) {
                        ctx.reply(txt.yourTopics0a.split("%name%").join(m.get_fromUserFN()).split("%list%").join(tl.join('\n')))
                    } else {
                        ctx.reply(txt.youHaveNoTopics)
                    }
                } else {
                    let tl = cmds[1].split(',')
                    let tt
                    let rt = []
                    let ttt = []
                    for (const it in tl) {
                        tt = ds.getTopicById(tl[it])
                        if (tt) {
                            ttt.push(tt.title)
                            rt.push(tt.title)
                        }
                    }
                    ds.setTopicsCopywriter(ttt, ctx.message.from)
                    if (ttt.length > 0) {
                        ctx.reply(m.get_fromUserFN() + txt.yourTopics0 + rt.join('\n> ') + txt.yourTopics1)
                    } else {
                        ctx.reply(m.get_fromUserFN() + txt.yourTopicsNoTopics)
                    }
                }*/
        break;

      //case "!предложение":
      case txt.COMMAND_suggestion:
      case txt.COMMAND_suggestion2:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        var cmds1 = msg.split(" ");
        if (cmds1.length > 1) {
          let suggestionText = msg.substring(msg.indexOf(" ") + 1);
          ds.addSuggestion(suggestionText);
          ctx.reply(m.get_fromUserFN() + txt.thankyouForYourSuggestion);
        } else {
          ctx.reply(txt.wrongSuggestion);
        }
        break;

      //case "!предложения":
      case txt.COMMAND_listSuggestions:
      case txt.COMMAND_listSuggestions1:
        if (!this.svcPMOnlyCmd(ctx, cmd, m.get_inGroupChat())) break;

        if (ds.isAdmin(m.get_fromUserID())) {
          const sl = ds.getSuggestionsList();
          let slt = [];
          for (const s in sl) {
            slt.push(sl[s].text);
          }
          ctx.reply(slt.join("\n\n"));
        } else {
          ctx.reply(txt.noYouAreNotAdmin);
        }
        break;

      //case "/Need":
      case txt.COMMAND_postJobVacancy:
        //do nothing
        ds.addVacancy(ctx.message, txt.COMMAND_postJobVacancy);
        break;

      default:
        ctx.reply(
          txt.incorrectCommand
            .split("%list%")
            .join(txt.userHelp.join(""))
            .split("%cmd%")
            .join(cmd)
        );
        break;
    }
  }

  /**
   * command can be used only in pm
   * @return in pm mode
   */
  svcPMOnlyCmd(ctx, cmd, inGroupChat) {
    let txt = this.get_ae().get_txt();
    if (inGroupChat) {
      ctx.reply(txt.pmChatCommandOnly.split("%cmd%").join("/" + cmd));
    }
    return !inGroupChat;
  }

  getAutoSubscribeEvents(envName) {
    return [AMBotCommands.ID_A_PROCESS_COMMAND];
  }

  static NAME = "AMBotCommands";
  /**
   * DUChatMessage
   */
  static ID_A_PROCESS_COMMAND = AMBotCommands.NAME + "ID_A_PROCESS_COMMAND";
};
