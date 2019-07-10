const Discord = require('discord.js');
var fs = require('fs'); //FileSystem
let conf = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file

exports.run = (client, message, args) => {
  var replys1 = [
    "ᗷメD|",
  ];
  let reponse = (replys1[Math.floor(Math.random() * replys1.length)])

  const embed = new Discord.RichEmbed()
    .setColor("#FE0101")
    .setTitle(`**use it the start on your name ᗷメD|name**`)
    .addField(`${reponse}`, `** **`)
    .setDescription("** **")
  message.channel.send(embed);
}