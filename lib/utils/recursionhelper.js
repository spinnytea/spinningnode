var recursionHelper = angular.module('RecursionHelper', []);
module.exports = recursionHelper;
recursionHelper.factory('RecursionHelper', function($compile) {
  return {
    /*
     * Manually compiles the element
     * @param element
     * @param link: a poist link function, or an object with function(s) registered via pre and post properties
     * @returns an object containing the linking function
     */
    compile: function(element, link) {
      if(angular.isFunction(link))
        link = { post: link };
      var contents = element.contents().remove();
      var compiledContents;
      return {
        pre: ((link && link.pre) ? link.pre : null),
        /* compiles and re-adds the contents */
        post: function(scope, element) {
          if(!compiledContents)
            compiledContents = $compile(contents);
          compiledContents(scope, function(clone) {
            element.append(clone);
          });

          if(link && link.post)
            link.post.apply(null, arguments);
        }
      };
    }
  };
});
