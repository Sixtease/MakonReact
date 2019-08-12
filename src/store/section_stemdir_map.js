import stemdir from './stemdir.json';

let togglable_by_section = {};
let stack = [];
let traverse = function _traverse(items) {
  items.forEach(item => {
    if (item.section) {
      togglable_by_section[item.section] = stack.slice();
    }
    if (item.items) {
      stack.push(item.key);
      _traverse(item.items);
      stack.pop();
    }
  });
};
traverse(stemdir);

export default togglable_by_section;
