import express from 'express';
import cors from 'cors';
import Person from './models/person.js';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

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

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const foundPerson = await Person.findById(req.params.id);
    foundPerson ? res.json(foundPerson) : next();
  } catch (e) {
    next(e);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  const body = req.body;
  const updateObj = {
    name: body.name,
    number: body.number,
  };

  try {
    const updatePerson = await Person.findByIdAndUpdate(
      req.params.id, 
      updateObj, 
      { new: true, runValidators: true, context: 'query' });
    updatePerson ? res.json(updatePerson) : next();
  } catch (e) {
    next(e);
  }
})

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

app.get('/api/persons', async (req, res) => {
  const data = await Person.find({});
  res.json(data);
});

app.post('/api/persons', async (req, res, next) => {
  const body = req.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  try {
    const personExist = await Person.findOne({ name: body.name });

    if (personExist) {
      console.log('person exists');
      const id = personExist.id;
      const updatedPerson = await Person.findByIdAndUpdate(id, 
        { number: body.number },
        { new: true, runValidators: true, context: 'query' });
      res.json(updatedPerson);
    } else {
      const newPerson = await person.save();
      res.status(201).json(newPerson);
    }
  } catch (e) {
    next(e);
  }
});

app.get('/info', async (req, res) => {
  const retrieveDate = new Date().toString();
  const entriesCount = await Person.estimatedDocumentCount();
  res.send(`Phonebook has info for ${entriesCount} people\n${retrieveDate}`);
});

app.use((req, res) => {
  res.status(404).send('Entry not found');
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'malformatted id' });
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
  }

  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    status: 500
  })
});

const port = process.env.port || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));