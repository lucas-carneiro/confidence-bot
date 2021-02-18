console.log("Starting...");
const Discord = require("discord.js");
const client = new Discord.Client();
client.login(process.env.DISCORD_BOT_TOKEN);

let confidenceVotes = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", function(message) {
    if (message.author.bot)
        return;    

    if (isDirectMessage(message))
        takeVote(message);
    else
        takeCommand(message);
});

function isDirectMessage(message) {
    return message.channel instanceof Discord.DMChannel;
}

function takeVote(message) {
    const vote = Number.parseInt(message.content);
    const { username: user } = message.author;
    try {
        isValidVote(votes,user);
        confidenceVotes.push({user , vote});
        message.reply("Thank you for your vote!");
    } catch(error) {
        message.reply(error.message);
    }
}

function isValidVote(vote, user) {
    // Checking if the vote is a valid number
    const isValidNumber = Number.isInteger(vote) && vote >= 1 && vote <= 5;
    if(!isValidNumber) {
        throw new Error("Oops, that's not a valid vote. Please send me an integer number between 1 and 5.");
    }

    //Checking if the user areadyVoted
    const alreadyVoted =  confidenceVotes.filter(vote => vote.user != user) > 0;
    if(alreadyVoted) {
        throw new Error("Oops, you already voted")
    }
}

function takeCommand(message) {
    const command = message.content.toLowerCase();

    switch (command) {
        case "!startconfidence":
        case "!sc":
            startConfidence(message.channel);
            break;
        case "!endconfidence":
        case "!confidence":
        case "!ec":
            endConfidence(message.channel);
            message.delete();
            break;
        case "!votes":
            countVotes(message.channel);
            break;
        default:
            break;
    }
}

function startConfidence(channel) {
    confidenceVotes = [];
    const startConfidenceMessage = "Send me DMs with your confidence votes!";
    channel.send(startConfidenceMessage);
}

function endConfidence(channel) {
    try {
        const confidence = calculateConfidence();
        const confidenceMessage = formatConfidenceMessage(confidence);
        channel.send(confidenceMessage);
    } catch (e) {
        console.log(e);
        channel.send("Error while calculating confidence. Please start voting again.");
    } finally {
        confidenceVotes = [];
    }
}

function countVotes(channel) {
    const votes = confidenceVotes.length;
    channel.send(`I'm currently storing ${votes} votes.`);
}

function calculateConfidence() {
    let sumVotes = 0;
    confidenceVotes.forEach(vote => sumVotes += vote.vote);

    if (sumVotes > 0)
        return sumVotes / confidenceVotes.length;
    return 0;
}

function formatConfidenceMessage(confidence) {
    const confidenceDate = formatDate();
    const votes = formatVotes();
    return `Confidence ${confidenceDate}: ${confidence.toString().substring(0, 4)}, from ${confidenceVotes.length} votes ${votes}`;
}

function formatDate() {
    const now = new Date();
    const day = formatDateNumber(now.getDate());
    const month = formatDateNumber(now.getMonth() + 1);
    const year = now.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function formatDateNumber(dateNumber) {
    if (dateNumber < 10)
        return `0${dateNumber}`;
    return dateNumber;
}

function formatVotes() {
    let votes = "";
    confidenceVotes.forEach(vote => votes += `${vote.vote}, `);
    return `(${votes.substring(0, votes.length - 2)})`;
}
