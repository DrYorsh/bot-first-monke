const TelegramBot = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options.js');
const sequelize = require('./db.js');
const UserModels = require('./models.js');

const token = "7636606096:AAHZQ4EqPV5aGCGZSQOiAOn23ydssnWWvq0";

const bot = new TelegramBot(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
    const int = Math.floor(Math.random() * 10);
    chats[chatId] = int;
    await bot.sendMessage(chatId, "Я загадал цифру от 0 до 9. А ты угадай какую", gameOptions);
}

const start = async () => {

    try {
        await sequelize.authenticate();
        await sequelize.sync()
    } catch (error) {
        console.log('Подключение к БД сломалось', error);

    }

    bot.setMyCommands([
        { command: "/start", description: "Начало работы" },
        { command: "/info", description: "Получите инфу" },
        { command: "/game", description: "Игра в 'Угадай число'" },
    ])

    bot.on("message", async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === "/start") {
                await UserModels.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/be1/98c/be198cd5-121f-4f41-9cc0-e246df7c210d/8.webp')
                return bot.sendMessage(chatId, `добро пожаловать ${text}`)
            } else if (text === "/info") {
                const user = await UserModels.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}100 % инфа, ты выиграл ${user.right} раз, а проиграл ${user.wrong} раз.`)
            } else if (text === "/game") {
                return startGame(chatId);
            } else {
                await bot.sendMessage(chatId, "Ничего не понимаю");
                return bot.sendSticker(chatId, `https://tlgrm.ru/_/stickers/be1/98c/be198cd5-121f-4f41-9cc0-e246df7c210d/23.webp`)

            }
        } catch (error) {
            return bot.sendMessage(chatId, 'Что-то сломалось, попробуйте позже')
        }
    })

    bot.on("callback_query", async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const user = await UserModels.findOne({chatId})
        if (data !== "/again") {
            await bot.sendMessage(chatId, `Ты нажал кнопку под цыфрой ${data}`);
            user.wrong += 1;
        }
        if (chats[chatId].toString() === msg.data) {
            user.right += 1;
            await bot.sendMessage(chatId, "Бля, угадал!", againOptions)
        }
        if (data === "/again") {
            await startGame(chatId);
        }
        await user.save();
        await bot.sendMessage(chatId, "Пробуй еще", againOptions)
    })

}

start();