const Discord = require('discord.js');
var fs = require('fs'); //FileSystem
var db = require('quick.db');
const itemsDB = new db.table("ITEMS");
let conf = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file
let itemsJSON = JSON.parse(fs.readFileSync("./items.json", "utf8")); //Config file
var utils = require("../utils.js");

exports.run = async (client, message, args, ops) => {

  // VARIABLES //

  const prefix = conf[message.guild.id].prefix;

  var startedUser = message.author;
  var battleUser = message.mentions.members.first();
  let items = [];
  var count = 0;
  var count2 = 0;
  var xpA = 100;
  var xpB = 100;
  var histResp = "Battle started!";
  var coffA = 1;
  var coffB = 1;
  var used = [0, 0, 0, 0];
  const rushed = new Set();
  const countered = new Set();
  var amountA = [];
  var amountB = [];
  var deleteTime = 3000;
  
  // FETCHING ITEMS //
  
  // RESETTINGS //

  itemsDB.fetch(`${message.guild.id}_${message.author.id}`).then(mA => {
    if (mA === undefined || mA === null) itemsDB.set(`${message.guild.id}_${message.author.id}`, [0, 0, 0, 0, 0, 0]);
  });
  
  itemsDB.fetch(`${message.guild.id}_${battleUser.id}`).then(mB => {
    if (mB === undefined || mB=== null) itemsDB.set(`${message.guild.id}_${battleUser.id}`, [0, 0, 0, 0, 0, 0]);
  });
  
  // THEN... //
    
  itemsDB.fetch(`${message.guild.id}_${message.author.id}`).then(amA => {
    for (let i in amA) {
      amountA.push(amA[i]);
    }
  });

  itemsDB.fetch(`${message.guild.id}_${battleUser.id}`).then(amB => {
    for (let i in amB) {
      amountB.push(amB[i]);
    }
  });

  for (let i in itemsJSON) {
    items.push(itemsJSON[i]);
  }

  // EMBEDS //

  let notFound = utils.error("Item not found");

  let noItem = utils.error("You don\'t have this item");

  var battle = new Discord.RichEmbed()
    .setColor(`RED`)
    .setTitle("Battle")
    .addField("Usage", "Click on reactions to make a move\nUse `" + prefix + "use` to use your items", false)
    .addField("How to attack",
      ":regional_indicator_s: - Strike\n" +
      ":regional_indicator_c: - Counter\n" +
      ":regional_indicator_r: - Rush\n" +
      ":gun: Gun - Removes from the enemy from 40 to 50HP\n" +
      ":dagger: Knife - Removes from the enemy from 30 to 40HP\n" +
      ":shield: Shield - Lowers damage to 50%\n" +
      ":martial_arts_uniform: Uniform - Lowers damage to 75%\n" +
      ":pill: Pill - Adds 25HP\n" +
      ":cookie: Cookie - Adds 10HP ", false)

  var help = utils.text("Battle", "To battle with someone, use `" + conf[message.guild.id].prefix + "battle <user>`\nHe would need to accept your battle.")

  var noUser = utils.error("Mention valid user")

  var self = utils.error("You can't battle with yourself");

  var bot = utils.error("You can't battle with bot");

  var offline = utils.error("You can't battle with offline member")

  // RETURNS //

  if (args.length == 0) return message.channel.send(help);

  if (battleUser == undefined || battleUser.id === undefined) return message.channel.send(noUser);
  if (battleUser.id === message.author.id) return message.channel.send(self);
  if (battleUser.user.bot) return message.channel.send(bot);
  if (battleUser.presence.status == "offline" || battleUser.presence.status == "idle") return message.channel.send(offline);

  // Creating channel //

  var battleChannel = await message.guild.createChannel(`${message.author.username}-${client.users.get(battleUser.id).username}`, "text")
    .then(async channel => {

      // CHANNEL PERMISSIONS //

      channel.overwritePermissions(message.guild.roles.find(r => r.name === '@everyone'), {
        "VIEW_CHANNEL": false
      });
      channel.overwritePermissions(message.author, {
        "VIEW_CHANNEL": true,
        "SEND_MESSAGES": true
      });
      channel.overwritePermissions(battleUser, {
        "VIEW_CHANNEL": true,
        "SEND_MESSAGES": true
      });
      channel.overwritePermissions(client.users.get("464747957288435732"), {
        "VIEW_CHANNEL": true,
        "SEND_MESSAGES": true
      });

      message.channel.send({
        embed: {
          "title": "Battle",
          "description": "Go to <#" + channel.id + "> to start a battle!",
          "color": 0xff2222
        }
      }).then(msgd => {
        msgd.delete(10000);
      })

      // SEND "BATTLE" EMBED //

      channel.send(battle).then(async function(msg) {
        
        // Then, 1st panel //
        await msg.channel.send({
          embed: {
            "title": "Panel for " + message.author.username,
            "description": ":gun: " + amountA[0] + " :dagger: " + amountA[1] + " :shield: " + amountA[2] + " :martial_arts_uniform: " + amountA[3] + " :pill: " + amountA[4] + " :cookie: " + amountA[5],
            "color": 0xff3052
          }
        }).then(async function(reactMsg) {
          
          // REACTIONS FOR 1ST PANEL //
          await reactMsg.react('🇸');
          await reactMsg.react('🇨');
          await reactMsg.react('🇷');

          // Then, 2nd panel //
          channel.send({
            embed: {
              "title": "Panel for " + battleUser.user.username,
              "description": ":gun: " + amountB[0] + " :dagger: " + amountB[1] + " :shield: " + amountB[2] + " :martial_arts_uniform: " + amountB[3] + " :pill: " + amountB[4] + " :cookie: " + amountB[5],
              "color": 0x3f89ff
            }
          }).then(async function(reactMsg2) {
            // REACTIONS FOR 2ND PANEL //
            await reactMsg2.react('🇸');
            await reactMsg2.react('🇨');
            await reactMsg2.react('🇷');

            var statsEmbed = utils.text("Stats", battleUser.user.username + " - " + xpB + "HP\n" + message.author.username + " - " + xpA + "HP")

            var historyEmbed = utils.text("History", histResp);

            channel.send(statsEmbed).then(async stats => {
              channel.send(historyEmbed).then(async history => {
                
                // REACTIONS COLLECTOR FOR USER //

                var filterA = (reaction, user) =>
                  (reaction.emoji.name === '🇸' ||
                    reaction.emoji.name === '🇨' ||
                    reaction.emoji.name === '🇷') &&
                  user.id === message.author.id;
                var reactionsA = reactMsg.createReactionCollector(filterA, {
                  time: 3600000
                });
                
                // REACTIONS COLLECTOR FOR ENEMY //

                var filterB = (reaction, user) =>
                  (reaction.emoji.name === '🇸' ||
                    reaction.emoji.name === '🇨' ||
                    reaction.emoji.name === '🇷') &&
                  user.id === battleUser.id;

                var reactionsB = reactMsg2.createReactionCollector(filterB, {
                  time: 3600000
                });
                
                // MESSAGE COLLECTORS FOR ITEMS //
                
                var itemsFilterA = m =>
                  m.author.id === message.author.id &&
                  m.content.startsWith(prefix + "use"); // FILTER FOR 'A'
                
                var itemsFilterB = m => 
                  m.author.id === battleUser.id && 
                  m.content.startsWith(prefix + "use"); // FILTER FOR 'B'
                
                // COLLECTOR A //
                const collectorA = new Discord.MessageCollector(channel, itemsFilterA, {
                  time: 3600000
                }); 
                
                // COLLECTOR B //
                const collectorB = new Discord.MessageCollector(channel, itemsFilterB, {
                  time: 3600000
                });
                
                // FUNCTIONS FOR EDITING EMBEDS //

                function editStats() {
                  stats.edit({
                    embed: {
                      "title": "Stats",
                      "description": battleUser.user.username + " - " + xpB + "HP\n" + message.author.username + " - " + xpA + "HP",
                      "color": 0xffffff
                    }
                  });
                }

                function editHistory() {
                  history.edit({
                    embed: {
                      "title": "History",
                      "description": histResp,
                      "color": 0xffffff
                    }
                  });
                }
                
                 // FUNCTION FOR EMITING END //

                function end(a) {
                  var user;
                  if (a == 0) {
                    user = message.author.username;
                    xpB = 0;
                  } else {
                    user = battleUser.user.username;
                    xpA = 0;
                  }
                  history.edit({
                    embed: {
                      "title": "History",
                      "description": histResp + "\n***Battle ended!***",
                      "color": 0xffffff
                    }
                  });
                  stats.edit({
                    embed: {
                      "title": "Stats",
                      "description": user + " won!\n\nEnd stats: \n" + message.author.username + " - `" + xpA + "HP`\n" + battleUser.user.username + " - `" + xpB + "HP`",
                      "color": 0x22ff22
                    }
                  })
                  setTimeout(function() {
                    channel.delete()
                  }, 7500);
                  message.channel.send({
                    embed: {
                      "title": "Battle ended!",
                      "description": user + " won!\n\nEnd stats: \n" + message.author.username + " - `" + xpA + "HP`\n" + battleUser.user.username + " - `" + xpB + "HP`",
                      "color": 0x22ff22
                    }
                  })
                }
                
                function getUser(user) {
                  var arr = [];
                  
                  switch (user) {
                    case 0:
                      arr[0] = startedUser.id;           //USER
                      arr[1] = startedUser.username;     //USERNAME
                      arr[2] = xpA;                      //USER's HP
                      arr[3] = battleUser.id;            //ENEMY
                      arr[4] = battleUser.user.username; //ENEMY's USERNAME
                      arr[5] = xpB;                      //ENEMY's HP
                      arr[6] = coffA;                    //COFF USER
                      arr[7] = coffB;                    //COFF ENEMY
                      break;
                    case 1:
                      arr[0] = battleUser.id;            //USER
                      arr[1] = battleUser.user.username; //USERNAME
                      arr[2] = xpB;                      //USER's HP
                      arr[3] = startedUser.id;           //ENEMY
                      arr[4] = startedUser.username;     //ENEMY's USERNAME
                      arr[5] = xpA;                      //ENEMY's HP
                      arr[6] = coffB;                    //COFF USER
                      arr[7] = coffA;                    //COFF ENEMY
                      break;
                  }
                  return arr;
                }
                
                // FUNCTION FOR COLLECTING REACTIONS //

                function checkReactions(user, emoji) {

                  var arr = getUser(user);
                  
                      user          = arr[0];
                  var username      = arr[1],
                      userHP        = arr[2],
                      enemy         = arr[3],
                      enemyUsername = arr[4],
                      enemyHP       = arr[5],
                      coffUser      = arr[6],
                      coffEnemy     = arr[7];
                  
                  switch (emoji.emoji.name) {

                    case "🇸":
                      emoji.remove(user);
                      enemyHP -= utils.random(1, 10) * coffEnemy;
                      histResp += "\n" + username + " *striked* " + enemyUsername;
                      break;

                    case "🇨":
                      emoji.remove(user);

                      if (countered.has(user)) return channel.send({
                        embed: {
                          "title": "Counter",
                          "description": username + " can't counter now because he is tired!",
                          "color": 0xff2222
                        }
                      }).then(msgDA1 => {
                        msgDA1.delete(deleteTime)
                      });

                      countered.add(user);
                      setTimeout(() => {
                        countered.delete(user);
                      }, 20000);

                      coffUser = 0.85;
                      setTimeout(() => {
                        coffUser = 1;
                      }, 5000);
                      histResp += "\n" + username + " *countered*!";
                      break;

                    case "🇷":
                      emoji.remove(user);

                      if (rushed.has(user)) return channel.send({
                        embed: {
                          "title": "Rush",
                          "description": username + " can't rush now because he is tired!",
                          "color": 0xff2222
                        }
                      }).then(msgDA2 => {
                        msgDA2.delete(deleteTime);
                      });

                      rushed.add(user);
                      setTimeout(() => {
                        rushed.delete(user);
                      }, 20000);

                      enemyHP -= utils.random(10, 20);
                      histResp += "\n" + username + " *rushed* " + enemyUsername;
                      break;

                  }
                  
                  xpA = userHP;
                  xpB = enemyHP;

                  if (userHP <= 0) return end(1);
                  if (enemyHP <= 0) return end(0);
                }
                
                // FUNCTION FOR COLLECTING ITEMS //

                function collectItem(user, m) {
                  
                  var arr = getUser(user);

                      user          = arr[0];
                  var username      = arr[1],
                      userHP        = arr[2],
                      enemy         = arr[3],
                      enemyUsername = arr[4],
                      enemyHP       = arr[5],
                      coffUser      = arr[6],
                      coffEnemy     = arr[7];
                  
                  var usedNum = 0;
                  if (user == 1) usedNum = 2;

                  var item = m.content.split(" ").slice(1).toString().toLowerCase();

                  if (userHP <= 0) return end(1);
                  if (enemyHP <= 0) return end(0);

                  itemsDB.fetch(`${message.guild.id}_${user}`).then(amount => {

                    for (var i in items) {

                      if (items[i].name.split(" ").slice(1).toString().toLowerCase() === item) {
                        var itemToUse = items[i];
                        var num = i;

                        if (amount[num] <= 0) {
                          m.delete().catch(e => {});
                          return channel.send(noItem).then(msg => {
                            msg.delete(deleteTime).catch(e => {});
                          });
                        }

                        itemsDB.subtract(`${message.guild.id}_${user}`, 1, {
                          "target": num
                        });
                        
                        switch (itemToUse.name.split(" ").slice(1).toString().toLowerCase()) {
                          case "gun":
                            if (utils.random(0, 10) > 8) {
                              enemyHP -= utils.random(40, 50) * coffEnemy;
                              histResp += "\n" + username + " used *Gun*";
                            } else {
                              histResp += "\n" + username + " used *Gun* but missed!";
                            }
                            break;

                          case "knife":
                            enemyHP -= utils.random(10, 20) * coffEnemy;
                            histResp += "\n" + username + " used *Knife*";
                            break;

                          case "shield":
                            if (used[usedNum] == 0) {
                              coffUser = 0.5;
                              histResp += "\n" + username + " used *Shield*";
                              used[usedNum]++;
                            } else {
                              channel.send({
                                embed: {
                                  "title": "Error",
                                  "description": "You can't use more this item anymore"
                                }
                              }).then(msg => {
                                msg.delete(deleteTime);
                              });
                            }
                            break;

                          case "uniform":
                            if (used[usedNum + 1] == 0) {
                              coffUser = 0.75;
                              histResp += "\n" + username + " used *Uniform*";
                              used[usedNum + 1]++;
                            } else {
                              channel.send({
                                embed: {
                                  "title": "Error",
                                  "description": "You can't use more this item anymore"
                                }
                              }).then(msg => {
                                msg.delete(deleteTime);
                              });
                            }
                            break;

                          case "pill":
                            userHP += 25;
                            histResp += "\n" + username + " used *Pill*";
                            break;

                          case "cookie":
                            userHP += 10;
                            histResp += "\n" + username + " used *Cookie*";
                            break;
                        }
                        
                        xpA = userHP;
                        xpB = enemyHP;

                        editStats();
                        editHistory();

                        m.delete().catch(e => {});

                        count++;
                      }
                    }

                    if (count === 0) return channel.send(notFound).then(msg => {
                      msg.delete(deleteTime).catch(e => {});
                    });
                  }).then(() => {
                    if (userHP <= 0) return end(1);
                    if (enemyHP <= 0) return end(0);
                  });

                }

                // REACTIONS EMIT //

                await reactionsA.on("collect", async r => {

                  checkReactions(0, r);

                  editStats();
                  editHistory();

                });

                await reactionsB.on("collect", async r2 => {

                  checkReactions(1, r2);

                  editStats();
                  editHistory();

                });

                // DELETE IF NOT A +USE //

                var filterDelete = m => m.author.id === message.author.id || m.author.id === battleUser.id;
                const deleteMsg = new Discord.MessageCollector(channel, filterDelete, {
                  time: 3600000
                });

                deleteMsg.on("collect", msg => {
                  if (!msg.content.startsWith(prefix + "use")) msg.delete();
                });

                // END OF DELETE COLLECTOR //
                

                /* ------  USING ITEMS FOR USER  ------ */

                // END OF INIT COLLECTOR A //

                collectorA.on("end", () => { // When time is up (1 hour)
                  setTimeout(function() { // Delete channel after 5s because of "Unknow Message" error
                    channel.delete(); // *but this 5s timeout also doesn't help :p*
                  }, 5000);
                  message.channel.send(
                    utils.error(
                      `**Time left**\n
                    Battle between <@${message.author.id}> and <@${battleUser.id}>`
                    )
                  ); // Error - time's up
                });

                // PLAYER A COLLECTING +USE //

                collectorA.on("collect", m => {
                  collectItem(0, m);
                });
                
                // PLAYER B COLLECTING +USE //
                
                collectorB.on("collect", m2 => {
                  collectItem(1, m2);
                });

              });
            });
          });
        });
      });
    });
}