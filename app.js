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
    console.error(e);

    e.status = 400;
    e.message = 'Malformatted id';
    next(e);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  try {
    const updatePerson = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    updatePerson ? res.json(updatePerson) : next();
  } catch (e) {
    e.status = 400;
    console.error(e);
    
    e.status = 400;
    e.message = 'Malformatted id';
    next(e);
  }
})

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    
    e.status = 400;
    e.message = 'Malformatted id';
    next(e);
  }
});

app.get('/api/persons', async (req, res) => {
  const data = await Person.find({});
  res.json(data);
});

app.post('/api/persons', async (req, res) => {
  const newName = req.body.name;
  const newNum = req.body.number;
  const nameAlreadyExist = await Person.findOne({name: newName});

  if (!newName || !newNum) {
    res.status(400).json({
      error: "Incomplete request body data (400)"
    })
  } else if (nameAlreadyExist) {
    const id = nameAlreadyExist.id;
    const updatedPerson = await Person.findByIdAndUpdate(id, { number: newNum }, { new: true });
    res.json(updatedPerson);
  } else {
    const newPerson = new Person({
      name: newName,
      number: newNum
    })

    const createdPerson = await newPerson.save();
    res.status(201).json(createdPerson);
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
  const status = err.status || 500;

  res.status(status).json({
    error: err.message,
    status: status
  })
});

const port = process.env.port || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));