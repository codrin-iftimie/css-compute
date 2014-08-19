### Not production ready

This project will end up into a *gulp task* that will convert a CSS file (preferably already optimised) into a mapping of all declarations. This mapping will be later used in a *React Mixin* to compute the CSS for a className and add it as inline style, taking in consideration all of his parents.

By creating a .baseClass inside the CSS file, all future declarations will inherit this one, and overwrite existing classes. It will also add !important to all declarations.

This project, when finished, could be used to isolate the CSS from React components from the rest of the page. Usefull for widgets/embdables where iframes are not an option.

## Roadmap

 - Support composed CSS classes and more specific tags (ex: .mother.father-side ul.mother) in resolveStyle.js
 - Find a way to hook into React componentWillUpdate to find the CSS classNames that have changed
 - Transform the `node index.js` into a gulp task (that will accept options, ofc)
 - Transform the resolveStyle.js, walkTheDOM method from app.jsx into a React Mixin that will also hook recursivelly into his kids and check for changes
 
## Notes

`node index.js` will create the css map
`gulp` will start a server on 3009 port