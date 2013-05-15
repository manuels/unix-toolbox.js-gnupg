#include <string.h>
#include <iconv.h>

int raise(int i) {
  return 0;
}

int mlock(const void *addr, size_t len) {
  return 0;
}

size_t iconv(iconv_t cd,
             char **inbuf, size_t *inbytesleft,
             char **outbuf, size_t *outbytesleft) {
  memcpy(outbuf, inbuf, *inbytesleft);
  *outbytesleft = *inbytesleft;

  return *outbytesleft;
}

iconv_t iconv_open(const char *tocode, const char *fromcode) {
  return ((iconv_t) 1);
}

int iconv_close(iconv_t cd) {
  return 0;
}

