import { expect } from 'chai';

interface DBUSER {
	user: string,
	password: string,
	host: string,		
	db: string, 
	port: number,
	type: number 
}



describe("First test with Mocha", () => {
    
    it("Should return ok", () => {        

        expect(true).to.equal(true);
    }); 
});