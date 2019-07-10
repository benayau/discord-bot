const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.use(express.static('public'));

/* SERVER */

var request = require('request');

// FUNCTIONS //

function parseCookies(request) {
  var list = {},
      rc = request.headers.cookie;
  
  rc && rc.split(';').forEach(function(cookie) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  
  return list;
}

function writeUserData(userId, rankColor, rankImage) {
  var user = JSON.parse(fs.readFileSync("./cards.json", "utf8"));
  user[userId].color = rankColor;
  user[userId].image = rankImage;
  fs.writeFile("./cards.json", JSON.stringify(user, null, 2), (err) => {
    if (err) return console.log(err)
  });
}

function writeServerData(serverId, settings) {
  var server = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  server[serverId] = settings;
  fs.writeFile("./config.json", JSON.stringify(server, null, 2), (err) => {
    if (err) return console.log(err)
  });
}

function isUser(userId) {
  var user = JSON.parse(fs.readFileSync("./cards.json", "utf8"));
  if (user[userId] == undefined) return false;
  else return true;
}

function isServer(serverId) {
  var server = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  if (server[serverId] == undefined) return false;
  else return true;
}

app.post('/sendUser', function(req, res) {
  var body = '';
  req.on('data', function(data) {
    body += data;
  });
  req.on('end', function() {
    body = JSON.parse(body);
    writeUserData(body.id, body.rankColor, body.rankImage);
  });
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end('OK');
});

app.post('/sendServer', function(req, res) {
  var body = '';
  req.on('data', function(data) {
    body += data;
  });
  req.on('end', function() {
    body = JSON.parse(body);
    writeServerData(body.id, body.settings);
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end('OK');
  });
});

app.post('/getUser', function(req, res) {
  var body = "";
  req.on('data', function(data) {
    body += data;
  });
  req.on('end', function() {
    body = JSON.parse(body);
    if (body === null || body === undefined) {
      res.writeHead(404, {
        'Content-Type': 'text/html'
      });
      res.end(null);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.end(JSON.stringify(body));
    }
  });
});

app.post('/getServer', function(req, res) {
  var body = "";
  req.on('data', function(data) {
    body += data;
  });
  req.on('end', function() {
    body = JSON.parse(body);
    
    var id = body.id;
    const data = '{ "prefix": "a", "delete": "true", "deleteTime": 10000, "volume": 100, "maxVolume": 200, "djonly": false, "djroles": [], "levelup": false }'
    
    if (body === null) {
      writeServerData(id, JSON.parse(data));
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.end(data);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.end(JSON.stringify(body));
    }
  });
});

app.post('/getBotInGuild', function(req, res) {
  var body = "";
  var state = false;
  
  req.on('data', function(data) {
    body += data;
  });
  req.on('end', function() {
    var id = JSON.parse(body).id;
    
    request(`https://discordapp.com/api/v6/guilds/${id}/members/560839563484856323`, {
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`
      }
    }, (err, resp, body) => {
      body = JSON.parse(body);
      if (!isNaN(body.code)) {
        state = false;
        res.writeHead(200, {
          'Content-Type': 'text/json'
        });
        body.state = state;
        return res.end(JSON.stringify(body));
      } else if (body.user.id === "588742451255050243") {
        state = true;
        
        body.state = state;
        
        res.writeHead(200, {
          'Content-Type': 'text/json'
        });
        return res.end(JSON.stringify(body));
      }
    });
  });
});

app.listen(3001);

/* BOT */

//Libraries
const db = require('quick.db'); //Quick.db
const Discord = require('discord.js'); //Discord library
const fs = require('fs'); //FileSystem

//Creating bot
const client = new Discord.Client({
  forceFetchUsers: true
});

db.createWebview(process.env.PASSWORD, process.env.PORT); // process.env.PORT creates the webview on the default port

try {
  var config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
} catch (ex) {
  console.log("[ERROR] Config overwrited");
  console.log("[ERROR_TEXT] " + ex);
  var config = {}
  fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => console.error); //papaia their error under .. Line 250 or something like that
}

const active = new Map();
const log = client.channels.get("588742451255050243"); // Logging channel

const totalDB = new db.table("TOTAL");
const itemsDB = new db.table("ITEMS");

var data = {
  "xp": 0,
  "level": 0
};

const serverStats = {
  guildID: '588742451255050243',
  totalUsersID: '589783670974316544',
  memberCountID: '589783721335455755',
  botCountID: '589783769011978251',
  ticketCategoryID: '589035235937878051'
}

var ownerId = '346276975792619531'; //MrScary id

const getDefaultChannel = async (guild) => {
  if (guild.channels.has(guild.id))
    return guild.channels.get(guild.id)
  
  if (guild.channels.exists(r => r.name === "general"))
    return guild.channels.find(n => n.name === "general").id;
  
  return guild.channels
    .filter(c => c.type === "text" &&
            c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
    .sort((a, b) => a.position - b.position) //here
    .first().id;
}

client.on("error", e => {
  console.log("[ERROR] " + e);
});

client.on('ready', () => { //Startup
  console.log("[LOG] Bot on! Started with " + client.users.size + " users and " + client.guilds.size + " guilds.");
  client.user.setUsername("Exploits");
  client.user.setStatus('online');
  client.user.setActivity(`on ${client.users.size} users | ahelp`, {
    type: 'WATCHING'
  });
});

client.on("disconnected", () => {
  console.log("[WARN] Disconnected from Discord");
  console.log("[LOG] Attempting to log in...");
  client.login(process.env.TOKEN);
});

client.on('guildCreate', guild => { // If the Bot was added on a server, proceed
  client.user.setActivity(`on ${client.users.size} users | ahelp`, {
    type: 'WATCHING'
  });
  
  var chan = client.channels.get("594912510398824539");
  
  config[guild.id] = {
    prefix: 'a',
    delete: 'true',
    deleteTime: 10000,
    volume: 100,
    maxVolume: 200,
    djonly: false,
    djroles: [],
    levelup: false
  }
  fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => console.error);
  
  /* Welcome first message */
  
  var welcome = new Discord.RichEmbed()
  .setColor(0xff6c09)
  .setURL("https://discord.gg/uRsq6m")
  .setTitle("Joined " + guild.name + " | Click to visit server")
  .setDescription("**Well, hello, I think.**\n\n, as you can see. I'm just a bot. Perfect bot.\n\n")
  .addField("Prefix", `\`a\``, false)
  .addField("Auto-delete", "true", false)
  .addField("Delete time", "10s", false)
  .addField("Default volume", "100%", false)
  .addField("Max volume", "200%", false)
  .addField("Level UP messages", "false", false)
  .addField("Join/Leave messages", "*To change, use `agreet` & `abye` commands*", false)
  .setFooter("Members: " + guild.memberCount + " | Guild: " + guild.name + " | Use ahelp to get help information | Official server discord:https://discord.gg/uRsq6m");
  
  const channel = Promise.resolve(getDefaultChannel(guild));
  channel.then(function(ch) {
    const chan1 = client.channels.get(ch);
    chan1.send(welcome).then(() => {
      chan1.send("https://discord.gg/uRsq6m **Official server**")
    });
  });
  
  let liveLEmbed = new Discord.RichEmbed()
  .setAuthor(client.user.username, client.user.avatarURL)
  .setTitle(`Joined A Guild`)
  .setDescription(`**Guild Name**: ${guild.name}\n**Guild ID**: ${guild.id}\n**Members Get**: ${guild.memberCount}`)
  chan.send(liveLEmbed);
  
});

client.on('guildDelete', (guild) => { // If the Bot was removed on a server, proceed
  
  guild.members.forEach(function(member) {
    itemsDB.delete(`${guild.id}_${member.id}`);
    totalDB.delete(`${guild.id}_${member.id}`);
    db.delete(`${guild.id}_${member.id}`);
  });
  
  delete config[guild.id]; // Deletes the Guild ID and Prefix
  fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => {
    if (err) console.log(err)
  })
  client.user.setActivity(`on ${client.users.size} users | ahelp`, {
    type: 'WATCHING'
  });
  const chan = client.channels.get("594912510398824539");
  let liveLEmbed = new Discord.RichEmbed()
  .setAuthor(client.user.username, client.user.avatarURL)
  .setTitle(`Stopped Serving A Guild`)
  .setDescription(`**Guild Name**: ${guild.name}\n**Guild ID**: ${guild.id}\n**Members Lost**: ${guild.memberCount}`)
  chan.send(liveLEmbed);
});


/* ON MESSAGE */
client.on('message', async message => { //If recieves message
  
  /* START OF TICKET SUPPORT */
  
  if (message.author.bot) return; //Do nothing if bot
  
  if (message.channel.type !== 'text') { //If message type isn't a text
    let activeTicket = await db.fetch(`support_${message.author.id}`); //Fetching ticket from DB
    let guild = client.guilds.get(serverStats.guildID); //Finding support server
    let channelTicket, found = true; //Creating variables
    
    try {
      /* Trying to fetch a channel of ticket. If no - create then */
      if (activeTicket) client.channels.get(activeTicket.channelID)
        .guild;
    } catch (e) {
      found = true;
    }
    
    if (!activeTicket || !found) { // If 'false' activeTicket or found (if no channel)
      activeTicket = {};
      
      // Creating channel //
      // maybe use the guild variable you set on line 333. im not sure if thats what you want
      channelTicket = await guild.createChannel(`${message.author.username}-${message.author.discriminator}`, { type: "text" }).then(async chan => {
        
        // There could be a possible bug of creating channel on non-exist category or smth
        chan.setParent("594912510398824539"); // Parent - TICKETS category
        var channel = chan; // Channel is channel xD
        
        channel.overwritePermissions(message.guild.roles.find(n => n.name === "@everyone"), {
          "VIEW_CHANNEL": false
        });
        channel.overwritePermissions(message.guild.roles.find(n => n.name === "help"), {
          "VIEW_CHANNEL": true
        });
        
        let author = message.author; //Define author
        
        const newChannel = new Discord.RichEmbed() // Embed for SUPPORT
        .setColor(0xFFFF22)
        .setFooter('Support Ticket Created!')
        .addField('User', author.username)
        .addField('ID', author.id)
        
        await channel.send(newChannel); // Send it to created channel in TICKETS category
        
        const newTicket = new Discord.RichEmbed() //Embed for USER
        .setColor(0xFFFF22)
        .setAuthor(`Hello, ${author.username}`)
        .setFooter('Support Ticket Created!');
        
        await author.send(newTicket).then(msg => {
          msg.delete(5000);
        }); //Send it to USER
        
        // Push info to activeTicket //
        activeTicket.channelID = channel.id;
        activeTicket.targetID = author.id;
      });
    }
    
    channelTicket = client.channels.get(activeTicket.channelID); // Get suport channel ID
    //go to console log and u will see erro is show hline 348 
    // FIX: Change there to your prefix
    if (message.content === 'acomplete') return; // If 'complete' in DM
    
    const embed = new Discord.RichEmbed() //'Recieved message' embed
    .setAuthor(message.author.tag)
    .setDescription(message.content)
    .setFooter(`Message Received - ${message.author.tag}`)
    
    if(!channelTicket) return;
    
    await channelTicket.send(embed); //Send it to support channel //not answer rip this
    
    db.set(`support_${message.author.id}`, activeTicket);
    db.set(`supportChannel_${channelTicket.id}`, message.author.id);
    return;
  }
  
  let support = await db.fetch(`supportChannel_${message.channel.id}`);
  
  if (support) {
    support = await db.fetch(`support_${support}`);
    let supportUser = client.users.get(support.targetID);
    if (!supportUser) return message.channel.delete();
    
    // FIX: Change there to your prefix
    if (message.content.toLowerCase() === 'acomplete') {
      const complete = new Discord.RichEmbed()
      .setColor(0x4286f4)
      .setAuthor(`Hey, ${supportUser.tag}`)
      .setFooter('Ticket Closed')
      .setDescription('*Your ticket has been marked as complete. \nIf you wish to reopen it, or create a new one, please send a message to the bot.*')
      supportUser.send(complete).then(msg => {
        msg.delete(5000);
      });
      
      message.channel.delete();
      db.delete(`support_${support.targetID}`);
      db.delete(`supportChannel_${support.id}`);
      
      let inEmbed = new Discord.RichEmbed()
      .setTitle('Ticket Closed')
      .addField('Support User', `${supportUser.tag}`)
      .addField('Closer', message.author.tag)
      .setColor(0x4286f4)
      
      const staffChannel = client.channels.get('594912510398824539');
      staffChannel.send(inEmbed);
      return;
    }
    
    const embed = new Discord.RichEmbed()
    .setColor(0xffffff)
    .setAuthor(message.author.tag)
    .setFooter(`Message Received`)
    .setDescription(message.content)
    client.users.get(support.targetID).send(embed);
    return;
  }
  
  /* END OF TICKET SUPPORT */
  
  if (message.channel.type == "dm") return;
  
  const mentions = message.mentions.members.first();
  
  if (mentions) {
      if (mentions.user.id === client.user.id && message.content === `<@${client.user.id}>`) { // Ping bot
          message.reply('hey!');
      } else if(mentions.user.id === ownerId && message.content === `<@${ownerId}>`) {
          message.delete();
          message.reply(`don't ping the owner.`);
      }
    
      return;
  }
  
  try {
    config = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Overwrite prefix (important for changing prefix)
  } catch (ex) {
    config[message.guild.id] = {
      prefix: 'a',
      delete: 'true',
      deleteTime: 10000,
      volume: 100,
      maxVolume: 200,
      djonly: false,
      djroles: [],
      levelup: false
    }
    fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => console.error);
  }
  
  
  if (config[message.guild.id] == undefined) {
    config[message.guild.id] = {
      prefix: 'a',
      delete: 'true',
      deleteTime: 10000,
      volume: 100,
      maxVolume: 200,
      djonly: false,
      djroles: [],
      levelup: false
    }
    fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => console.error);
  }
  
  var xpAdd = Math.floor(Math.random() * 7) + 8;
  
  // POINT SYSTEM
  
  if (message.guild.id === "594912510398824539") {} else {
    
    db.fetch(`balance_${message.guild.id}_${message.author.id}`).then(b => {
      if (b == null || b == undefined) db.set(`balance_${message.guild.id}_${message.author.id}`, 50); //If no data
    });
    
    itemsDB.fetch(`${message.guild.id}_${message.author.id}`).then(a => {
      if (a == null || a == undefined) itemsDB.set(`${message.guild.id}_${message.author.id}`, [0, 0, 0, 0, 0, 0]); //If no data
    });
    
    db.fetch(`${message.guild.id}_${message.author.id}`).then(i => {
      if (i == null || i == undefined) {
        
        db.set(`${message.guild.id}_${message.author.id}`, data); //If no data
        totalDB.set(`${message.guild.id}_${message.author.id}`, 0)
        
      } else {
        
        totalDB.fetch(`${message.guild.id}_${message.author.id}`).then(total => {
          
          if (total == null || total == undefined) {
            totalDB.set(`${message.guild.id}_${message.author.id}`, 0);
          } else {
            
            if (i.level == null || i.level == undefined || i.level == 0) {
              db.set(`${message.guild.id}_${message.author.id}`, 1, {
                "target": ".level"
              });
            }
            
            db.add(`${message.guild.id}_${message.author.id}`, xpAdd, {
              "target": ".xp"
            }).then(j => {
              totalDB.add(`${message.guild.id}_${message.author.id}`, xpAdd, {
                "target": ".total"
              });
            });
            
            db.fetch(`${message.guild.id}_${message.author.id}`).then(data => {
              console.log(`${message.content} | USER - ${message.author.username} | LEVEL ${data.level} | POINTS - ${data.xp} | ADDED ${xpAdd} | TOTAL - ${total}`);
              
              var xpReq = data.level * 300;
              
              if (data.xp >= xpReq) {
                db.add(`${message.guild.id}_${message.author.id}`, 1, {
                  "target": ".level"
                });
                db.set(`${message.guild.id}_${message.author.id}`, 0, {
                  "target": ".xp"
                });
                db.fetch(`${message.guild.id}_${message.author.id}`, {
                  "target": ".level"
                }).then(lvl => {
                  if (config[message.guild.id].levelup === "true") {
                    message.channel.send({
                      embed: {
                        "title": "Level Up!",
                        "description": "Now your level - **" + lvl + "**",
                        "color": 0x42f477
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    
  }
  //END OF POINT SYSTEM
  
  var prefix = config[message.guild.id].prefix;
  
  let args = message.content.slice(prefix.length).trim().split(' '); //Setting-up arguments of command
  let cmd = args.shift().toLowerCase(); //LowerCase command
  
  if (message.content === "areset-prefix") {
    config[message.guild.id].prefix = 'a';
    fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => console.error);
    message.channel.send({
      embed: {
        "title": "Prefix - a",
        "color": 0x22ff22
      }
    });
    return;
  }
  
  if (message.content === prefix + "nsfw" && message.guild.id == "594912510398824539") {
    message.delete(1000);
    var author = message.member;
    var role = message.guild.roles.find(c => c.name === "Hide NSFW"); //Role Search
    if (author.roles.has(role.id)) {
      author.removeRole(role).then(() => message.channel.send({
        embed: {
          "title": "Now you will see that hell... :ok_hand:"
        }
      })).then(msg => {
        msg.delete(10000);
      });
    } else {
      author.addRole(role).then(() => message.channel.send({
        embed: {
          "title": "Now your mom won't see any hentai :ok_hand:"
        }
      })).then(msg => {
        msg.delete(10000);
      });
    }
    return;
  }
  
  if (!message.content.startsWith(prefix)) return; //If no prefix
  
  //Command handler
  try {
    
    if (config[message.guild.id].delete == 'true') {
      message.delete(config[message.guild.id].deleteTime).catch(function(e) {
        console.log("[WARN] Can't delete message - " + e);
      });
    }
    
    let ops = {
      ownerId: ownerId,
      active: active
    }
    
    if (cmd == '') {
      message.channel.send({
        embed: {
          "color": 0xff2222,
          "fields": [{
            "name": "**Error**",
            "value": "Enter command"
          }]
        }
      }).then(msg => {
        if (config[message.guild.id].delete == 'true') {
          msg.delete(config[message.guild.id].deleteTime).catch(function(e) {
            console.log("[WARN] Can't delete message - " + e);
          });
        }
      });
    }
    
    let commandFile = require(`./commands/${cmd}.js`); //Require command from folder
    commandFile.run(client, message, args, ops); //Pass four args into 'command'.js and run it
    
  } catch (e) { //Catch errors 
    if (!message.content === "areset-prefix") {
      message.channel.send({
        embed: {
          "color": 0xff2222,
          "fields": [{
            "name": "**Error**",
            "value": "Something went wrong \n" + e
          }]
        }
      }).then(msg => {
        if (config[message.guild.id].delete == 'true') {
          msg.delete(config[message.guild.id].deleteTime).catch(function(e) {
            console.log("[WARN] Can't delete message - " + e);
          });
        }
      });
    }
  }
});

client.on('guildMemberAdd', member => {
  
  try {
    var settings = JSON.parse(fs.readFileSync("./notifications.json", "utf8")); //Notifications file
  } catch (ex) {
    console.log("[ERROR] Join/Leave settings overwrited");
    console.log("[ERROR_TEXT] " + ex);
    const reset = {}
    fs.writeFile("./notifications.json", JSON.stringify(reset), (err) => console.error);
  }
  var settings = JSON.parse(fs.readFileSync("./notifications.json", "utf8")); //Notifications file
  
  console.log(`${member}`, "has joined" + `${member.guild.name}`);
  
  // RESETTING IF ERROR //
  
  if (settings[member.guild.id] === null || settings[member.guild.id] === undefined) { // If no settings for greeting
    settings[member.guild.id] = {
      "joinState": "false",
      "joinChannel": "join-leave",
      "joinMessage": "Welcome <USER> to our server!",
      "leaveState": "false",
      "leaveChannel": "join-leave",
      "leaveMessage": "Goodbye, <USER>!"
    }
    fs.writeFile("./notifications.json", JSON.stringify(settings), (err) => console.error);
  }
  
  // END //
  
  var log = client.channels.get("594912510398824539");
  
  var joinState = settings[member.guild.id].joinState;
  var joinChannel = settings[member.guild.id].joinChannel;
  var joinMessage = settings[member.guild.id].joinMessage;
  var joinMessageEdited = joinMessage;
  
  if (joinMessage.includes("<USER>")) {
    joinMessageEdited = joinMessage.replace(/<USER>/, member.user.username);
  }
  
  if (member.guild.id === serverStats.guildID) {
    client.channels.get(serverStats.totalUsersID).setName(`Total: ${member.guild.memberCount}`);
    client.channels.get(serverStats.memberCountID).setName(`Users: ${member.guild.members.filter(m => !m.user.bot).size}`);
    client.channels.get(serverStats.botCountID).setName(`Bots: ${member.guild.members.filter(m => m.user.bot).size}`);
    db.set(`${member.guild.id}_${member.id}`, data);
    totalDB.set(`${member.guild.id}_${member.id}`, 0);
    
    var userGot = new Discord.RichEmbed()
    .setColor(0x555555)
    .setDescription("User Joined")
    .setTitle(member.user.tag);
    
    log.send(userGot);
    
  } else if (joinState === "true") {
    if (member.guild.channels.find(c => c.name === joinChannel) == null) return;
    member.guild.channels.find(c => c.name === joinChannel).send({
      embed: {
        "description": joinMessageEdited,
        "color": 0x22ff22,
        "title": "Log"
      }
    });
  }
  
});

client.on('guildMemberRemove', member => {
  
  try {
    var settings = JSON.parse(fs.readFileSync("./notifications.json", "utf8")); //Notifications file
  } catch (ex) {
    console.log("[ERROR] Join/Leave settings overwrited");
    console.log("[ERROR_TEXT] " + ex);
    const reset = {}
    fs.writeFile("./notifications.json", JSON.stringify(reset), (err) => console.error);
  }
  var settings = JSON.parse(fs.readFileSync("./notifications.json", "utf8")); //Notifications file
  
  console.log("[LOG] Member removed in " + member.guild.name);
  
  // RESETTING IF ERROR //
  
  if (settings[member.guild.id] === null || settings[member.guild.id] === undefined) { // If no settings for greeting
    settings[member.guild.id] = {
      "joinState": "false",
      "joinChannel": "join-leave",
      "joinMessage": "Welcome <USER> to our server!",
      "leaveState": "false",
      "leaveChannel": "join-leave",
      
      "leaveMessage": "Goodbye, <USER>!"
    }
    fs.writeFile("./notifications.json", JSON.stringify(settings), (err) => console.error);
  }
  
  // END //
  
  var log = client.channels.get("594912510398824539");
  
  var leaveState = settings[member.guild.id].leaveState;
  var leaveChannel = settings[member.guild.id].leaveChannel;
  var leaveMessage = settings[member.guild.id].leaveMessage;
  var leaveMessageEdited = leaveMessage;
  
  if (leaveMessage.includes("<USER>")) {
    leaveMessageEdited = leaveMessage.replace(/<USER>/, member.user.username);
  }
  
  if (member.guild.id === serverStats.guildID) {
    client.channels.get(serverStats.totalUsersID).setName(`Total: ${member.guild.memberCount}`);
    client.channels.get(serverStats.memberCountID).setName(`Users: ${member.guild.members.filter(m => !m.user.bot).size}`);
    client.channels.get(serverStats.botCountID).setName(`Bots: ${member.guild.members.filter(m => m.user.bot).size}`);
    db.delete(`${member.guild.id}_${member.id}`);
    totalDB.delete(`${member.guild.id}_${member.id}`);
    
    var userLost = new Discord.RichEmbed()
    .setColor(0x555555)
    .setDescription("User Left")
    .setTitle(member.user.tag);
    
    log.send(userLost);
    
  } else if (leaveState === "true") {
    if (member.guild.channels.find(c => c.name === leaveChannel) == null) return;
    member.guild.channels.find(c => c.name === leaveChannel).send({
      embed: {
        "description": leaveMessageEdited,
        "color": 0xff2222,
        "title": "Log"
      }
    });
  }
  
});


//Connecting bot
client.login(process.env.TOKEN);
