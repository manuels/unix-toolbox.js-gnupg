var files = {
}


var pre = {
  help: function(gpg) {
    return ['--help'];
  },


  list_keys: function(gpg) {
    return ['--lock-never', '-k'];
  },


  gen_key: function(gpg) {
    var input = document.getElementById('gen_key_text').value;
    gpg.addData(input, '/input.txt');

    return ['--lock-never', '--batch', '--gen-key', '/input.txt'];
  },


  import: function(gpg) {
    var import_text = document.getElementById('import_text').value;
    gpg.addData(import_text, '/import.txt');

    return ['--lock-never', '--batch', '--import', '/import.txt'];
  },


  sign_key: function(gpg) {
    var sign_key_id = document.getElementById('sign_key_id').value;
    var passwd = document.getElementById('sign_key_passwd').value;

    return ['--lock-never', '--passphrase', passwd, '--yes', '--batch', '--sign-key', sign_key_id];
  },


  decrypt: function(gpg) {
    var to_decrypt = document.getElementById('decrypt_text').value;
    var passwd = document.getElementById('decrypt_passwd').value;
    gpg.addData(to_decrypt, '/decryptme.txt');

    return ['--lock-never', '--passphrase', passwd, '--yes', '--batch', '--decrypt', '/decryptme.txt'];
  },


  encrypt: function(gpg) {
    var recipient_id = document.getElementById('encrypt_recipient_id').value;
    var to_encrypt = document.getElementById('encrypt_text').value;
    var passwd = document.getElementById('encrypt_passwd').value;
    gpg.addData(to_encrypt, '/encryptme.txt');

    return ['--lock-never', '--always-trust', '--passphrase', passwd, '--yes', '--batch', '-r', recipient_id, '--armor', '--encrypt', '/encryptme.txt'];
  },


  encrypt_symm: function(gpg) {
    var to_encrypt = document.getElementById('encrypt_symm_text').value;
    var passwd = document.getElementById('encrypt_symm_passwd').value;
    gpg.addData(to_encrypt, '/encryptme.txt');

    return ['--lock-never', '--passphrase', passwd, '--yes', '--batch', '--armor', '--symmetric', '/encryptme.txt'];
  },


  sign: function(gpg) {
    var to_sign = document.getElementById('sign_text').value;
    var passwd = document.getElementById('sign_passwd').value;
    gpg.addData(to_sign, '/signme.txt');

    return ['--lock-never', '--armor', '--passphrase', passwd, '--yes', '--batch', '--detach-sign', '/signme.txt'];
  },


  verify: function(gpg) {
    var to_verify = document.getElementById('verify_text').value;
    var signature = document.getElementById('signature_text').value;
    var passwd = document.getElementById('verify_passwd').value;
    gpg.addData(to_verify, '/verifyme.txt');
    gpg.addData(signature, '/signature.txt');

    return ['--lock-never', '--armor', '--passphrase', passwd, '--yes', '--batch', '--verify', '/signature.txt', '/verifyme.txt'];
  },

}

// this works like underscore's after function
var after = function(count, fn) {
  var c = 0;

  return function() {
    c++;
    if(c >= count)
      fn();
  }
};


var post = {
  gen_key: function(gpg, callback) {
    var cb = after(2, callback);

    gpg.getFile('/home/emscripten/.gnupg/secring.gpg').then(function(contents) {
      files['secring.gpg'] = contents;
      cb();
    });

    gpg.getFile('/home/emscripten/.gnupg/secring.gpg').then(function(contents) {
      files['secring.gpg'] = contents;
      cb();
    });
  },


  encrypt: function(gpg, callback) {
    gpg.getFile('/encryptme.txt.asc').then(function(contents) {
      log(contents);
      callback();
    });
  },


  help: function(gpg, callback) {
    callback();
  },


  encrypt_symm: function(gpg, callback) {
    gpg.getFile('/encryptme.txt.asc').then(function(contents) {
      log(contents);
      callback();
    });
  },


  sign: function(gpg, callback) {
    gpg.getFile('/signme.txt.asc').then(function(contents) {
      log(contents);
      callback();
    });
  },


  decrypt: function(gpg, callback) {
    callback();
  },


  list_keys: function(gpg, callback) {
    callback();
  },


  verify: function(gpg, callback) {
    callback();
  },


  sign_key: function(gpg, callback) {
    callback();
  },


  'import': function(gpg, callback) {
    callback();
  },
};


