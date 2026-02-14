#!/bin/bash

# Configuración - RELLENA ESTOS DATOS
STORAGE_ACCOUNT="nombre_de_tu_cuenta"
FILE_SHARE="bv-data"
STORAGE_KEY="tu_key_aqui" # Opcional si ya hiciste login con 'az login'

echo "--- Iniciando descarga de datos desde Azure ---"

# 1. Descargar base de datos
echo "Descargando db.sqlite..."
az storage file download \
    --account-name $STORAGE_ACCOUNT \
    --share-name $FILE_SHARE \
    --path "db.sqlite" \
    --dest "./backend/data/db.sqlite" \
    --account-key $STORAGE_KEY

# 2. Sincronizar carpeta de imágenes
echo "Sincronizando carpeta uploads..."
az storage file download-batch \
    --account-name $STORAGE_ACCOUNT \
    --share-name $FILE_SHARE \
    --source "uploads" \
    --destination "./backend/uploads" \
    --account-key $STORAGE_KEY

echo "--- Sincronización completada: Azure -> Local ---"
