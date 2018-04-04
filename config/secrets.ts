import dotenv from "dotenv";

const ENV:string = process.env.NODE_ENV;

console.log("Appliocation Mode: ", ENV);

if (fs.existsSync(".env") && ENV==='dev') {
    console.log("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else  if (fs.existsSync(".env") && ENV==='production') {
    console.log("Using .env.example file to supply config environment variables");
    dotenv.config({ path: ".prod" });  // you can delete this after you create your own .env file!
}


/***
 * Export ENV as defined in package.json
 */
export const ENVIRONMENT = process.env.NODE_ENV;


