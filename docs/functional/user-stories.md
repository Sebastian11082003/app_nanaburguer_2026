# User Stories

---

# Authentication Module

---

## HU-001 — User Login

**Actor:** Admin, Cashier, Waiter, Delivery

### Description

As a system user,  
I want to authenticate using email and password,  
So that I can securely access the platform according to my role permissions.

### Acceptance Criteria

- The system must validate email and password credentials.
- The system must generate JWT authentication tokens.
- The system must reject invalid credentials.
- The system must identify the authenticated user role.
- The system must apply RBAC authorization.

### Priority

High

### Status

Implemented

---

# User Management Module

---

## HU-002 — Create User

**Actor:** Admin

### Description

As an administrator,  
I want to create system users,  
So that restaurant staff can access the platform.

### Acceptance Criteria

- The system must allow creating users with email and password.
- The system must allow assigning a role.
- The system must validate unique emails.
- The system must store encrypted passwords.

### Priority

High

### Status

Implemented

---

## HU-003 — Edit User

**Actor:** Admin

### Description

As an administrator,  
I want to edit user information,  
So that staff information remains updated.

### Acceptance Criteria

- The system must allow editing user information.
- The system must allow changing user roles.
- The system must validate required fields.

### Priority

Medium

### Status

Implemented

---

## HU-004 — Disable User

**Actor:** Admin

### Description

As an administrator,  
I want to disable users,  
So that unauthorized staff cannot access the system.

### Acceptance Criteria

- The system must allow disabling users.
- Disabled users must not authenticate.
- The system must preserve historical records.

### Priority

High

### Status

Implemented

---

## HU-005 — Reset User Password

**Actor:** Admin

### Description

As an administrator,  
I want to reset user passwords,  
So that users can recover access to the system.

### Acceptance Criteria

- The system must allow password reset.
- The new password must be encrypted.
- Previous credentials must become invalid.

### Priority

Medium

### Status

Implemented

---

# Menu Management Module

---

## HU-006 — Create Product Category

**Actor:** Admin

### Description

As an administrator,  
I want to create menu categories,  
So that products can be organized properly.

### Acceptance Criteria

- The system must allow category creation.
- The category name must be unique.
- Categories must be visible in the menu module.

### Priority

High

### Status

Implemented

---

## HU-007 — Create Menu Item

**Actor:** Admin

### Description

As an administrator,  
I want to create menu items,  
So that products can be sold in the restaurant.

### Acceptance Criteria

- The system must allow product creation.
- Products must include price and category.
- Products must allow activation and deactivation.

### Priority

High

### Status

Implemented

---

## HU-008 — Edit Menu Item

**Actor:** Admin

### Description

As an administrator,  
I want to edit menu items,  
So that menu information remains updated.

### Acceptance Criteria

- The system must allow modifying product information.
- The system must allow updating prices.
- The system must preserve existing sales history.

### Priority

Medium

### Status

Implemented

---

# Orders Module

---

## HU-009 — Create Dine-In Order

**Actor:** Waiter, Cashier, Admin

### Description

As a restaurant operator,  
I want to create dine-in orders,  
So that customer requests can be processed.

### Acceptance Criteria

- The system must allow selecting a table.
- The system must allow multiple products.
- The system must calculate totals automatically.
- The order must start with CREATED status.

### Priority

High

### Status

Implemented

---

## HU-010 — Send Order to Kitchen

**Actor:** Waiter, Cashier, Admin

### Description

As a restaurant operator,  
I want to send orders to kitchen,  
So that kitchen staff can prepare the order.

### Acceptance Criteria

- The system must generate a kitchen ticket.
- The order status must change to SENT_TO_KITCHEN.
- The order must become locked for modification.

### Priority

High

### Status

Implemented

---

## HU-011 — Move Table Order

**Actor:** Waiter, Admin

### Description

As a waiter,  
I want to move orders between tables,  
So that customer seating changes can be managed.

### Acceptance Criteria

- The system must allow changing the assigned table.
- The order information must remain unchanged.
- The movement must be registered in the audit history.

### Priority

Medium

### Status

Implemented

---

## HU-012 — Cancel Order Item

**Actor:** Admin

### Description

As an administrator,  
I want to cancel order items,  
So that operational mistakes can be corrected.

### Acceptance Criteria

- The system must require administrator authorization.
- Canceled items must move to a canceled state.
- The system must preserve audit records.
- The system must register cancellation reasons.

### Priority

Medium

### Status

Implemented

---

# Delivery Module

---

## HU-013 — Register Delivery Order

**Actor:** Delivery, Cashier, Waiter, Admin

### Description

As a restaurant operator,  
I want to register delivery orders,  
So that customer home deliveries can be managed.

### Acceptance Criteria

- The system must register customer information.
- The system must register delivery address.
- The system must allow multiple products.
- The order type must be DELIVERY.

### Priority

High

### Status

Implemented

---

## HU-014 — Register Pickup Order

**Actor:** Delivery, Cashier, Waiter, Admin

### Description

As a restaurant operator,  
I want to register pickup orders,  
So that customers can collect orders at the restaurant.

### Acceptance Criteria

