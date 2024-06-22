const { QuickDB } = require('quick.db');
const db = new QuickDB();
const Discord = require('discord.js');

module.exports = {
    name: 'prevnames',
    description: 'Displays prevnames of a user.',
    options: [
        {
            type: 6,
            name: 'user',
            description: 'The user to show prevnames for.',
            required: false
        }
    ],
    dm_permission: false,
    run: async (bot, interaction, args, config) => {
        try {
        let user = interaction.options.getUser('user') || interaction.user;

        const userData = await db.get(`prevnames.${user.id}`);

        if (!userData || !userData.previous_usernames || userData.previous_usernames.length === 0) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('\`❌\` ▸ None prevnames')
                .setDescription(`> *The user ${user} (\`${user.username}\` | \`${user.id}\`) does not currently have previous names.*`)
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('Red')
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const data = userData.previous_usernames.sort((a, b) => new Date(b.date) - new Date(a.date));
        let page = 1;
        const totalPages = Math.ceil(data.length / 10);

        const generateEmbed = (page) => {
            const currentPageData = data.slice((page - 1) * 10, page * 10).map(entry => `<t:${Math.floor(new Date(entry.date) / 1000)}:d> — **${entry.value}**`).join('\n');

            return new Discord.EmbedBuilder()
                .setTitle(`\`🪄\` ▸ ${user.username}'s Prevnames`)
                .setDescription(currentPageData || '*No data found.*')
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
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

        const msg = await interaction.reply({ embeds: [generateEmbed(page)], components: [new Discord.ActionRowBuilder().addComponents(boutonBefore, boutonCurrentPage, boutonAfter)], fetchReply: true });

        const filter = (i) => {
            if (i.user.id === interaction.user.id) {
                return true;
            } else {
                const embed = new Discord.EmbedBuilder()
                    .setTitle('\`❌\` ▸ Unauthorized interaction')
                    .setDescription('> *You are not authorized to use this interaction.*')
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
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
}
};