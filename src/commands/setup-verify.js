import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-verify')
    .setDescription('إرسال رسالة التحقق في هذه القناة')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const iconURL = guild.iconURL({ size: 256, extension: 'png' });

    const embed = new EmbedBuilder()
      .setTitle('🛡️ حياك الله في مجتمع South Group')
      .setDescription(
        '> أهلاً وسهلاً بك في مجتمعنا!\n' +
        '> للدخول إلى السيرفر يرجى إتمام عملية التحقق أدناه.\n\n' +
        '**📋 شروط التفعيل:**\n\n' +
        '✅  تاريخ إنشاء الحساب لا يقل عن **30 يوماً**\n' +
        '✅  يجب أن لا يكون الحساب **بوت**\n\n' +
        '> اضغط على زر **Verify** للمتابعة.'
      )
      .setColor(0x5865F2)
      .setThumbnail(iconURL)
      .setFooter({
        text: 'South Group • نظام التحقق',
        iconURL: iconURL,
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_button')
        .setLabel('✅  Verify')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({ content: '✅ تم إرسال رسالة التحقق بنجاح!' });
  },
};
