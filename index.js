require('dotenv').config();

const { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError } = require('grammy');
const { getRandomQuestion } = require('./utils');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx) => {
    const startKeyboard = new Keyboard()
        .text('HTML')
        .text('CSS')
        .row()
        .text('JS')
        .text('React')
        .resized();
    await ctx.reply(
        'Hello!'
    );
    await ctx.reply('Hello! Is a Telegram bot is schedule for students.', {
        reply_markup: startKeyboard
    })
});

bot.hears(['HTML', 'CSS', 'JS', 'React'], async (ctx) => {
    const topic = ctx.message.text;
    const question = getRandomQuestion(topic);

    let inlineKeyboard;

    if (question.hasOptions) {
        const buttonRows = question.options.map((option) => [InlineKeyboard.text(option.text, JSON.
        stringify({
            type: `${topic}-option`,
            isCorrect: option.isCorrect,
            questionId: question.id,
        }),
        ),
        ]);
    } else {
        inlineKeyboard = new InlineKeyboard()
            .text('Узнать ответ',
                JSON.stringify({
                    type: topic,
                    questionId: question.id,
                }),
            );
    }

    await ctx.reply(question.text, {
        reply_markup: inlineKeyboard,
    });
});

bot.on('callback_query:data', async (ctx) => {
    if(ctx.callbackQuery.data === 'cansel') {
        await ctx.reply('Отменено')
        await ctx.answerCallbackQuery();
        return;
    }

    const callbackData = JSON.parse(ctx.callbackQuery.data);
    await ctx.reply(`${callbackData.type} - составляющая фронтенда`);
    await ctx.answerCallbackQuery();
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('Cloud not contact Telegram:', e);
    } else {
        console.error('Unknown error:', e);
    }
});

bot.start();