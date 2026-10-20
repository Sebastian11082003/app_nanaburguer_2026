# Dirección de diseño — RestoOS (Nana Burger piloto)

Estándar: AI Engineering OS `b71085f` `standards/ui-ux-design.md`.
Plantilla: `templates/docs/_template-design-direction.md`.

> **Cromo vigente (2026-10-13):** la dirección C (“pase de cocina” / Instrumento de servicio) se **DESCARTA** para shipping. No se aplican esos mockups. El look en producto es el **diseño inicial de git HEAD**: zinc cards, pills blancos, `--flame` dorado, Archivo Black, landing RESTOOS hero oscuro. Sin Refero, sin riel/dock de pase, sin tent/ticket-paper/chile/orbs.

## Producto

- **Qué es:** POS SaaS multi-tenant (RestoOS) para restobar. Primer tenant: Nana Burger.
- **Qué debe hacer:** turno de salón — mesas, llevar, domicilio, KDS, cobro, caja, comanda/recibo.
- **Industria:** food service / restobar, no ERP ni “SaaS analytics”.
- **Personalidad:** pase de cocina de noche; papel de comanda; sello de mesa; chile, no púrpura.
- **Objetivo del usuario:** tomar, cocinar y cobrar sin perder la mesa ni la ronda.
- **Objetivo de negocio:** piloto operable vs Loggro; demo con térmica.
- **Contenido real:** mesas, tickets, rondas, totales, servicio 5%, métodos, logos de tenant.
- **Dispositivo:** teléfono de pie (~390px, DEC-009); PC de caja; KDS de cocina.

## Usuario

Mesero, caja, cocina, domicilio, admin del local. La tarea que termina es un **ticket del turno**, no explorar un dashboard.

## Referencias

No se copia un sitio. Cada fuente aporta una capa.

### Mobbin — UX e interacción

Patrones de POS reales (Cyllo floor map, CAKE POS / KDS / handheld, plantillas de ticket + mapa de mesas):

- El **piso es el mapa**, no una lista: un tap abre el ticket de esa mesa.
- Pedido = **grilla de menú + comanda persistente** + un envío a cocina inequívoco.
- KDS = **tickets vivos**, un tap para avanzar estado, color solo para estado.
- Contraste alto, taps ≥ 44px, acciones destructivas distintas (CAKE).

Transformación: no copiamos el floor editor de Cyllo ni el iPad split de las plantillas. En teléfono el piso es una **rejilla de tent cards** (número grande); llevar/domicilio no son “otra mesa”, son **tiras de comanda**.

### Godly — identidad visual

De galerías tipo Godly / dark editorial hospitality (Sōen, Secret Dining Club, Maison Noir):

- Tipografía de **masthead** (números de mesa enormes) + cuerpo legible.
- Fondos **cálidos casi negros**, no zinc genérico.
- El objeto de papel (ticket, stub) es el ancla, no un orbe con blur.

Transformación: no usamos hero fotográfico ni Didot de fine dining. El “papel” es la **comanda térmica**, no una revista.

### Web Anatomy — composición por sección

De navbars puntuadas: **use-case tabs** (100% de las mejores) y un CTA primario distinto; no mega-menú de Product/Solutions.

| Sección | Composición | Jerarquía | Ancla visual | Responsive |
|---|---|---|---|---|
| Login | Stub perforado + talón de cuenta (2 columnas) | Identificar local, luego entrar | Perforación vertical | Stack: stub arriba, talón abajo |
| Piso | Tent cards de mesa (número) | Estado por sello, no por card SaaS | Número de mesa | 2 col móvil / más en desktop |
| Canales | Tira térmica a todo el ancho | Llevar / Domicilio ≠ mesa | Título de canal + cuenta | Full width bajo las mesas |
| KDS | Comandas de papel en riel | #ticket, ítems, un avance | Papel crema sobre pase oscuro | Lista; no kanban de 3 cards iguales |
| Nav POS | Riel de estaciones (tarea) | Use case: Mesas, Cocina, Caja… | Subrayado / metal, no pill | Abajo en móvil, arriba en desktop |
| Cobro | Talón de cuenta fijo abajo | Total + cobrar | Chile en el CTA | Sticky bottom |

### Land-book — narrativa y conversión

Filtros Land-book usados como capa, no como plantilla de landing: **brutalismo / bordes visibles / bottom navigation / food**. El valor del POS no es “Book a demo”: es **cerrar el ticket**. Un CTA de turno (enviar / cobrar) siempre reachable. No hero genérico con un botón.

### Google Stitch — exploración

Misma tarea (turno), tres direcciones (método Stitch: variar composición/tipo/color/metáfora, no las pantallas).

| Dirección | Idea | Por qué encaja o no |
|---|---|---|
| A — mínima / editorial | Serif, columnas, números romanos, terracotta de fine dining | Encaja en landing de restaurante, **no** en un rush de hamburguesas. Product_fit bajo. |
| B — expresiva | Paneles de vidrio, tres UI flotantes, verde “signal”, motion | Es el template hospitality-POS de landing. Glass + grilla = **genérico prohibido**. |
| C — centrada en el producto | La UI **es** el pase de cocina: mesas-sello, comandas térmicas, riel de estaciones, login como talón | Encaja con el turno, la térmica y Nana. No parece un dashboard. |

**Elegida:** C — pase de servicio / comanda.

**Por qué no la más convencional:** A y B son “SaaS u hospitalidad de catálogo”. C trata el ticket como objeto físico del local.

## Design DNA

```yaml
design_dna:
  visual_direction: "Pase de cocina de noche. Objetos de papel (comanda, talón, tent de mesa). No dashboard."
  typography:
    display: "Archivo Black — números de mesa y #ticket (sello)"
    body: "Outfit — lectura de pie"
    ticket: "IBM Plex Mono — líneas de comanda, slug, totales"
  colors:
    pass: "#140e0c"
    paper: "#f4ead6"
    chile: "#c43c22"
    grill: "#d97706"
    ink: "#1c1410"
    occupied: "chile fill on paper tent"
    free: "paper tent, dashed ink"
  layout: "Riel de estaciones (tarea). Piso = tents. KDS = papel. Login = stub+talón."
  spacing: "4/8/16. Densidad de turno, no landing aireada."
  radius: "1.25rem en superficies y 1rem en botones. Táctil, no punteado bruto."
  shadows: "Ninguna decorativa. Sin glass."
  imagery: "Logo del tenant. Sin stock food, sin orbe blur."
  icons: "Evitar set genérico de dashboard. Texto de estación primero."
  motion: "Solo cambio de estado (sello ocupada). Sin hover lift de card."
  density: "Alta en piso y KDS. Login más holgado."
```

## Qué hace único este diseño

Sin logo ni nombre queda: **números de mesa como sello, comandas de papel térmico, riel de estaciones abajo, login partido como talón**. Eso es un turno de restobar, no un CRM.

## Evaluación

```yaml
evaluation:
  UX_quality: 8
  visual_identity: 8
  originality: 8
  hierarchy: 8
  responsiveness: 8
  accessibility: 7
  product_fit: 9
```

Originalidad ≥ 7 y encaje ≥ 8: **autoriza implementación** de las pantallas afectadas (shell, piso, KDS, login, tokens). No un recorte de color sobre el layout anterior.

## Anti-genérico

- [x] No se describe solo como "SaaS moderno".
- [x] No depende de gradiente púrpura/azul, Inter, pills, glass ni grilla de tres features.
- [x] Las secciones no repiten la misma card redondeada.
- [x] Al quitar logo y nombre, el pase/comanda/sello no podría ser de otros cien productos SaaS.
