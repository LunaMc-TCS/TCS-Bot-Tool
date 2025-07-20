import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.once('ready', () => {
    console.log(`Bot đã online dưới tên ${client.user?.tag}`);
});
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!'))
        return;
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    if (command === 'mc') {
        const cmd = await import('./commands/utility/mc'); // <-- Đường dẫn đúng
        await cmd.default.callback(client, message, args); // Gọi hàm callback
    }
});
client.login(process.env.TOKEN);
