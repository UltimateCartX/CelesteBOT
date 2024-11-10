const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, EmbedBuilder, SlashCommandStringOption } = require('discord.js');
const { characters } = require("../utils/characters.js");
const log = require("../utils/log.js");
const loc = require("../utils/loc.js")

// I love hardcoding stuff and making this bot unbearable to use for other people
//^ Relatable
const emojis = new Map;
emojis.set('badeline_angry', "<:badeline_angry:1278765308261306441>");
emojis.set('badeline_angryAlt', "<:badeline_angryAlt:1278765318000611479>");
emojis.set('badeline_concerned', "<:badeline_concerned:1278765329094545408>");
emojis.set('badeline_freakA', "<:badeline_freakA:1278765344919523409>");
emojis.set('badeline_freakB', "<:badeline_freakB:1278765845295792128>");
emojis.set('badeline_freakC', "<:badeline_freakC:1278769908909604917>");
emojis.set('badeline_normal', "<:badeline_normal:1278766250146795594>");
emojis.set('badeline_sad', "<:badeline_sad:1278766258476552286>");
emojis.set('badeline_scoff', "<:badeline_scoff:1278766268010463354>");
emojis.set('badeline_serious', "<:badeline_serious:1278766764167270420>");
emojis.set('badeline_sigh', "<:badeline_sigh:1278766864692023359>");
emojis.set('badeline_upset', "<:badeline_upset:1278766873772560515>");
emojis.set('badeline_worried', "<:badeline_worried:1278766883109081141>");
emojis.set('badeline_worriedAlt', "<:badeline_worriedAlt:1278766925391986770>");
emojis.set('badeline_yell', "<:badeline_yell:1278766933730394213>");
emojis.set('ex_normal', "<:ex_normal:1278771551038341140>");
emojis.set('granny_creepA', "<:granny_creepA:1278771654079811635>");
emojis.set('granny_creepB', "<:granny_creepB:1278771663370063873>");
emojis.set('granny_laugh', "<:granny_laugh:1278771674573181099>");
emojis.set('granny_mock', "<:granny_mock:1278771684706619422>");
emojis.set('granny_normal', "<:granny_normal:1278771694814629979>");
emojis.set('madeline_angry', "<:madeline_angry:1278722057399435346>");
emojis.set('madeline_deadpan', "<:madeline_deadpan:1278724495753871473>");
emojis.set('madeline_determined', "<:madeline_determined:1278737211365265480>");
emojis.set('madeline_distracted', "<:madeline_distracted:1278737222132043900>");
emojis.set('madeline_normal', "<:madeline_normal:1278737232362082398>");
emojis.set('madeline_panic', "<:madeline_panic:1278737421814464523>");
emojis.set('madeline_peaceful', "<:madeline_peaceful:1278737560809635912>");
emojis.set('madeline_sad', "<:madeline_sad:1278737570586562601>");
emojis.set('madeline_sadder', "<:madeline_sadder:1278737580426268724>");
emojis.set('madeline_surprised', "<:madeline_surprised:1278737588739379261>");
emojis.set('madeline_together', "<:madeline_together:1278740546948694048>");
emojis.set('madeline_togetherZoom', "<:madeline_togetherZoom:1278740555265736848>");
emojis.set('madeline_upset', "<:madeline_upset:1278740563193106543>");
emojis.set('madeline_mirror_angry', "<:madeline_mirror_angry:1278775833380786278>");
emojis.set('madeline_mirror_deadpan', "<:madeline_mirror_deadpan:1278775846416420904>");
emojis.set('madeline_mirror_determined', "<:madeline_mirror_determined:1278775855157477498>");
emojis.set('madeline_mirror_distracted', "<:madeline_mirror_distracted:1278775864258986046>");
emojis.set('madeline_mirror_normal', "<:madeline_mirror_normal:1278775873889108059>");
emojis.set('madeline_mirror_panic', "<:madeline_mirror_panic:1278775883695521895>");
emojis.set('madeline_mirror_sad', "<:madeline_mirror_sad:1278775893417787392>");
emojis.set('madeline_mirror_surprised', "<:madeline_mirror_surprised:1278775904688144394>");
emojis.set('madeline_mirror_upset', "<:madeline_mirror_upset:1278775913777074226>");
emojis.set('madeline_phone_angry', "<:madeline_phone_angry:1278776805636968468>");
emojis.set('madeline_phone_distracted', "<:madeline_phone_distracted:1278776814403194880>");
emojis.set('madeline_phone_normal', "<:madeline_phone_normal:1278776823500636253>");
emojis.set('madeline_phone_sad', "<:madeline_phone_sad:1278776832656936980>");
emojis.set('madeline_phone_surprised', "<:madeline_phone_surprised:1278776840965849189>");
emojis.set('madeline_phone_upset', "<:madeline_phone_upset:1278776852621819985>");
emojis.set('mom_concerned', "<:mom_concerned:1278777664831885332>");
emojis.set('mom_normal', "<:mom_normal:1278777675497869464>");
emojis.set('mom_phone_concerned', "<:mom_phone_concerned:1278777822839701676>");
emojis.set('mom_phone_normal', "<:mom_phone_normal:1278777831412994068>");
emojis.set('oshiro_drama', "<:oshiro_drama:1278785934791540857>");
emojis.set('oshiro_lostcontrol', "<:oshiro_lostcontrol:1278785944496898182>");
emojis.set('oshiro_nervous', "<:oshiro_nervous:1278785955771318365>");
emojis.set('oshiro_normal', "<:oshiro_normal:1278785967309852673>");
emojis.set('oshiro_serious', "<:oshiro_serious:1278785976176611379>");
emojis.set('oshiro_sidehappy', "<:oshiro_sidehappy:1278785984926056499>");
emojis.set('oshiro_sidesuspicious', "<:oshiro_sidesuspicious:1278785996246482964>");
emojis.set('oshiro_sideworried', "<:oshiro_sideworried:1278786005230420062>");
emojis.set('oshiro_worried', "<:oshiro_worried:1278786014135189635>");
emojis.set('theo_excited', "<:theo_excited:1278792754755010590>");
emojis.set('theo_nailedit', "<:theo_nailedit:1278792763491487774>");
emojis.set('theo_normal', "<:theo_normal:1278792771595010078>");
emojis.set('theo_serious', "<:theo_serious:1278792780923015188>");
emojis.set('theo_thinking', "<:theo_thinking:1278792790603726981>");
emojis.set('theo_worried', "<:theo_worried:1278792799231283281>");
emojis.set('theo_wtf', "<:theo_wtf:1278792807863156736>");
emojis.set('theo_yolo', "<:theo_yolo:1278792816021209178>");
emojis.set('theo_mirror_excited', "<:theo_mirror_excited:1278793320159514737>");
emojis.set('theo_mirror_nailedit', "<:theo_mirror_nailedit:1278793328502112256>");
emojis.set('theo_mirror_normal', "<:theo_mirror_normal:1278793336420958340>");
emojis.set('theo_mirror_serious', "<:theo_mirror_serious:1278793345233191043>");
emojis.set('theo_mirror_thinking', "<:theo_mirror_thinking:1278793358067630153>");
emojis.set('theo_mirror_worried', "<:theo_mirror_worried:1278793366372487240>");
emojis.set('theo_mirror_wtf', "<:theo_mirror_wtf:1278793375193108580>");
emojis.set('theo_mirror_yolo', "<:theo_mirror_yolo:1278793383950680116>");

