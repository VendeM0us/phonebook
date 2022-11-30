const Notification = ({ message }) => {
  if (!message) return;

  const notifColor = message.error ? 'red' : 'green';

  const notificationStyle = {
    backgroundColor: 'lightgray',
    border: `2px solid ${notifColor}`,
    borderRadius: 5,
    color: notifColor,
    padding: 10,
    margin: 10,
    fontSize: 24,
    fontWeight: 'bold'
  };

  return (
    <div className='notification' style={notificationStyle}>
      {message.message}
    </div>
  );
};

export default Notification;