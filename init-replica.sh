#!/bin/bash
# Start MongoDB in the background
mongod --replSet rs0 --bind_ip_all --port 27017 &

# Wait for MongoDB to be ready
until mongosh --host 127.0.0.1 --port 27017 --eval "print('MongoDB is up')" > /dev/null 2>&1; do
    echo "Waiting for MongoDB to start..."
    sleep 1
done

# Check if replica set is already initialized
rs_status=$(mongosh --host 127.0.0.1 --port 27017 --quiet --eval "rs.status().ok" 2>/dev/null)
if [ "$rs_status" != "1" ]; then
    echo "Initializing replica set..."
    mongosh --host 127.0.0.1 --port 27017 --quiet --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'host.docker.internal:27017'}]})"
else
    echo "Replica set already initialized."
fi

# Keep the container running
wait