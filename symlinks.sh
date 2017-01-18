LIBCC1=./tools/ARM/lib/libcc1.so
LIBCC1_TARGET=$(pwd)/tools/ARM/lib/libcc1.0.so

LIBTO_PLUGIN=./tools/ARM/libexec/gcc/arm-none-eabi/5.3.0/liblto_plugin.so
LIBTO_PLUGIN_TARGET=$(pwd)/tools/ARM/libexec/gcc/arm-none-eabi/5.3.0/liblto_plugin.0.so

LIBCC1PLUGIN=./tools/ARM/lib/gcc/arm-none-eabi/5.3.0/plugin/libcc1plugin.so
LIBCC1PLUGIN_TARGET=$(pwd)/tools/ARM/lib/gcc/arm-none-eabi/5.3.0/plugin/libcc1plugin.0.so

[ -e $LIBCC1 ] && rm $LIBCC1
[ -e $LIBTO_PLUGIN ] && rm $LIBTO_PLUGIN
[ -e $LIBCC1PLUGIN ] && rm $LIBCC1PLUGIN

ln -s $LIBCC1_TARGET $LIBCC1
ln -s $LIBTO_PLUGIN_TARGET $LIBTO_PLUGIN
ln -s $LIBCC1PLUGIN_TARGET $LIBCC1PLUGIN
