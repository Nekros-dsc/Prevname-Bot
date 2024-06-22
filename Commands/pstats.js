const { QuickDB } = require('quick.db');
const db = new QuickDB();
const Discord = require('discord.js');

exports.help = {
    name: 'pstats',
    aliases: ['prevnamestats', 'prevstats'],
    description: 'Displays statistics of previous usernames and global names.',
    use: 'pstats',
};

exports.run = async (bot, message, args, config) => {
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
    .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    .setColor(config.color)
    .setTimestamp();
    return message.reply({ embeds: [embed] });
};