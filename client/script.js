import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

let message_objects = [
  //train the bot for the basic knowledge via Q&A
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
];
//add system role to the beginning
message_objects.unshift({role: "system", content: "Yor are the customer service officer who works for the STC 4D.net. You are trained to anwser question about STC 4D lottery game. Act as customer service officer and give no more than 100 words per answer. Your task is to answer STC 4D question ONLY and say to no to any other unrelated topic. Use point form to format your response."});

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent.length > 3) {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src="${isAi ? bot : user}" 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id="${uniqueId}">${value}</div>
          </div>
      </div>
  `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  //show loading
  loader(messageDiv);

  //prepare message
  message_objects.push({role: "user", content: data.get('prompt').trim()});

  // fetch response from the server
  //const response = await fetch('http://localhost:5000', {
  const response = await fetch('https://puffai.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: message_objects
    })
  })

  //no longer loading
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
    //append the latest completion into message_objects
    message_objects.push({role: "assistant", content: `${parsedData}`});
  }else{
    const err = await response.text()
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
    //if error, pop last user's prompt
    message_objects.pop();
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.key === 'Enter') {
    handleSubmit(e);
  }
})