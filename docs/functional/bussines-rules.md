# Business Rules

---

# Authentication Rules

## BR-001

Only authenticated users can access the platform.

---

## BR-002

The system must apply role-based access control (RBAC).

---

## BR-003

Disabled users cannot authenticate.

---

# User Management Rules

## BR-004

Only administrators can create users.

---

## BR-005

Only administrators can assign roles.

---

## BR-006

Passwords must be stored encrypted.

---

# Menu Rules

## BR-007

Every product must belong to a category.

---

## BR-008

Inactive products cannot be added to orders.

---

# Orders Rules

## BR-009

Orders must contain at least one product.

---

## BR-010

Once an order is sent to kitchen, it cannot be modified.

---

## BR-011

Only administrators can authorize item cancellations.

---

## BR-012

Canceled items must remain registered for audit purposes.

---

## BR-013

Orders must maintain status consistency.

Allowed statuses:

- CREATED
- SENT_TO_KITCHEN
- IN_PREPARATION
- READY
- OUT_FOR_DELIVERY
- DELIVERED
- CLOSED
- CANCELED

---

## BR-014

Closed orders become read-only.

---

# Delivery Rules

## BR-015

Delivery orders must contain customer information.

---

## BR-016

Delivery orders must contain delivery address.

---

## BR-017

Pickup orders must contain estimated pickup time.

---

# Payments Rules

## BR-018

Orders cannot be closed without payment registration.

---

## BR-019

The system must support multiple payment methods:

- Cash
- Card
- Transfer

---

## BR-020

The system must apply a 5% service fee.

---

## BR-021

All payments must generate a POS receipt.

---

# Reports Rules

## BR-022

Cash register closing can only be performed by the cashier role.

---

## BR-023

Cash closing must calculate totals grouped by payment method.

---

## BR-024

Reports must preserve historical information.

---

# SaaS Rules

## BR-025

All system operations must belong to a tenant context.

---

## BR-026

Tenant information must remain isolated logically.

---

# Future Integration Rules

## BR-027

Electronic billing integration must comply with DIAN regulations.

---

## BR-028

External integration failures must not affect internal order processing.
