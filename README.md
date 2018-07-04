# Advanced Realtime TypeScript Node Starter 

This repository has been developed to provide a Node Typescript application workflow with support for sockets and much more.
The current verion is not ready yet. Community contributions and recommendations for improvements are encouraged and will be most welcome. 

# Getting Started 

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Prerequisites
To build and run this app locally you will need a few things:

### **Install Node.js**

This application is developed using Node.js version 8.9.4 or higher. To test your version of node:

```
npm --version
```
- Install [Node.js](https://nodejs.org/en/)

## **Choose your database platform**

Define your requirements depending on your needs. It's important to do a careful needs analysis before you dive in and commit to a database solution. Currently thsi application supports only a NoSQL solution with these strategies:

1. Local _MongoDB_ Databases only
2. Remote _MONGODB_ Databases only
3. Replication with a _local_ and _remote_ instance of [MongoDB](https://docs.mongodb.com/).

### a) Local MongoDB Instance

MongoDB is released as two editions: Community and Enterprise. Community is the open source release of MongoDB. Enterprise provides additional administration, authentication, and monitoring features. 

- Install [MongoDB](https://docs.mongodb.com/manual/installation/) server locally.

### b) Remote MongoDB Instance

This application supports connections over _Mongoose_ and _https_ with [MLAB](https://mlab.com/), a cloud based MongoDB platform. To get started with mLab, you must first create your free mLab account. When that’s complete, you can add as many database subscriptions as you want.
There is one restriction however: the free plan of MLAB does not support a production environment.

- Create a [MLAB](https://docs.mlab.com/) account.

### c) MongoDB Replication

A replica set in MongoDB is a group of mongod processes that maintain the same data set. Replica sets provide redundancy and high availability, and are the basis for all production deployments. 
This feature shall be implemented in August 2018.

## **Choose your authenticaton strategy**

This Node.js application uses Passport as its authentication middleware. by default the following Auth providers are supported: 

1. Google Auth
2. Facebook Auth
3. Local Authentication

**How does it work?**

By default a user object supports all authentication methods that are mentioned above. So for instance, a local user account can authenticate with Facebook or Google as long as the same email address is used for these providers. 
A user that registered with Google can authenticate with Facebook or vice versa. To enable local authentication the user needs to set a local password. 

This feature is enabled by yusing the following Mongoose subdocument:

```
const accounts = {
	googleID: { type:String, required:false },
	facebookID: { type:String, required:false },
	localID: { type:String, required:false }  	
};
```

## **Avalaible Strategies**

### a) Passport with Google Authentication

Use [Google's Developers console](https://console.developers.google.com/apis/dashboard ) to create your authentication credentials and a new project. For instructions please refer to this excellent [article](https://medium.com/@bogna.ka/integrating-google-oauth-with-express-application-f8a4a2cf3fee) on _medium.com_.
As soon as you have your credentials (applicationID, secret and callback Url) defined please edit environmental file **/env/.env.authentication**.

```
ENABLE_GOOGLE_AUTHENTICATION=true
GOOGLE_AUTH_ID=applicationID.apps.googleusercontent.com

## google auth scret
GOOGLE_AUTH_SECRET=yoursecretstring

## your google callback url
GOOGLE_CALLBACK_URL=/api/user/auth/google/callback
```

If you decide not to use Google Auth in your client application edit **/env/.env.authentication** and set ENABLE_GOOGLE_AUTHENTICATION to _false_.

```
ENABLE_GOOGLE_AUTHENTICATION=false
```

### b) Passport with Facebook Authentication

Use [Facebook's Developers Console](https://developers.facebook.com/) to create an Application ID, secret and defien your callback Url. 
As soon as you have your credentials (applicationID, secret and callback Url) defined please edit environmental file **/env/.env.authentication**.

```
ENABLE_FACEBOOK_AUTHENTICATION=true
FACEBOOK_ID=12345678910
FACEBOOK_SECRET=verysecretfacebookstring
FACEBOOK_CALLBACK_URL=/api/user/auth/facebook/callback
```

If you decide not to use Facebook Auth in your client application edit **/env/.env.authentication** and set ENABLE_FACEBOOK_AUTHENTICATION to _false_.

```
ENABLE_FACEBOOK_AUTHENTICATION=false
```

### c) Local Authentication

To use _local authentication_ please edit **/env/.env.authentication** and set ENABLE_LOCAL_AUTHENTICATION to _true_.

```
ENABLE_LOCAL_AUTHENTICATION=true
```
### More Authentication Utilities

To set a cookie after authentication edit **/env/.env.authentication** and set STORE_WEBTOKEN_AS_COOKIE to _true_.

```
STORE_WEBTOKEN_AS_COOKIE=true
```

## Project Structure
There are many ways to organize a Node.js project but always strive to produce clean code and the possibility of adding new features with ease. Please realize that this project does not have a GUI (graphical user interface) so you wont find a **views** folder. 

## Guidelines for an effective project folder structure


1. Organize your files around features, not roles: put components that call eachother in a nested folder structure as much as possible.
2. Don't add logic in your index.js file but only export functionality.
3. Put your test files in a seperate **test** folder next to your implementation to avoid confusion.
4. Place your configuration and/or environmental files in a seperate directory. For instance, if you are using [dotenv](https://www.npmjs.com/package/dotenv) to load environmental variables (process.env) it's a good practice to split your settings into feature based environmental files.
5. Create a new folder for your long scripts or bash scripts that4 can be called in package.json.
6. In any Typescript project you should use at least a seperate _source_ and _dist_ folder. Your _source_ folder contains your source code with TypeScript files (`.ts`). Your _dist_ folder contains the transpiled and compiled output, defaulting to a standards such as es6, es2017 or [ECMAScript](https://codeburst.io/javascript-wtf-is-es6-es8-es-2017-ecmascript-dca859e4821c)

Our Project folder structure:

> **Note!** The full folder structure is visible after `npm run build` and then  `npm run watch` in development mode. In a later stage we shall add webpack for fully automated distribution.



| Name                     | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **config**               | Contains cryptographic keys and certificates for your https configuration                     |
| **env**                  | Contains environment-specific files per application feature                                   |
| **private**              | Contains non-public files and directories                                                     |
| **private/datastore**    | Contains simple file-based feature db                                                         |
| **private/users**        | Contains private user images if you decide not to use AWS BitBuckets                          |
| **public**               | Contains public accessible static files and directories                                       |
| **public/assets**        | Contains public accessible HTML, scripts and styles                                           |
| **public/users**         | Contains public images if you decide not to use AWS BitBuckets                                |
| **dist**                 | Contains output from Typescript build, used for Continious Integration                        |
| **src**                  | Contains source code trans- and compiled to your dist directory                               |
| **src/config**           | Passport authentication strategies and login middleware. Add other complex config code here   |
| **src/apps**             | Forked Node.js applications or child processes written in plain JavaScript                    |
| **src/controllers**      | Defines functions or proxies that respond to http, socket or application system requests      |
| **/controllers/actions** | Defines Action identifiers per feature used in Controller Proxies                             |
| **/controllers/mail**    | Contains templates, interfaces and definitions for automated event based mailing.             |
| **/controllers/logging** | Contains definitions for Winston Event Logging                                                |
| **src/engines**          | Defines Mongoose Repositories for pre-defined Mongoose Models independent from hosts          |
| **src/routers**          | Defines functions that respond to feature based http requests                                 |
| **src/services/**        | A Service is a function class that supports API processing                                    |
| **src/services/data**    | Contains functions for Local DataStore                                                        |
| **src/services/db**      | Contains functions for local and remote DB Hosts                                              |
| **src/services/http**    | Contains functions for analysis of client devices or interfaces                               |
| **src/services/mail**    | Contains functions for automated generaton of email templates                                 |
| **src/services/state**   | Contains proxyservices to facilitate app component communications                             |
| **src/services/user**    | Contains functions for any User _Subtype_                                                     |
| **src/shared**           | Shared files used in services, controllers and routers                                        |
| **src/shared/auth**      | Passport authentication strategies: Facebook, Google and Local                                |
| **src/shared/helpers**   | Helper libraries for other application components                                             |
| **src/shared/interfaces**| TypeScript Duck types or structural subtypes                                                  |
| **src/shared/lib**       | Shared Class Wrappers                                                                         |
| **src/shared/models**    | Wrapper for Mongoose _Read_ and _Write_ repositories                                          |
| **src/shared/schemas**   | Mongoose Schemas                                                                              |
| **src/shared/types**     | Containes pre-defined types for features based pre-defined _interfaces_.                      |
| **src/util**             | Containes datastore, sncryption and security functions.                                       |
| **.nyc_output**          |                                                                                               |
| **coverage**             |                                                                                               |
| **logs**                 | Contains event logs (access, application, error, mail, tests                                  |
| **node_modules**         | Contains all your npm dependencies                                                            |
| **tests**                | Test directory: seperated from source because this is a different build process.              |
| **tests/integration**    | Contains application integration tests and associated build processes                         |
| **tests/unit**           | Contains application unit tests and associated build processes                                |

# Pre-defined User Account Types

This application predefines three categories of _user_ accounts to identify different _roles_ and _permissions_ per account category. These structured data types are defined internally but share Typescript interface definitions and Mongoose SubDocument Definitions. All user accounts are stored inside the **Users Database**.

## A **User subtypes**

The category Users defines roles and permissons for CMS management and internal operatoins.


##### - System User

The System User account is your fail safe when you can't access your application. When the application initializes the systemuser is confugured as a Cluster DB Admin and as the master user account. To set the credentials for this account edit environmental file _env/env.default_,

```
SYSTEM_ADMIN_FIRST_NAME=John
SYSTEM_ADMIN_LAST_NAME=Doe
SYSTEM_ADMIN_EMAIL=johndoe@example.com
SYSTEM_ADMIN_USER=johndoe@example.com
SYSTEM_ADMIN_PASSWORD=passwordtoospecial
```

##### - Admin

Account Admins are the administrators of the _Power Users_, _Authors_ and _Users_ accounts.  Admins can create, edit, and delete accounts (all user roles) and permissions (all user roles). 

##### - Power User

Power Users can set permissions for all user subtypes, clients and customers.

##### - Author

Authors can create, edit and delete articles.

##### - User

Users can comment on published articles.

## **Client**

This application defines a _client_ is an account type that provides services for or sells products to customers. 

## **Customer**

A _customer_ is an account type that purchases services or products from _clients_.



# System Events

Node.js is perfect for event-driven applications.This application has many event identifiers that are logged. To review pre-defined event identifiers please cobsult the [events document](docs/events.md)




