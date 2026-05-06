const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('posts')) {
      const collection = db.collection('posts');
      const indexes = await collection.indexes();
      
      // Find the bad text index
      const badIndex = indexes.find(idx => idx.name === 'title_text_tags_1' || idx.key.tags === 1);
      
      if (badIndex) {
        console.log(`Found bad index: ${badIndex.name}, dropping it...`);
        await collection.dropIndex(badIndex.name);
        console.log('Successfully dropped the bad index! Mongoose will automatically recreate the correct one.');
      } else {
        console.log('No bad index found. You are good to go!');
      }
    } else {
      console.log('Posts collection does not exist yet. No action needed.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

fixIndex();