const embeds = new Map;
const portraitsPath = path.join(__dirname, `../../assets/portraits`);
const characterFolders = fs.readdirSync(portraitsPath);
for (const characterFolder of characterFolders) {
    const embed = new EmbedBuilder();
    var portraits = 0;
    const characterFolderPath = path.join(portraitsPath, characterFolder);
    const portraitFiles = fs.readdirSync(characterFolderPath);
    for (const portraitFile of portraitFiles) {
        portraits++;
        const portraitName = portraitFile.slice(0, portraitFile.lastIndexOf('.png'))
        const emojiName = `${characterFolder}_${portraitName}`;
        const emoji = emojis.get(emojiName) ?? "❔";
        const portraitDisplayName = loc.find(`portrait.${portraitName}.name`);
        const spacer = "     ‎";
        embed.addFields({
            name: emoji + " " + portraitDisplayName + spacer,
            value: " ",
            inline: true
        });
    };
    if (portraits % 3 == 2) embed.addFields({ name: " ", value: " ", inline: true })
    embeds.set(characterFolder, embed);
};

function choice(character) {
    return { name: loc.find(`character.${character}.name`), name_localizations: loc.get(`character.${character}.name`), value: character }
};

const option = new SlashCommandStringOption()
    .setName("character")
    .setNameLocalizations(loc.get("command.list.option.name.strict"))
	.setDescription(loc.find("command.list.option.description"))
    .setDescriptionLocalizations(loc.get("command.list.option.description"))
    .setRequired(true)
for (const character of Object.keys(characters)) {
    option.addChoices(choice(character));
};


const command = new SlashCommandBuilder()
    .setName("list")
    .setNameLocalizations(loc.get("command.list.name.strict"))
	.setDescription(loc.find("command.list.description"))
    .setDescriptionLocalizations(loc.get("command.list.description"))
    .addStringOption(option)

module.exports = {
    cooldown: 2,
	data: command.toJSON(),

	async execute(interaction) {
        const userDisplayName = interaction.user.displayName.normalize("NFKC").trim();
        const character = interaction.options.getString("character");
        const embed = embeds.get(character);
        embed.setTitle(loc.find("command.list.embed.title", interaction.locale) + " " + loc.find(`character.${character}.name`, interaction.locale))
        await interaction.reply({ embeds: [embed] });
        log.action(userDisplayName, `requested portrait list of ${loc.find(`character.${character}.name`)}`);
	}
};