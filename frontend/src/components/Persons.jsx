const Persons = ({persons, handleDelete}) => {
  return (
    <>
      {
        persons.map(({name, number,  id}) => {
          return (
            <div key={id}>
              {name} {number} <button data-note-id={id} onClick={handleDelete}>delete</button>
            </div>
          );
        })
      }
    </>
  );
}

export default Persons;