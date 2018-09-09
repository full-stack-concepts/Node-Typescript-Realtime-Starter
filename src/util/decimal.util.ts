
/***
 * Export Class Decimals
 * Use for handling floats with different precisions
 */

export class D {

	/***
	 * Get precision of floating point number
	 * @n: number | string
	 */
	public static getPrecision(n:any):number {
		
		const l = n.toString().split('.')[1];
		if(l) {
			return l.length;
		} else {
			return 0;
		}
	}

	/***
	 * Parse number to floating point number
	 */
	private static toFloat(n:number, precision:number) {	
		return parseFloat(
			// @ts-ignore
			parseFloat( n / Math.pow(10, precision))
		);	
	}

	/***
	 * Convert number to decimal
	 */
	public static makeDecimal(n:number, precision:number):number {	
		let i:number = n * Math.pow(10, precision);
		if(i.toString().indexOf('.') > -1)  i = Math.round(i);	
    	return D.toFloat(i, precision);
	}

	/***
	 * Convert number to currency string with precision 2
	 */
	public static toCurrencyString(n:number):string {
		return D.makeDecimal(n,2).toFixed(2);
	}

	/***
	 * Test if variable is a floating point number
	 */
	public static isFloat(n:any):boolean {
    	return Number(n) === n && n % 1 !== 0;
	}

	/***
	 *
	 */
	public static divide(x:number, y:number) {

		const p:number = Math.max(D.getPrecision(x), D.getPrecision(y));
		x = D.makeDecimal(x, p);
		y = D.makeDecimal(y, p);
		return D.makeDecimal((x/y), p);	
	}
 
	/***
	 *
	 */
	public static multiply(x:number, y:number) {	
		
		const p:number = Math.max(D.getPrecision(x), D.getPrecision(y));
		x = D.makeDecimal(x, p);
		y = D.makeDecimal(y, p);
		return D.makeDecimal((x*y), p);		
	}

	
}