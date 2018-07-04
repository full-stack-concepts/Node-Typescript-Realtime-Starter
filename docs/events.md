# **Event identifiers**

An event identifier is a numerical value associated with a (system event)

## System Events


### (1) Bootstrap Events 

The following depictoin provides a high level overview of the initialization and bootstrap process within this Node.js and its forked or spawned child applicaions.

| Event                    | ID      | Description | Logged |
| ------------------------ | ------- | --------------------------------------------------------------------- | ------- |
| Express Server listening | **1**   | HTTP/HTTPS Server ready                                               | false   |
| Redis Controller Ready   | **1000**| Redis Controller connected to local instance or Provider              | true    |
| UA Controller Build      | **1001**| User Actions functions can be invoked throuh proxy                    | true    |
| DA Controller Build      | **1002**| Data Action functoins can be called through proxy                     | true    |
| Redis Client Ready       | **1003**| Redis Client propagated to Mongoose Repositories                      | true    |
| UA Controller ready      | **1004**| Listeners can subscribe to User Action Proxy                          | true    |
| DA Controller ready      | **1005**| Listeners can subscribe to Data Action Proxy                          | true    |
| DB Configuration         | **1006**| DB configured with predefined users and designated roles              | true    |
| Infrastructure           | **1007**| Public and private directories have been configured.                  | true    |
| User Database Live       | **1008**| Users Database is ready to perform queries                            | true    |
| Product Database Live    | **1009**| Products Database is ready to perform queries                         | true    |
| Express Controller Ready | **1010**| Express middleware configured for cookies, compression, headers etc   | true    |
| System User Ready        | **1011**| System User created according settings in _env.default_ file          | true    |
| Client RW Model Ready    | **1012**| DB Client ReadWrite Model has initialized                             | true    |
| Client R Model ready     | **1013**| DB Client Read Only Model has initialized                             | true    |
| Customer RW Model ready  | **1014**| DB Customer ReadWrite Model has initialized                           | true    |
| Customer R Model ready   | **1015**| DB Customer Read Model has initialized                                | true    |
| SystemUser RW Model ready| **1016**| DB SystemUser ReadWrite Model has initialized                         | true    |
| User RW Model ready      | **1017**| DB User ReadWrite Model has initialized                               | true    |
| User RW Model ready      | **1018**| DB User Read Only Model has initialized                               | true    |
| Mail Controller ready    | **1019**| Mail Controller proxy has initialized                                 | true    |
| SMTP Config Verified     | **1020**| SMTP Configuration Email Provider has been verified.                  | true    |


 










