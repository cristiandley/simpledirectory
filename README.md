## SimpleDirectory (KittyShortener)


## Running the project

`make help` or...

```bash
make docker-build
make docker-up
# now visit localhost:3000
```

## Technologies

- TypeScript
- NodeJS | NestJS
- NextJS | HeroUI

## Workflow

### URL Creation

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Controller
    participant Service
    participant Database

%% Create URL Flow
    User->>Frontend: Enter URL to shorten
    Frontend->>Controller: POST /urls {originalUrl, customSlug?, userId?}
    Controller->>Service: create(createUrlDto, userId?)
    alt Custom Slug Provided
        Service->>Database: Check if slug exists
        Database-->>Service: Return result
        alt Slug Already Exists
            Service-->>Controller: Throw ConflictException
            Controller-->>Frontend: Return 409 Conflict
            Frontend-->>User: Display error message
        else Slug Available
            Service->>Database: Save URL with custom slug
        end
    else No Custom Slug
        Service->>Service: Generate random slug
        Service->>Database: Save URL with generated slug
    end
    Database-->>Service: Return saved URL
    Service-->>Controller: Return URL object
    Controller-->>Frontend: Return {url, shortenedUrl}
    Frontend-->>User: Display shortened URL, copy to clipboard
```

### Redirection

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Controller
    participant Service
    participant Database
    
    %% Redirect Flow
    User->>Controller: GET /:slug
    Controller->>Service: trackVisit(slug)
    Service->>Database: Find URL by slug
    alt Slug Exists
        Database-->>Service: Return URL
        Service->>Service: Increment visit count
        Service->>Database: Save updated URL
        Database-->>Service: Return updated URL
        Service-->>Controller: Return URL
        Controller-->>User: 301 Redirect to original URL
        User->>External Site: Access original URL
    else Slug Not Found
        Database-->>Service: Return null
        Service-->>Controller: Throw NotFoundException
        Controller-->>User: Redirect to 404 page
    end
```


### Listing

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Controller
    participant Service
    participant Database
    
    %% List URLs Flow
    User->>Frontend: View URL dashboard
    Frontend->>Controller: GET /urls?userId={userId}
    Controller->>Service: findAll(userId?)
    alt userId Provided
        Service->>Database: Find URLs by userId
    else No userId
        Service->>Database: Find all URLs
    end
    Database-->>Service: Return URLs
    Service-->>Controller: Return URLs
    Controller-->>Frontend: Return URLs array
    Frontend-->>User: Display URLs list with stats
```

## Coverage

<img width="801" alt="Screenshot 2025-04-01 at 06 31 19" src="https://github.com/user-attachments/assets/a096abbe-121b-44df-be35-3e03fbdd237c" />


## Project Improvements

- [ ] Adding real sessions
- [ ] Using network analytics instead of saving them on request
- [ ] Handle load with queues 
