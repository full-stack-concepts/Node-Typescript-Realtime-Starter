/*****
 * Wrapper class for socket.io
 * used on client and server 
 */

import {Observable, ReplaySubject} from "rxjs";

// error function to enable stack traces
// clientMessage property is send back to client
export function clientMessage(message:any) {
	const error:any = new Error(message);
	error.message = message;
	return error;
}

export class ObservableSocket {

	private _socket: any;
 	private _state:any = {};
 	private _actionCallbacks:any = {};

 	/***
 	 * Socket requests 
 	 */
 	private _requests:any = {}; 

 	/***
 	 * Counter for send socket requests
 	 */ 
	private _nextRequestID: number; // c
	public status$: any;	

	/***
	 * getters
	 */
 	get isConnected() { 
 		return this._state.isConnected; 
 	}

	get isReconnecting() { 
		return this._state.isReconnecting; 
	}

	get isTotallyDead() { 
		return !this.isConnected && !this.isReconnecting; 
	}

 	constructor(socket:any, done?:Function) {

 		this._socket = socket;
 		this._state = {};
 		this._actionCallbacks = {};
 		this._requests = {}; 
 		this._nextRequestID = 0; 

 		this.status$ = Observable.merge(
			this.on$("connect").map(() => ({ isConnected: true })),
			this.on$("disconnect").map(() => ({ isConnected: false })),
			this.on$("reconnecting").map( (attempt:any) => ({ isConnected: false, isReconnecting: true, attempt })),
			this.on$("reconnect_failed").map(() => ({ isConnected: false, isReconnecting: false }))
		)
		/***
		 * Ensure to always publish the latest socket event to all subscribers
		 */
		.publishReplay(1)
		.refCount();
			
		this.status$.subscribe( (state:any) => {			
			if(!state.isConnected) {
				// log state message
			}
			this._state = state
		});		
 	}

 	/****
 	 * Default Socket Event Wrappers
 	 * fromEvent: creates Observable sequence
 	 */ 	
	public on$(event:any) {
		return Observable.fromEvent(this._socket, event);
	}

	public on(event:any, callback:Function) {	
		this._socket.on(event, callback);
	}

	public off(event:any, callback:Function) {
		this._socket.off(event, callback);
	}

	public emit(event:any, arg:any) {
		this._socket.emit(event, arg);
	}

	// ---------------------------------------------------------------
	// CLIENT: emit emitAction$ returns Observable Sequence
	// --> needs two helper methods
	public emitAction$(action:any, arg:any):ReplaySubject<any> {

		const id:number = this._nextRequestID++;
		this._registerCallbacks(action);

		/* ************************************************************************************ 
		 * Rx ReplaySubject Class
		 *  Represents an object that is both an observable sequence as well as an observer. 
		 *  Each notification is broadcasted to all subscribed and future observers, 
		 *  subject to buffer trimming policies.
		 * 
		 **************************************************************************************/

		this._socket.emit( action, arg, id);
		const subject:any = this._requests[id] = new ReplaySubject(1);	
		
		return subject;
		
	}

	/***
	 * Register socket callbacks epr action event
	 */
	_registerCallbacks(action:any) {

		let request:any;	

		// return if we already have registered this action
		if( this._actionCallbacks.hasOwnProperty(action)) {			
			return;
		}

		this._socket.on(action, (arg:any, id:number) => {			
			
			request = this._popRequest(id);
			
			if(!request) return;

			// observable stream
			request.next(arg);
			request.complete();			
		});

		// error response from server		
		this._socket.on(`${action}:fail`, (arg:any, id:number) => {
			
			if(!request)
				return;

			// invoke error method on subject4
			request.error(arg);

		});

		this._actionCallbacks[action] = true;

	}

	_popRequest(id:number ) {

		/***
		 * error: Socket client receives answer from server 
		 * but did not initiate request with this ID
		 * or ID is unknown
		 */
		if(!this._requests.hasOwnProperty(id)) {
			console.error(`Event with ID ${id} was returned twice or server did not send an ID`);
			return;
		}

		const request:any = this._requests[id];

		delete this._requests[id];
		return request;
	}

	onAction(action:any, callback:Function) {

		this._socket.on(action, (arg:any, requestID:number) => {

			try {

				const value:any = callback(arg);

				/***
				 * Notify client that action has resolved but callback did not provide any data
				 */
				if(!value) {				
					this._socket.emit(action, null, requestID);
					return;
				}

				/*** 
				* if value is not an observable sequence
				*/
				if(typeof(value.subscribe) !== "function") {
					this._socket.emit(action, value, requestID);
					return;
				}

			
				let hasValue:boolean = false;				
				value.subscribe({
					next: (item:any) => {

						if(hasValue)
							throw new Error(`Action ${action} produced more than one value`);

						this._socket.emit(action, item, requestID);
						hasValue = true;
					},

					error: (error:any) => {
						this._emitError(action, requestID, error);					
					},

					complete: () => {
						if(!hasValue) {
							this._socket.emit(action, null, requestID);
						}
					}
				});


			} catch (error) {

				if(typeof(requestID ) !== 'undefined') {
					this._emitError(action, requestID, error );
				}

				// display stacktrace of error
				console.error(error.stack || error);
			}
		});	
	}

	/***
	 * Register multiple actions for same object
	 */
	onActions(actions:any) {
		for ( let action in actions) {

			if(!actions.hasOwnProperty (action) )
				continue;

			this.onAction(action, actions[action]);
		}
	}

	// helper function error handling
	_emitError(action:any, id:mumber, error:any) {

		// message defined on final thing that can be ran, this equals
		// if(error === null && error.clientMessage === null) { message = "Fatal Error";}
		const message = (error && error.clientMessage || "Fatal Error");
		this._socket.emit(`${action}:fail`, {message}, id);
	}
}