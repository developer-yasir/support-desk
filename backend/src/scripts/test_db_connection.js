import mongoose from 'mongoose';

const uri = "mongodb+srv://yasirraeesit_db_user:D1FR3txM3f2v4KE9@cluster0.4hi5hos.mongodb.net/support-desk?retryWrites=true&w=majority";

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ Successfully connected to MongoDB Atlas!');

        const dbName = mongoose.connection.name;
        console.log(`Connected to database: ${dbName}`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(c => console.log(` - ${c.name}`));

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error.message);
        process.exit(1);
    }
}

testConnection();
