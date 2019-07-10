const Discord = require('discord.js');
const {
  get
} = require('request-promise-native');
var fs = require('fs'); //FileSystem
let conf = JSON.parse(fs.readFileSync("./config.json", "utf8")); //Config file

exports.run = (client, message, args) => {

  const options = {
    url: 'https://cdn.glitch.com/1b5035c4-feae-41ed-a3dd-d10150cb76c1%2Fgiphy.gif?1556716233077',
    json: true
  }

  get(options).then(body => {
    const patEmb = new Discord.RichEmbed()
      .setColor(0xff6c09)
      .setImage(body.url);
    const sadEmb = new Discord.RichEmbed()
      .setColor(0xff6c09)
      .setImage('https://cdn.glitch.com/1b5035c4-feae-41ed-a3dd-d10150cb76c1%2Fgiphy.gif?1556716233077');
    if (!args[0]) {
      message.channel.send(`<@${message.author.id}>  Oh wait! here the skins`, {
        embed: sadEmb
      });
      return;
    }

    if (message.mentions.users.first().id == 464747957288435732) {
      message.channel.send(`<@${message.author.id}> i not need .. b-but i\'m only a bot...`, {
        embed: patEmb
      });
      return;
    }

    if (!message.mentions.users.first()) return message.channel.send({
      embed: {
        "description": "Please mention someone!",
        "color": 0xFF2222
      }
    }).then(msg => {
      if (conf[message.guild.id].delete == 'true') {
        msg.delete(conf[message.guild.id].deleteTime);
      }
    });
    message.channel.send(`<@${message.author.id}> gay ${args[0]}`, {
      embed: patEmb
    });
  });

}