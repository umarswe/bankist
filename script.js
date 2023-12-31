'use strict';


/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460, 100],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${acc.balance}€`;
}

const calcDisplaySummary = function(acc) {
  const incomes = acc.movements
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`

  const out = acc.movements
  .filter(mov => mov < 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${out}€`;

  const interest = acc.movements
  .filter(mov => mov > 0)
  .map(deposit => deposit * acc.interestRate / 100)
  .filter((int, i, arr) => int >= 1)
  .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`
}

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function(mov, i) {

    const type = mov > 0 ? 'deposit' : 'withdrawal'; 
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>
    `

    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
};

const createUsernames = function(accs) {
  accs.forEach(function(acc) {
    acc.username = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
  });
};

createUsernames(accounts)


const updateUI = function(acc) {
  //Display Movements
  displayMovements(acc.movements);

  //Display Summary
  calcDisplaySummary(acc);
  
  //Display Balance
  calcDisplayBalance(acc);
}

let currentAccount, timer;

btnLogin.addEventListener('click', function(e) {
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  if(currentAccount?.pin === +(inputLoginPin.value)){

    //Display UI and Welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
    containerApp.style.opacity = 100;

    //Clear input Field
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if(timer){
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    updateUI(currentAccount)
  }

  console.log(currentAccount);
})

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);  
  inputTransferAmount.value = inputTransferTo.value = '';

  if(amount > 0 && 
    receiverAcc && 
    currentAccount.balance >= amount && 
    receiverAcc?.username !== currentAccount.username) {
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);

      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }
})

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();
  const amount = +(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount)

    updateUI(currentAccount)

    clearInterval(timer);
    timer = startLogOutTimer();
  }

  inputLoanAmount.value = '';
})

btnClose.addEventListener('click', function(e){
  e.preventDefault();

  if(currentAccount.username === inputCloseUsername.value && currentAccount.pin === +(inputClosePin.value)) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin = '';

})

let sorted = false;

btnSort.addEventListener('click', function(e) {
  e.preventDefault();

  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
})


// Calculating All Balance
// const allBalance = accounts
// .flatMap(acc => acc.movements)
// .reduce((acc, mov) => acc + mov, 0)
// console.log(allBalance)



//Dates

const now = new Date();
const day = now.getDate();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const hour = now.getHours();
const min = now.getMinutes();

labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`


const startLogOutTimer = function() {

  const tick = function() {
    const min = String(Math.trunc(time/60)).padStart(2, 0);
    const sec = String(Math.trunc(time%60)).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if(time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started'
      containerApp.style.opacity = 0;
    }

    time--
  }

  let time = 600;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}