# Notification Batching with Redis

This is a simple example of how to implement notification batching with Redis.
It uses Redis as a key-value store and a pub/sub system to handle notification expiration.

_This is just a PoC for demonstration purposes. It's not meant to be a
production-ready solution. Modify it as needed for your specific use case._

## Prerequisites

- Deno
- Redis

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/BadgerBloke/redis-notify.git
    ```

2. Install dependencies:

    ```bash
    deno install
    ```

## Usage

1. Start the Redis server:

    ```bash
    redis-server
    ```

2. Start the application:

    ```bash
    deno task dev
    ```

3. Send a notification:

    ```bash
    curl --location --request PATCH 'http://localhost:8000/notifications/user123' \
        --header 'Content-Type: application/json' \
        --data '{
            "content": ["Hi, this is first message"]
        }'
    ```

4. Check the Redis keyspace:

    ```bash
    redis-cli keys *
    ```

    You should see the following keys:

    - `notification:batch:user123`
    - `notification:backup:user123`

5. On expiration, the batch will be processed and the backup will be deleted:
6. If processing fails, the backup will not be deleted.
