function _select(nfds, readfds, writefds, exceptfds, timeout) {
      // readfds are supported,
      // writefds checks socket open status
      // exceptfds not supported
      // timeout is always 0 - fully async
      assert(!exceptfds);
      function canRead(info) {
        // make sure hasData exists. 
        // we do create it when the socket is connected, 
        // but other implementations may create it lazily
        return info.hasData && info.hasData();
      }
      function canWrite(info) {
        // make sure socket exists. 
        // we do create it when the socket is connected, 
        // but other implementations may create it lazily
        return info.socket && (info.socket.readyState == info.socket.OPEN);
      }
      function checkfds(nfds, fds, can) {
        return 1;
        if (!fds) return 0;
        var bitsSet = 0;
        var dstLow  = 0;
        var dstHigh = 0;
        var srcLow  = HEAP32[((fds)>>2)];
        var srcHigh = HEAP32[(((fds)+(4))>>2)];
        nfds = Math.min(64, nfds); // fd sets have 64 bits
        for (var fd = 0; fd < nfds; fd++) {
          var mask = 1 << (fd % 32), int = fd < 32 ? srcLow : srcHigh;
          if (int & mask) {
            // index is in the set, check if it is ready for read
            var ok = false;
            if(FS.streams[fd])
              ok = true;
            else {
              // index is in the set, check if it is ready for read
              /* do not use Sockets here!
              var info = Sockets.fds[fd];
              ok = (info && can(info));*/
            }
            console.log(ok);
            if (ok) {
              // set bit
              fd < 32 ? (dstLow = dstLow | mask) : (dstHigh = dstHigh | mask);
              bitsSet++;
            }
          }
        }
        HEAP32[((fds)>>2)]=dstLow;
        HEAP32[(((fds)+(4))>>2)]=dstHigh;
        return bitsSet;
      }
      return checkfds(nfds, readfds, canRead)
           + checkfds(nfds, writefds, canWrite);
  }

_i32______gpg_err_init_to_void_____ = function() {}

