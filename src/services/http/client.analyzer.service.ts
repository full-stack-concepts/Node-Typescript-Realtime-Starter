/* Analyser: module that examines incoming client request */
import Promise from "bluebird";
import { Request, Response } from 'express';


/*********************************
 * Mobile-Detect
 * mobile or not
 * if mobile, whether phone or tablet
 * operating system
 * Mobile Grade (A, B, C)
 * specific versions (e.g. WebKit)
 */
const MobileDetect  = require('mobile-detect');

/*********************************
 * Container provides data
 * for analyzinf client
 */
const settings:any = {
	"analyse": {
		"keys" : ["iPad", "NexusTablet", "SamsungTablet", "Kindle", "SurfaceTablet", "HPTablet", "AsusTablet", "BlackBerryTablet", "HTCtablet", "MotorolaTablet", "NookTablet", "AcerTablet", "ToshibaTablet", "LGTablet", "FujitsuTablet", "PrestigioTablet", "LenovoTablet", "YarvikTablet", "MedionTablet", "ArnovaTablet", "IntensoTablet", "IRUTablet", "MegafonTablet", "EbodaTablet", "AllViewTablet", "ArchosTablet", "AinolTablet", "SonyTablet", "CubeTablet", "CobyTablet", "MIDTablet", "SMiTTablet", "RockChipTablet", "FlyTablet", "bqTablet", "HuaweiTablet", "NecTablet", "PantechTablet", "BronchoTablet", "VersusTablet", "ZyncTablet", "PositivoTablet", "NabiTablet", "KoboTablet", "DanewTablet", "TexetTablet", "PlaystationTablet", "TrekstorTablet", "PyleAudioTablet", "AdvanTablet", "DanyTechTablet", "GalapadTablet", "MicromaxTablet", "KarbonnTablet", "AllFineTablet", "PROSCANTablet", "YONESTablet", "ChangJiaTablet", "GUTablet", "PointOfViewTablet", "OvermaxTablet", "HCLTablet", "DPSTablet", "VistureTablet", "CrestaTablet", "MediatekTablet", "ConcordeTablet", "GoCleverTablet", "ModecomTablet", "VoninoTablet", "ECSTablet", "StorexTablet", "VodafoneTablet", "EssentielBTablet", "RossMoorTablet", "iMobileTablet", "TolinoTablet", "AudioSonicTablet", "AMPETablet", "SkkTablet", "TecnoTablet", "JXDTablet", "iJoyTablet", "Hudl", "TelstraTablet", "GenericTablet", "iPhone", "BlackBerry", "HTC", "Nexus", "Dell", "Motorola", "Samsung", "LG", "Sony", "Asus", "Micromax", "Palm", "Vertu", "Pantech", "Fly", "iMobile", "SimValley", "GenericPhone", "AndroidOS", "BlackBerryOS", "PalmOS", "SymbianOS", "WindowsMobileOS", "WindowsPhoneOS", "iOS", "MeeGoOS", "MaemoOS", "JavaOS", "webOS", "badaOS", "BREWOS", "Chrome", "Dolfin", "Opera", "Skyfire", "IE", "Firefox", "Bolt", "TeaShark", "Blazer", "Safari", "Tizen", "UCBrowser", "DiigoBrowser", "Puffin", "Mercury", "GenericBrowser", "DesktopMode", "TV", "WebKit", "Bot", "MobileBot", "Console", "Watch"],
		"versionKeys" : ["Mobile", "Build", "Version", "VendorID", "iPad", "iPhone", "iPod", "Kindle", "Chrome", "Coast", "Dolfin", "Firefox", "Fennec", "IE", "NetFront", "NokiaBrowser", "Opera", "Opera Mini", "Opera Mobi", "UC Browser", "MQQBrowser", "MicroMessenger", "Safari", "Skyfire", "Tizen", "Webkit", "Gecko", "Trident", "Presto", "iOS", "Android", "BlackBerry", "BREW", "Java", "Windows Phone OS", "Windows Phone", "Windows CE", "Windows NT", "Symbian", "webOS"]
	}
}

