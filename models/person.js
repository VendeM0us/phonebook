import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URI;
mongoose.connect(url)
  .then(() => console.log('connected to MongoDB'))
  .catch(e => console.error('Failed MongoDB connection: ', e));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be atleast 3 characters long'],
    required: [true, 'Name required']
  },
  number: {
    type: String,
    validate: {
      validator: v => /^\d{2,3}-\d{4,}$/.test(v),
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Person', personSchema);