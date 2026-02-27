import {connect} from "mongoose";

const UserDB = async (userDB) => {
    try {
        await connect (`mongodb://localhost:27017/${userDB}`);
        console.log('Connected to UserDB');
    }catch(err) {
        console.log('Error connecting to UserDB:', err);
    }
}

export default UserDB;