import json
import subprocess
import os

ruta_lista = 'data/_list.json'

print("--- Añadir Nuevo Nivel a CataList ---")
# El nombre que aparecerá literalmente en _list.json
nombre_lista = input("Nombre exacto para _list.json (Ej: Acropolis): ")
# El nombre del archivo para que cosito.exe y Vue lo encuentren
nombre_archivo = input("Nombre del archivo JSON (sin .json, Ej: acropolis o Acropolis): ")

creador = input("Creador/Autor (Ej: Zobros): ")
verificador = input("Verificador (Déjalo en blanco si no aplica): ")
id_nivel = input("ID del nivel (solo números, Ej: 10248231): ")
video_url = input("Link completo de verificación en YouTube: ")
contrasena = input("Contraseña del nivel (Ej: -- o Free to copy): ")
posicion = int(input("¿En qué posición del top entra? (Ej: 1): "))

# Convertir ID a número
try:
    id_nivel_num = int(id_nivel)
except ValueError:
    id_nivel_num = id_nivel

if not contrasena.strip():
    contrasena = "--"

ruta_nivel = f'data/{nombre_archivo}.json'

# 1. ACTUALIZAR _list.json (Lista de textos simples)
with open(ruta_lista, 'r', encoding='utf-8') as f:
    niveles = json.load(f)

# Insertamos únicamente el nombre en texto (Ej: "Acropolis")
niveles.insert(posicion - 1, nombre_lista)

with open(ruta_lista, 'w', encoding='utf-8') as f:
    # Usamos indent=2 para que quede con los saltos de línea legibles
    json.dump(niveles, f, indent=2, ensure_ascii=False)

# 2. CREAR EL ARCHIVO INDIVIDUAL (Estructura completa)
datos_nivel = {
    "id": id_nivel_num,
    "name": nombre_lista,
    "author": creador,
    "creators": [],
    "verifier": verificador,
    "verification": video_url,
    "percentToQualify": 100,
    "password": contrasena,
    "records": []
}

with open(ruta_nivel, 'w', encoding='utf-8') as f:
    json.dump(datos_nivel, f, indent=2, ensure_ascii=False)

# 3. SUBIR A GITHUB
print("\nGuardando y subiendo a GitHub...")
subprocess.run(['git', 'add', ruta_lista, ruta_nivel])
subprocess.run(['git', 'commit', '-m', f"Añadido {nombre_lista} en la posicion {posicion}"])
subprocess.run(['git', 'push'])
print("¡Completado sin errores!")