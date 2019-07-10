var Discord = require("discord.js");

const RED = 0xff2222;
const GREEN = 0x22ff22;
const WHITE = 0xffffff;

module.exports.randomArray = (array) => {
  return array[Math.floor(Math.random()*array.length)];
}

module.exports.random = (min, max) => {
  var rand = min - 0.5 + Math.random() * (max - min + 1)
  rand = Math.round(rand);
  return rand;
}

module.exports.error = (text) => {
  var embed = new Discord.RichEmbed()
    .setColor(RED)
    .setTitle("Error")
    .setDescription(text)
  
  return embed;
}

module.exports.success = (text) => {
  var embed = new Discord.RichEmbed()
    .setColor(GREEN)
    .setTitle("Success")
    .setDescription(text)
  
  return embed;
}

module.exports.text = (title, text) => {
  var embed = new Discord.RichEmbed()
    .setColor(WHITE)
    .setTitle(title)
    .setDescription(text)
  
  return embed;
}