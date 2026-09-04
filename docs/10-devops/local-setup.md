# Setup y despliegue del MVP

Cómo levantar RestoOS / NanaBurguer con el código que ya existe. No sustituye AWS: el compose de producción es el artefacto de despliegue del MVP (un host, Docker, Postgres local).

## Qué queda fuera

- RDS, ALB, AWS gestionado.
- Factus, WhatsApp, impresora térmica.
- Pedidos públicos online.

## Un comando (MVP)

Desde la raíz del repo:

```bash
cp docker/.env.example docker/.env
cd docker
docker compose -f docker-compose.yml up --build
```

Servicios:

| URL | Qué es |
|---|---|
| http://localhost | Frontend (puerto 80) |
| http://localhost:3000/health | API |
| http://localhost:3000/api | Swagger |

Credencial seed (solo local): `admin@nanaburger.com` / `123456`. Entrar por `/platform/login`, crear un restaurante.

Tras crear el tenant, las estaciones ya existen. En `/restaurant/roles` (o directo a `/restaurant/waiter/login`, etc.) entra con el slug y:

| Rol | Correo |
|---|---|
| Admin | el `adminEmail` que escribiste (suele ser `admin@slug.test`) |
| Cajero | `cashier@slug.test` |
| Mesero | `waiter@slug.test` |
| Cocina | `kitchen@slug.test` |
| Delivery | `delivery@slug.test` |

La clave de esas cuatro estaciones es la misma que la del administrador. `/restaurant/login` sigue siendo el acceso del local (correo/clave del restaurante), no el de un rol.

La API aplica `prisma migrate deploy` y el seed al arrancar. El seed es idempotente.

El compose local pone `ALLOW_INSECURE_DEFAULTS=true`: JWT y password de seed documentados (`admin@nanaburger.com` / `123456`) están permitidos. En un host público eso debe ser `false`.

## Variables

Ver [docker/.env.example](../../docker/.env.example) (local) y [docker/.env.https.example](../../docker/.env.https.example) (VPS).

- `NEXT_PUBLIC_API_URL` se hornea en el **build** del frontend. Si cambias la URL pública, rebuild: `docker compose -f docker-compose.yml up --build`.
- `CORS_ORIGINS` es la lista de orígenes del navegador (coma-separada). Tiene que incluir el origen del frontend, no el de la API.
- `JWT_SECRET` debe tener al menos 16 caracteres. Los valores de los `.env*.example` están en una lista denegada: la API no arranca en producción si los dejas.
- `ALLOW_INSECURE_DEFAULTS=true` solo en local. El overlay HTTPS lo fuerza a `false`.
- `SEED_ON_BOOT` (default `true`): crea el platform admin si no existe. Password desde `PLATFORM_ADMIN_PASSWORD`. El seed no pisa un admin que ya esté.
- `PLATFORM_ADMIN_EMAIL` / `PLATFORM_ADMIN_PASSWORD`: credencial del primer arranque. En VPS no uses `123456`.

En un VPS por HTTP (sin Caddy), ejemplo:

```env
NEXT_PUBLIC_API_URL=http://TU_IP:3000
CORS_ORIGINS=http://TU_IP
JWT_SECRET=<valor largo propio, no el del example>
ALLOW_INSECURE_DEFAULTS=false
SEED_ON_BOOT=true
PLATFORM_ADMIN_EMAIL=tu@correo
PLATFORM_ADMIN_PASSWORD=<password propio, mínimo 8>
```

El navegador llama a la API en el puerto 3000. Abre 80 y 3000 en el host.

## HTTPS en un VPS (Caddy)

No reemplaza el comando local. Es un overlay: Caddy escucha 80/443, API y frontend dejan de publicarse en el host. Certificados: Let's Encrypt automático.

Requisitos:

- Un VPS con Docker Compose v2.24+ (por `!reset` de ports).
- Dos nombres DNS (`app.` y `api.` del mismo dominio) con A/AAAA hacia el VPS.
- Puertos 80 y 443 abiertos.

```bash
cp docker/.env.https.example docker/.env
# edita JWT_SECRET, POSTGRES_PASSWORD, PLATFORM_ADMIN_*, hosts y CORS
# no dejes los placeholders del example
cd docker
docker compose -f docker-compose.yml -f docker-compose.https.yml up --build -d
```

Si copias el example y arrancas sin editar, la API sale: JWT o password de seed coinciden con valores documentados.

`NEXT_PUBLIC_API_URL` se hornea en el build. Si cambias el dominio, `--build` otra vez.

Comprobar:

```bash
curl -sS https://api.TU_DOMINIO/health
# {"ok":true}
```

App: `https://app.TU_DOMINIO/platform/login`.

## Desarrollo (API y Next en watch)

```bash
cd docker
docker compose -f docker-compose.dev.yml up --build
```

Frontend en http://localhost:3001, API en http://localhost:3000.

## Comprobar

```bash
curl -sS http://localhost:3000/health
# {"ok":true}
```
