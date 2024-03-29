# CSV Sales Loader Application

Interactive sales loading solution made to handle large amounts of CSV data with pagination and mitigation strategies. Also implements Brazilian business rules for handling documents. The solution works on an "eventual-consistence" based model where the data is constantly updated from a CSV storage delivery service to a PostgreSQL replica database that is where the data will be fetched until needs to be updated again. Made with React, Fastify and PostgreSQL.

```mermaid
flowchart

A[React Frontend] -->|REST Call| B(Node.js Fastify Core)

B -->|REST Call| C[Node.js Eventual  <br> Consistency Service]

C ---|Fetch from| D[PostgreSQL <br> Replica Database]
C ---|Filled by| E[Node.js CSV File  <br> Storage Service]
```
