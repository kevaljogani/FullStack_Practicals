
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3002;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));


app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.render('index'); 
});


app.post('/calculate', (req, res) => {
  const { income1, income2 } = req.body;


  const num1 = parseFloat(income1);
  const num2 = parseFloat(income2);


  if (isNaN(num1) || isNaN(num2) || num1 < 0 || num2 < 0) {
    const errorMessage = 'Invalid input. Please enter only positive numbers for both income sources.';
    res.render('error', { errorMessage: errorMessage }); 
    return;
  }

 
  const totalIncome = num1 + num2;

 
  res.render('result', {
    income1: num1,
    income2: num2,
    totalIncome: totalIncome
  }); 
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running smoothly at http://localhost:${PORT}`);
});