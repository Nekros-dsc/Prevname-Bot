const { QuickDB } = require('quick.db');
const db = new QuickDB();
const Discord = require('discord.js');

exports.help = {
    name: 'prevnames',
    aliases: ['prevname', 'prev'],
    description: 'Displays prevnames of a user.',
    use: 'prevnames [user]',
};

exports.run = async (bot, message, args, config) => {
    try {
    let user = message.mentions.users.first() || bot.users.cache.get(args[0]);
    if (!user) {
        try {
            user = await bot.users.fetch(args[0]);
        } catch {
            user = message.author;
        }
    }

    const userData = await db.get(`prevnames.${user.id}`);

    if (!userData || !userData.previous_usernames || userData.previous_usernames.length === 0) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('\`❌\` ▸ None prevnames')
            .setDescription(`> *The user ${user} (\`${user.username}\` | \`${user.id}\`) does not currently have previous names.*`)
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor('Red')
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    const data = userData.previous_usernames.sort((a, b) => new Date(b.date) - new Date(a.date));
    let page = 1;
    const totalPages = Math.ceil(data.length / 10);

    const generateEmbed = (page) => {
        const currentPageData = data.slice((page - 1) * 10, page * 10).map(entry => `<t:${Math.floor(new Date(entry.date) / 1000)}:d> — **${entry.value}**`).join('\n');

        return new Discord.EmbedBuilder()
            .setTitle(`\`🪄\` ▸ ${user.username}'s Prevnames`)
            .setDescription(currentPageData || '*No data found.*')
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor(config.color)
            .setTimestamp();
    };

    const boutonBefore = new Discord.ButtonBuilder()
        .setLabel('◀')
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId('pageBefore')
        .setDisabled(true);

    const boutonCurrentPage = new Discord.ButtonBuilder()
        .setLabel(`${page}/${totalPages}`)
        .setStyle(Discord.ButtonStyle.Secondary)
        .setCustomId('page')
        .setDisabled(true);

    const boutonAfter = new Discord.ButtonBuilder()
        .setLabel('▶')
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId('pageAfter')
        .setDisabled(totalPages === 1);

    const msg = await message.reply({ embeds: [generateEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(boutonBefore, boutonCurrentPage, boutonAfter)] });

    const filter = (i) => {
        if (i.user.id === message.author.id) {
            return true;
        } else {
            const embed = new Discord.EmbedBuilder()
                .setTitle('\`❌\` ▸ Unauthorized interaction')
                .setDescription('> *You are not authorized to use this interaction.*')
                .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor('Red')
                .setTimestamp();
            i.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
    };

    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (i) => {
        if (i.customId === 'pageBefore' && page > 1) {
            page--;
        } else if (i.customId === 'pageAfter' && page < totalPages) {
            page++;
        }

        boutonBefore.setDisabled(page === 1);
        boutonCurrentPage.setLabel(`${page}/${totalPages}`);
        boutonAfter.setDisabled(page === totalPages);

        await i.update({ embeds: [generateEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(boutonBefore, boutonCurrentPage, boutonAfter)] });
    });

    collector.on('end', async () => {
        msg.components.forEach(row => {
            row.components.forEach(component => {
                component.data.disabled = true;
            });
        });
        await msg.edit({ components: msg.components });
    });
} catch {}
};