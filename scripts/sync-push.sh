#!/bin/bash

# Configuración - RELLENA ESTOS DATOS
STORAGE_ACCOUNT="nombre_de_tu_cuenta"
FILE_SHARE="bv-data"
STORAGE_KEY="tu_key_aqui" # Opcional si ya hiciste login con 'az login'

echo "--- Iniciando subida de datos a Azure ---"

# 1. Subir base de datos
echo "Subiendo db.sqlite..."
az storage file upload \
    --account-name $STORAGE_ACCOUNT \
    --share-name $FILE_SHARE \
    --source "./backend/data/db.sqlite" \
    --path "db.sqlite" \
    --account-key $STORAGE_KEY

# 2. Sincronizar carpeta de imágenes
echo "Subiendo carpeta uploads..."
az storage file upload-batch \
    --account-name $STORAGE_ACCOUNT \
    --share-name $FILE_SHARE \
    --source "./backend/uploads" \
    --destination "uploads" \
    --account-key $STORAGE_KEY

echo "--- Sincronización completada: Local -> Azure ---"
