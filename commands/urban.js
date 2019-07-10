const Discord = require("discord.js");
var fs = require('fs'); //FileSystem
let config = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file
const urban = require("urban-dictionary");

exports.run = async (client, message, args, ops) => { //Collecting info about command
  
  var str = args.join(" ");
  if (!str) return message.channel.send({ embed: {"title": "Enter text", "color": 0xff2222} });

  urban.term(str).then((result) => {
    const json = result.entries;

    let embed = new Discord.RichEmbed()
      .setColor(0x42f4cb)
      .setDescription(json[0].definition)
      .addField('Example', json[0].example)
      .addField("Upvotes", json[0].thumbs_up, true)
      .addField("Downvotes", json[0].thumbs_down, true)
      .setFooter(`Written by ${json[0].author}`)
      .setTitle(json[0].word);

    message.channel.send(embed);

  }).catch((error) => {
    message.channel.send({
      embed: {
        "description": "Nothing found :sweat: ",
        "color": 0xFF2222
      }
    });
  });

}