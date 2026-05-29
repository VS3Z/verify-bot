export default {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`✅ Bot is online as ${client.user.tag}`);
  },
};
