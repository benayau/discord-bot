const Discord = require("discord.js");
var fs = require('fs'); //FileSystem
let config = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file

exports.run = (client, message, args) => {
  
  if (args.length == 0) {
    return message.channel.send({
      embed: {
        "title": "Help",
        "fields": [{
            "name": "Simple Poll (Yes/No)",
            "value": "`poll` - this menu\n`poll <time> <question>` - poll with timed end. Time should be entered in seconds, default - 1 hour"
          },
          {
            "name": "Multi-choice Poll",
            "value": "`mpoll <question> <a1>...<a9>` - poll with multi-choice."
          }
        ],
        "color": 3264944,
        "footer": {
          "text": message + ""
        }
      }
    });
  }
  
  let args1 = message.content.slice(config[message.guild.id].prefix.length + "mpoll".length).trim().split('|'); //Setting-up arguments of command

  let choices = ["", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣"];

  let question = args1[0].trim();
  var answers = "";
  for (var i = 1; i < args1.length; i++) {
    answers += "\n" + choices[i] + " " + args1[i].trim();
  }

  const embed = new Discord.RichEmbed()
    .setColor("#31D1B0")
    .setDescription(answers)
    .setFooter(`Опрос создал ${message.author.username}`, message.author.avatarURL);

  if (args1 === null || args1.length < 3 || args1.length > 10) {
    message.channel.send({ embed: {"title": "Error", "description": "Usage - `mpoll <question>|<answer1>|...|<answer9>`", "color": 0xff2222} });
  } else {
    message.channel.send('❓ **' + question + '**', {
      embed
    }).then(async function(msg) {
      for (var i = 1; i < args1.length; i++) {
        await msg.react(choices[i]);
      }
    });
  }
}