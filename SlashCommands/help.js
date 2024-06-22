const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Displays the list of commands or detailed information about a specific command.',
    dm_permission: true,
    options: [
        {
            type: 3,
            name: 'command',
            description: 'The command to get help for',
            required: false,
        },
    ],
    run: async (bot, interaction, args, config) => {
        const commandName = interaction.options.getString('command');
        const commands = await bot.application.commands.fetch();

        if (!commandName) {
            const commandNames = new Set();
            const commandsList = commands.filter(command => {
                if (!commandNames.has(command.name)) {
                    commandNames.add(command.name);
                    return true;
                }
                return false;
            }).map(command => {
                return `${Discord.chatInputApplicationCommandMention(command.name, command.id)}\n*— ${command.description}*`;
            }).join('\n');

            const embed = new Discord.EmbedBuilder()
                .setTitle('`🪄` ▸ Help menu')
                .setDescription(commandsList)
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(config.color)
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const command = commands.find(cmd => cmd.name === commandName);
            if (!command) {
                const embed = new Discord.EmbedBuilder()
                    .setTitle('`❌` ▸ Invalid arguments')
                    .setDescription('> *Please provide an existing command.*')
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor('Red')
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const embed = new Discord.EmbedBuilder()
                    .setTitle(`\`🪄\` ▸ ${command.name}`)
                    .setDescription(`> *Command:* ${Discord.chatInputApplicationCommandMention(command.name, command.id)}\n> *Description:* \`${command.description}\``)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(config.color)
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    }
};