# RestoOS Print Agent

Puente local entre el POS (navegador) y una impresora térmica ESC/POS 80mm
(Digital POS D300/D200 u otra Epson-compatible). Corre **solo en el PC de caja**.

## Arranque (demo)

En PowerShell, en esta carpeta:

```
npm start
```

Escucha `http://127.0.0.1:19100` (no uses 9100: ese puerto es el RAW de la térmica).
El POS detecta `/health` (respuesta inmediata; no espera WMI de Windows) y manda comanda/recibo sin el diálogo del navegador.

### Windows (USB instalada como impresora)

1. Configuración → Impresoras: anota el nombre exacto (ej. `POS-80`, `D300`).
2. Compártela (clic derecho → Propiedades de impresora → Compartir) para que exista `\\localhost\Nombre`.
3. Opcional: márcarla como predeterminada.
4. Antes de `npm start`:

```
$env:PRINT_TARGET = "windows"
$env:PRINT_PRINTER = "POS-80"
```

Si `PRINT_PRINTER` va vacío, usa la impresora predeterminada de Windows.

### Red (IP, puerto RAW 9100)

```
$env:PRINT_TARGET = "tcp"
$env:PRINT_HOST = "192.168.1.50"
$env:PRINT_PORT = "9100"
```

## Probar

```
curl http://127.0.0.1:19100/health
curl -Method POST http://127.0.0.1:19100/print/test
```

En el POS: Configuración → Impresora térmica → Imprimir prueba.

Si el agente no está arriba, comanda y recibo siguen usando el diálogo del
navegador en formato 80mm (elige la térmica ahí).

No publiques este puerto a internet.
