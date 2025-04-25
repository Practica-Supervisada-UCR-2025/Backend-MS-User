# Login Process

## Backend focus

- Frontend manage login.

```mermaid
sequenceDiagram
    participant User as User (Frontend)
    participant Backend as Backend (Node.js/Express)
    participant Firebase as Firebase Authentication
    participant Database as Postgress

    User->>Firebase: Submit login credentials
    Firebase-->>User: Return token
    User->>Backend: Send Firebase Token
    Backend->>Firebase: Validate Firebase Token
    Firebase-->>Backend: Return email and uid
    Backend->>Database: Validate email and uid
    Database-->>Backend: Ok response
    Backend-->>User: Return a new jwt for future requests
```

## Frontend focus

- Frontend just send credentials to backend and Backend connect with firebase.

```mermaid
sequenceDiagram
    participant User as User (Frontend)
    participant Backend as Backend (Node.js/Express)
    participant Firebase as Firebase Authentication

    User->>Backend: Submit login credentials (email and pass)
    Backend->>Firebase: validate with firebase
    Firebase-->>Backend: Return token
    Backend-->>User: Return token
```

## Hybrid focus

- Frontend in charge of login using Firebase SDK.
- Backend validate the token that Frontend sends.

```mermaid
sequenceDiagram
    User->>Firebase: Submit login credentials
    Firebase-->>User: Return token
    User->>Backend: Send token
    Backend->>Firebase: Validate token
    Firebase-->>Backend: Token valid/invalid
    Backend-->>User: Access granted/denied
```
