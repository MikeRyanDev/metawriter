import poly from 'babel/polyfill';
import {expect} from './tests';
import Metawriter from './es6';

describe('es6 Metawriter', function(){
	let writer, Test, defaultValues, Another;

	beforeEach(function(){
		writer = new Metawriter('test');
		Test = class { };
		defaultValues = {
			a : 1,
			b : 2,
			c : 3,
			d : 4,
			e : 5
		};

		writer.set('a', 1, Test);
		writer.set('b', 2, Test);
		writer.set('c', 3, Test);

		Another = class extends Test{ };

		writer.set('d', 4, Another);
		writer.set('e', 5, Another);
	});

	it('should let you iterate over the metadata by exposing a generator', function(){
		for(let [key, value] of writer.getAll(Test)){
			defaultValues[key].should.be.defined;
			defaultValues[key].should.eql(value);
			key.should.not.eql('d');
			key.should.not.eql('e');
		}
	});

	it('should let you iterate over all local keys and values by exposing a generator', function(){
		for(let [key, val] of writer.getAllOwn(Another)){
			defaultValues[key].should.be.defined;
			defaultValues[key].should.eql(val);
			key.should.not.eql('a');
			key.should.not.eql('b');
			key.should.not.eql('c');
		}
	});
});