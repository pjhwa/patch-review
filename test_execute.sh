#!/bin/bash
curl -s -X POST http://localhost:3000/api/pipeline/execute \
     -H 'Content-Type: application/json' \
     -d '{"category": "os", "productId": "redhat"}'
