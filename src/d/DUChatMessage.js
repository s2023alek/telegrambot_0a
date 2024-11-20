module.exports = class DUChatMessage {
  /**
   * @param botChatId  = ds.get_botChatId()
   */
  constructor(ctx, message, chat, fromUser, inGroupChat) {
    this.ctx = ctx;
    this.message = message;
    this.chat = chat;
    this.fromUser = fromUser;

    this.fromChatID = chat.id;
    this.fromUserID = this.fromUser.id;
    this.fromUserFN = this.fromUser.first_name;
    this.fromUserLN = this.fromUser.last_name;
    this.fromUserUN = this.fromUser.username;
    this.inGroupChat = inGroupChat;

    if (
      this.message != null &&
      this.message.new_chat_member != null &&
      inGroupChat
    ) {
      this.userIsNew = true;
    }
  }

  ctx;
  get_ctx = () => this.ctx;
  message;
  get_message = () => this.message;
  chat;
  get_chat = () => this.chat;
  fromUser;
  get_fromUser = () => this.fromUser;
  userIsNew;
  get_userIsNew = () => this.userIsNew;

  fromUserID;
  get_fromUserID = () => this.fromUserID;
  fromUserFN;
  get_fromUserFN = () => this.fromUserFN;
  fromUserLN;
  get_fromUserLN = () => this.fromUserLN;
  fromUserUN;
  get_fromUserUN = () => this.fromUserUN;
  fromChatID;
  get_fromChatID = () => this.fromChatID;
  inGroupChat;
  get_inGroupChat = () => this.inGroupChat;
};
