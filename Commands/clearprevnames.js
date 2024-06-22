const { QuickDB } = require('quick.db');
const db = new QuickDB();
const Discord = require('discord.js');

exports.help = {
    name: 'clearprevnames',
    aliases: ['clearprev', 'clearprevs'],
    description: 'Clears your previous usernames and global names.',
    use: 'clearprevnames',
};

exports.run = async (bot, message) => {
    const userData = await db.get(`prevnames.${message.author.id}`);

    if (!userData || !userData.previous_usernames || userData.previous_usernames.length === 0) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('\`❌\` ▸ No prevnames to clear')
            .setDescription(`> *You do not currently have any prevnames to clear.*`)
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor('Red')
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    await db.set(`prevnames.${message.author.id}`, { username: userData.username, previous_usernames: [] });

    const embed = new Discord.EmbedBuilder()
        .setTitle(`\`✅\` ▸ Cleared prevnames`)
        .setDescription(`> *All your prevnames have been cleared successfully.*`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setColor('Green')
        .setTimestamp();
    return message.reply({ embeds: [embed] });
};