interface OSInfo {
	android: string,
	iOS: string,
	iPhone: boolean,
	iPad: boolean,
	webOS: string,
	mac: any,
	windows: string;
}


export class ClientAnalyzerService {

	// instance of Mobile Detect module
	mD:any;

	mobile:string;
	phone:string;
	tablet:string;
	mobileGrade:string;
	userAgent:string;
	ip:any;
	os:string;  
	isIPhone:boolean;
	isBot:boolean;
	webkit: string;
	viewport:number;  

	osInfo:OSInfo;
			
	constructor() {		
	}

	private __getIPAddress(req:Request) {
		return req.headers['x-forwarded-for'] || req.connection.remoteAddress;					
	}

	private _initSequence():Promise<any> {
		return new Promise( ( resolve, reject) => { resolve(); });
	}

	private __defineViewPort():number {

		let viewport:number;		
		  
		if(this.mobile) {  viewport = 1; }		
		else if (!this.mobile && this.tablet) { viewport = 2;} 	
		else { viewport = 3; }	
		
		return viewport;	
	}	

	private __getOsInfo(ua:any) {		

		let $:OSInfo= {
			android: null,
			iOS: null,   
			iPhone: null,
			iPad: null,
			webOS: null,  
			mac: null,
			windows: null
		}

		if (/Android/.test(ua)) {
		 	$.android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];
		}		

		if (/like Mac OS X/.test(ua)) {
		    $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
		    $.iPhone = /iPhone/.test(ua);
		    $.iPad = /iPad/.test(ua);
		}

		if (/webOS\//.test(ua)) {
		    $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];
		}		

		if (/(Intel|PPC) Mac OS X/.test(ua)) {
			$.mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;
		}

		if (/Windows NT/.test(ua)) {			
			var windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];			
			$.windows = windows;			  
		}

		return $;
	}

	private _getClientConfig(req:Request):Promise<any> {	

		var err:Error;
		try {

			this.mD = new MobileDetect(req.headers['user-agent']);

			// test if client is mobile
			if(this.mD.mobile()) { this.mobile = this.mD.mobile(); }

			// test if client is phone
			if(this.mD.phone()) { this.phone = this.mD.phone(); }

			// test if client is tablet
			if(this.mD.tablet) { this.tablet = this.mD.tablet(); }				

			// test fro jQuery
			if(this.mD.mobileGrade()) { this.mobileGrade = this.mD.mobileGrade(); }

			// operating system version;
			if(this.mD.os()) { this.os = this.mD.os(); }

 			// test ip address
 			this.ip = this.__getIPAddress(req);

 			// define viewport of client 		
 			this.viewport = this.__defineViewPort(); 		
		}

		catch(e) { err=e;}
		finally {
			return new Promise ( (resolve, reject) => {
				(err) ? reject(err):resolve();				
			});			
		}
	}  

	private _buildResponseObject(osInfo:any) {

		this.osInfo = osInfo;		
		return {
			'mobile': this.mobile,
			'phone': this.phone,
			'tablet': this.tablet,
			'os': this.os,
			'ip': this.ip,
			'viewport': this.viewport,
			'osInfo': this.osInfo
		}		
	}

	private analyseHeader(req:Request, res:Response) {
		
		const keys = settings.analyse.keys;
		const versionKeys = settings.analyse.versionKeys;

		return this._initSequence()
		.then( () => this._getClientConfig(req) )
		.then( () => this.__getOsInfo( req.headers['user-agent'] ) )
		.then( (osInfo:any) => this._buildResponseObject(osInfo) )
		.then( (info:any) => Promise.resolve(info) )
		.catch( (err) => Promise.reject(err) );
	
	}			

	/* Public interface */
	public analyse(req:Request, res:Response) {
		return this.analyseHeader(req, res) 
		.then( (info:any) => Promise.resolve(info) )
		.catch( (err) => Promise.reject(err) );		
	}
}

export const clientDetectionService = new ClientAnalyzerService();



