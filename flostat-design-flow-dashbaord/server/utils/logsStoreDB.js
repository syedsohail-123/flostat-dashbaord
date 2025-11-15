import { v4 as uuidv4} from "uuid"
import { LogsTableRepository } from "../models/Models.js";
export const storeLogInDB = async (data)=>{
    /**
     * data is an object of fields to store 
     *  
     * 
     */
    
    const entry = {...data};
    // entry["uuid"] = data.uuid;
    entry["updated_at"] = new Date().toISOString();
    console.log("Log entry: ",entry);
    const result = await LogsTableRepository.create(entry);
    console.log("db entry: ",result)
}