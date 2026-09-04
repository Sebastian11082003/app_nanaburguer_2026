# Setup y despliegue del MVP

Cómo levantar RestoOS / NanaBurguer con el código que ya existe. No sustituye AWS: el compose de producción es el artefacto de despliegue del MVP (un host, Docker, Postgres local).

## Qué queda fuera

- RDS, ALB, HTTPS, dominio.
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

Credencial seed (solo local): `admin@nanaburger.com` / `123456`. Entrar por `/platform/login`, crear un restaurante, luego `/restaurant/login`.

La API aplica `prisma migrate deploy` y el seed al arrancar. El seed es idempotente.

## Variables

Ver [docker/.env.example](../../docker/.env.example).

- `NEXT_PUBLIC_API_URL` se hornea en el **build** del frontend. Si cambias la URL pública, rebuild: `docker compose -f docker-compose.yml up --build`.
- `CORS_ORIGINS` es la lista de orígenes del navegador (coma-separada). Tiene que incluir el origen del frontend, no el de la API.
- `JWT_SECRET` debe tener al menos 16 caracteres. El default es solo para local.

En un VPS, ejemplo:

```env
NEXT_PUBLIC_API_URL=http://TU_IP:3000
CORS_ORIGINS=http://TU_IP
JWT_SECRET=<valor largo propio>
```

El navegador llama a la API en el puerto 3000. Abre 80 y 3000 en el host.

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
