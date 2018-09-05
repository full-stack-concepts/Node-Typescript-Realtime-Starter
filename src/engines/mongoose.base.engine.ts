import mongoose from 'mongoose';

import {     

    /****
     * Person Model Identifiers
     */
    PERSON_SUBTYPE_SYSTEM_USER,
    PERSON_SUBTYPE_USER,
    PERSON_SUBTYPE_CLIENT,
    PERSON_SUBTYPE_CUSTOMER,

    // Person Model related identifiers
    ADDRESS_TYPE   

} from "../util/secrets";


export class RepositoryBase<T extends mongoose.Document> {

    public PERSON_SUBTYPE_SYSTEM_USER: string = PERSON_SUBTYPE_USER;
    public PERSON_SUBTYPE_USER:string = PERSON_SUBTYPE_USER;
    public PERSON_SUBTYPE_CLIENT:string = PERSON_SUBTYPE_CLIENT;
    public PERSON_SUBTYPE_CUSTOMER:string = PERSON_SUBTYPE_CUSTOMER;

    public ADDRESS_TYPE:any = ADDRESS_TYPE;


}