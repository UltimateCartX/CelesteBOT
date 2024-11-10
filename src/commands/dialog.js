const { AttachmentBuilder, SlashCommandBuilder, SlashCommandStringOption, SlashCommandBooleanOption, SlashCommandSubcommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const sizeOf = require("image-size")
const wait = require('node:timers/promises').setTimeout;
let CanvasTextWrapper = require('canvas-text-wrapper').CanvasTextWrapper;
const { Users, Guilds } = require("../utils/database.js");
const { characters } = require("../utils/characters.js");
const log = require("../utils/log.js");
const loc = require("../utils/loc.js");
const path = require('node:path');

const textOption = new SlashCommandStringOption()
    .setName("text")
    .setNameLocalizations(loc.get("command.dialog.option.text.name.strict"))
    .setDescription(loc.find("command.dialog.option.text.description"))
    .setDescriptionLocalizations(loc.get("command.dialog.option.text.description"))
    .setRequired(true);

function portraitChoice(portrait) {
    return { name: loc.find(`portrait.${portrait}.name`), name_localizations: loc.get(`portrait.${portrait}.name`), value: portrait }
};

function portraitOption(portraits) {
    let option = new SlashCommandStringOption()
        .setName("portrait")
        .setNameLocalizations(loc.get("command.dialog.option.portrait.name.strict"))
        .setDescription(loc.find("command.dialog.option.portrait.description"))
        .setDescriptionLocalizations(loc.get("command.dialog.option.portrait.description"))
        .setRequired(true)
    for (const portrait of portraits) {
        option.addChoices(portraitChoice(portrait))
    };
    return option;
};

const directionOption = new SlashCommandStringOption()
    .setName("direction")
    .setNameLocalizations(loc.get("command.dialog.option.direction.name.strict"))
    .setDescription(loc.find("command.dialog.option.direction.description"))
    .setDescriptionLocalizations(loc.get("command.dialog.option.direction.description"))
    .addChoices(
        { name: loc.find("command.dialog.option.direction.choices.left"),  name_localizations: loc.get("command.dialog.option.direction.choices.left"),  value: 'left' },
        { name: loc.find("command.dialog.option.direction.choices.right"), name_localizations: loc.get("command.dialog.option.direction.choices.right"), value: 'right'});

const flippedOption = new SlashCommandBooleanOption()
    .setName("flipped")
    .setNameLocalizations(loc.get("command.dialog.option.flipped.name.strict"))
    .setDescription(loc.find("command.dialog.option.flipped.description"))
    .setDescriptionLocalizations(loc.get("command.dialog.option.flipped.description"));

const upsideDownOption = new SlashCommandBooleanOption()
    .setName("upside_down")
    .setNameLocalizations(loc.get("command.dialog.option.upside_down.name.strict"))
    .setDescription(loc.find("command.dialog.option.upside_down.description"))
    .setDescriptionLocalizations(loc.get("command.dialog.option.upside_down.description"));

function characterSubcommand(character, portraits) {
    let subcommand = new SlashCommandSubcommandBuilder()
    if (portraits.length > 1) subcommand.addStringOption(portraitOption(portraits));
    return subcommand
        .addStringOption(textOption)
        .addStringOption(directionOption)
        .addBooleanOption(flippedOption)
        .addBooleanOption(upsideDownOption)
        .setName(character)
        .setNameLocalizations(loc.get(`command.dialog.subcommand.${character}.name.strict`))
        .setDescription(loc.find(`command.dialog.subcommand.${character}.description`))
        .setDescriptionLocalizations(loc.get(`command.dialog.subcommand.${character}.description`))
};

const command = new SlashCommandBuilder()
    .setName("dialog")
	.setNameLocalizations(loc.get("command.dialog.name.strict"))
	.setDescription(loc.find("command.dialog.description"))
    .setDescriptionLocalizations(loc.get("command.dialog.description"))
for (const [character, attributes] of Object.entries(characters)) {
    command.addSubcommand(characterSubcommand(character, attributes.portraits))
};

// As of v14, DiscordJS does not officialy support user installed apps
// This snippet of code by MeowffleCATYT on Reddit allows commands to be used on user installed apps
// https://www.reddit.com/r/Discordjs/comments/1d16ft2/comment/l861dfe/
const commandJSON = command.toJSON();
const extras = {
  "integration_types": [0, 1],
  "contexts": [0, 1, 2],
}
Object.keys(extras).forEach(key => commandJSON[key] = extras[key]);

module.exports = {
    cooldown: 5,
	data: commandJSON,

	async execute(interaction) {

        if (interaction.inGuild() && interaction.guild !== null) {
            var guild = await Guilds.findOne({ where: { guildId: interaction.guildId } });
            if (guild === null) { guild = await Guilds.create({ guildId: interaction.guildId, name: interaction.guild.name }) };
            var webhookMode = guild.get("webhook");
        };
        
        await interaction.deferReply({ ephemeral: webhookMode });

        const userDisplayName = interaction.user.displayName.normalize("NFKC").trim();
        const character = interaction.options.getSubcommand();
        const textbox = characters[character].textbox;
        const text = interaction.options.getString('text').normalize("NFKC").trim();
        const portrait = interaction.options.getString('portrait') ?? characters[character].portraits[0];
        const direction = interaction.options.getString('direction') ?? 'left';
        const flipped = interaction.options.getBoolean('flipped') ?? false;
        const upsidedown = interaction.options.getBoolean('upside_down') ?? false;

        const portraitPath = path.join(__dirname, `../../assets/portraits/${character}/${portrait}.png`);
        const textboxPath = path.join(__dirname, `../../assets/textboxes/${textbox}.png`);
        
        const dimensions = sizeOf(portraitPath);
        const portraitWidth = dimensions.width * 1.34375;
        const portraitHeight = dimensions.height * 1.34375;
        const portraitX = direction == 'left'? 192.5 - (portraitWidth / 2) : 1607.5 - (portraitWidth / 2);
        const portraitY = 200 - (portraitHeight / 2);
        const countNewline = (text.match(/\\n/g) || []).length;
        
        const portraitCanvas = Canvas.createCanvas(portraitWidth, portraitHeight);
		const portraitContext = portraitCanvas.getContext('2d');
        portraitContext.translate(direction == 'left'? (flipped? portraitWidth : 0) : (flipped? 0 : portraitWidth), upsidedown? portraitHeight : 0)
        portraitContext.scale(direction == 'left'? (flipped? -1 : 1) : (flipped? 1 : -1), upsidedown? -1 : 1)
        portraitContext.drawImage(await Canvas.loadImage(portraitPath), 0, 0, portraitWidth, portraitWidth)
        
        const textCanvas = Canvas.createCanvas(1330, 200);
		const textContext = textCanvas.getContext('2d');
        textContext.font = '46px Renogare';
	    textContext.fillStyle = '#d3d3d3';
        const textLefted = (textContext.measureText(text).width > 1330 && countNewline == 0);
        const textLarge = (textContext.measureText(text).width > 3990 || countNewline >= 3);
        CanvasTextWrapper(textCanvas, text, {font: '46px Renogare', textAlign: textLefted? 'left' : 'center', lineHeight: 1.4, verticalAlign: 'middle', sizeToFill: textLarge, maxFontSizeToFill: 46});
        
        // This snippet of code originally made by Remy Sharp on GitHub trims the surrounding transparent pixels from a canvas
        // It has been modified to better fit my needs
        // https://gist.github.com/remy/784508
        var pixels = portraitContext.getImageData(0, 0, portraitCanvas.width, portraitCanvas.height),
        l = pixels.data.length,
        i,
        bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
        },
        x, y;
        
        for (i = 0; i < l; i += 4) {
            if (pixels.data[i+3] !== 0) {
              x = (i / 4) % portraitCanvas.width;
              y = ~~((i / 4) / portraitCanvas.width);
          
              if (bound.top === null) {
                bound.top = y;
              }
              
              if (bound.left === null) {
                bound.left = x; 
              } else if (x < bound.left) {
                bound.left = x;
              }
              
              if (bound.right === null) {
                bound.right = x; 
              } else if (bound.right < x) {
                bound.right = x;
              }
              
              if (bound.bottom === null) {
                bound.bottom = y;
              } else if (bound.bottom < y) {
                bound.bottom = y;
              }
            }
          }
            
        const trimTop = (0 - (bound.top + portraitY)) < 0? 0 : 0 - (bound.top + portraitY);
        const trimLeft = (0 - (bound.left + portraitX)) < 0? 0 : 0 - (bound.left + portraitX);
        const trimRight = ((bound.right + portraitX) - 1800) < 0? 0 : (bound.right + portraitX) - 1800;
        const trimBottom = ((bound.bottom + portraitY) - 400) < 0? 0 : (bound.bottom + portraitY) - 400;
        const dialogWidth = 1800 + trimLeft + trimRight
        const dialogHeight = 400 + trimTop + trimBottom
        const offsetX = trimLeft;
        const offsetY = trimTop;
		const dialogCanvas = Canvas.createCanvas(dialogWidth, dialogHeight);
        const dialogContext = dialogCanvas.getContext('2d');
        dialogContext.drawImage(await Canvas.loadImage(textboxPath), offsetX, offsetY, 1800, 400);
        dialogContext.drawImage(portraitCanvas, portraitX + offsetX, portraitY + offsetY, portraitWidth, portraitHeight)
        dialogContext.drawImage(textCanvas, direction == 'left'? 350 + offsetX : 120 + offsetX, 100 + offsetY);

	    const attachment = new AttachmentBuilder(await dialogCanvas.encode('png'), { name: 'dialog.png' });

        if (webhookMode) {
            const webhookId = guild.get("webhookId")
            const webhook = await interaction.client.fetchWebhook(webhookId);
            if (webhook.channelId != interaction.channelId) await webhook.edit({channel: interaction.channelId});
            await webhook.send({
                username: interaction.member.displayName,
                avatarURL: interaction.member.displayAvatarURL({ extension: 'png' }),
                files: [attachment]});
            await interaction.editReply(loc.find("command.dialog.reply", interaction.locale));
            await wait(2_000);
            await interaction.deleteReply();
        } else await interaction.editReply({ files: [attachment] });

        log.action(userDisplayName, `created a dialog box with character ${loc.find(`character.${character}.name`)}`);
        var user = await Users.findOne({ where: { userId: interaction.user.id } });
        if (!user) { user = await Users.create({ userId: interaction.user.id, displayName: interaction.user.displayName }) };
        user.increment(character);
	},
};