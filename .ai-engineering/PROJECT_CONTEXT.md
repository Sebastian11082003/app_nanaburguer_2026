# PROJECT CONTEXT

## Problema

Muchos restaurantes pequeños gestionan pedidos manualmente.

## Solución

**RestoOS**: POS SaaS multi-tenant para restaurantes y gastrobares (referencia: Loggro Restobar). El MVP es el núcleo de salón (pedidos, cocina, caja, roles, domicilio). No es un ERP, ni contabilidad/nómina, ni un POS de una sola tienda sin tenancy.

## Usuarios

- Administrador
- Cajero
- Mesero
- Cocina
- Cliente

## Objetivos

- Automatizar pedidos.
- Reducir errores.
- Escalar a múltiples sucursales.

## Restricciones

- SaaS multi-tenant: cada local se identifica por slug. Tras el login del restaurante, nombre + slug no se ocultan.
- `/restaurant/*` es mobile-first: el POS se opera en teléfono.
- Debe poder desplegarse en Docker.
- Barra de calidad del POS SaaS: el agente verifica flujos de tenant (slug, aislamiento, chrome de marca) antes de pedir revisión humana. La revisión/testing del dueño es al cierre de beta en `dev`.