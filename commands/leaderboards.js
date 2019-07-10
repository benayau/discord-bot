const Discord = require("discord.js");
const db = require('quick.db');
var currencyFormatter = require('currency-formatter'); //For currency
var fs = require('fs'); //FileSystem
let conf = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file
const totalDB = new db.table("TOTAL");

exports.run = async (client, message, args, ops) => {
  let title = 'Leaderboards';
  var finalLb = "";
  
  if (args.length == 0) {
    db.startsWith(`balance_${message.guild.id}`, { sort: '.data'}).then(resp => {
      resp.length = 15;

      let i = 0;
      for (i in resp) {
        if (resp[i] == null || resp[i] == undefined) {
          db.set(`balance_${message.guild.id}_${resp[i].ID.split('_')[2]}`, 50);
        }
        finalLb += `**${client.users.get(resp[i].ID.split('_')[2]).username}** - \`$${resp[i].data}\`\n`;
      }

      message.channel.send({
        embed: {
          "description": finalLb,
          "title": title,
          "color": 16777215
        }
      }).then(msg => {
        if (conf[message.guild.id].delete == 'true') {
          msg.delete(conf[message.guild.id].deleteTime);
        }
      });
    });
  } 
  if (args[0] === "xp") {
    totalDB.startsWith(`${message.guild.id}`, { sort: ".data" }).then(r => {
      r.length = 15;

      let title = 'Leaderboards';
      var finalLb = "";
      var i = 0;
      for (i in r) {
        if (r[i].data == null || r[i].data == undefined) {
          totalDB.set(`${message.guild.id}_${r[i].ID.split('_')[1]}`, 0);
        }
        finalLb += `**${client.users.get(r[i].ID.split('_')[1]).username}** - \`${r[i].data}xp\`\n`;
      }

      message.channel.send({
        embed: {
          "description": finalLb,
          "title": title,
          "color": 16777215
        }
      }).then(msg => {
        if (conf[message.guild.id].delete == 'true') {
          msg.delete(conf[message.guild.id].deleteTime);
        }
      });
    });
  }
}