function log(txt) {
  console.log(txt);
  var log_el = document.getElementsByTagName('pre')[0];
  log_el.appendChild(log_el.ownerDocument.createTextNode(txt));
}


function clearLog() {
  var log_el = document.getElementsByTagName('pre')[0];
  while(log_el.childNodes.length >= 1)
    log_el.removeChild(log_el.firstChild);
}


function run() {
  var run_button = document.getElementById('run')
  run_button.setAttribute('disabled', '')
  run_button.setAttribute('value', 'Running... please be patient');
  clearLog();  

  var gpg = new Interface('gpg2-worker.js');
  gpg.mkdir('/home');
  gpg.mkdir('/home/emscripten');
  gpg.mkdir('/home/emscripten/.gnupg');

  var rand = new Uint8Array(4096);
  window.crypto.getRandomValues(rand);
  gpg.addData(rand, '/dev/egd-pool');

  var filenames = ['trustdb.gpg', 'secring.gpg', 'pubring.gpg']
  for(var i in filenames)
    if(files[filenames[i]]!==undefined)
      gpg.addData(files[filenames[i]], '/home/emscripten/.gnupg/'+filenames[i]);
    else
      gpg.addUrl('demo/'+filenames[i], '/home/emscripten/.gnupg/'+filenames[i]);
  if(files['random_seed']!==undefined)
    gpg.addData(files['random_seed'], '/home/emscripten/.gnupg/random_seed');

  gpg.on_stdout = log;
  gpg.on_stderr = log;

  var selected = document.getElementsByTagName('select')[0].value;
  var args = pre[selected](gpg);

  log('$ gpg2 '+args.join(" ")+"\n");
  gpg.allDone().then(function() {
    gpg.run.apply(gpg, args).then(function() {
      post[selected](gpg, function() {
        var cb = after(4, function() {
          run_button.removeAttribute('disabled')
          run_button.setAttribute('value', 'Run');
        });
  
        gpg.getFile('/home/emscripten/.gnupg/pubring.gpg').then(function(contents) {
          files['pubring.gpg'] = contents;
          cb();
        });

        gpg.getFile('/home/emscripten/.gnupg/secring.gpg').then(function(contents) {
          files['secring.gpg'] = contents;
          cb();
        });

        gpg.getFile('/home/emscripten/.gnupg/trustdb.gpg').then(function(contents) {
          files['trustdb.gpg'] = contents;
          cb();
        });

        gpg.getFile('/home/emscripten/.gnupg/random_seed').then(function(contents) {
          files['random_seed'] = contents;
          cb();
        });
      })
    });
  })
}


function changeContext(ev) {
  var select_el = ev.target;

  for(var i = 0; i < select_el.children.length; i++) {
    var id = select_el.children[i].value;
    document.getElementById(id).setAttribute('class', 'hidden');
  }

  var selected_value = select_el.value;
  document.getElementById(selected_value).removeAttribute('class');
}


function main() {
  document.getElementsByTagName('select')[0].addEventListener('change', changeContext);
  document.getElementById('run').addEventListener('click', run);

  document.getElementById('show_anyway').addEventListener('click', function() {
    changeContext({target: document.getElementsByTagName('select')[0]});
    document.getElementById('show_anyway').setAttribute('class', 'hidden');
    document.getElementsByTagName('img')[0].setAttribute('class', 'hidden');
    document.getElementById('features').removeAttribute('class');
  });

}
main();

/*
gpg.allDone().then( function() {
  gpg.run.apply(gpg, '--batch --yes --passphrase foobar --no-tty --symmetric --cipher-algo AES256 /manuels_input'.split(' ')).then(
    gpg.getFile('/home/emscripten/.gnupg/secring.gpg').then(function(contents) {
      console.log('contents:', contents)
    });
  });
});
*/
