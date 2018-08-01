const { GraphQLScalarType } = require('graphql');
const { INT } = require('graphql/language/kinds');

const MAX_INT = Number.MAX_SAFE_INTEGER;
const MIN_INT = Number.MIN_SAFE_INTEGER;


const coerceBigInt = (value:any) => {

	if (value === "") {
    	throw new TypeError('BigInt cannot represent non 53-bit signed integer value: (empty string)')
  	}
  
  	const num:number = Number(value)
  	if (num !== num || num > MAX_INT || num < MIN_INT) {
    	throw new TypeError("BigInt cannot represent non 53-bit signed integer value: " + String(value) );
  	}
  
  	const int:number = Math.floor(num);
  	if (int !== num) {
    	throw new TypeError("BigInt cannot represent non-integer value: " + String(value) )
  	}
  	return int;
}



export const BigIntegerScalar = new GraphQLScalarType({
  	name: 'BigIntegerType',
  	description:
    	'The `BigInt` scalar type represents non-fractional signed whole numeric ' +
    	'values. BigInt can represent values between -(2^53) + 1 and 2^53 - 1. ',
	serialize: coerceBigInt,
  	parseValue: coerceBigInt,
  	parseLiteral(ast:any) {
    	if (ast.kind === INT) {
      		const num:number = parseInt(ast.value, 10)
      		if (num <= MAX_INT && num >= MIN_INT) {
        		return num;
      		}
    	}
    	return null;
  	}
});