# Changelog

## v1.1.0
### Features

#### Added `push` method for pushing data to an array field
Example:
```js
let writer = new Metawriter('namespace');
class Test{ }

writer.push('field', 1, Test);
writer.push('field', 2, Test);
writer.push('field', 3, Test);

writer.get('field', Test).should.eql([1, 2, 3]);
```
