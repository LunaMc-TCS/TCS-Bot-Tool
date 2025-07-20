import { Client, GatewayIntentBits, Message } from 'discord.js';
import 'dotenv/config'; // Tự động chạy

console.log('Token:', process.env.TOKEN); // Kiểm tra token có được load không

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

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'mc') {
    const cmd = await import('./commands/utility/mc.js');
    await cmd.default.callback(client, message, args);
  }
});

client.login(process.env.TOKEN);
