import { GraphQLScalarType, Kind } from 'graphql';

export const DateScalar = new GraphQLScalarType({
	name: 'Date',
  	parseLiteral: (ast:any) => {
    	if (ast.kind === Kind.INT) {
      		return parseInt(ast.value, 10);
    	}
    	return null;
	},
	parseValue: (value: string):Date => {
  		return new Date(value);
  	},
	serialize(value: string | Date): string {
    	return typeof value === 'string' ? value : value.toISOString();
  	},
});