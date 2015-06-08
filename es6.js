import Metawriter from './metawriter';

export default class ES6Metawriter extends Metawriter{
	*getAll(target, propertyKey){
		let count = 0;

		for(let key of this.keys(target, propertyKey)){
			let value = this.get(key, target, propertyKey);
			count++;
			yield [ key, value ];
		}

		return count;
	}

	*getAllOwn(target, propertyKey){
		let count = 0;

		for(let key of this.ownKeys(target, propertyKey)){
			let value = this.getOwn(key, target, propertyKey);
			count++;
			yield [ key, value ];   
		}

		return count;
	}
}