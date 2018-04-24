import randomNumber from "random-number";

import {IUser, IClient, ICustomer } from "../shared/interfaces";

interface IName  {
    givenName:string,
    middleName:string,
    familyName:string
}

export const sliceMe = (obj:any, prop:string, pos:number) => {
    return obj[prop].toString().slice(0, pos).trim().toLowerCase();
}

export const randomInt = (min:number, max:number):number => {
    return randomNumber({min:1001, max:8999, integer:true});
}

export const constructUserCredentials = (user:IUser, done:Function):any => {   

    let uPolicy:any = {
        'givenName': sliceMe( user.profile.personalia, 'givenName', 4),
        'familyName': sliceMe( user.profile.personalia, 'familyName', 5),
        'number': randomInt(1001, 3999)
    }

    return done({
        userName: `${uPolicy.givenName}${uPolicy.familyName}${uPolicy.number}`,
        url:  `${uPolicy.givenName}_${uPolicy.familyName}_${uPolicy.number}`
    });
}

export const constructProfileFullName = ( {givenName, middleName, familyName }:IName ):string => {
    let n:string = givenName;
    if(middleName) n+= ` ${middleName}`;
    if(familyName) n+= ` ${familyName}`;
    return n;
}

export const constructProfileSortName = ( {givenName, middleName, familyName }:IName ):string => {   
    return `${familyName}`;
}

export const validateInfrastructure = (user:IUser|IClient|ICustomer):Promise<boolean> => {
    return Promise.resolve(true);
}

export const validateUserIntegrity = (user:IUser|IClient|ICustomer):Promise<boolean> =>  {
    return Promise.resolve(true);
}


