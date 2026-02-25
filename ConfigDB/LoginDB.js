import {connect} from "mongoose";

const loginDB = async (loginDB) => {
    try {
        await connect (`mongodb://localhost:27017/${loginDB}`);
        console.log('Connected to LoginDB');
    }catch(err) {
        console.log('Error connecting to LoginDB:', err);
    }
}

export default loginDB;