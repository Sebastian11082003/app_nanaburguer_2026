# PROJECT CONTEXT

## Problema

Muchos restaurantes pequeños gestionan pedidos manualmente.

## Solución

Crear un SaaS para administrar la operación completa.

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
- Debe poder desplegarse en Docker.
- Barra de calidad de ERP: el agente verifica flujos de tenant antes de pedir revisión humana. La revisión/testing del dueño es al cierre de beta en `dev`.