(function(window, undefined) {'use strict';
/*
 * The MIT License
 *
 * Copyright (c) 2016, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 


angular
  .module('adf.widget.travis', ['adf.provider', 'angular-md5']);

angular.module("adf.widget.travis").run(["$templateCache", function($templateCache) {$templateCache.put("{widgetsPath}/travis/src/edit/edit.html","<form role=form><div class=form-group><label for=username>Username</label> <input type=text class=form-control id=username ng-model=config.username placeholder=\"Enter username\"></div><div class=form-group><label for=repository>Repository</label> <input type=text class=form-control id=repository ng-model=config.repository placeholder=\"Enter repository\"></div></form>");
$templateCache.put("{widgetsPath}/travis/src/history/history.html","<div><div ng-if=!config.repository class=\"alert alert-info\">Please configure the widget</div><div ng-if=config.repository><ul class=media-list><li class=media ng-repeat=\"build in vm.builds\"><div class=media-left><img class=\"media-object img-thumbnail\" ng-src=\"http://www.gravatar.com/avatar/{{ build.commit.author_email | gravatar }}?s=64&d=identicon\"></div><div class=media-body><h4 class=media-heading><a href={{build.htmlUrl}} ng-class=vm.headingClass(build) target=_blank>{{build.number}} {{build.state}}</a></h4><p>{{build.description}}</p><small>{{build.commit.author_name}}, {{build.started_at | date: \'yyyy-MM-dd HH:mm\'}}</small></div></li></ul></div></div>");}]);
/*
 * The MIT License
 *
 * Copyright (c) 2016, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 


angular
  .module('adf.widget.travis')
  .controller('HistoryController', HistoryController);

function HistoryController(builds){
  var vm = this;

  vm.builds = builds;

  vm.headingClass = function(build){
    return 'travis-' + build.state;
  };
}
HistoryController.$inject = ["builds"];

/*
 * The MIT License
 *
 * Copyright (c) 2016, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



angular
  .module('adf.widget.travis')
  .config(RegisterWidgets);

function RegisterWidgets(dashboardProvider){
  dashboardProvider
    .widget('travis-history', {
      title: 'Travis CI History',
      description: 'Build history from Travis CI',
      category: 'Travis CI',
      templateUrl: '{widgetsPath}/travis/src/history/history.html',
      resolve: {
        builds: ["Travis", "config", function(Travis, config){
          if (config.username && config.repository){
            return Travis.getBuildHistory(config.username, config.repository);
          }
          return null;
        }]
      },
      controller: 'HistoryController',
      controllerAs: 'vm',
      edit: {
        templateUrl: '{widgetsPath}/travis/src/edit/edit.html'
      }
    });
}
RegisterWidgets.$inject = ["dashboardProvider"];

/*
 * The MIT License
 *
 * Copyright (c) 2016, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

 /*jshint camelcase: false */



angular
  .module('adf.widget.travis')
  .constant('travisEndpoint', 'https://api.travis-ci.org')
  .constant('travisHtmlEndpoint', 'https://travis-ci.org')
  .factory('Travis', Travis);

function Travis($http, travisEndpoint, travisHtmlEndpoint){

  function createHtmlUrl(username, repository, build){
    return travisHtmlEndpoint + '/' + username + '/' + repository + '/builds/' + build.id;
  }

  function createDescription(build){
    var description;
    if (build.pull_request){
      description = 'PR #' + build.pull_request_number + ' ' + build.pull_request_title;
    } else if (build.commit && build.commit.message){
      description = build.commit.message;
    }
    return description;
  }

  function createBuildHandler(username, repository){
    return function(data){
      var commits = {};
      angular.forEach(data.commits, function(commit){
        commits[commit.id] = commit;
      });
      var builds = data.builds;
      angular.forEach(builds, function(build){
        if (build.commit_id){
          build.commit = commits[build.commit_id];
        }
        build.description = createDescription(build);
        build.htmlUrl = createHtmlUrl(username, repository, build);
      });
      return builds;
    };
  }

  function getBuildHistory(username, repository){
    return $http({
      method: 'GET',
      url: travisEndpoint + '/repos/' + username + '/' + repository + '/builds',
      headers: {
        'Accept': 'application/vnd.travis-ci.2+json'
      }
    }).then(function(response){
      return response.data;
    }).then(createBuildHandler(username, repository));
  }

  return {
    getBuildHistory: getBuildHistory
  };
}
Travis.$inject = ["$http", "travisEndpoint", "travisHtmlEndpoint"];
})(window);