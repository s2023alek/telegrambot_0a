const LOG = require("./LOG");

function log(a, stringify) {
  stringify ? console.log(JSON.stringify(a)) : console.log(a);
}

module.exports = class DS {
  static ID_PROP_LAST_TOPIC_ID = "ID_PROP_LAST_TOPIC_ID";

  dbIsReady;

  appDB;

  app;
  data;
  admDB; //admins
  cpDB; //copywriters
  tDB; //topics
  mDB; //messages
  vDB; //vacancies
  userInqueryDB;
  userTechInfoDB; // various tech data like userFirstMessageIsProcessed
  userSuggestionsDB;

  admins = [];
  topics = [];
  techInfoUsers = [];
  userSuggestions = [];

  appDataId = 0;
  appData = {
    lastTopicId: -1,
    botChatId: -1,
  };
  copywriters = [];
  userInqueries = [];

  constructor(
    appDBPath,
    adminDBPath,
    copywritersDBPath,
    topicsDBPath,
    messagesDBPath,
    vacanciesDBPath,
    userInqueryDBPath,
    userTechInfoDBPath,
    userSuggestionsDBPath,
    dbIsReadyCb
  ) {
    let s = this;
    s.userSuggestionsDB = new DB(userSuggestionsDBPath, () => {
      s.userTechInfoDB = new DB(userTechInfoDBPath, () => {
        s.appDB = new DB(appDBPath, () => {
          s.admDB = new DB(adminDBPath, () => {
            s.cpDB = new DB(copywritersDBPath, () => {
              s.tDB = new DB(topicsDBPath, () => {
                s.mDB = new DB(messagesDBPath, () => {
                  s.vDB = new DB(vacanciesDBPath, () => {
                    s.userInqueryDB = new DB(userInqueryDBPath, () => {
                      s.prepareDb(() => {
                        dbIsReadyCb(dbIsReadyCb);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  prepareDb(dbIsReadyCb) {
    let s = this;

    s.userSuggestionsDB.db.find({}, function (err, docs) {
      s.userSuggestions = docs;

      s.appDB.db.find({ id: 0 }, function (err, docs) {
        s.prepareApplicationProperties(docs);

        s.admDB.db.find({}, function (err, docs) {
          s.admins = docs;

          s.userTechInfoDB.db.find({}, function (err, docs) {
            s.techInfoUsers = docs;

            s.tDB.db
              .find({})
              .sort({ id: 1 })
              .exec(function (err, docs) {
                s.topics = docs;

                s.cpDB.db.find({}, function (err, docs) {
                  s.copywriters = docs;

                  s.userInqueryDB.db.find({}, function (err, docs) {
                    s.userInqueries = docs;

                    s.dbIsReady = true;
                    dbIsReadyCb();
                  });
                });
              });
          });
        });
      });
    });
  }

  prepareApplicationProperties(docs) {
    if (docs.length < 1) docs = [this.appData];
    this.appData = docs[0];
    if (this.appData.lastTopicId === -1) {
      this.appData.lastTopicId = 19;
      this.addAppData(this.appData);
    }
  }

  get_lastTopicId() {
    return this.appData.lastTopicId;
  }

  set_lastTopicId(a) {
    this.appData.lastTopicId = a;
    this.updateAppData(this.appData);
  }

  get_botChatId() {
    return this.appData.botChatId;
  }

  set_botChatId(a) {
    this.appData.botChatId = a;
    this.updateAppData(this.appData);
  }

  addAdmin(userId) {
    if (this.isAdmin(userId)) {
      //log('admin with id ' + userId + ' already exists')
      return;
    }
    //log('ADMIN ADDED:'+userId)
    this.admDB.db.insert({ id: userId });
    this.admins.push({ id: userId });
  }

  removeAdmin(userId) {
    this.admDB.db.remove({ id: userId }, {});
  }

  /**
   * tech info
   * @return if setProcessed is false - reads from db. else - writes to db
   */
  tiUsersFirstPMMsgProcessed(userId, setProcessed = false) {
    if (!setProcessed) {
      for (const a in this.techInfoUsers) {
        //log(this.admins[a].id +'=='+userId)
        const userData = this.techInfoUsers[a];
        if (userData.id == userId) {
          return userData.firstPMMsgProcessed;
        }
      }
    } else {
      for (const a in this.techInfoUsers) {
        //log(this.admins[a].id +'=='+userId)
        const userData = this.techInfoUsers[a];
        if (userData.id == userId) {
          return false;
        }
      }

      const userData = { id: userId, firstPMMsgProcessed: true };
      this.techInfoUsers.push(userData);
      this.userTechInfoDB.db.insert(userData);
    }
    return false;
  }

  isAdmin(userId) {
    //log('isAdmin============================')
    //log(JSON.stringify(this.admins))
    for (const a in this.admins) {
      //log(this.admins[a].id +'=='+userId)
      if (this.admins[a].id == userId) return true;
    }
    return false;
  }

  getCopyWritersByTopicId(topicId) {
    let r = [];
    for (const i in this.topics) {
      let t = this.topics[i];
      if (t.id === topicId) {
        let tu = t.users;
        for (const ii in tu) {
          r.push(tu[ii].username);
        }
      }
    }
    return r;
  }

  getTopics() {
    return this.topics;
  }

  getCopywriters() {
    return this.copywriters;
  }

  getUserInqueries() {
    return this.userInqueries;
  }

  /**
   *
   * @param id
   * @return {null|{id, title}}
   */
  getTopicById(id) {
    for (const i in this.topics) {
      let t = this.topics[i];
      if (t) {
        //log(this.topics)
        if (t.id.toString() === id.toString()) return t;
      }
    }
    return null;
  }

  getCpTopicsIDList(userId) {
    let userTopics = [];
    for (const i in this.topics) {
      let t = this.topics[i];
      for (const u in t.users) {
        let tuser = t.users[u];
        if (tuser.id == userId) {
          userTopics.push(t.id);
        }
      }
    }
    return userTopics;
  }

  toggleTopicCopywriter(topicId, user) {
    let t;
    let removed = false;
    for (const j in this.topics) {
      t = this.topics[j];
      //remove
      if (t.id == topicId) {
        for (const jj in t.users) {
          if (t.users[jj].id == user.id) {
            t.users.splice(jj, 1);
            removed = true;
            break;
          }
        }
      }
    }

    if (!removed) {
      for (const j in this.topics) {
        //add:
        t = this.topics[j];
        if (t.id == topicId) {
          //log('ADD:'+t.title+'/'+user.id)
          if (!t.users) t.users = [];
          t.users.push(user);
          break;
        }
      }
    }
    this.updateTopics();
  }

  /**
   *
   * @param topicTitle
   * @param user
   * @return true added, false already present
   */
  setTopicsCopywriter(topicTitles, user) {
    var t;
    for (const j in this.topics) {
      t = this.topics[j];
      //remove
      for (const jj in t.users) {
        if (t.users[jj].id == user.id) t.users.splice(jj, 1);
      }
    }

    for (const i in this.topics) {
      t = this.topics[i];
      //add
      if (topicTitles.indexOf(t.title) !== -1) {
        t.users = t.users == null ? [] : t.users;
        let userFound = false;
        for (const ii in t.users) {
          let u = t.users[ii];
          if (u.id === user.id) {
            userFound = true;
            break;
          }
        }
        if (!userFound) {
          //log('ADD:'+t.title+'/'+user.id)
          t.users.push(user);
        }
      }
    }
    //log('RESULT:'+JSON.stringify(this.topics))
    this.updateTopics();
  }

  updateAppData(data) {
    this.appDB.db.update({ id: 0 }, data, {});
  }

  addAppData(data) {
    data.id = 0;
    this.appDB.db.insert(data);
  }

  updateTopics() {
    let s = this;
    for (const i in s.topics) {
      let t = s.topics[i];
      s.tDB.db.update({ id: t.id }, t, {});
    }
  }

  getTopicsByUserId(userId) {
    let s = this;
    let r = [];
    for (const i in this.topics) {
      let t = this.topics[i];
      for (const ti in t.users) {
        let u = this.topics[i].users[ti];
        if (u.id == userId) r.push(t);
      }
    }
    //log('user topics:'+JSON.stringify(r))
    return r;
  }

  setCopywriterAboutText(user, text) {
    let targetUser = null;
    for (const ti in this.copywriters) {
      let u = this.copywriters[ti];
      if (u.id == user.id) {
        targetUser = u;
        break;
      }
    }
    if (targetUser == null) {
      targetUser = user;
      targetUser.about = text;
      this.copywriters.push(targetUser);
      this.addCopywriter(targetUser);
    } else {
      targetUser.about = text;
      this.updateCopywriter(targetUser);
    }
  }

  getCopywriterAboutText(userId) {
    for (const ti in this.copywriters) {
      let u = this.copywriters[ti];
      if (u.id == userId) {
        return u.about;
      }
    }
    return null;
  }

  setUserToldWhatItWantsText(user, text) {
    user.userInquery = text;
    this.addWhatUserWants(user);
  }

  addWhatUserWants(a) {
    this.userInqueries.push(a);
    this.userInqueryDB.db.insert(a);
  }

  addSuggestion(a) {
    let s = { text: a };
    this.userSuggestions.push(s);
    this.userSuggestionsDB.db.insert(s);
  }

  getSuggestionsList() {
    return this.userSuggestions;
  }

  updateCopywriter(cp) {
    //log('update:'+JSON.stringify(cp))
    this.cpDB.db.update({ id: cp.id }, cp, {});
  }

  addCopywriter(cp) {
    //log('insert:'+JSON.stringify(cp))
    this.cpDB.db.insert(cp);
  }

  storeMessage(msg) {
    let m = JSON.parse(JSON.stringify(msg));
    m.chat = "0";
    this.mDB.db.insert(m);
  }

  addVacancy(msg, botCommand) {
    let m = JSON.parse(JSON.stringify(msg));
    m.chat = "0";
    m.text = m.text.substring(botCommand.length + 1);
    this.vDB.db.insert(m);
  }
};

class DB {
  db = null;

  /**
   *
   * @param fileName
   * @param cb function (dbIsReady)
   */
  constructor(fileName, cb) {
    let Datastore = require("nedb");
    this.db = new Datastore({ filename: fileName });
    this.db.loadDatabase(function (err) {
      //log('database error: ' + err)
      cb(err == null);
    });
  }
}
