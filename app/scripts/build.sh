#!/bin/bash
PHOENIX_PATH="../core"
TAURI_SRC_PATH="./src-tauri"

echo "Compilando Phoenix..."
cd $PHOENIX_PATH
mix deps.get
MIX_ENV=prod mix release --overwrite

if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar Phoenix"
    exit 1
fi

cd - > /dev/null

echo "Preparando Sidecar..."

TARGET_TRIPLE=$(rustc -vV | sed -n 's|host: ||p')

SOURCE_BIN="$PHOENIX_PATH/burrito_out/solaris_core_linux"
DEST_BIN="$TAURI_SRC_PATH/solaris_core-$TARGET_TRIPLE"

if [ ! -f "$SOURCE_BIN" ]; then
    echo "❌ Binário do Burrito não encontrado em: $SOURCE_BIN"
    exit 1
fi

echo "Copiando de: $SOURCE_BIN"
echo "Para: $DEST_BIN"

cp "$SOURCE_BIN" "$DEST_BIN"

echo "Sidecar pronto!"
