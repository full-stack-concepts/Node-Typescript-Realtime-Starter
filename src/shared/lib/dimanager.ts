
interface DI_Container {
    modules: any,
    register: any,
    get: any,
    registerClass:Function,
    _isClassNameProvided:Function,
    _isClassNameRegistered:Function,
    _testFactory:Function,
    _registerClassAsModule:Function,
    _getRegisteredModule:Function,
    _testModuleConfig:Function,
    _getModuleDependencies:Function,
    _isClass:Function,
    startModule:Function,
    getModule:Function,
    inject:Function
}

interface IModule {
    name?:string,
    dependencies?:any[],
    factory?: any,
    instance?:any,
    started?: boolean
}

/***
 * NodeJs Dependencies Injection Manager
 */
const _Container:DI_Container = {   

    /***
     * Registered modules
     */
    modules: [],  

    // alisases
    register: this.registerClass,
    get: this.getModule,    

    /*****
     * Register any exported application module
     */
    registerClass:  ( _className:string, dependencies:any, factory:any) => {

        let className:any = _className.toString();      
       
        Container._isClassNameProvided(className);
        Container._isClassNameRegistered(className);     
        Container._testFactory(className, dependencies, factory);

        /***
         * Create module object
         */
        let module:any = Container._registerClassAsModule(className, dependencies, factory);     

        /***
         * Register module object
         */
        Container.modules[className] = module;

        /***
         * Start Module
         */
        Container.startModule(className);     

        return this;
    },

    _isClassNameProvided(className:any) {
        if( !className)   
            throw new Error('=> Please provide a Class when registering an application module!');
    },

    _isClassNameRegistered: (className:any) => {

        if(Container.modules[className] !== undefined) 
             throw new Error('=> Class Name is already registered');
    },

    /*
     * Rewrite this later
     */
    _testFactory(className:string, dependencies:Array<any>, factory: string | boolean | Object | Function | Array<any>) {          
       
    },

    _registerClassAsModule(className:string, dependencies:any, factory:any) {

        let module:IModule = {
            name: className.toString(),
            dependencies: dependencies,
            factory: factory,
            instance: null,
            started: false
        }
        
        return module;
    },

    startModule: (moduleName:any, callback?:any) => {   

        let instance,
        moduleDef = Container._getRegisteredModule(moduleName);        

        Container._testModuleConfig(moduleDef);

        /***
         * Return instance if module was started previously
         */
        if(moduleDef.started)
            return moduleDef.instance;

        /***
         * Start module (create instance)
         */
        instance = Container.getModule(moduleName);           

        if(!instance){
            throw new Error('Class ' + moduleName + ' failed to be instantiated');
        }       

        /*** 
         * Prototype Service instance and try to execute default test function
         */
        let err;
        try {        
            instance.prototype.startThisService = () => {
                // #TODO Log error Message
            }
            instance.startThisService();

        } catch (e) {
            err = e;
        } finally {
            if(!err) {

                moduleDef.started=true;
                moduleDef.instance= instance;

                // now update array
                delete Container.modules[moduleName];

                Container.modules[moduleName] = moduleDef;
            }
        }
    },   

    _getRegisteredModule(moduleName:any) {  

        let moduleDef:any = Container.modules[moduleName];
         if(!moduleDef)
            throw new Error('ES2015 class ' + moduleName + ' is not registered');       

        return moduleDef;
    },

    _testModuleConfig(moduleDef:any) {   
        if( !moduleDef.hasOwnProperty('instance') || !moduleDef.hasOwnProperty('started') )
            throw new Error('=> DI Error: ' + moduleDef+ ' has corrupted configuration!'); 
    },

    getModule: function(moduleName:string) {      

        let moduleDef:any = Container._getRegisteredModule(moduleName),
            moduleDependencies:any = Container._getModuleDependencies(moduleDef);

        if(!moduleDef.instance) {

             moduleDependencies.unshift(null);

             // create instance and prototype
             moduleDef.instance = new (
                Function.prototype.bind.apply(
                    moduleDef.factory, 
                    moduleDependencies)
             );

            moduleDef.instance.prototype = moduleDef.factory.prototype;
        }

        return moduleDef.instance;                    
    },

    _isClass: (factory:any) => {       
        return typeof factory === 'function' || /^class\s/.test(factory.toString()+'');
    },

    _getModuleDependencies(moduleDef:any) {
        if( !moduleDef.hasOwnProperty('dependencies') || 
            !Array.isArray(moduleDef.dependencies) )
                return [];

        return moduleDef.dependencies;
    },

    inject(name:string, done:Function) {
        let instance = Container.getModule(name);
        return instance;       
    }
}

export const Container = _Container;

