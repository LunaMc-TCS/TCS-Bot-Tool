"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const { exec } = require("child_process");
module.exports = {
    name: "mc",
    aliases: ["mc", "scan"],
    description: "Xem thông tin về một server minecraft hoặc quét cổng",
    callback: (client, message, args) => __awaiter(void 0, void 0, void 0, function* () {
        const target = args[0];
        if (!target)
            return message.reply("Vui lòng cung cấp tên miền hoặc địa chỉ IP của server.");
        if (args[1] === "scan") {
            const port = args[2] || 25565;
            try {
                exec(`nmap -p ${port} ${target}`, (error, stdout, stderr) => {
                    if (error || stderr) {
                        console.error(`Lỗi Nmap:`, error || stderr);
                        return message.reply("Đã xảy ra lỗi khi quét server.");
                    }
                    message.reply(`Kết quả quét Nmap cho ${target} trên cổng ${port}:\n\`\`\`${stdout}\`\`\``);
                });
            }
            catch (err) {
                console.error(err);
                message.reply("Đã xảy ra lỗi khi quét server.");
            }
        }
        else {
            try {
                const [serverInfoResponse, dnsLookupResponse] = yield Promise.all([
                    axios_1.default.get(`https://api.mcsrvstat.us/3/${target}`),
                    axios_1.default.get(`https://api.mcsrvstat.us/2/${target}`)
                ]);
                const data = serverInfoResponse.data;
                const dnsData = dnsLookupResponse.data;
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor("White")
                    .setTitle(`${data.hostname}`)
                    .setDescription(`
> ** | ${data.online ? `Online: \`${data.players.online}/${data.players.max}\`` : "Offline"}**
> ** | Version: ${data.online ? `${data.version}` : "Server đang offline"}**
> ** | Ping: ${data.online ? `\`${data.ping}\`` : "Server đang offline"}** 
> ** | IP: ${dnsData.ip ? `\`${dnsData.ip}\`` : "Không tìm thấy"}** 
> ** | Resolved IP: ${data.online ? `\`${data.ip}:${data.port}\`` : "Server đang offline"}** 
`)
                    .addFields({ name: `**Motd**`, value: `\`\`\`${data.online ? `${data.motd.clean}` : "Server đang offline"}\`\`\``, inline: false }, { name: `**protocol**`, value: `\`\`\`${data.online ? `${data.protocol.version} - ${data.protocol.name}` : "Server đang offline"}\`\`\``, inline: true }, { name: `Sotfware`, value: `\`\`\`${data.online ? `${data.software ? `${data.software}` : "Không tìm thấy"}` : "Server đang offline"}\`\`\``, inline: true })
                    .setTimestamp()
                    .setThumbnail(`https://api.mcsrvstat.us/icon/${target}`);
                message.reply({ embeds: [embed] });
            }
            catch (err) {
                console.error(err);
                message.reply(`Không tìm thấy máy chủ này!`);
            }
        }
    })
};
