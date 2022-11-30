import { useEffect, useState } from 'react';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';
import Notification from './components/Notification';
import phonebookServer from './server/handleRecords';

function App() {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filterWord, setFilterWord] = useState('');
  const [message, setMessage] = useState(null);

  const getRecords = () => {
    const eventHandler = records => setPersons(records);
    phonebookServer
      .getAll()
      .then(eventHandler);
  };
  useEffect(getRecords, []);

  const handleNewName = (event) => setNewName(event.target.value);
  const handleNewNumber = (event) => setNewNumber(event.target.value);

  const clearInput = () => {
    setNewName('');
    setNewNumber('');
  };

  const clearNotif = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  const addPerson = (event) => {
    event.preventDefault();
    const personExist = persons.find(person => person.name === newName);

    if (personExist) {
      const shouldUpdateRecord = window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`);

      if (shouldUpdateRecord) {
        const updateRecord = { ...personExist, number: newNumber };

        phonebookServer
          .updateRecord(updateRecord.id, updateRecord)
          .then(updatedRecord => {
            setMessage({
              message: `Updated ${updatedRecord.name}`,
              error: false
            });
            clearNotif();
            setPersons(persons.map(p => p.id !== updatedRecord.id ? p : updatedRecord));
            clearInput();
          })
          .catch(e => {
            console.log(e.response.data.error);
            setMessage({
              message: e.response.data.error,
              error: true
            });
            clearNotif();
            getRecords();
            clearInput();
          });
      }
    } else {
      const newPerson = {
        name: newName,
        number: newNumber,
      };

      phonebookServer
        .create(newPerson)
        .then(createdRecord => {
          setPersons(persons.concat(createdRecord));
          setMessage({
            message: `Added ${createdRecord.name}`,
            error: false
          });
          clearNotif();
          clearInput();
        })
        .catch(e => {
          console.log(e.response.data.error);
          setMessage({
            message: e.response.data.error,
            error: true
          });
          clearNotif();
          clearInput();
        });
    }
  };

  const handleDelete = event => {
    const id = event.target.dataset.noteId;
    const person = persons.find(p => p.id === id);
    const confirmDelete = window.confirm(`Delete ${person.name}?`);

    if (confirmDelete) {
      phonebookServer
        .deleteRecord(id)
        .then(() => {
          setMessage({
            message: `Successfully deleted: ${person.name}`,
            error: false
          });
          clearNotif();
          setPersons(persons.filter(p => p.id !== id));
        });
    }
  };

  const handleFilterWord = (event) => setFilterWord(event.target.value);
  const filteredPersons = persons.filter(person => {
    return person.name.toLowerCase().includes(filterWord.toLowerCase());
  });

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter filter={filterWord} handleFilter={handleFilterWord} />

      <h3>add a new</h3>
      <PersonForm {
        ...{
          onSubmit: addPerson,
          newName: newName,
          handleNewName: handleNewName,
          newNumber: newNumber,
          handleNewNumber: handleNewNumber,
        }
      } />

      <h3>Numbers</h3>
      <Persons persons={filteredPersons} handleDelete={handleDelete} />
    </div>
  );
}

export default App;
