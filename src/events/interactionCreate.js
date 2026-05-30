import {
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    // ─── Slash Commands ───────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        const reply = { content: '❌ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // ─── Verify Button ────────────────────────────────────────────
    if (interaction.isButton() && interaction.customId === 'verify_button') {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.member;
      const user   = interaction.user;
      const guild  = interaction.guild;
      const iconURL = guild.iconURL({ size: 64, extension: 'png' });

      // 1. Bot check
      if (user.bot) {
        return interaction.editReply({
          embeds: [errorEmbed('❌ البوتات غير مسموح لها بالتحقق.', iconURL)],
        });
      }

      // 2. Account age check (30 days)
      const accountAge = Date.now() - user.createdTimestamp;
      if (accountAge < THIRTY_DAYS_MS) {
        const daysOld   = Math.floor(accountAge / (24 * 60 * 60 * 1000));
        const daysLeft  = 30 - daysOld;
        return interaction.editReply({
          embeds: [errorEmbed(
            `❌ حسابك لم يبلغ 30 يوماً بعد.\n\n` +
            `📅 عمر حسابك: **${daysOld} يوم**\n` +
            `⏳ الأيام المتبقية: **${daysLeft} يوم**`,
            iconURL
          )],
        });
      }

      // 3. Assign verified role (if VERIFIED_ROLE_ID is set)
      const verifiedRoleId = process.env.VERIFIED_ROLE_ID;
      if (verifiedRoleId) {
        const role = guild.roles.cache.get(verifiedRoleId);
        if (role) {
          const botMember = guild.members.me;
          if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.editReply({
              embeds: [errorEmbed('❌ البوت لا يملك صلاحية إدارة الأدوار.', iconURL)],
            });
          }
          if (botMember.roles.highest.comparePositionTo(role) <= 0) {
            return interaction.editReply({
              embeds: [errorEmbed('❌ رتبة البوت أقل من رتبة التحقق، يرجى رفع رتبة البوت.', iconURL)],
            });
          }
          if (member.roles.cache.has(verifiedRoleId)) {
            return interaction.editReply({
              embeds: [successEmbed('✅ أنت محقق بالفعل!', iconURL)],
            });
          }
          await member.roles.add(role);
        }
      }

      // 4. Success
      return interaction.editReply({
        embeds: [successEmbed(
          `✅ تم التحقق بنجاح! مرحباً بك في **${guild.name}** 🎉`,
          iconURL
        )],
      });
    }
  },
};

function errorEmbed(description, iconURL) {
  return new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle('نظام التحقق • South Group')
    .setDescription(description)
    .setThumbnail(iconURL)
    .setTimestamp();
}

function successEmbed(description, iconURL) {
  return new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('نظام التحقق • South Group')
    .setDescription(description)
    .setThumbnail(iconURL)
    .setTimestamp();
}
