import { Category } from "discord-akairo";
import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { config } from "../config";
const ignoredCategories = ["owner", "default", "auto"];


interface UwUCommand extends Command {
  description: {
    usage: string;
    content: string;
    example: string[];
  };
}

export default class Help extends Command {
  public constructor() {
    super("help", {
      aliases: ["help", "h"],
      args: [
        {
          id: "command",
          type: "commandAlias",
          default: null,
        },
      ],
      category: "utilities",
      description: {
        content: "Displays information about a command",
        usage: "[command]",
        example: ["help manual"],
      },
    });
  }

  public async exec(message: Message, { command }: { command?: UwUCommand }) {
    const prefix = config.prefix;
    const embed = new MessageEmbed().setColor(3447003);

    if (command) {
      embed
        .addField(
          "❯ Description",
          command.description.content || "No Description provided"
        )
        .addField(
          "❯ Usage",
          `\`${prefix}${command.aliases[0]}${
            command.description.usage ? command.description.usage : ""
          }\``
        )
        .addField(
          "❯ Examples",
          command.description.example.map((x) => `\`${prefix}${x}\``).join("\n")
        );
      if (command.aliases.length > 1) {
        embed.addField(
          "❯ Aliases",
          `\`${command.aliases
            .filter((x: string) => x !== command.id)
            .join("`, `")}\``
        );
      }
      return message.channel.send(embed);
    }
    embed.setTitle("Commands").setDescription(
      `
					A list of available commands.
                    For additional info on a command, type \`${prefix}help [command]\`

                    \`<>\` means an argument is required.
                    \`[]\` means an argument is optional.

					`
    );

    for (const category of this.client.commandHandler.categories
      .filter(
        (x: Category<string, Command>) => !ignoredCategories.includes(x.id)
      )
      .values()) {
      embed.addField(
        `❯ ${category.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`,
        `${category
          .filter((cmd) => cmd.aliases.length > 0)
          .map((cmd) => `\`${cmd.aliases[0]}\``)
          .join(", ")}`
      );
    }

    return message.channel.send(embed);
  }
}
