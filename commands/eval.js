const db = require("quick.db");
const utils = require("bot-utils");
const canvas = require("canvas");
const snekfetch = require("snekfetch");
const Discord = require("discord.js");

exports.run = async (client, message, args, ops) => {
  
  function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
    return text;
  }
  
  if (message.author.id == ops.ownerId) {
  const code = args.join(" ");
  try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

      message.channel.send({embed: {"description": clean(evaled)}});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  } else {
    message.channel.send({ embed: {"color": 0xff2222, "title": "Only owner can do this!"} });
  }
};