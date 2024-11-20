const DUChatAction = require("./DUChatAction");

module.exports = class DUApp {
  /**
   * @param botChatId  = ds.get_botChatId()
   */
  constructor() {}

  idNextAction = [];

  get_idNextAction(fromChatID) {
    if (!this.idNextAction[fromChatID]) return DUChatAction.ID_ACTION_NONE;
    return this.idNextAction[fromChatID];
  }
  set_idNextAction(fromChatID, actionId) {
    this.idNextAction[fromChatID] = actionId;
  }

  waitingForUserFeedbackUserIds = [];
  /**
   * @param userId if null returns current
   */
  waitingForUserFeedbackTextId(chatID, userId = null) {
    if (userId == null) {
      return this.waitingForUserFeedbackUserIds[chatID];
    } else {
      this.waitingForUserFeedbackUserIds[chatID] = userId;
    }
  }
};
