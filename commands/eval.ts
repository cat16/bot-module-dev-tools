import { RichEmbed, Message } from "discord.js";
import * as ts from "typescript";
import { inspect } from "util";
import { Bot, CommandCreateInfo } from "cat16-bot-core";

const depth = 0;

const createEvalMsg = (
  bot: Bot,
  input: string,
  content: any,
  type: string,
  color: number
): RichEmbed => {
  const output =
    content instanceof Error
      ? [
          {
            name: "Exception",
            value: "```ts\n" + content.message + "```"
          },
          {
            name: "Stack",
            value: "```ts\n" + content.stack.slice(0, 1000) + "```"
          }
        ]
      : [
          {
            name: "Output",
            value:
              "```ts\n" +
              content.replace(bot.getConfig().token, "[TOKEN]").slice(0, 1000) +
              "```"
          }
        ];
  return new RichEmbed({
    color,
    fields: [
      {
        name: "Input",
        value: "```ts\n" + input + "```"
      },
      ...output,
      {
        name: "Type",
        value: "```ts\n" + type + "```"
      }
    ],
    timestamp: new Date()
  });
};

const createInfo: CommandCreateInfo = {
  async run(context) {
    const sending = context.reply(
      createEvalMsg(
        this.bot,
        context.args.content,
        "evaluating...",
        "evaluating...",
        0xffff00
      )
    );
    try {
      // tslint:disable-next-line:no-eval
      const result = await eval(
        ts.transpile(context.args.content, {
          moduleResolution: ts.ModuleResolutionKind.NodeJs
        })
      );
      let output = result;
      if (typeof output !== "string") {
        output = inspect(result, { depth });
      }
      const type =
        result === null
          ? "null"
          : result === undefined
            ? "undefined"
            : typeof result === "object"
              ? "object - " + result.constructor.name
              : typeof result;
      const promise = output.startsWith("Promise {");
      const sent = await sending as Message;
      sent.edit(
        createEvalMsg(
          this.bot,
          context.args.content,
          output,
          type,
          promise ? 0xffff00 : 0x00ff00
        )
      );
    } catch (err) {
      const sent = await sending as Message;
      sent.edit(
        createEvalMsg(this.bot, context.args.content, err, err.name, 0xff0000)
      );
    }
  },
  async hasPermission(context) {
    return this.bot.isAdmin(context.user.id);
  }
};

export default createInfo;
