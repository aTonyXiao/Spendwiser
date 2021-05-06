# Spendwiser Server

This is the containerized server that utilizes MongoDB and Express to create an API for database and user authentication operations

## Configuration

1. First copy the "config/.env-template" into the root of the server folder, renaming the file to a ".env" file.  
2. Fill out the file, changing the necessary variables

Notes:
- When loading a file, uncomment the proper LOAD_FILE line and run once in order to load in data into the database.  Once it runs, stop the server and comment out the line again. Make sure the file is in the root server directory!
- For DB_LOCATION, make sure the folder exists before running the server
- The LOAD_FILE and ADMIN_JSON files must be in the root server directory (with docker-compose.yml, etc)! 

## Deployment

Requirements:
- Docker

First follow the configuration instructions beforehand

To run, first build the container using: `docker compose build`

### For production:
Run the server containers using: `docker compose up`

### For development:
Run the server containers using: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`