import express from 'express';
import { entries, generateId } from './data.js';
import morgan from 'morgan';
const app = express();

app.use(express.json());
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req,res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ');
}));

app.get('/api/persons/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const retrievedEntry = entries.find(entry => entry.id === id);

  if (!retrievedEntry) next();
  res.json(retrievedEntry);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = entries.findIndex(entry => entry.id === id);
  entries.splice(index, 1);
  res.status(204).send();
});

app.get('/api/persons', (req, res) => {
  res.json(entries);
});

app.post('/api/persons', (req, res) => {
  const entryAlreadyExist = entries.find(entry => entry.name === req.body.name);

  if (!req.body.name || !req.body.number) {
    res.status(400).json({
      Error: "Incomplete entry data"
    })
  } else if (entryAlreadyExist) {
    res.status(400).json({
      Error: "Name must be unique"
    })
  } else {
    const newEntry = {
      id: generateId(),
      name: req.body.name,
      number: req.body.number,
    };
  
    entries.push(newEntry);
    res.json({ ...newEntry, created: new Date().toString() });
  }
});

app.get('/info', (req, res) => {
  const retrieveDate = new Date().toString();
  const entriesCount = entries.length;
  res.send(`Phonebook has info for ${entriesCount} people\n${retrieveDate}`);
});

app.use((req, res) => {
  res.status(404).send('Entry not found');
})

const port = process.env.port || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));