- The system must register customer information.
- The system must allow multiple products.
- The order type must be PICKUP.
- The system must register estimated pickup time.

### Priority

High

### Status

Implemented

---

## HU-015 — Update Delivery Order Status

**Actor:** Delivery, Admin

### Description

As a delivery operator,  
I want to update delivery order status,  
So that delivery progress can be tracked.

### Acceptance Criteria

- The system must allow valid state transitions.
- The system must register delivery timestamps.
- The system must prevent invalid status changes.

### Priority

Medium

### Status

Implemented

---

# Payments Module

---

## HU-016 — Register Payment

**Actor:** Cashier, Admin

### Description

As a cashier,  
I want to register customer payments,  
So that restaurant sales can be completed.

### Acceptance Criteria

- The system must allow cash payments.
- The system must allow card payments.
- The system must allow transfer payments.
- The system must calculate final totals automatically.

### Priority

High

### Status

Implemented

---

## HU-017 — Apply Service Fee

**Actor:** Cashier, Admin

### Description

As a cashier,  
I want the system to apply service fees,  
So that restaurant service charges are included.

### Acceptance Criteria

- The system must calculate a 5% service fee.
- The service fee must appear in the receipt.
- The final total must include the service fee.

### Priority

Medium

### Status

Implemented

---

## HU-018 — Close Order

**Actor:** Cashier, Admin

### Description

As a cashier,  
I want to close completed orders,  
So that completed sales are finalized.

### Acceptance Criteria

- The system must validate completed payment.
- The order status must change to CLOSED.
- Closed orders must become read-only.

### Priority

High

### Status

Implemented

---

## HU-019 — Generate POS Receipt

**Actor:** Cashier, Admin

### Description

As a cashier,  
I want to generate POS receipts,  
So that customers receive proof of payment.

### Acceptance Criteria

- The receipt must include purchased items.
- The receipt must include payment method.
- The receipt must include totals and service fee.
- The receipt must include order information.

### Priority

High

### Status

Implemented

---

# Reports Module

---

## HU-020 — View Daily Sales Report

**Actor:** Admin

### Description

As an administrator,  
I want to view daily sales reports,  
So that restaurant performance can be monitored.

### Acceptance Criteria

- The system must display total daily sales.
- The system must display payment method totals.
- The system must allow date filtering.

### Priority

High

### Status

Implemented

---

## HU-021 — View Monthly Sales Report

**Actor:** Admin

### Description

As an administrator,  
I want to view monthly sales reports,  
So that business growth can be analyzed.

### Acceptance Criteria

- The system must calculate monthly totals.
- The system must display sales trends.
- The system must support date ranges.

### Priority

Medium

### Status

Implemented

---

## HU-022 — View Best Selling Products

**Actor:** Admin

### Description

As an administrator,  
I want to view best-selling products,  
So that menu performance can be analyzed.

### Acceptance Criteria

- The system must rank products by sales.
- The system must allow date filtering.
- The system must display quantities sold.

### Priority

Medium

### Status

Implemented

---

## HU-023 — View Orders by Status

**Actor:** Admin

### Description

As an administrator,  
I want to analyze orders by status,  
So that operational bottlenecks can be identified.

### Acceptance Criteria

- The system must group orders by status.
- The system must display totals by status.
- The system must allow filtering by date.

### Priority

Medium

### Status

Implemented

---

## HU-024 — View Delivery Sales Report

**Actor:** Admin

### Description

As an administrator,  
I want to analyze delivery sales,  
So that delivery performance can be measured.

### Acceptance Criteria

- The system must display total delivery sales.
- The system must display payment method totals.
- The system must display total delivery orders.

### Priority

Medium

### Status

Implemented

---

## HU-025 — Perform Cash Register Closing

**Actor:** Cashier

### Description

As a cashier,  
I want to close the cash register at the end of the day,  
So that daily operations can be finalized.

### Acceptance Criteria

- The system must calculate total sales.
- The system must calculate totals by payment method.
- The system must generate a closing summary.
- The system must preserve historical closing records.

### Priority

High

### Status

Implemented

---

# Future Integrations

---

## HU-026 — Electronic Billing Integration

**Actor:** Cashier, Admin

### Description

As a cashier,  
I want to generate electronic invoices connected to DIAN,  
So that the restaurant complies with fiscal regulations.

### Acceptance Criteria

- The system must integrate with external billing APIs.
- The system must generate fiscal invoices.
- The system must store external invoice responses.

### Priority

Low

### Status

Planned

---

## HU-027 — WhatsApp Notifications

**Actor:** Customer

### Description

As a customer,  
I want to receive WhatsApp notifications,  
So that I can track my order status.

### Acceptance Criteria

- The system must send order confirmations.
- The system must send order status updates.
- The system must handle notification failures.

### Priority

Low

### Status

Planned

---

## HU-028 — Online Payments Integration

**Actor:** Customer

### Description

As a customer,  
I want to pay online,  
So that I can complete orders digitally.

### Acceptance Criteria

- The system must integrate with payment gateways.
- The system must validate successful transactions.
- The system must register payment confirmations.

### Priority

Low

### Status

Planned
