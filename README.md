### Not production ready

This project will end up into a *gulp task* that will convert a CSS file (preferably already optimised) into a mapping of all declarations. This mapping will be later used in a *React Mixin* to compute the CSS for a className and add it as inline style, taking in consideration all of his parents.

By creating a .baseClass inside the CSS file, all future declarations will inherit this one, and overwrite existing classes. It will also add !important to all declarations.

This project, when finished, could be used to isolate the CSS from React components from the rest of the page. Usefull for widgets/embdables where iframes are not an option.