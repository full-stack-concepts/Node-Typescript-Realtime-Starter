import socketIO from "socket.io";
import { Observable} from "rxjs/Observable";
import { Subscription} from "rxjs/Subscription";

// has no @types/file
const socketioJwt=require("socketio-jwt");

import {  ObservableSocket } from "./../shared/lib/";
import {  DefaultOnlineController } from "./online";


import {
	readPrivateKeyForTokenAuthentication
} from "../util";

class OnlineController {

	/****
	 * IO Objct
	 */	
	private io:any;

	/****
	 *
	 */
	private IO_Observable:Observable<any>;

	/****
	 *
	 */
	private IO_Subscription:Subscription;

	/***
	 * Online Controllers
	 */
	usersController:DefaultOnlineController;
	productsController:DefaultOnlineController;
	salesController:DefaultOnlineController;	
	settingsController:DefaultOnlineController;
	imagesController:DefaultOnlineController;

	/*
	 * Register Online controllers in a single array so
	 * we can register and remove sockets per manager
	 */
	onlineControllers:any=[];

	public init(server:any) {	

		/****
		 * launch SOCKET.IO Server	
		 */
		this.io = socketIO(server);

		// process thick: configure controllers
		this.configureControllers()

		// process thick: configure sockets
		.then( () => this.initOnlineAuthentication() )
	}

	private _exit(err:Error) {
		console.error("Online Controller: criticial error ");
		process.exit(1);
	}

	private configureControllers():Promise<void> {

		let err:Error;

		try {

			/*****
			 * Register our Management Store instances
			 * Then wrap them in our observable class
			 */
			this.onlineControllers = [			
			];	

			/*****
			 * Monitor onLinemodule initialization 
			 * and stop executing on critical error*/	
			Observable.merge(
				...this.onlineControllers.map( 
					(c:DefaultOnlineController) => 
						c.init$()
					)
			)
			.subscribe({
				complete() {},
				error(error:any) {
					console.error(`Could not init module ${error.stack} || error`);
					this.exit(1);
				}
			}); 

			/****
			 * Create Observable Sequence 
			 * update registered online controlelrs on change events in socket store		
			 */		
			this.IO_Observable = Observable.merge(
				...this.onlineControllers.map( 
					(c:DefaultOnlineController) => 
						c.updateIO$(this.io)
					)
				);

		} catch (e) {err=e;} 

		finally {
			if(err) this._exit(err);
			if(!err) return Promise.resolve();
		}	
	}

	/******
	 * Configure incoming sockets for JSON Web Token (JWT) authentication
	 * with JWT you do not need session management or store session state
	 */

	private initOnlineAuthentication():Promise<void>{

		const PRIVATE_KEY = readPrivateKeyForTokenAuthentication();

		/****
		 * Initialize Socket IO Token Authentication
		 */
		this.io.on('connection', socketioJwt.authorize({
			secret: PRIVATE_KEY,
			timeout: 10000 // 15 seconds to send authentication message
		}))

		/*
		 * On Authorizatoni of client web token
		 * (1) get decoded serialized user object from cert
		 * (2) push it to client user service
		 */
		.on('authenticated', (socket:any) => {

			/****
			 *  Find associated user 
			 */	
			const decodedToken:string = socket.decoded_token;

			/****
			 * Wrap socket in observable class & update managers
			 */
			const client:ObservableSocket = new ObservableSocket(socket);	

			/**** 
			 * Register <client> per controller
			 */
			this._injectClient(client, socket);			

			// handle disconnect event		
			socket.on('disconnect', () => this._disconnect(socket) );

		});		

		return Promise.resolve();
	}

	/****
	 * Update online controllers per socket connection event
	 */
	private _injectClient(client:ObservableSocket, socket:any):void {

		/****
		 * Register Client with each online controller
		 */
		this.onlineControllers.forEach( (c:DefaultOnlineController) => 
			c.registerClient( this.io, client, socket) 
		);

		/****
		 * 
		 */
		this.onlineControllers.forEach( (c:DefaultOnlineController) => 
			c.clientRegistered( this.io, client, socket) 
		);
	}

	/****
	 * On socket disconnect event
	 */
	private _disconnect(socket:any):void {
	}
}

export const onlineController = new OnlineController();