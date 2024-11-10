const path = require('node:path');
const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require('@napi-rs/canvas');
let CanvasTextWrapper = require('canvas-text-wrapper').CanvasTextWrapper;
const log = require("../utils/log.js");
const loc = require("../utils/loc.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("postcard")
        .setNameLocalizations(loc.get("command.postcard.name.strict"))
        .setDescription(loc.find("command.postcard.description"))
        .setDescriptionLocalizations(loc.get("command.postcard.description"))
        .addStringOption(option => option
            .setName("to")
            .setNameLocalizations(loc.get("command.postcard.option.to.name.strict"))
            .setDescription(loc.find("command.postcard.option.to.description"))
            .setDescriptionLocalizations(loc.get("command.postcard.option.to.description"))
            .setMaxLength(12)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("content")
            .setNameLocalizations(loc.get("command.postcard.option.content.name.strict"))
            .setDescription(loc.find("command.postcard.option.content.description"))
            .setDescriptionLocalizations(loc.get("command.postcard.option.content.description"))
            .setRequired(true)
            .setMaxLength(250)
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const userDisplayName = interaction.user.displayName.normalize("NFKC").trim();
        const author = interaction.options.getString("to");
        const text = interaction.options.getString("content");

        const postcardPath = path.join(__dirname, `../../assets/postcard.png`);
        
        const textCanvas = Canvas.createCanvas(750, 350);
        const textContext = textCanvas.getContext("2d");
        textContext.fillStyle = '#606060';
        CanvasTextWrapper(textCanvas, text, { font: '31.5px Renogare', textAlign: 'center', lineHeight: 8.82, verticalAlign: 'middle' });

        const postcardCanvas = Canvas.createCanvas(859, 583);
		const postcardContext = postcardCanvas.getContext('2d');
        postcardContext.drawImage(await Canvas.loadImage(postcardPath), 0, 0, 859, 583);
        postcardContext.font = '40.5px Renogare';
	    postcardContext.fillStyle = '#494949';
	    postcardContext.fillText(author, 115, 73);
        postcardContext.drawImage(textCanvas, 55, 150);

        const attachment = new AttachmentBuilder(await postcardCanvas.encode('png'), { name: 'postcard.png' });

        interaction.editReply({ files: [attachment] });
        log.action(userDisplayName, `created a postcard`);
    }
};