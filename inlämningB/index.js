const fs = require('fs');

const _ = require('underscore');

const express = require('express');
const app = express();

app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get('/data/highscores', (req, res) => {

    let rawScores = fs.readFileSync('./data/highscores.json');
    let highscoresArray = JSON.parse(rawScores);
    
    // Sort the highscore data in descending order based on the score 
    highscoresArray = _.sortBy(highscoresArray, score => -score.score);
  
    res.send(highscoresArray);
  });

  app.post('/data/highscores', (req, res) => {
   
    const {name, score} = (req.body);
    let rawScores = fs.readFileSync('./data/highscores.json');
    let highscoresArray = JSON.parse(rawScores);
  
    highscoresArray.push({ name, score });
  
    highscoresArray = _.sortBy(highscoresArray, score => -score.score);
    highscoresArray = highscoresArray.slice(0, 5);
  
    fs.writeFileSync('./data/highscores.json', JSON.stringify(highscoresArray));
  
    res.setHeader('Content-Type', 'application/json');
    res.send({ message: `High score added for ${name}!` });
  });


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

