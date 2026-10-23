// Everything that talks to Skapi lives here. Two public tables:
//   starlog — guestbook entries { name, message, project }
//   sparks  — one record per "spark" on a project { project }, indexed by project
// Both are written anonymously into the 'public' access group, which Skapi allows
// unless the project turns anonymous writes off.

var Backend = (function () {
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/skapi-js@2.2.14/dist/skapi.js';
  var skapi = null;
  var ready = null;

  function explain(err) {
    var code = err && err.code;
    if (code === 'REQUIRE_LOGIN') {
      return 'The Starlog can\'t be read while signed out yet: the Skapi project still has "Require Login" on, and only Skapi can switch it off for now. Posting still works.';
    }
    if (code === 'SERVICE_DISABLED') return 'The Skapi project is suspended.';
    return (err && err.message) || 'Something went wrong talking to Skapi.';
  }

  function connect() {
    if (ready) return ready;
    if (!SKAPI_PROJECT_ID) {
      ready = Promise.reject({ code: 'NO_PROJECT', message: 'No Skapi project ID set in js/config.js.' });
      ready.catch(function () {});
      return ready;
    }
    ready = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SDK_URL;
      s.onload = function () {
        try {
          skapi = new Skapi(SKAPI_PROJECT_ID);
          resolve(skapi);
        } catch (e) { reject(e); }
      };
      s.onerror = function () { reject({ code: 'SDK_LOAD', message: 'Could not load the Skapi library.' }); };
      document.head.appendChild(s);
    });
    return ready;
  }

  function info() {
    return connect().then(function (s) { return s.getConnectionInfo(); });
  }

  function readStarlog() {
    return connect().then(function (s) {
      return s.getRecords(
        { table: { name: 'starlog', access_group: 'public' } },
        { limit: 40, ascending: false }
      );
    }).then(function (res) {
      return (res && Array.isArray(res.list)) ? res.list : [];
    });
  }

  function writeStarlog(entry) {
    return connect().then(function (s) {
      return s.postRecord(entry, { table: { name: 'starlog', access_group: 'public' } });
    });
  }

  // Tally sparks client-side. Fine for a personal site; past ~1000 sparks
  // this undercounts and should move to fetchMore paging.
  function readSparks() {
    return connect().then(function (s) {
      return s.getRecords({ table: { name: 'sparks', access_group: 'public' } }, { limit: 1000 });
    }).then(function (res) {
      var counts = {};
      var list = (res && Array.isArray(res.list)) ? res.list : [];
      list.forEach(function (r) {
        var p = r && r.data && r.data.project;
        if (typeof p === 'string') counts[p] = (counts[p] || 0) + 1;
      });
      return counts;
    });
  }

  function spark(projectId) {
    return connect().then(function (s) {
      return s.postRecord(
        { project: projectId },
        { table: { name: 'sparks', access_group: 'public' }, index: { name: 'project', value: projectId } }
      );
    });
  }

  return {
    enabled: function () { return !!SKAPI_PROJECT_ID; },
    explain: explain,
    info: info,
    readStarlog: readStarlog,
    writeStarlog: writeStarlog,
    readSparks: readSparks,
    spark: spark
  };
})();
