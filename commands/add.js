const Discord = require('discord.js');
const db = require('quick.db');
var currencyFormatter = require('currency-formatter'); //For currency
var fs = require('fs'); //FileSystem
let conf = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file

exports.run = async (client, message, args) => { //Collecting info about command
  
  if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send({ embed: {"title": "Error", "description": "You don't have permissions", "color": 0xff2222} });
  
  let member = message.mentions.members.first();
  if (!member) member = message.member;
  var amount = 0;
  if (!isNaN(args[0])) {
    amount = args[0];
  } else {
    amount = args[1];
  }
  
  if (isNaN(amount)) return message.channel.send({ embed: {"title": "Error", "description": "Input value", "color": 0xff2222} });
    
  db.fetch(`balance_${message.guild.id}_${member.id}`).then(b => {
    
    if (b == null || b == undefined) {
      db.set(`balance_${message.guild.id}_${member.id}`, 50);
    }
  
    db.add(`balance_${message.guild.id}_${member.id}`, parseInt(amount, 10));
  
    var embed = new Discord.RichEmbed()
      .setColor(0x22ff22)
      .setTitle("Success")
      .setDescription("Added to " + member.user.username + " **$" + amount + "**")
    
    message.channel.send(embed).then(msg => {
      if (conf[message.guild.id].delete == 'true') {
        msg.delete(conf[message.guild.id].deleteTime);
      }
    });
  });
}