import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);
const model = "gpt-3.5-turbo";
//const model = "gpt-3.5-turbo-0301";

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send({
        message: model,
    });
});

function generateMessageObject(prompt){
  //train the bot for the basic knowledge via Q&A
  let message_objects = [
    {role: "user", content: "What is the STC 4D game"},
    {role: "assistant", content: "In an STC 4D game, you place a bet on a 4-digit number (from 0000 to 9999) and see if your number comes up in any of the 23 winning numbers in the exact sequence.  For example, if you place a bet on 1234 and the winning number of the 2nd prize is 1234, you will win the 2nd prize.  However, if the 2nd prize number is with other sequences (for example 1243, 4321, 3214) you will not win the 2nd prize."},
    {role: "user", content: "How much is the ticket"},
    {role: "assistant", content: "The minimum amount per bet is RM1.  You could win up to RM3,500 for an RM1 bet.  You may increase your bet amount in multiples of RM1.  For example, if your place a bet for RM3, you could win up to RM10,500 (RM3500 x 3)."},
    {role: "user", content: "How do I receive the ticket"},
    {role: "assistant", content: "The electronic ticket(s) will be sent to you immediately upon purchase if the bet(s) were placed within our office hours.  The ticket(s) will be sent to you once our business hours commence if the bet(s) were placed outside our office hours.  You will see the details and image(s) of your ticket in the My Tickets section of the website.  No physical (printed) ticket will be distributed."},
    {role: "user", content: "Do I have to pay tax for the ticket"},
    {role: "assistant", content: "A lottery ticket is subject to a 15% tax (based on the betting amount) for ordinary draws and 25% for special draws.  Tax will be charged when you buy the ticket.  No tax will be charged for lottery winnings."},
    {role: "user", content: "How many prizes are there in an STC 4D game"},
    {role: "assistant", content: "There are 23 winning numbers in each draw: 1 winning number for the 1st Prize, 1 winning number for the 2nd Prize, 1 winning number for the 3rd Prize, 10 winning numbers for the Special Prize, and 10 numbers for the Consolation Prize."},
    {role: "user", content: "Can I choose the bet number on my own"},
    {role: "assistant", content: "Yes, you can choose any 4-digit number on your own.  In the case that you do not have a specific number to bet, you may choose the Easy-Pick Bet and the gaming system will generate a random number."},
    {role: "user", content: "How much can I win in each kind of prize in the STC 4D game"},
    {role: "assistant", content: "For each RM1 bet, you can choose to bet on “Big Forecast” or “Small Forecast”.  For “Big Forecast”, you have a higher chance of winning (it has 23 prizes), but the winning amount is lower.  For “Small Forecast”, your winning amount will be higher, but the chance of winning is lower (it only has 3 prizes)."},
    {role: "user", content: "Can I increase the chance of winning? (BOX)"},
    {role: "assistant", content: "You can increase your winning chance by choosing the BOX option.  For example, if your bet number is 1234 and the result is not with the exact sequence (for example 4321, 2134), you are still able to win if you have chosen the BOX option.  For the BOX option, the bet amount is still RM1."},
  ];
  //add system role to the beginning
  message_objects.unshift({role: "system", content: "Assistant is a customer servicer who works for the STC4D.net to answer users enquiry regarding the STC 4D lottery game ONLY. Do not answer any question unlated to the STC 4D lottery game!"});

  //add prompt to the end
  message_objects.push({role: "user", content: `${prompt}`});
  return message_objects;
}

app.post('/', async (req, res) => {
    try {
      const prompt = req.body.prompt;
      
      console.log(generateMessageObject(prompt));

      const response = await openai.createChatCompletion({
        model: `${model}`,
        messages: generateMessageObject(prompt),
        temperature: 0, // Higher values means the model will take more risks.
        max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
        top_p: 1, // alternative to sampling with temperature, called nucleus sampling
        frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
        presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
      });
  
      res.status(200).send({
        bot: response.data.choices[0].message.content
      });
  
    } catch (error) {
      console.error(error)
      res.status(500).send(error || 'Something went wrong');
    }
  })
  
  app.listen(5000, () => console.log('AI server started on port:5000'))