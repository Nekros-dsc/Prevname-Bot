// Nekros-dsc on github

const Discord = require('discord.js');
const db = require("quick.db");
const { token, prefix } = require("./config.json");
const client = new Discord.Client({
    intents: Object.keys(Discord.Intents.FLAGS),
    restTimeOffset: 0,
    partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]
});

process.on("unhandledRejection", err => {console.log(err);})

client.on("ready", async () => {
    console.log(`BOT ON (${client.user.username})`);
});

client.on("userUpdate", async (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
        db.set(`prevname_${oldUser.id}_${parseInt(new Date() / 1000)}_${newUser.username}`, true);
        console.log(`${oldUser.username} => ${newUser.username}`);
    }
});

client.on("messageCreate", async (message) => {
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "clear") {
        const data = db.all().filter(data => data.ID.startsWith(`prevname_${message.author.id}`));
        let clear = 0;
        for (let i = 0; i < data.length; i++) {
            db.delete(data[i].ID);
            clear++;
        };
        return message.reply({ allowedMentions: { repliedUser: false }, content: `${data.length ? data.length : 0} ${data.length > 1 ? "pseudo ont été supprimées " : "pseudo a été supprimée"} de votre prevname` });
    };

    if (command === "prevname") {
        let membre = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (!membre) try {
            membre = await client.users.fetch(args[0]);
        } catch (e) {
            membre = message.author;
        }
        const data = db.all().filter(data => data.ID.startsWith(`prevname_${membre.id}`)).sort((a, b) => b.data - a.data);
        const count = 15;
        let p0 = 0;
        let p1 = count;
        let page = 1;

        let embed = new Discord.MessageEmbed()
        embed.setTitle(`Liste des anciens pseudo de ${membre.username}`)
            .setFooter({ text: `${page}/${Math.ceil(data.length / count) === 0 ? 1 : Math.ceil(data.length / count)} • Nekros-dsc on Github` })
            .setColor("#2f3136")
            .setDescription(data.slice(p0, p1).map((m, c) => `**<t:${m.ID.split("_")[2]}>** - **${m.ID.split("_")[3]}**`).join("\n") || "Aucune donnée trouvée");
        const msg = await message.reply({ content: `Chargement...`, allowedMentions: { repliedUser: false } });

        if (data.length > count) {
            const btn = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton()
                    .setCustomId(`prev1_${message.id}`)
                    .setLabel('◀')
                    .setStyle('PRIMARY'))
                .addComponents(new Discord.MessageButton()
                    .setCustomId(`prev2_${message.id}`)
                    .setLabel('▶')
                    .setStyle('PRIMARY'));
            msg.edit({ content: null, allowedMentions: { repliedUser: false }, embeds: [embed], components: [btn] });
            setTimeout(() => {
                message.delete();
                return msg.delete();
            }, 60000 * 5);

            const collector = await msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 * 5 });
            collector.on("collect", async interaction => {
                if (interaction.user.id !== message.author.id) return;
                interaction.deferUpdate()

                if (interaction.customId === `prev1_${message.id}`) {
                    if (p0 - count < 0) return;
                    if (p0 - count === undefined || p1 - count === undefined) return;

                    p0 = p0 - count;
                    p1 = p1 - count;
                    page = page - 1

                    embed.setFooter({ text: `${page} / ${Math.ceil(data.length / count) === 0 ? 1 : Math.ceil(data.length / count)}` }).setDescription(data.slice(p0, p1).map((m, c) => `**<t:${m.ID.split("_")[2]}>** - **${m.ID.split("_")[3]}**`).join("\n") || "Aucune donnée trouvée");
                    msg.edit({ embeds: [embed] });
                }
                if (interaction.customId === `prev2_${message.id}`) {
                    if (p1 + count > data.length + count) return;
                    if (p0 + count === undefined || p1 + count === undefined) return;

                    p0 = p0 + count;
                    p1 = p1 + count;
                    page++;

                    embed.setFooter({ text: `${page} / ${Math.ceil(data.length / count) === 0 ? 1 : Math.ceil(data.length / count)}` }).setDescription(data.slice(p0, p1).map((m, c) => `**<t:${m.ID.split("_")[2]}>** - **${m.ID.split("_")[3]}**`).join("\n") || "Aucune donnée trouvée");
                    msg.edit({ embeds: [embed] });
                }
            })
        } else {
            msg.edit({ content: null, allowedMentions: { repliedUser: false }, embeds: [embed] })
        }
    };


});

client.login(token);

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
};