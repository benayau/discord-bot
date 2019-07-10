const Discord = require('discord.js');
var fs = require('fs'); //FileSystem
try {
  const settings = JSON.parse(fs.readFileSync("./notifications.json", "utf8")); //Notifications file
} catch (ex) {
  console.log("[ERROR] Join/Leave settings overwrited");
  console.log("[ERROR_TEXT] " + ex);
  const reset = {}
  fs.writeFile("./notifications.json", JSON.stringify(reset), (err) => console.error);
}
var settings = JSON.parse(fs.readFileSync("./notifications.json", "utf8")); //Notifications file
var config = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file

exports.run = async (client, message, args) => {
  
  if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send({ embed: {"title": "Error", "description": "Denied!", "color": 0xff2222} })
  
  var guild = message.guild.id;
  var msg = message.channel;
  
  // RESETTING IF ERROR //
  
  if (settings[guild] === null || settings[guild] === undefined) { // If no settings for greeting
    settings[guild] = 
    {
      "joinState": "false", 
      "joinChannel": "👋🏼welcome👋🏼", 
      "joinMessage": "Welcome <USER> to our server!",
      "leaveState": "false", 
      "leaveChannel": "👋🏼welcome👋🏼", 
      "leaveMessage": "Goodbye, <USER>!"
    }
    fs.writeFile("./notifications.json", JSON.stringify(settings), (err) => console.error);
  }
  
  // END //
  
  // VARIABLES //
  
  var leaveState = settings[guild].leaveState;
  var leaveChannel = settings[guild].leaveChannel;
  var leaveMessage = settings[guild].leaveMessage;
  
  if (!args[0]) return message.channel.send({ //Send embed
    embed: {
      "title": "Leave",
      "description": "*To change settings, use `" + config[guild].prefix + "bye <state> -message <message> -channel <channel>`*",
      "color": 16098851,
      "timestamp": "1337-01-01",
      "footer": {
        "text": message + ""
      },
      "fields": [{
          "name": "State",
          "value": leaveState + ""
        },
        {
          "name": "Channel",
          "value": leaveChannel + ""
        },
        {
          "name": "Message",
          "value": leaveMessage + ""
        }
      ]
    }
  }).then(msg => {
    if (config[message.guild.id].delete == 'true') {
      msg.delete(config[guild].deleteTime);
    }
  }); //If no arguments
  
  if (args.includes("-channel")) {
    if (args[args.indexOf("-channel") + 1]) {
      
      var channel = message.guild.channels.find(c => c.name === args[args.indexOf("-channel") + 1]);
      if (channel == null || channel == undefined) return message.channel.send({ embed: {"title": "Error", "description": "There\'s no channel called **" + args[args.indexOf("-channel") + 1] + "**", "color": 0xff2222} });
      
      settings[guild].leaveChannel = args[args.indexOf("-channel") + 1];
      fs.writeFile("./notifications.json", JSON.stringify(settings), (err) => console.error);
      
      return message.channel.send({ embed: {"title": "Success", "description": "Now *leave* messages will be sent in **" + args[args.indexOf("-channel") + 1] + "**", "color": 0x22ff22} });
      
    } else {
      return message.channel.send({ embed: {"title": "Error", "description": "Enter channel name", "color": 0xff2222} });
    }
  }
  
  if (args.includes("-message")) {
    if (args[args.indexOf("-message") + 1]) {
      
      var message = args.slice(1).join(" ");
      
      settings[guild].leaveMessage = message;
      fs.writeFile("./notifications.json", JSON.stringify(settings), (err) => console.error);
      
      return msg.send({ embed: {"title": "Success", "description": "Now *leave* message is: **" + message + "**", "color": 0x22ff22} });
      
    } else {
      return message.channel.send({ embed: {"title": "Error", "description": "Enter message", "color": 0xff2222} });
    }
  }
  
  if (args[0] == "true") {
    settings[guild].leaveState = "true";
    fs.writeFile("./notifications.json", JSON.stringify(settings), (err) => console.error);
    message.channel.send({ embed: {"title": "Success", "description": "Now *leave* messages will be send", "color": 0x22ff22} }).then(msg => {
    if (config[message.guild.id].delete == 'true') {
      msg.delete(config[guild].deleteTime);
    }
  });
    return;
  }
  if (args[0] == "false") {
    settings[guild].leaveState = "false";
    fs.writeFile("./notifications.json", JSON.stringify(settings), (err) => console.error);
    message.channel.send({ embed: {"title": "Success", "description": "Now *leave* messages won't be send", "color": 0x22ff22} }).then(msg => {
    if (config[message.guild.id].delete == 'true') {
      msg.delete(config[guild].deleteTime);
    }
  });
    return;
  } 
  
}