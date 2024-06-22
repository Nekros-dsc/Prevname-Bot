const { QuickDB } = require('quick.db');
const db = new QuickDB();
const Discord = require('discord.js');

module.exports = {
    name: 'pstats',
    description: 'Displays statistics of previous usernames and global names.',
    dm_permission: true,
    run: async (bot, interaction, args, config) => {
        const allData = await db.get('prevnames') || [];
        let totalPrevUsernames = 0;
        let totalPrevGlobalNames = 0;
        let totalUsersWithPrevNames = 0;
    
        for (const userId in allData) {
            const userData = allData[userId];
            if (userData && userData.previous_usernames && userData.previous_usernames.length > 0) {
                totalUsersWithPrevNames++;
                userData.previous_usernames.forEach(nameEntry => {
                    if (nameEntry.type === 'username') {
                        totalPrevUsernames++;
                    } else if (nameEntry.type === 'globalName') {
                        totalPrevGlobalNames++;
                    }
                });
            }
        }
    
        const embed = new Discord.EmbedBuilder()
        .setTitle(`\`📊\` ▸ Prevnames Statistics`)
        .setDescription(`*Total Users with Prevnames:* \`${totalUsersWithPrevNames}\`\n*Total Previous Usernames:* \`${totalPrevUsernames}\`\n*Total Previous Global Names:* \`${totalPrevGlobalNames}\``)
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor(config.color)
        .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }
};