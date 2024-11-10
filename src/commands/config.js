const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Guilds } = require("../utils/database.js");
const log = require("../utils/log.js");
const loc = require("../utils/loc.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setNameLocalizations(loc.get("command.config.name.strict"))
        .setDescription(loc.find("command.config.description"))
        .setDescriptionLocalizations(loc.get("command.config.description"))
        .addBooleanOption(option => option
            .setName("webhook_mode")
            .setNameLocalizations(loc.get("command.config.option.webhook.name.strict"))
            .setDescription(loc.find("command.config.option.webhook.description"))
            .setDescriptionLocalizations(loc.get("command.config.option.webhook.description"))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),

    async execute(interaction) {
        let guild = await Guilds.findOne({ where: { guildId: interaction.guildId } });
        if (guild === null) { guild = await Guilds.create({ guildId: interaction.guildId, name: interaction.guild.name }) };
        const webhookMode = interaction.options.getBoolean('webhook_mode');

        if (webhookMode === null) return interaction.reply(guild.get("webhook")? loc.find("command.config.reply.webhook.isEnabled", interaction.locale) : loc.find("command.config.reply.webhook.isDisabled", interaction.locale));
        
        if (webhookMode && guild.get("webhookId") === null) {
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageWebhooks)) { interaction.reply(loc.find("command.config.reply.webhook.permission", interaction.locale)); return }
            const webhook = await interaction.channel.createWebhook({
                name: 'CelesteBOT',
                avatar: './assets/logo.png'
            });
            guild.update({ webhook: webhookMode, webhookId: webhook.id })
        } else {
            guild.update({ webhook: webhookMode });
        };

        interaction.reply(webhookMode? loc.find("command.config.reply.webhook.hasEnabled", interaction.locale) : loc.find("command.config.reply.webhook.hasDisabled", interaction.locale));
        log.action(guild.get("name"), webhookMode? "has enabled webhook_mode" : "has disabled webhook_mode")
    },
};