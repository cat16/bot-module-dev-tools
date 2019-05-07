import { CommandCreateInfo } from "cat16-bot-core";

const createInfo: CommandCreateInfo = {
  run(context) {
    const now = new Date();
    context.msg.channel.send("Ping: loading...").then(sent => {
      const msg = sent instanceof Array ? sent[0] : sent;
      const then = new Date();
      msg.edit(`Ping: ${then.getTime() - now.getTime()}ms`);
    });
  },
  async hasPermission(context) {
    return true;
  }
};

export default createInfo;
