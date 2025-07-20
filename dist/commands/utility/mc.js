"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('mc')
        .setDescription('🔍 Quét và xem thông tin một server Minecraft')
        .addStringOption(opt => opt.setName('ip')
        .setDescription('Địa chỉ IP hoặc tên miền của server')
        .setRequired(true))
        .addStringOption(opt => opt.setName('tacvu')
        .setDescription('Quét cổng bằng nmap')
        .addChoices({ name: 'scan', value: 'scan' })),
    name: "mc",
    aliases: ["mc", "scan"],
    description: "Xem thông tin về một server Minecraft hoặc quét cổng",
    callback: async (client, message, args) => {
        const isSlash = message instanceof discord_js_1.ChatInputCommandInteraction;
        const target = isSlash ? message.options.getString('ip', true) : args[0];
        const action = isSlash ? message.options.getString('tacvu') : args[1];
        const port = args[2] || 25565;
        if (!target)
            return message.reply("⚠️ Vui lòng cung cấp IP hoặc tên miền server!");
        // Nếu dùng "scan" thì chạy nmap
        if (action === "scan") {
            (0, child_process_1.exec)(`nmap -p ${port} ${target}`, (err, stdout) => {
                if (err)
                    return message.reply("❌ Lỗi khi quét server.");
                message.reply(`📡 Kết quả quét \`${target}:${port}\`:\n\`\`\`${stdout}\`\`\``);
            });
            return;
        }
        try {
            const [infoRes, dnsRes] = await Promise.all([
                axios_1.default.get(`https://api.mcsrvstat.us/3/${target}`),
                axios_1.default.get(`https://api.mcsrvstat.us/2/${target}`)
            ]);
            const data = infoRes.data;
            const dns = dnsRes.data;
            const isOnline = data.online;
            const players = data.players?.list || [];
            const plugins = data.plugins || [];
            const mods = data.mods?.names || [];
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(isOnline ? 0x00BFFF : 0xFF3333)
                .setTitle(`TCS Tool | Máy chủ:`)
                .setDescription(`🌐 \`${target}\``)
                .addFields({
                name: '📊 Thông tin',
                value: isOnline
                    ? `🟢 Trạng thái: Online\n👥 Người chơi: \`${data.players.online}/${data.players.max}\`\n💻 Phiên bản: \`${data.version || 'Không rõ'}\`\n📶 Ping: \`${data.ping ?? 'N/A'}ms\`\n🌐 IP Gốc: \`${dns.ip || 'Không rõ'}\`\n📡 Resolved IP: \`${data.ip}:${data.port}\``
                    : `🔴 Máy chủ đang offline`,
                inline: false,
            }, {
                name: '💬 MOTD',
                value: `\`\`\`\n${isOnline ? data.motd.clean.join('\n') : 'Không có'}\n\`\`\``,
                inline: false,
            })
                .setThumbnail(`https://api.mcsrvstat.us/icon/${target}`)
                .setFooter({ text: '🔧 The Clowns Studio Tool Minecraft' })
                .setTimestamp();
            if (isOnline && players.length > 0) {
                embed.addFields({
                    name: `👤 Người chơi (${players.length}):`,
                    value: `\`\`\`\n${players.join(', ')}\n\`\`\``,
                    inline: false,
                });
            }
            if (isOnline && plugins.length > 0) {
                embed.addFields({
                    name: `🔌 Plugin (${plugins.length})`,
                    value: plugins.join(', ').slice(0, 1000),
                    inline: false,
                });
            }
            if (isOnline && mods.length > 0) {
                embed.addFields({
                    name: `🧩 Mods (${mods.length})`,
                    value: mods.join(', ').slice(0, 1000),
                    inline: false,
                });
            }
            const button = new discord_js_1.ButtonBuilder()
                .setCustomId('mc_refresh')
                .setLabel('🔄 Làm mới')
                .setStyle(discord_js_1.ButtonStyle.Primary);
            const row = new discord_js_1.ActionRowBuilder().addComponents(button);
            if (isSlash) {
                await message.reply({ embeds: [embed], components: [row] });
            }
            else {
                await message.reply({ embeds: [embed], components: [row] });
            }
        }
        catch (err) {
            console.error(err);
            return message.reply("❌ Không thể lấy thông tin từ máy chủ.");
        }
    }
};
