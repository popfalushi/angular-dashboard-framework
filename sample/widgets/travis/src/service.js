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

'use strict';

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
