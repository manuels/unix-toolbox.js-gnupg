UTIL_PATH=./src/g10/
ZLIB_PATH=./zlib/src
LIBGCRYPT_PATH=./libgcrypt/src
LIBASSUAN_PATH=./libassuan/src
LIBGPGERROR_PATH=./libgpg-error/src

ZLIB=${ZLIB_PATH}/compress.o \
  ${ZLIB_PATH}/adler32.o \
  ${ZLIB_PATH}/crc32.o \
  ${ZLIB_PATH}/deflate.o \
  ${ZLIB_PATH}/gzclose.o \
  ${ZLIB_PATH}/gzlib.o \
  ${ZLIB_PATH}/gzread.o \
  ${ZLIB_PATH}/gzwrite.o \
  ${ZLIB_PATH}/infback.o \
  ${ZLIB_PATH}/inffast.o \
  ${ZLIB_PATH}/inflate.o \
  ${ZLIB_PATH}/inftrees.o \
  ${ZLIB_PATH}/trees.o \
  ${ZLIB_PATH}/uncompr.o \
  ${ZLIB_PATH}/zutil.o

LIBASSUAN=${LIBASSUAN_PATH}/src/.libs/*.o
LIBGCRYPT=${LIBGCRYPT_PATH}/src/.libs/*.o ${LIBGCRYPT_PATH}/cipher/.libs/*.o ${LIBGCRYPT_PATH}/mpi/.libs/*.o ${LIBGCRYPT_PATH}/random/.libs/*.o ${LIBGCRYPT_PATH}/compat/.libs/*.o
LIBGPGERROR=${LIBGPGERROR_PATH}/src/.libs/*.o

all: utils ;

utils: gpg2 ;

%:
	cp ${UTIL_PATH}/$@ ${UTIL_PATH}/$@.bc
	emcc defmissing.c  -o defmissing.bc
	emcc -O2 --minify 1 --post-js post.js --pre-js ./toolbox-base/pre.js defmissing.bc ${UTIL_PATH}/$@.bc ${ZLIB} ${LIBASSUAN} ${LIBGCRYPT} ${LIBGPGERROR} -o $@-worker.js
