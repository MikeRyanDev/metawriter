import Metawriter from './metawriter';
import {expect, sinon} from './tests';

describe('Metawriter', function(){
	let parent, child, Test;

	beforeEach(function(){
		parent = new Metawriter('parent');
		child = new Metawriter('child', parent);

		Test = class{
			someProp = 'abcd';

			someMethod(){ }

			static someStaticProp = 'qwer';

			static someStaticMethod(){ }
		}
	});

	it('should let you create a new metawriter with a provided namespace', function(){
		parent.should.be.defined;
		parent.namespace.should.eql('parent');
	});

	it('should let you create a descendent metawriter using a parent writer', function(){
		child.namespace.should.eql('parent:child')
	});

	describe('writing metadata', function(){
		it('should let you write metadata to a class', function(){
			parent.set('exampleKey', 'testValue', Test);
			parent.has('exampleKey', Test).should.be.ok;
			parent.get('exampleKey', Test).should.eql('testValue');
		});

		it('should let you write metadata to a key', function(){
			parent.set('exampleKey', 'testValue', Test, 'someStaticProp');
			parent.set('anotherKey', 'anotherTest', Test, 'someStaticMethod');

			parent.has('exampleKey', Test, 'someStaticProp').should.be.ok;
			parent.get('exampleKey', Test, 'someStaticProp').should.eql('testValue');
			parent.has('anotherKey', Test, 'someStaticMethod').should.be.ok;
			parent.get('anotherKey', Test, 'someStaticMethod').should.eql('anotherTest');
		});

		it('should let you write metadata to a key on the prototype', function(){
			parent.set('exampleKey', 'testValue', Test.prototype, 'someProp');
			parent.set('anotherKey', 'anotherTest', Test.prototype, 'someMethod');

			parent.has('exampleKey', Test.prototype, 'someProp').should.be.ok;
			parent.get('exampleKey', Test.prototype, 'someProp').should.eql('testValue');
			parent.has('anotherKey', Test.prototype, 'someMethod').should.be.ok;
			parent.get('anotherKey', Test.prototype, 'someMethod').should.eql('anotherTest');
		});
	});

	describe('checking for metadata', function(){
		let Another;

		beforeEach(() => Another = class extends Test{ });

		it('should return true if the key exists in the metadata', function(){
			parent.set('exampleKey', 'testValue', Test);

			parent.has('exampleKey', Test).should.be.ok;
			parent.has('exampleKey', Another).should.be.ok;
		});

		it('should return false if the key does not exist in the metadata', function(){
			parent.has('sampleKey', Test).should.not.be.ok;
			parent.has('sampleKey', Another).should.not.be.ok;
		});

		it('should handle checking against local metadata', function(){
			parent.set('exampleKey', 'testValue', Test);
			parent.set('anotherKey', 'simpleTest', Another);

			parent.hasOwn('exampleKey', Test).should.be.ok;
			parent.hasOwn('exampleKey', Another).should.not.be.ok;
			parent.hasOwn('anotherKey', Test).should.not.be.ok;
			parent.hasOwn('anotherKey', Another).should.be.ok;
		});
	});

	describe('reading metadata', function(){
		it('should let you get the values stored in metadata', function(){
			let testA = 'Hello, world!';
			let testB = { val : 'Hello!' };
			let testC = new Map();

			parent.set('testA', testA, Test);
			parent.set('testB', testB, Test);
			parent.set('testC', testC, Test);

			parent.get('testA', Test).should.eql(testA);
			parent.get('testB', Test).should.eql(testB);
			parent.get('testC', Test).should.eql(testC);
		});

		it('should only return keys that belong to the writer', function(){
			parent.set('testA', 1, Test);
			child.set('testB', 2, Test);

			parent.keys(Test).should.eql(['testA', 'child:testB']);
			child.keys(Test).should.eql(['testB']);
		});

		it('should return local keys using ownKeys', function(){
			parent.set('testA', 1, Test);
			parent.set('testB', 2, Test);

			class Another extends Test{ }

			parent.set('testC', 3, Another);
			parent.set('testD', 4, Another);

			parent.ownKeys(Test).should.eql(['testA', 'testB']);
			parent.ownKeys(Another).should.eql(['testC', 'testD']);
		});

		it('should only return values that belong to the writer', function(){
			parent.set('testA', 1, Test);
			child.set('testB', 2, Test);

			parent.values(Test).should.eql([1, 2]);
			child.values(Test).should.eql([2]);
		});

		it('should return local values using ownValues', function(){
			parent.set('testA', 1, Test);
			parent.set('testB', 2, Test);

			class Another extends Test{ }

			parent.set('testC', 3, Another);
			parent.set('testD', 4, Another);

			parent.ownValues(Another).should.eql([3, 4]);
		});

		it('should let you iterate over the key,value pairs using the forEach method', function(){
			parent.set('testA', 1, Test);
			parent.set('testB', 2, Test);
			parent.set('testC', 3, Test);

			let spy = sinon.spy();

			parent.forEach(spy, Test);

			spy.should.have.been.calledThrice;
			spy.should.have.been.calledWith(1, 'testA');
			spy.should.have.been.calledWith(2, 'testB');
			spy.should.have.been.calledWith(3, 'testC');
		});

		it('should let you iterate over local metadata using forEachOwn', function(){
			parent.set('testA', 1, Test);
			parent.set('testB', 2, Test);

			class Another extends Test{ }

			parent.set('testC', 3, Another);
			parent.set('testD', 4, Another);

			let spy = sinon.spy();
			parent.forEachOwn(spy, Another);

			spy.should.have.been.calledTwice;
			spy.should.have.been.calledWith(3, 'testC');
			spy.should.have.been.calledWith(4, 'testD');
		});
	});

	describe('deleting metadata', function(){
		it('should let you remove metadata', function(){
			parent.set('test', 'Hello, world!', Test);
			parent.delete('test', Test);

			parent.has('test', Test).should.not.be.ok;
		});

		it('should let you remove an array of keys from the metadata', function(){
			parent.set('testA', 1, Test);
			parent.set('testB', 2, Test);
			parent.set('testC', 3, Test);

			parent.deleteKeys(['testA', 'testC'], Test);

			parent.has('testA', Test).should.not.be.ok;
			parent.keys(Test).should.eql(['testB']);
			parent.has('testC', Test).should.not.be.ok;
		});

		it('should let you clear all keys from the metadata', function(){
			parent.set('testA', 1, Test);
			parent.set('testB', 2, Test);

			parent.clear(Test);

			parent.keys(Test).length.should.eql(0);
		});

		it('should let you clear all local keys from the metadata', function(){
			parent.set('testA', 1, Test);
			parent.set('testB', 2, Test);

			class Another extends Test{ }

			parent.set('testC', 3, Another);

			parent.clearOwn(Another);

			parent.keys(Another).should.eql(['testA', 'testB']);
			parent.ownKeys(Another).length.should.eql(0);
		});
	});

	describe('private methods', function(){
		it('should correctly idenfity if a key belongs to the namespace', function(){
			parent._mine('parent:asdf').should.be.ok;
			parent._mine('asdfparent:asdf').should.not.be.ok;
			parent._mine('parent:child:asdf').should.be.ok;
			parent._mine('asdf').should.not.be.ok;
		});

		it('should namespace keys', function(){
			parent._k('hi').should.eql('parent:hi');
		});

		it('should throw an error if the key is not a string', function(){
			(() => parent._k(false)).should.throw(TypeError);
			(() => parent._k({})).should.throw(TypeError);
			(() => parent._k('asdf')).should.not.throw();
		});

		it('should throw an error if the length of the key is 0', function(){
			(() => parent._k('')).should.throw(Error);
			(() => parent._k('a')).should.not.throw();
		});

		it('should remove namespaces from keys', function(){
			parent._strip('parent:asdf').should.eql('asdf');
			parent._strip('asdfasdf').should.eql('asdfasdf');
		});

		it('should correctly clean keys by providing only the set of keys that are namespaced, stripped clean', function(){
			parent._cleanKeys([
				'parent:1',
				'parent:2',
				'parent:3',
				'parent:child:4',
				'5',
				'6',
				'asdf'
			])
			.should.eql([
				'1',
				'2',
				'3',
				'child:4'
			]);
		});
	});
});