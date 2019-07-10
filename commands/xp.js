const Discord = require('discord.js');
var db = require('quick.db'); //Database lib
var fs = require('fs'); //FileSystem
let conf = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file
const totalDB = new db.table("TOTAL");

exports.run = (client, message, args) => {
  
  db.fetch(`${message.guild.id}_${message.author.id}`).then(data => {
    totalDB.fetch(`${message.guild.id}_${message.author.id}`).then(total => {
      
      if (data == null || data == undefined) {
        db.set(`${message.guild.id}_${message.author.id}`, {"xp": 0, "level": 1});
        totalDB.set(`${message.guild.id}_${message.author.id}`, 0);
      }
      
      var xpReq = data.level * 300 - data.xp;
      
      if (xpReq <= 0) xpReq = 0; 
  
      var embed = new Discord.RichEmbed()
        .setColor(0xffffff)
        .setTitle("XP | Level")
        .addField("XP", data.xp, true)
        .addField("Level", data.level, true)
        .addField("Points left to next level", xpReq, false)
        .setFooter("Total XP: " + total);
  
        message.channel.send(embed).then(msg => {
        if (conf[message.guild.id].delete == 'true') {
          msg.delete(conf[message.guild.id].deleteTime);
        }
      });
    });
  });
  
}