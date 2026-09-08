# PROJECT CONTEXT

## Problema

Muchos restaurantes pequeños gestionan pedidos manualmente.

## Solución

ERP vertical para restaurantes, entregado como SaaS multi-tenant. El MVP actual es el núcleo operativo (pedidos, cocina, caja, roles). No es un ERP horizontal (contabilidad, nómina, inventario) ni un POS de una sola tienda.

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
- Barra de calidad de ERP: el agente verifica flujos de tenant antes de pedir revisión humana. La revisión/testing del dueño es al cierre de beta en `dev`.