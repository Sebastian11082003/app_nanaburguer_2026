![Diagrama context](./img/2.jpeg)



```mermaid

flowchart TB

  %% ====== People ======
  subgraph People["People"]
    W[Waiter]
    C[Cashier - Admin]
    U[Customer]
  end

  %% ====== Client Apps ======
  subgraph Clients["Client Applications"]
    IA[Ionic Internal App]
    PW[Public Ordering Web]
  end

  %% ====== Backend ======
  subgraph Backend["Backend"]
    API[NestJS API - Modular Monolith]
  end

  %% ====== Data ======
  subgraph Data["Data Store"]
    DB[(PostgreSQL)]
  end

  %% ====== External ======
  subgraph External["External Systems"]
    WA[WhatsApp API]
    SG[Siigo API]
  end

  %% ====== Flows ======
  W --> IA
  C --> IA
  U --> PW

  IA -->|HTTPS REST| API
  PW -->|HTTPS REST| API

  API -->|SQL| DB
  API -->|HTTPS| WA
  API -->|HTTPS| SG

  %% ====== Styles ======
  classDef person fill:#1f2937,stroke:#111827,color:#ffffff;
  classDef client fill:#0f766e,stroke:#0b3d39,color:#ffffff;
  classDef backend fill:#1d4ed8,stroke:#1e3a8a,color:#ffffff;
  classDef data fill:#374151,stroke:#111827,color:#ffffff;
  classDef external fill:#7c3aed,stroke:#4c1d95,color:#ffffff;

  class W,C,U person;
  class IA,PW client;
  class API backend;
  class DB data;
  class WA,SG external;