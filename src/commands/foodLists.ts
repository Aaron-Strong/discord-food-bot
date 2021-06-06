import { Argument } from 'discord-akairo';
import { Command } from 'discord-akairo';
import { FieldsEmbed } from 'discord-paginationembed';
import { Message } from 'discord.js';
import { Client } from 'discord.js';
import { TextChannel } from 'discord.js';
import { User } from 'discord.js';
import { findFood } from '../db';
import { foodObject } from '../typings';
import { FOODTYPE } from '../enums';
interface Args {
  user: User | null;
  page: number | null;
  foodType: string;
}

class FoodLists extends Command {
  constructor() {
    super('food', {
      aliases: ['food'],
      category: 'food',
      args: [
        {
          id: 'foodType',
          type: Argument.validate('string', (_m, p) => {
            console.log('P: ' + p);
            return Object.values(FOODTYPE).includes(
              p.toLowerCase() as FOODTYPE
            );
          }),
          unordered: true,
          default: 'all',
        },
        {
          id: 'user',
          type: 'user',
          unordered: true,
          default: '',
        },
      ],
      description: {
        content: 'This is how you view the top food stats, duh..',
        usage: '[foodtype](all/porn/hell) | [user]',
        example: [
          'food porn blacky',
          'food karl hell',
          'food all',
          'food @degrec',
        ],
      },
    });
  }

  async exec(message: Message, args: Args) {
    let user = args.user;
    console.log('USER', user.username);
    console.log('LIST FOODTYPE', args.foodType);

    let foodArr: foodObject[];
    let foodType = await getFoodType(args.foodType);

    console.log('PROCESSED FOODTYPE', foodType);
    if (!user) foodArr = await findFood(foodType, message.guild.id);
    else foodArr = await findFood(foodType, message.guild.id, user.id);

    //// Hack to prevent confusion when a user isn't found
    if (
      (!user &&
        foodType == 'all' &&
        !message.content.split(' ').includes('all') &&
        message.content.split(' ').length > 1) || // We can assume any other arguments are attempts at a user
      (!user &&
        foodType == 'all' &&
        message.content.split(' ').includes('all') &&
        message.content.split(' ').length > 2)
    ) {
      return await message.util.reply(
        "Couldn't find that user, try @ing them instead"
      );
    }
    ////

    if (foodArr.length === 0) {
      let prefix =
        user == message.author ? "You don't" : user.username + "doesn't";
      let suffix;
      if (foodType == FOODTYPE.PORN) suffix = 'food porn';
      if (foodType == FOODTYPE.HELL) suffix = 'shit food';
      if (foodType == FOODTYPE.ALL) suffix = 'food posted';

      return await message.util.reply(`${prefix} have any ${suffix}`);
    }

    return await embedAllPornCreator(
      foodArr,
      message,
      this.client,
      foodType,
      user
    );
  }
}

async function getFoodType(arg: string) {
  switch (arg.toLowerCase()) {
    case FOODTYPE.PORN:
    case FOODTYPE._HEAVEN:
      return FOODTYPE.PORN;
    case FOODTYPE.HELL:
      return FOODTYPE.HELL;
    default:
      return FOODTYPE.ALL;
  }
}

async function embedAllPornCreator(
  foodArr: foodObject[],
  message: Message,
  client: Client,
  foodType: string,
  user?: User
) {
  let allMode = foodType === 'all';
  let pornMode = foodType === 'porn';
  let hellMode = foodType === 'hell';

  let descriptionTitle;
  let descriptionTitlePrefix = '';

  if (user) descriptionTitlePrefix = user.username + "'s ";
  if (allMode) descriptionTitle = 'Top Food!';
  if (pornMode) descriptionTitle = 'Top Porn!';
  if (hellMode) descriptionTitle = 'Top Shit!';
  descriptionTitle = descriptionTitlePrefix + descriptionTitle;

  let mainTitle;
  if (allMode) mainTitle = 'All The Food!';
  if (pornMode) mainTitle = 'Food Porn!';
  if (hellMode) mainTitle = 'Food Hell!';

  const Pagination = new FieldsEmbed<foodObject>()
    .setArray(foodArr)
    .setAuthorizedUsers([message.author.id])
    .setChannel(message.channel as TextChannel)
    .setElementsPerPage(5)
    .setPageIndicator(true)
    .formatField(
      descriptionTitle,
      (food) =>
        `\n[**${food.url.split('/').pop()}**](${food.discordInline})\n👍🏿 x ${
          food.upvotes
        }, 👎🏿 x ${food.downvotes}${user ? '' : ` - **${food.username}**`}`
    );
  Pagination.embed.setTitle(mainTitle).setColor(1925289);

  return await Pagination.build();
}

module.exports = FoodLists;
