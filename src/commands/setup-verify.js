import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from 'discord.js';

const SERVER_ICON = 'https://images-ext-1.discordapp.net/external/FjvFsowvpkjSDro8ro1WXmr8V7cKuGW8Kky0qXa7rGU/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1496940383874060548/382be9a3cff705917399d47b8c542722.png?format=webp&quality=lossless&width=901&height=901';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-verify')
    .setDescription('إرسال رسالة التحقق في هذه القناة')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'South Group • نظام التحقق',
        iconURL: SERVER_ICON,
      })
      .setTitle('🛡️ مرحباً بك في South Group')
      .setDescription(
        '```\nأهلاً وسهلاً! يرجى إتمام التحقق للوصول إلى السيرفر.\n```\n' +
        '**📋 متطلبات الدخول**\n' +
        '> 🗓️  عمر الحساب لا يقل عن **30 يوماً**\n' +
        '> 🤖  يجب ألا يكون الحساب **بوت**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '> 👇  اضغط على زر **Verify** أدناه للمتابعة'
      )
      .setColor(0x5865F2)
      .setThumbnail(SERVER_ICON)
      .setImage('https://i.imgur.com/transparent.gif')
      .setFooter({
        text: 'South Group ・ يُمنع التحايل على نظام التحقق',
        iconURL: SERVER_ICON,
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setURL('https://verify-bot-5x8y.onrender.com/')
        .setLabel('التحقق  ✅')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({ content: '✅ تم إرسال رسالة التحقق بنجاح!' });
  },
};
