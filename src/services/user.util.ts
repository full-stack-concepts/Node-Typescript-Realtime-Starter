import {IUser} from "../shared/interfaces";

const sliceMe = (obj:any, prop:string, pos:number) => {
    return obj[prop].toString().slice(0, pos).trim().toLowerCase();
}

const randomInt = ():number => {
    return Math.random()*101|0;
}

export const constructUserCredentials = (user:IUser, done:Function):any => {   

    let uPolicy:any = {
        'firstName': sliceMe( user.profile.personalia, 'firstName', 4),
        'lastName': sliceMe( user.profile.personalia, 'lastName', 5),
        'number': randomInt()
    }

    return done({
        userName: `${uPolicy.firstName}${uPolicy.lastName}${uPolicy.number}`,
        url:  `${uPolicy.firstName}_${uPolicy.lastName}_${uPolicy.number}`
    });
}

    	