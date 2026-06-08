self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

var pyodide = null;
var dlFlag = null, dlData = null, promptFlag = null, promptData = null;

function post(t, text) { self.postMessage({ type: t, text: text }); }

self.addEventListener('message', function(e) {
  if (e.data.type === 'init') {
    dlFlag = new Int32Array(e.data.sab, 0, 1);
    dlData = new Uint8Array(e.data.sab, 4, 4096);
    promptFlag = new Int32Array(e.data.sab, 4100, 1);
    promptData = new Uint8Array(e.data.sab, 4104, 4096);
    promptFlag[0] = 0;
  }
});

async function boot() {
  post('status', 'loading...');
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
  });

  post('status', 'mounting...');
  var FS = pyodide.FS;
  FS.mkdirTree('/dojical');
  FS.mkdirTree('/dojical/scripts');
  FS.mkdirTree('/dojical/scripts/data');

  var srcUrl = [
    ['dojical/__init__.py', ''],
    ['dojical/scripts/__init__.py', ''],
    ['dojical/scripts/session.py', ''],
    ['dojical/scripts/data_loader.py', ''],
    ['dojical/scripts/keys.py', ''],
    ['dojical/scripts/version_checker.py', ''],
    ['dojical/scripts/scmpy.py', ''],
    ['dojical/scripts/dojical_web.py', ''],
    ['dojical/scripts/main.py', ''],
    ['dojical/scripts/lpro.py', ''],
    ['dojical/scripts/lpro_s.py', ''],
    ['dojical/scripts/bible.txt', ''],
  ];
  var jsonFiles = [
    'acadlist','biology1','chemistry1','chi_chars','degrees1',
    'dhammapada1','diction','fcci','hospitals','jamo',
    'katakana','koran1','legal_terms1','medicals1','mims',
    'proverbs','psychology1','science1','strains','tracks','verses1',
  ];

  for (var i = 0; i < srcUrl.length; i++) {
    var url = srcUrl[i][0];
    var path = '/' + url;
    try {
      var r = await fetch(url);
      if (r.ok) FS.writeFile(path, await r.text());
      else post('stderr', 'fetch fail: ' + url + ' ' + r.status);
    } catch(e) {}
  }
  for (var j = 0; j < jsonFiles.length; j++) {
    var jurl = 'dojical/scripts/data/' + jsonFiles[j] + '.json';
    try {
      var r2 = await fetch(jurl);
      if (r2.ok) FS.writeFile('/' + jurl, await r2.text());
    } catch(e) {}
  }

  pyodide.registerJsModule('_stdin_bridge', {
    read: function() {
      if (!dlFlag || !dlData) return '';
      Atomics.wait(dlFlag, 0, 0);
      var len = dlFlag[0];
      if (len <= 0) return '';
      var result = '';
      for (var i = 0; i < len; i++) result += String.fromCharCode(dlData[i]);
      dlFlag[0] = 0;
      return result;
    },
    write_prompt: function(text) {
      if (!promptFlag || !promptData) return;
      var clean = stripAnsi(text);
      var enc = new TextEncoder();
      var bytes = enc.encode(clean);
      var len = Math.min(bytes.length, 4095);
      promptData.set(bytes.slice(0, len));
      promptFlag[0] = len;
      Atomics.notify(promptFlag, 0, 1);
    }
  });

  function stripAnsi(s) {
    return s.replace(/\x1b\[[0-9;]*[a-zA-Z]/g,'').replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g,'').replace(/\x1b[PX^_][^\x1b]*\x1b\\/g,'').replace(/\x1b./g,'');
  }

  pyodide.setStdout({
    batched: function(t) {
      if (!t) return;
      var c = stripAnsi(t);
      if (c.trim()) post('stdout', c);
    }
  });
  pyodide.setStderr({
    batched: function(t) {
      if (!t) return;
      var c = stripAnsi(t);
      if (c.trim()) post('stderr', c);
    }
  });

  post('stdout', 'Dojical — type in bottom field, press Enter');
  post('stdout', '');

  pyodide.runPython('import sys; sys.path.insert(0, "/"); from dojical.scripts.dojical_web import start; start()');
}

boot().catch(function(e) { post('stderr', 'FATAL: ' + e.message); });
