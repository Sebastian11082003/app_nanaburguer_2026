

```markdown
# C4 – Level 2 (Container Diagram)
```
![Diagrama context](./img/3.jpeg)


## Purpose
Show the major containers (applications/data stores) and how they communicate.

## Mermaid Diagram (Container)



```mermaid
flowchart LR
  subgraph Users["Users"]
    U[Internal Users + Customers]
  end

  subgraph Edge["Edge - EC2 Host"]
    NGINX[Nginx Container\nTLS + Reverse Proxy]
    API[NestJS API Container\nDocker]
  end

  subgraph Data["Data"]
    RDS[(AWS RDS PostgreSQL)]
    BK[Automated Backups]
  end

  subgraph Observability["Observability"]
    CW[CloudWatch Logs]
  end

  subgraph External["External Systems"]
    WA[WhatsApp API]
    SG[Siigo API]
  end

  subgraph CICD["CI/CD"]
    GH[GitHub Actions]
  end

  U -->|HTTPS 443| NGINX
  NGINX -->|HTTP internal| API

  API -->|TCP 5432| RDS
  RDS --> BK

  API -->|HTTPS| WA
  API -->|HTTPS| SG

  API --> CW
  GH -->|Deploy via SSH| NGINX
  GH -->|Deploy via SSH| API
  ```