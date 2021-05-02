# Spendwiser Server

This is the containerized server that utilizes MongoDB and Express to create an API for database and user authentication operations

## Deployment

Requirements:
- Docker

First make sure a folder named 'database' and 'cert' is created before running.

Place the necessary keys in the cert folder for proper SSL communication

To run, first build the container using: `docker compose build`

Then run the server containers using: `docker compose up`