import json
import subprocess

ruta_json = 'data/_changelog.json'

with open(ruta_json, 'r', encoding='utf-8') as f:
    datos = json.load(f)

fecha = input("Ingresa la fecha (ej. 24 Octubre 2023): ")
titulo = input("Ingresa el título de la actualización: ")

cambios = []
print("Ingresa los cambios uno por uno. Escribe 'fin' para terminar:")
while True:
    cambio = input("- ")
    if cambio.lower() == 'fin':
        break
    cambios.append(cambio)

nuevo_registro = {"fecha": fecha, "titulo": titulo, "cambios": cambios}
datos.insert(0, nuevo_registro)

with open(ruta_json, 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=4, ensure_ascii=False)

print("Subiendo a GitHub...")
subprocess.run(['git', 'add', ruta_json])
subprocess.run(['git', 'commit', '-m', f"Nueva actualización: {titulo}"])
subprocess.run(['git', 'push'])
print("¡Historial actualizado en la web!")