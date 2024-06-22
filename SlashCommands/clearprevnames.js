const { QuickDB } = require('quick.db');
const db = new QuickDB();
const Discord = require('discord.js');

module.exports = {
    name: 'clearprevnames',
    description: 'Clears your previous usernames and global names.',
    dm_permission: true,
    run: async (bot, interaction) => {
        const userData = await db.get(`prevnames.${interaction.user.id}`);

        if (!userData || !userData.previous_usernames || userData.previous_usernames.length === 0) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('\`❌\` ▸ No prevnames to clear')
                .setDescription(`> *You do not currently have any prevnames to clear.*`)
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor('Red')
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    
        await db.set(`prevnames.${interaction.user.id}`, { username: userData.username, previous_usernames: [] });
    
        const embed = new Discord.EmbedBuilder()
            .setTitle(`\`✅\` ▸ Cleared prevnames`)
            .setDescription(`> *All your prevnames have been cleared successfully.*`)
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setColor('Green')
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }
};